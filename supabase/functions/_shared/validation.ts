import { ApiError } from "./ai-client.ts";

type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatPayload = {
  messages: ChatMessage[];
};

export type SubstitutionPayload = {
  ingredient: string;
  recipeContext?: string;
  dietaryRestrictions?: string;
};

export type SharedRecipeLookupPayload = {
  shareToken: string;
};

const MAX_JSON_BYTES = 32 * 1024;
const decoder = new TextDecoder();

function parseDeclaredContentLength(request: Request): number | null {
  const raw = request.headers.get("content-length");
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

async function readRawBodyWithLimit(request: Request, maxBytes: number): Promise<string> {
  const declaredLength = parseDeclaredContentLength(request);
  if (declaredLength !== null && declaredLength > maxBytes) {
    throw new ApiError(413, "payload_too_large", `Request body exceeds ${maxBytes} bytes`);
  }

  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      throw new ApiError(413, "payload_too_large", `Request body exceeds ${maxBytes} bytes`);
    }
    chunks.push(value);
  }

  if (chunks.length === 0) return "";

  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return decoder.decode(merged);
}

export async function parseJsonBody(request: Request, maxBytes = MAX_JSON_BYTES): Promise<unknown> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ApiError(415, "unsupported_media_type", "Content-Type must be application/json");
  }

  const raw = await readRawBodyWithLimit(request, maxBytes);

  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, "invalid_json", "Request body is not valid JSON");
  }
}

function assertObject(value: unknown, message: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, "invalid_payload", message);
  }
}

function readBoundedString(
  value: unknown,
  field: string,
  minLength: number,
  maxLength: number,
): string;
function readBoundedString(
  value: unknown,
  field: string,
  minLength: number,
  maxLength: number,
  optional: true,
): string | undefined;
function readBoundedString(
  value: unknown,
  field: string,
  minLength: number,
  maxLength: number,
  optional = false,
): string | undefined {
  if (value == null && optional) return undefined;
  if (typeof value !== "string") {
    throw new ApiError(400, "invalid_payload", `${field} must be a string`);
  }

  const trimmed = value.trim();
  if (trimmed.length < minLength || trimmed.length > maxLength) {
    throw new ApiError(400, "invalid_payload", `${field} must be between ${minLength} and ${maxLength} characters`);
  }

  return trimmed;
}

export function validateChatPayload(raw: unknown): ChatPayload {
  assertObject(raw, "Payload must be an object");

  const { messages } = raw;
  if (!Array.isArray(messages)) {
    throw new ApiError(400, "invalid_payload", "messages must be an array");
  }

  if (messages.length < 1 || messages.length > 25) {
    throw new ApiError(400, "invalid_payload", "messages must include 1-25 items");
  }

  let totalChars = 0;
  const parsed = messages.map((message, index) => {
    assertObject(message, `messages[${index}] must be an object`);
    const role = message.role;

    if (role !== "user" && role !== "assistant") {
      throw new ApiError(400, "invalid_payload", `messages[${index}].role is invalid`);
    }

    const content = readBoundedString(message.content, `messages[${index}].content`, 1, 4_000);
    totalChars += content.length;
    return { role, content };
  });

  if (totalChars > 20_000) {
    throw new ApiError(400, "invalid_payload", "messages content is too large");
  }

  return { messages: parsed };
}

export function validateSubstitutionPayload(raw: unknown): SubstitutionPayload {
  assertObject(raw, "Payload must be an object");

  const ingredient = readBoundedString(raw.ingredient, "ingredient", 1, 120);
  const recipeContext = readBoundedString(raw.recipeContext, "recipeContext", 1, 400, true);
  const dietaryRestrictions = readBoundedString(raw.dietaryRestrictions, "dietaryRestrictions", 1, 240, true);

  return {
    ingredient,
    recipeContext,
    dietaryRestrictions,
  };
}

export function validateSharedRecipeLookupPayload(raw: unknown): SharedRecipeLookupPayload {
  assertObject(raw, "Payload must be an object");

  const shareToken = readBoundedString(raw.shareToken, "shareToken", 12, 256);
  if (!/^[A-Za-z0-9_-]{6,64}\.[A-Za-z0-9_-]{16,128}$/.test(shareToken)) {
    throw new ApiError(400, "invalid_payload", "shareToken format is invalid");
  }

  return { shareToken };
}
