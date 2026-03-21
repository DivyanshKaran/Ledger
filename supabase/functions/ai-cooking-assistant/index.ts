import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ApiError, fetchWithRetry, getAiConfig } from "../_shared/ai-client.ts";
import { buildCorsHeaders, getRequestContext, isAllowedOrigin, isAuthenticatedRequest, logError, logInfo, responseWithRequestId } from "../_shared/observability.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { parseJsonBody, validateChatPayload } from "../_shared/validation.ts";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

serve(async (req) => {
  const ctx = getRequestContext(req);
  const corsHeaders = buildCorsHeaders(req);

  if (!isAllowedOrigin(req)) {
    return responseWithRequestId(
      JSON.stringify({ error: "Origin is not allowed", code: "origin_not_allowed" }),
      {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
      ctx.requestId,
    );
  }

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") {
    return responseWithRequestId(
      JSON.stringify({ error: "Method not allowed", code: "method_not_allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
      ctx.requestId,
    );
  }

  try {
    if (!isAuthenticatedRequest(ctx)) {
      return responseWithRequestId(
        JSON.stringify({ error: "Authentication required", code: "auth_required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
        ctx.requestId,
      );
    }

    const limit = await checkRateLimit(`ai-chat:${ctx.userId}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);
    if (!limit.allowed) {
      return responseWithRequestId(
        JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(limit.retryAfterSeconds),
          },
        },
        ctx.requestId,
      );
    }

    const payload = validateChatPayload(await parseJsonBody(req));
    const { apiKey, apiUrl, model, timeoutMs, maxRetries } = getAiConfig();

    const response = await fetchWithRetry(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are a friendly AI cooking assistant for Ledger, a recipe cost calculator app. You help users with:
- Suggesting recipes based on ingredients they have
- Providing ingredient substitutions with cost implications
- Offering cooking tips and techniques
- Adapting recipes for dietary restrictions (vegan, gluten-free, keto, etc.)
- Answering any cooking-related questions

Keep responses concise, practical, and helpful. Use emojis sparingly for warmth. Format with markdown when listing items. If asked about non-cooking topics, politely redirect to cooking-related help.`
          },
          ...payload.messages,
        ],
        stream: true,
      }),
    }, { timeoutMs, maxRetries });

    logInfo("ai_chat_success", ctx, {
      status: response.status,
      remainingRequests: limit.remaining,
      durationMs: Date.now() - ctx.startedAt,
    });

    return responseWithRequestId(response.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    }, ctx.requestId);
  } catch (e) {
    logError("ai_chat_error", ctx, e, { durationMs: Date.now() - ctx.startedAt });

    if (e instanceof ApiError) {
      return responseWithRequestId(
        JSON.stringify({ error: e.message, code: e.code, details: e.details }),
        {
          status: e.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
        ctx.requestId,
      );
    }

    return responseWithRequestId(
      JSON.stringify({ error: "AI service temporarily unavailable", code: "internal_error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
      ctx.requestId,
    );
  }
});
