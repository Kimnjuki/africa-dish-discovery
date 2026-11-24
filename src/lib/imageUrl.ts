/**
 * Optimize remote recipe images for faster loads (especially mobile).
 * - Unsplash: width/quality params
 * - Supabase storage: keep /object/public URLs (Image Transformation is not enabled → /render/image returns 403)
 * - Falls back to original URL on any parse failure
 */

const PLACEHOLDER = "/placeholder.svg";

export function optimizeImageUrl(
  url: string | null | undefined,
  opts?: { width?: number; quality?: number; dataSaver?: boolean }
): string | null {
  if (!url || url === PLACEHOLDER) return url || null;
  const width = opts?.width ?? (opts?.dataSaver ? 480 : 800);
  const quality = opts?.quality ?? (opts?.dataSaver ? 55 : 72);

  try {
    const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://www.ladhaquest.com");

    if (u.hostname.includes("unsplash.com")) {
      // Drop non-Unsplash junk params that break CDN caching (e.g. &dish=…)
      const w = u.searchParams.get("w") || String(width);
      const q = u.searchParams.get("q") || String(quality);
      const clean = new URL(`${u.origin}${u.pathname}`);
      clean.searchParams.set("w", w);
      clean.searchParams.set("q", q);
      clean.searchParams.set("auto", "format");
      clean.searchParams.set("fit", "crop");
      return clean.toString();
    }

    // If a previous build rewrote to /render/image/, map back to public object URL
    if (u.hostname.includes("supabase") && u.pathname.includes("/storage/v1/render/image/")) {
      u.pathname = u.pathname.replace("/storage/v1/render/image/", "/storage/v1/object/");
      u.searchParams.delete("width");
      u.searchParams.delete("quality");
      u.searchParams.delete("resize");
      return u.toString();
    }

    // Leave Supabase /object/public URLs unchanged (transforms require a paid add-on)
    return url;
  } catch {
    return url;
  }
}

export function imageSrcSet(
  url: string | null | undefined,
  widths: number[] = [320, 640, 960]
): string | undefined {
  if (!url) return undefined;
  if (!url.includes("unsplash.com")) return undefined;
  try {
    const parts = widths
      .map((w) => {
        const optimized = optimizeImageUrl(url, { width: w, quality: 70 });
        return optimized ? `${optimized} ${w}w` : null;
      })
      .filter(Boolean);
    return parts.length ? parts.join(", ") : undefined;
  } catch {
    return undefined;
  }
}

export { PLACEHOLDER as IMAGE_PLACEHOLDER };
