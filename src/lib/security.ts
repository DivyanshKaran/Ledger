const SAFE_EXTERNAL_PROTOCOLS = new Set(["http:", "https:"]);
const SAFE_MARKDOWN_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const ABSOLUTE_URL_SCHEME_RE = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
const CSS_IDENTIFIER_RE = /[^a-zA-Z0-9_-]/g;
const SAFE_COLOR_PATTERNS = [
  /^#[0-9a-fA-F]{3,8}$/,
  /^(?:rgb|hsl)a?\([0-9.%\s,/-]+\)$/,
  /^var\(--[a-zA-Z0-9_-]+\)$/,
  /^hsl\(var\(--[a-zA-Z0-9_-]+\)\)$/,
  /^[a-zA-Z]+$/,
];

export function sanitizeExternalUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withProtocol = ABSOLUTE_URL_SCHEME_RE.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!SAFE_EXTERNAL_PROTOCOLS.has(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizeMarkdownUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "#";
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) return trimmed;

  if (!ABSOLUTE_URL_SCHEME_RE.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    return SAFE_MARKDOWN_PROTOCOLS.has(url.protocol) ? trimmed : "#";
  } catch {
    return "#";
  }
}

export function sanitizeCssIdentifier(value: string): string {
  const sanitized = value.replace(CSS_IDENTIFIER_RE, "");
  return sanitized || "x";
}

export function sanitizeCssColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  for (const pattern of SAFE_COLOR_PATTERNS) {
    if (pattern.test(trimmed)) return trimmed;
  }

  return null;
}
