import { supabase } from "@/integrations/supabase/client";

const DEFAULT_REDIRECT = "/";

function sanitizePath(input: string | null | undefined): string | null {
  if (!input) return null;
  if (!input.startsWith("/")) return null;
  if (input.startsWith("//")) return null;
  return input;
}

export function getRedirectTarget(searchParams: URLSearchParams, locationState: unknown): string {
  const nextFromQuery = sanitizePath(searchParams.get("next"));
  if (nextFromQuery) return nextFromQuery;

  const fromState = (locationState as { from?: string | { pathname?: string } } | null)?.from;
  const candidate = typeof fromState === "string" ? fromState : fromState?.pathname;
  const nextFromState = sanitizePath(candidate);
  if (nextFromState) return nextFromState;

  return DEFAULT_REDIRECT;
}

export function buildOAuthRedirectUrl(nextPath: string): string {
  const safeNext = sanitizePath(nextPath) || DEFAULT_REDIRECT;
  const params = new URLSearchParams({ oauth: "1", next: safeNext });
  return `${window.location.origin}/auth?${params.toString()}`;
}

export function getAuthErrorFromParams(searchParams: URLSearchParams): string | null {
  const errorDescription = searchParams.get("error_description");
  if (errorDescription) return errorDescription.replace(/\+/g, " ");

  const error = searchParams.get("error");
  if (error) return error.replace(/\+/g, " ");

  return null;
}

export function isOAuthReturn(searchParams: URLSearchParams): boolean {
  return searchParams.has("oauth") || searchParams.has("code");
}

export async function signInWithGoogleOAuth(nextPath: string) {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: buildOAuthRedirectUrl(nextPath),
    },
  });
}
