/**
 * Recently viewed recipes — continue cooking retention loop.
 */

const KEY = "ladhaquest_recently_viewed";
const MAX = 24;

export type RecentRecipe = {
  id: string;
  slug: string;
  name: string;
  country?: string;
  imageUrl?: string | null;
  viewedAt: string;
};

function read(): RecentRecipe[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: RecentRecipe[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new CustomEvent("ladhaquest:recently-viewed"));
  } catch {
    /* quota */
  }
}

export function trackRecipeView(entry: Omit<RecentRecipe, "viewedAt">): void {
  const list = read().filter((r) => r.id !== entry.id && r.slug !== entry.slug);
  list.unshift({ ...entry, viewedAt: new Date().toISOString() });
  write(list);
}

export function getRecentlyViewed(): RecentRecipe[] {
  return read();
}

export function clearRecentlyViewed(): void {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent("ladhaquest:recently-viewed"));
  } catch {
    /* ignore */
  }
}
