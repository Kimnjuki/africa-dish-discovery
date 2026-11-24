/**
 * Affiliate / shop-link helpers for the diaspora commerce pilot.
 * Appends Amazon associate tags only when VITE_AMAZON_ASSOCIATE_TAG is set.
 */

const AMAZON_HOSTS = new Set([
  "www.amazon.com",
  "amazon.com",
  "www.amazon.co.uk",
  "amazon.co.uk",
  "www.amazon.ca",
  "amazon.ca",
]);

export function getAmazonAssociateTag(): string | null {
  const tag = String(import.meta.env.VITE_AMAZON_ASSOCIATE_TAG || "").trim();
  return tag || null;
}

/** Return outbound URL, attaching Amazon tag when configured. */
export function withAffiliateParams(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const tag = getAmazonAssociateTag();
    if (tag && AMAZON_HOSTS.has(url.hostname.toLowerCase())) {
      url.searchParams.set("tag", tag);
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

export type PreferredShopRegion = "diaspora-us" | "diaspora-uk" | "ng" | "ke" | "all";

/** Guess shop region from recipe country for pilot prioritization. */
export function preferredShopRegion(country?: string | null): PreferredShopRegion {
  const c = String(country || "").toLowerCase();
  if (c.includes("nigeria") || c.includes("ghana") || c.includes("benin")) return "ng";
  if (c.includes("kenya") || c.includes("uganda") || c.includes("tanzania")) return "ke";
  if (
    c.includes("united kingdom") ||
    c.includes("uk") ||
    c.includes("britain") ||
    c.includes("ireland")
  ) {
    return "diaspora-uk";
  }
  return "diaspora-us";
}

export function rankShopLinks<T extends { region: string | null }>(
  links: T[],
  preferred: PreferredShopRegion
): T[] {
  const score = (region: string | null) => {
    if (!region) return 50;
    if (region === preferred) return 0;
    if (preferred === "ng" || preferred === "ke") {
      if (region.startsWith("diaspora-")) return 20;
    }
    if (preferred.startsWith("diaspora-") && region.startsWith("diaspora-")) return 10;
    return 40;
  };
  return [...links].sort((a, b) => score(a.region) - score(b.region));
}
