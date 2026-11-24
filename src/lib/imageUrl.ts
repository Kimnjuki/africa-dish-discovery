/**
 * Optimize remote recipe images for faster loads (especially mobile).
 * - Unsplash: width/quality params
 * - Supabase storage: render/image transform when available
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
      u.searchParams.set("w", String(width));
      u.searchParams.set("q", String(quality));
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      return u.toString();
    }

    // Supabase object → render transform (works when Image Transformation is enabled)
    if (u.hostname.includes("supabase") && u.pathname.includes("/storage/v1/object/")) {
      u.pathname = u.pathname.replace("/storage/v1/object/", "/storage/v1/render/image/");
      u.searchParams.set("width", String(width));
      u.searchParams.set("quality", String(quality));
      u.searchParams.set("resize", "contain");
      return u.toString();
    }

    // Already a render URL — ensure width/quality
    if (u.hostname.includes("supabase") && u.pathname.includes("/storage/v1/render/image/")) {
      u.searchParams.set("width", String(width));
      u.searchParams.set("quality", String(quality));
      return u.toString();
    }

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
