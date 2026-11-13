import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { parseAuthUrlError } from "@/lib/authRedirect";

/**
 * If Supabase Site URL still points at `/` (or an old localhost host),
 * error hashes like `#error=access_denied&error_code=otp_expired` land on home.
 * Forward them to /auth so the user sees a clear message.
 */
export function AuthUrlErrorRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/auth" || location.pathname.startsWith("/auth/")) {
      return;
    }

    const authError = parseAuthUrlError(location.search, location.hash || window.location.hash);
    if (!authError) return;

    const params = new URLSearchParams({
      error: authError.error,
    });
    if (authError.errorCode) params.set("error_code", authError.errorCode);
    if (authError.errorDescription) {
      params.set("error_description", authError.errorDescription);
    }

    navigate(`/auth?${params.toString()}`, { replace: true });
  }, [location.hash, location.pathname, location.search, navigate]);

  return null;
}
