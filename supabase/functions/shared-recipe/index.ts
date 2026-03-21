import { ApiError } from "../_shared/ai-client.ts";
import {
  buildCorsHeaders,
  getRequestContext,
  isAllowedOrigin,
  logError,
  logInfo,
  responseWithRequestId,
} from "../_shared/observability.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { parseJsonBody, validateSharedRecipeLookupPayload } from "../_shared/validation.ts";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 80;
const RATE_LIMIT_CODE_MAX_REQUESTS = 20;

type SharedRecipeRow = {
  share_code: string;
  recipe_id: string | null;
  preset_recipe_id: string | null;
  created_at: string;
};

function getSupabaseRuntimeConfig(): { supabaseUrl: string } {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  if (!supabaseUrl) {
    throw new ApiError(500, "missing_runtime_config", "Supabase runtime config is missing");
  }
  return { supabaseUrl };
}

function getApiKey(): string {
  const configuredAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const configuredTrimmed = configuredAnonKey.trim();
  if (/^[A-Za-z0-9._-]{16,1024}$/.test(configuredTrimmed)) {
    return configuredTrimmed;
  }
  throw new ApiError(500, "missing_runtime_config", "SUPABASE_ANON_KEY is missing or invalid");
}

async function callRpc<T>(
  name: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { supabaseUrl } = getSupabaseRuntimeConfig();
  const apikey = getApiKey();

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey,
      Authorization: `Bearer ${apikey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(502, "rpc_failed", `RPC ${name} failed`, { status: response.status });
  }

  return await response.json() as T;
}

Deno.serve(async (req) => {
  const ctx = getRequestContext(req);
  const corsHeaders = buildCorsHeaders(req);

  if (!isAllowedOrigin(req)) {
    return responseWithRequestId(
      JSON.stringify({ error: "Origin is not allowed", code: "origin_not_allowed" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ctx.requestId,
    );
  }

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  if (req.method !== "POST") {
    return responseWithRequestId(
      JSON.stringify({ error: "Method not allowed", code: "method_not_allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ctx.requestId,
    );
  }

  try {
    const payload = validateSharedRecipeLookupPayload(await parseJsonBody(req, 4 * 1024));
    const [shareCode, shareSecret] = payload.shareToken.split(".", 2);
    if (!shareCode || !shareSecret) {
      throw new ApiError(400, "invalid_payload", "shareToken format is invalid");
    }

    const digestBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(shareSecret));
    const shareSecretHash = Array.from(new Uint8Array(digestBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    const requestIdentity = ctx.ipAddress !== "unknown"
      ? `ip:${ctx.ipAddress}`
      : "ip:unknown";

    const globalLimit = await checkRateLimit(
      `share-lookup:${requestIdentity}`,
      RATE_LIMIT_MAX_REQUESTS,
      RATE_LIMIT_WINDOW_MS,
    );
    if (!globalLimit.allowed) {
      return responseWithRequestId(
        JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(globalLimit.retryAfterSeconds),
          },
        },
        ctx.requestId,
      );
    }

    const perCodeLimit = await checkRateLimit(
      `share-lookup-code:${requestIdentity}:${shareCode}`,
      RATE_LIMIT_CODE_MAX_REQUESTS,
      RATE_LIMIT_WINDOW_MS,
    );
    if (!perCodeLimit.allowed) {
      return responseWithRequestId(
        JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(perCodeLimit.retryAfterSeconds),
          },
        },
        ctx.requestId,
      );
    }

    const rows = await callRpc<SharedRecipeRow[]>(
      "lookup_shared_recipe_and_increment",
      {
        p_share_code: shareCode,
        p_share_secret_hash: shareSecretHash,
      },
    );
    const sharedRecipe = rows?.[0];

    if (!sharedRecipe) {
      return responseWithRequestId(
        JSON.stringify({ error: "Shared recipe not found", code: "not_found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        ctx.requestId,
      );
    }

    logInfo("shared_recipe_lookup_success", ctx, { shareCode });
    return responseWithRequestId(
      JSON.stringify({
        shareCode: sharedRecipe.share_code,
        recipeId: sharedRecipe.recipe_id,
        presetRecipeId: sharedRecipe.preset_recipe_id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ctx.requestId,
    );
  } catch (error) {
    logError("shared_recipe_lookup_error", ctx, error);

    if (error instanceof ApiError) {
      return responseWithRequestId(
        JSON.stringify({ error: error.message, code: error.code }),
        { status: error.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        ctx.requestId,
      );
    }

    return responseWithRequestId(
      JSON.stringify({ error: "Request failed", code: "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ctx.requestId,
    );
  }
});
