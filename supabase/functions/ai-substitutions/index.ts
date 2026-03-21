import { ApiError, fetchWithRetry, getAiConfig } from "../_shared/ai-client.ts";
import { buildCorsHeaders, getRequestContext, isAllowedOrigin, isAuthenticatedRequest, logError, logInfo, responseWithRequestId } from "../_shared/observability.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { parseJsonBody, validateSubstitutionPayload } from "../_shared/validation.ts";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

Deno.serve(async (req) => {
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

    const limit = await checkRateLimit(`ai-substitutions:${ctx.userId}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);
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

    const payload = validateSubstitutionPayload(await parseJsonBody(req));
    const { apiKey, apiUrl, model, timeoutMs, maxRetries } = getAiConfig();

    const prompt = `I need substitutions for "${payload.ingredient}" in the context of making: ${payload.recipeContext || "a recipe"}.
${payload.dietaryRestrictions ? `Dietary restrictions to consider: ${payload.dietaryRestrictions}` : ""}

Provide 3-4 substitution options.`;

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
            content: "You are a culinary expert. Return ingredient substitution suggestions."
          },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_substitutions",
              description: "Return ingredient substitution options",
              parameters: {
                type: "object",
                properties: {
                  substitutions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Substitute ingredient name" },
                        ratio: { type: "string", description: "How much to use (e.g., '1:1' or '2 tbsp per 1 cup')" },
                        notes: { type: "string", description: "Brief note on taste/texture difference" },
                        dietary_tags: {
                          type: "array",
                          items: { type: "string" },
                          description: "Applicable dietary tags like vegan, gluten-free, etc."
                        }
                      },
                      required: ["name", "ratio", "notes"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["substitutions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_substitutions" } },
      }),
    }, { timeoutMs, maxRetries });

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      logInfo("ai_substitutions_success", ctx, {
        status: response.status,
        substitutions: Array.isArray(result?.substitutions) ? result.substitutions.length : 0,
        remainingRequests: limit.remaining,
        durationMs: Date.now() - ctx.startedAt,
      });
      return responseWithRequestId(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }, ctx.requestId);
    }

    // Fallback if no tool call
    return responseWithRequestId(JSON.stringify({ 
      substitutions: [{ name: "No substitutions found", ratio: "N/A", notes: "Try asking the AI chat for more help" }] 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }, ctx.requestId);
  } catch (e) {
    logError("ai_substitutions_error", ctx, e, { durationMs: Date.now() - ctx.startedAt });

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
