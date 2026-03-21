export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export type AiConfig = {
  apiKey: string;
  apiUrl: string;
  model: string;
  timeoutMs: number;
  maxRetries: number;
};

const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_RETRIES = 2;

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function getAiConfig(): AiConfig {
  const apiKey = Deno.env.get("AI_API_KEY") || Deno.env.get("OPENAI_API_KEY") || "";
  if (!apiKey) {
    throw new ApiError(500, "missing_api_key", "AI_API_KEY is not configured");
  }

  return {
    apiKey,
    apiUrl: Deno.env.get("AI_API_URL") || "https://api.openai.com/v1/chat/completions",
    model: Deno.env.get("AI_MODEL") || "gpt-4o-mini",
    timeoutMs: parsePositiveInt(Deno.env.get("AI_REQUEST_TIMEOUT_MS"), DEFAULT_TIMEOUT_MS),
    maxRetries: parsePositiveInt(Deno.env.get("AI_MAX_RETRIES"), DEFAULT_MAX_RETRIES),
  };
}

function shouldRetryStatus(status: number): boolean {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseErrorBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, 300);
  } catch {
    return "";
  }
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: { timeoutMs: number; maxRetries: number },
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= options.maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      if (response.ok) {
        clearTimeout(timeout);
        return response;
      }

      const canRetry = shouldRetryStatus(response.status) && attempt < options.maxRetries;
      if (canRetry) {
        const jitterBuf = new Uint8Array(1);
        crypto.getRandomValues(jitterBuf);
        const delay = Math.min(2_000, 250 * 2 ** attempt + (jitterBuf[0] % 120));
        clearTimeout(timeout);
        await sleep(delay);
        continue;
      }

      const body = await parseErrorBody(response);
      clearTimeout(timeout);
      throw new ApiError(response.status, "upstream_error", "AI provider request failed", {
        upstreamStatus: response.status,
        body,
      });
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      const isAbort = error instanceof DOMException && error.name === "AbortError";
      const canRetry = attempt < options.maxRetries;

      if (canRetry) {
        const jitterBuf = new Uint8Array(1);
        crypto.getRandomValues(jitterBuf);
        const delay = Math.min(2_000, 250 * 2 ** attempt + (jitterBuf[0] % 120));
        await sleep(delay);
        continue;
      }

      if (isAbort) {
        throw new ApiError(504, "upstream_timeout", "AI provider timed out");
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(502, "upstream_unreachable", "AI provider is unreachable", {
        cause: error instanceof Error ? error.message : String(error),
      });
    }
  }

  throw new ApiError(502, "upstream_failed", "AI provider request failed after retries", {
    cause: lastError instanceof Error ? lastError.message : String(lastError),
  });
}
