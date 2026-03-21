import { describe, expect, it } from "vitest";
import { buildOAuthRedirectUrl, getAuthErrorFromParams, getRedirectTarget } from "@/services/authService";

describe("authService", () => {
  it("prefers query next redirect when valid", () => {
    const params = new URLSearchParams({ next: "/profile" });
    const redirect = getRedirectTarget(params, { from: "/recipes" });
    expect(redirect).toBe("/profile");
  });

  it("falls back to state redirect when query is invalid", () => {
    const params = new URLSearchParams({ next: "https://example.com" });
    const redirect = getRedirectTarget(params, { from: "/favorites" });
    expect(redirect).toBe("/favorites");
  });

  it("builds oauth redirect url preserving next path", () => {
    const redirectUrl = buildOAuthRedirectUrl("/create-recipe");
    expect(redirectUrl).toContain("/auth?");
    expect(redirectUrl).toContain("next=%2Fcreate-recipe");
  });

  it("extracts auth error message from params", () => {
    const params = new URLSearchParams({ error_description: "invalid+grant" });
    expect(getAuthErrorFromParams(params)).toBe("invalid grant");
  });
});
