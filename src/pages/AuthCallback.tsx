import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  friendlyAuthErrorMessage,
  parseAuthUrlError,
} from "@/lib/authRedirect";

/**
 * Handles Supabase email / OAuth redirects (?code= PKCE or #access_token hash),
 * then sends the user into the app. Surfaces otp_expired and similar errors on /auth.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Confirming your email…");

  useEffect(() => {
    let cancelled = false;

    const finishWithError = (description: string) => {
      const params = new URLSearchParams({
        error: "access_denied",
        error_description: description,
      });
      navigate(`/auth?${params.toString()}`, { replace: true });
    };

    const run = async () => {
      const authError = parseAuthUrlError();
      if (authError) {
        finishWithError(friendlyAuthErrorMessage(authError));
        return;
      }

      const search = new URLSearchParams(window.location.search);
      const next = search.get("next") || "/";
      const code = search.get("code");

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // Implicit / hash tokens: client detectSessionInUrl processes the hash
          const { error } = await supabase.auth.getSession();
          if (error) throw error;
        }

        if (cancelled) return;

        // Clear auth params from the address bar before navigating
        if (window.location.hash || search.has("code")) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        navigate(next.startsWith("/") ? next : "/", { replace: true });
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Could not complete sign-in from this email link.";
        setMessage(msg);
        finishWithError(
          /expired|invalid/i.test(msg)
            ? "This email link is invalid or has expired. Request a new confirmation email and click the latest link once."
            : msg,
        );
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-earth flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
