type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const buckets = new Map<string, number[]>();
const HASH_PREFIX = "rl_";
const MAX_RAW_KEY_LENGTH = 1024;
const encoder = new TextEncoder();
const ALLOW_IN_MEMORY_FALLBACK = Deno.env.get("RATE_LIMIT_ALLOW_IN_MEMORY_FALLBACK") === "true";
const FAIL_CLOSED_RETRY_SECONDS = 60;

function prune(entries: number[], now: number, windowMs: number): number[] {
  return entries.filter((timestamp) => now - timestamp < windowMs);
}

function checkRateLimitInMemory(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const current = prune(buckets.get(key) ?? [], now, windowMs);

  if (current.length >= limit) {
    const oldest = current[0] ?? now;
    const retryAfterMs = Math.max(0, oldest + windowMs - now);

    buckets.set(key, current);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1_000),
    };
  }

  current.push(now);
  buckets.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.length),
    retryAfterSeconds: 0,
  };
}

async function checkRateLimitInDatabase(key: string, limit: number, windowMs: number): Promise<RateLimitResult | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/check_rate_limit`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_key: key,
        p_limit: limit,
        p_window_ms: windowMs,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json() as {
      allowed?: boolean;
      remaining?: number;
      retry_after_seconds?: number;
    };

    if (typeof payload.allowed !== "boolean") return null;

    return {
      allowed: payload.allowed,
      remaining: Math.max(0, Number(payload.remaining ?? 0)),
      retryAfterSeconds: Math.max(0, Number(payload.retry_after_seconds ?? 0)),
    };
  } catch {
    return null;
  }
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function stableRateLimitKey(rawKey: string): Promise<string> {
  const normalized = rawKey.trim().slice(0, MAX_RAW_KEY_LENGTH);
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(normalized || "anonymous"));
  return `${HASH_PREFIX}${toHex(digest)}`;
}

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const storageKey = await stableRateLimitKey(key);
  const dbResult = await checkRateLimitInDatabase(storageKey, limit, windowMs);
  if (dbResult) return dbResult;
  if (ALLOW_IN_MEMORY_FALLBACK) {
    return checkRateLimitInMemory(storageKey, limit, windowMs);
  }

  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds: FAIL_CLOSED_RETRY_SECONDS,
  };
}
