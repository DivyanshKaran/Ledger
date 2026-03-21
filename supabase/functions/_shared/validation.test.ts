import { describe, expect, it } from "vitest";
import { ApiError } from "./ai-client.ts";
import {
  parseJsonBody,
  validateChatPayload,
  validateSharedRecipeLookupPayload,
  validateSubstitutionPayload,
} from "./validation.ts";

describe("validation", () => {
  it("validates chat payload", () => {
    const payload = validateChatPayload({
      messages: [{ role: "user", content: "How do I cook rice?" }],
    });

    expect(payload.messages).toHaveLength(1);
    expect(payload.messages[0].role).toBe("user");
  });

  it("rejects invalid substitution payload", () => {
    expect(() => validateSubstitutionPayload({ ingredient: "" })).toThrow(ApiError);
  });

  it("rejects non-json requests", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "hello",
    });

    await expect(parseJsonBody(request)).rejects.toBeInstanceOf(ApiError);
  });

  it("validates share recipe payload", () => {
    const payload = validateSharedRecipeLookupPayload({ shareToken: "abcDEF12.secretValueToken1234" });
    expect(payload.shareToken).toBe("abcDEF12.secretValueToken1234");
    expect(() => validateSharedRecipeLookupPayload({ shareToken: "bad token" })).toThrow(ApiError);
  });
});
