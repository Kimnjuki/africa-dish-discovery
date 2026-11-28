import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { stripTrailingSlash } from "@/lib/recipeSeoOverrides";

/**
 * Client-side mirror of nginx trailing-slash 301s.
 * Keeps local/dev and misconfigured proxies on the slash-free canonical path.
 * Production crawlers should hit nginx first; this is a safety net for humans.
 */
export function CanonicalPathRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { pathname, search, hash } = location;
    if (pathname.length <= 1 || !pathname.endsWith("/")) return;
    const clean = stripTrailingSlash(pathname);
    if (clean === pathname) return;
    navigate(`${clean}${search}${hash}`, { replace: true });
  }, [location, navigate]);

  return null;
}
