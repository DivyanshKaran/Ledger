export function getSiteUrl(): string {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (typeof envUrl === "string" && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
}
