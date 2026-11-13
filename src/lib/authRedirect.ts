/**
 * Build a Supabase Auth redirect URL for the current origin.
 * Uses window.location.origin so local (Vite :8080) and production
 * (https://www.ladhaquest.com) never hardcode localhost.
 */
export function getAuthRedirectUrl(path = "/auth/callback"): string {
  if (typeof window === "undefined") {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${normalized}`;
}

/**
 * Safe in-app path after sign-in (query `redirect` / `next`).
 * Only relative same-origin paths; blocks open redirects.
 */
export function getPostAuthRedirect(
  search: string = typeof window !== "undefined" ? window.location.search : "",
  fallback = "/",
): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const raw = params.get("redirect") || params.get("next") || fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return fallback;
  }
  return raw;
}

export type AuthUrlError = {
  error: string;
  errorCode: string | null;
  errorDescription: string | null;
};

/** Parse Supabase auth errors from hash or query (otp_expired, access_denied, etc.). */
export function parseAuthUrlError(
  search: string = typeof window !== "undefined" ? window.location.search : "",
  hash: string = typeof window !== "undefined" ? window.location.hash : "",
): AuthUrlError | null {
  const fromSearch = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const fromHash = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);

  const error = fromSearch.get("error") || fromHash.get("error");
  if (!error) return null;

  return {
    error,
    errorCode: fromSearch.get("error_code") || fromHash.get("error_code"),
    errorDescription:
      fromSearch.get("error_description") || fromHash.get("error_description"),
  };
}

export function friendlyAuthErrorMessage(authError: AuthUrlError): string {
  const code = authError.errorCode?.toLowerCase() ?? "";
  const desc = (authError.errorDescription || "").replace(/\+/g, " ");

  if (code === "otp_expired" || /expired|invalid/i.test(desc)) {
    return "This email link is invalid or has expired. Request a new confirmation or reset email, then use the latest link once.";
  }
  if (authError.error === "access_denied") {
    return desc || "Access was denied. Please try signing in again or request a new email link.";
  }
  return desc || "Authentication failed. Please try again.";
}
