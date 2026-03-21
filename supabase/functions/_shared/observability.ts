export type RequestContext = {
  requestId: string;
  userId: string;
  authRole: string;
  ipAddress: string;
  startedAt: number;
};

const DEFAULT_ALLOWED_ORIGINS = new Set([
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const IP_ADDRESS_RE = /^[0-9a-fA-F:.]{3,64}$/;
const ALLOW_MISSING_ORIGIN = Deno.env.get("ALLOW_MISSING_ORIGIN") === "true";
const ALLOW_X_FORWARDED_FOR_IP = Deno.env.get("ALLOW_X_FORWARDED_FOR_IP") === "true";
const LOG_ERROR_STACKS = Deno.env.get("LOG_ERROR_STACKS") === "true";

function getAllowedOriginsFromEnv(): { allowAny: boolean; origins: Set<string> } {
  const raw = Deno.env.get("ALLOWED_ORIGINS") || "";
  const values = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const allowAny = values.includes("*");
  const origins = new Set<string>(DEFAULT_ALLOWED_ORIGINS);

  for (const value of values) {
    if (value === "*") continue;
    origins.add(value);
  }

  return { allowAny, origins };
}

const CORS_ORIGINS = getAllowedOriginsFromEnv();

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  return atob(padded);
}

function parseJwtSub(token: string): string | undefined {
  const parts = token.split(".");
  if (parts.length < 2) return undefined;

  try {
    const payloadRaw = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadRaw) as { sub?: string };
    return typeof payload.sub === "string" ? payload.sub : undefined;
  } catch {
    return undefined;
  }
}

function parseJwtRole(token: string): string {
  const parts = token.split(".");
  if (parts.length < 2) return "unknown";

  try {
    const payloadRaw = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadRaw) as { role?: string };
    return typeof payload.role === "string" ? payload.role : "unknown";
  } catch {
    return "unknown";
  }
}

function normalizeIpCandidate(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || !IP_ADDRESS_RE.test(trimmed)) return null;
  return trimmed;
}

function getRequestIpAddress(request: Request): string {
  const cfIp = normalizeIpCandidate(request.headers.get("cf-connecting-ip"));
  if (cfIp) return cfIp;

  const flyIp = normalizeIpCandidate(request.headers.get("fly-client-ip"));
  if (flyIp) return flyIp;

  const trueClientIp = normalizeIpCandidate(request.headers.get("true-client-ip"));
  if (trueClientIp) return trueClientIp;

  const realIp = normalizeIpCandidate(request.headers.get("x-real-ip"));
  if (realIp) return realIp;

  if (ALLOW_X_FORWARDED_FOR_IP) {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0] || "";
    const forwardedIp = normalizeIpCandidate(forwarded);
    if (forwardedIp) return forwardedIp;
  }

  return "unknown";
}

function getRequestOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  return origin ? origin.trim() : null;
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return ALLOW_MISSING_ORIGIN;
  if (CORS_ORIGINS.allowAny) return true;
  return CORS_ORIGINS.origins.has(origin);
}

export function getRequestContext(request: Request): RequestContext {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const userId = parseJwtSub(token) || "anonymous";
  const authRole = token ? parseJwtRole(token) : "unknown";
  const ipAddress = getRequestIpAddress(request);

  return {
    requestId: request.headers.get("x-request-id") || crypto.randomUUID(),
    userId,
    authRole,
    ipAddress,
    startedAt: Date.now(),
  };
}

export function isAllowedOrigin(request: Request): boolean {
  return isOriginAllowed(getRequestOrigin(request));
}

export function buildCorsHeaders(request: Request, extra: Record<string, string> = {}): Record<string, string> {
  const origin = getRequestOrigin(request);
  const allowOrigin = isOriginAllowed(origin) && origin ? origin : undefined;

  return {
    ...(allowOrigin ? { "Access-Control-Allow-Origin": allowOrigin } : {}),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-request-id",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
    ...extra,
  };
}

export function logInfo(event: string, ctx: RequestContext, meta: Record<string, unknown> = {}): void {
  console.log(
    JSON.stringify({
      level: "info",
      event,
      requestId: ctx.requestId,
      userId: ctx.userId,
      authRole: ctx.authRole,
      ipAddress: ctx.ipAddress,
      ...meta,
    }),
  );
}

export function logError(event: string, ctx: RequestContext, error: unknown, meta: Record<string, unknown> = {}): void {
  const normalized =
    error instanceof Error
      ? {
        name: error.name,
        message: error.message,
        ...(LOG_ERROR_STACKS && error.stack ? { stack: error.stack } : {}),
      }
      : { message: String(error) };

  console.error(
    JSON.stringify({
      level: "error",
      event,
      requestId: ctx.requestId,
      userId: ctx.userId,
      authRole: ctx.authRole,
      ipAddress: ctx.ipAddress,
      error: normalized,
      ...meta,
    }),
  );
}

export function isAuthenticatedRequest(ctx: RequestContext): boolean {
  return ctx.authRole === "authenticated" && ctx.userId !== "anonymous";
}

export function responseWithRequestId(
  body: BodyInit | null,
  init: ResponseInit,
  requestId: string,
): Response {
  const headers = new Headers(init.headers);
  headers.set("x-request-id", requestId);
  return new Response(body, { ...init, headers });
}
