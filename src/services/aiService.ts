import { supabase } from "@/integrations/supabase/client";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type IngredientSubstitution = {
  name: string;
  ratio: string;
  notes: string;
  dietary_tags?: string[];
};

type ApiErrorPayload = {
  error?: string;
  code?: string;
};

function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return `${Date.now().toString(36)}-${Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

function mapToUserMessage(status?: number, code?: string, fallback = "Request failed"): string {
  if (status === 401 || status === 403 || code === "auth_required") return "Please sign in to use AI features.";
  if (status === 429 || code === "rate_limited") return "You are sending requests too quickly. Please wait and try again.";
  if (status === 413 || code === "payload_too_large") return "Your request is too large. Try a shorter prompt.";
  if (status === 415 || code === "unsupported_media_type") return "Invalid request format. Please refresh and try again.";
  if (status === 504 || code === "upstream_timeout") return "The AI service timed out. Please retry.";
  if (status === 502 || code === "upstream_unreachable") return "The AI service is temporarily unavailable. Please retry.";
  return fallback;
}

class ServiceError extends Error {
  status?: number;
  code?: string;
  retriable: boolean;

  constructor(message: string, options: { status?: number; code?: string; retriable?: boolean } = {}) {
    super(message);
    this.name = "ServiceError";
    this.status = options.status;
    this.code = options.code;
    this.retriable = options.retriable ?? true;
  }
}

export async function streamCookingAssistant(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
): Promise<void> {
  const chatUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-cooking-assistant`;
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new ServiceError(
      mapToUserMessage(401, "auth_required", "Authentication required"),
      { status: 401, code: "auth_required", retriable: false },
    );
  }

  const response = await fetch(chatUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "x-request-id": createRequestId(),
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    const message = mapToUserMessage(response.status, data.code, data.error || `Request failed (${response.status})`);
    throw new ServiceError(message, {
      status: response.status,
      code: data.code,
      retriable: response.status >= 500 || response.status === 429 || response.status === 504,
    });
  }

  if (!response.body) {
    throw new ServiceError("No response body from AI service", { retriable: true });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onChunk(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (!textBuffer.trim()) return;

  for (let raw of textBuffer.split("\n")) {
    if (!raw) continue;
    if (raw.endsWith("\r")) raw = raw.slice(0, -1);
    if (raw.startsWith(":") || raw.trim() === "") continue;
    if (!raw.startsWith("data: ")) continue;

    const jsonStr = raw.slice(6).trim();
    if (jsonStr === "[DONE]") continue;

    try {
      const parsed = JSON.parse(jsonStr);
      const content = parsed.choices?.[0]?.delta?.content as string | undefined;
      if (content) onChunk(content);
    } catch {
      // Ignore trailing parse fragments.
    }
  }
}

export async function fetchIngredientSubstitutions(
  ingredientName: string,
  recipeTitle: string,
): Promise<IngredientSubstitution[]> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new ServiceError(
      mapToUserMessage(401, "auth_required", "Authentication required"),
      { status: 401, code: "auth_required", retriable: false },
    );
  }

  const { data, error } = await supabase.functions.invoke("ai-substitutions", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: {
      ingredient: ingredientName,
      recipeContext: recipeTitle,
    },
  });

  if (error) {
    const status = typeof (error as { context?: { status?: number } }).context?.status === "number"
      ? (error as { context?: { status?: number } }).context?.status
      : 500;
    throw new ServiceError(
      mapToUserMessage(status, "invoke_failed", "Failed to reach substitutions service"),
      {
        status,
        code: status === 401 || status === 403 ? "auth_required" : "invoke_failed",
        retriable: !(status === 401 || status === 403),
      },
    );
  }

  const payload = (data || {}) as { substitutions?: IngredientSubstitution[]; error?: string; code?: string };
  if (payload.error) {
    throw new ServiceError(
      mapToUserMessage(undefined, payload.code, payload.error),
      { code: payload.code, retriable: payload.code !== "invalid_payload" },
    );
  }

  if (!Array.isArray(payload.substitutions)) {
    throw new ServiceError("No substitutions were returned", { code: "empty_response", retriable: true });
  }

  return payload.substitutions;
}

export function isRetriableError(error: unknown): boolean {
  return error instanceof ServiceError ? error.retriable : true;
}
