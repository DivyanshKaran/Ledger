const GLOBAL_HANDLER_KEY = "__ledger_global_telemetry_bound__";
const IS_DEV = Boolean(import.meta.env?.DEV);

type TelemetryMeta = Record<string, unknown>;

const REDACTION_PATTERNS: RegExp[] = [
  /Bearer\s+[A-Za-z0-9._-]+/gi,
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+\b/g, // JWT-like tokens
  /\b[A-Za-z0-9_-]{6,64}\.[A-Za-z0-9_-]{16,128}\b/g, // share tokens
];

function redactString(value: string): string {
  let next = value;
  for (const pattern of REDACTION_PATTERNS) {
    next = next.replace(pattern, "[REDACTED]");
  }
  return next;
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (!value || typeof value !== "object") return value;

  const sanitized: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    sanitized[key] = sanitizeValue(entry);
  }
  return sanitized;
}

function sanitizeMeta(meta: TelemetryMeta): TelemetryMeta {
  return sanitizeValue(meta) as TelemetryMeta;
}

function toMessage(error: unknown): string {
  if (error instanceof Error) return redactString(error.message);
  return redactString(String(error));
}

function report(level: "info" | "error", event: string, meta: TelemetryMeta = {}): void {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...sanitizeMeta(meta),
  };

  if (level === "error") {
    console.error("[telemetry]", payload);
    return;
  }

  console.info("[telemetry]", payload);
}

export function trackEvent(event: string, meta: TelemetryMeta = {}): void {
  report("info", event, meta);
}

export function trackError(event: string, error: unknown, meta: TelemetryMeta = {}): void {
  report("error", event, {
    message: toMessage(error),
    ...(error instanceof Error
      ? {
        name: error.name,
        ...(IS_DEV && error.stack ? { stack: redactString(error.stack) } : {}),
      }
      : {}),
    ...meta,
  });
}

export function bindGlobalErrorTelemetry(): void {
  const globalWindow = window as Window & { [GLOBAL_HANDLER_KEY]?: boolean };
  if (globalWindow[GLOBAL_HANDLER_KEY]) return;

  window.addEventListener("error", (event) => {
    trackError("window.error", event.error || event.message, {
      source: event.filename,
      line: event.lineno,
      column: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    trackError("window.unhandledrejection", event.reason);
  });

  globalWindow[GLOBAL_HANDLER_KEY] = true;
}
