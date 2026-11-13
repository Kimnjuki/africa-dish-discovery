/**
 * Offline-first snapshots for LadhaQuest (F09).
 * Uses localStorage (not the full recipe catalog) so the SW stays lean.
 */

export const OFFLINE_KEYS = {
  recipes: "ladhaquest_cached_recipes",
  pantry: "ladhaquest_offline_pantry",
  mealPlan: "ladhaquest_offline_meal_plan",
  pantryQueue: "ladhaquest_pantry_queue",
  dataSaver: "ladhaquest_data_saver",
} as const;

const MAX_CACHED_RECIPES = 40;

export type OfflineRecipe = {
  id: string;
  name: string;
  country: string;
  image_url: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: string | null;
  summary: string | null;
  slug: string;
  ingredients?: unknown;
  steps?: unknown;
  cachedAt: string;
};

export type OfflinePantryItem = {
  id: string;
  ingredient_name: string;
  quantity?: number | null;
  unit?: string | null;
  expires_at?: string | null;
  storage_location?: string | null;
  category?: string | null;
  added_at?: string | null;
};

export type OfflinePantrySnapshot = {
  userId: string;
  items: OfflinePantryItem[];
  updatedAt: string;
};

export type OfflineMealPlanMeal = {
  id: string;
  day_of_week: number;
  meal_type: string;
  servings: number;
  notes?: string | null;
  recipe?: {
    id: string;
    name: string;
    country?: string;
    image_url?: string | null;
    slug?: string | null;
    prep_time?: number | null;
    cook_time?: number | null;
  } | null;
};

export type OfflineMealPlanSnapshot = {
  userId: string;
  plan: {
    id: string;
    name: string;
    week_start_date: string;
  };
  meals: OfflineMealPlanMeal[];
  updatedAt: string;
};

export type PantryQueueOp =
  | {
      id: string;
      type: "insert";
      payload: {
        ingredient_name: string;
        quantity?: number;
        unit?: string;
        expires_at?: string | null;
      };
      createdAt: string;
      localId: string;
    }
  | {
      id: string;
      type: "update";
      payload: {
        id: string;
        ingredient_name?: string;
        quantity?: number | null;
        unit?: string | null;
        expires_at?: string | null;
      };
      createdAt: string;
    }
  | {
      id: string;
      type: "delete";
      payload: { id: string };
      createdAt: string;
    };

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("offlineStore write failed", key, error);
  }
}

/** Prefer smaller Unsplash / common CDN URLs when data-saver is on. */
export function lighterImageUrl(url: string | null | undefined, dataSaver: boolean): string | null {
  if (!url) return null;
  if (!dataSaver) return url;
  try {
    const u = new URL(url);
    if (u.hostname.includes("unsplash.com") || u.hostname.includes("images.unsplash.com")) {
      u.searchParams.set("w", "480");
      u.searchParams.set("q", "60");
      u.searchParams.set("auto", "format");
      return u.toString();
    }
    if (u.hostname.includes("supabase") && u.pathname.includes("/storage/")) {
      // Keep original path; caller may still skip decode-heavy images when saver is on
      return url;
    }
  } catch {
    /* keep original */
  }
  return url;
}

export function getDataSaver(): boolean {
  return localStorage.getItem(OFFLINE_KEYS.dataSaver) === "1";
}

export function setDataSaver(enabled: boolean): void {
  localStorage.setItem(OFFLINE_KEYS.dataSaver, enabled ? "1" : "0");
  window.dispatchEvent(new CustomEvent("ladhaquest:data-saver", { detail: enabled }));
}

export function getCachedRecipes(): OfflineRecipe[] {
  return readJson<OfflineRecipe[]>(OFFLINE_KEYS.recipes, []);
}

export function cacheRecipe(recipe: Omit<OfflineRecipe, "cachedAt"> & { cachedAt?: string }): OfflineRecipe[] {
  const list = getCachedRecipes().filter((r) => r.id !== recipe.id);
  const entry: OfflineRecipe = {
    ...recipe,
    image_url: recipe.image_url ?? null,
    prep_time: recipe.prep_time ?? null,
    cook_time: recipe.cook_time ?? null,
    servings: recipe.servings ?? null,
    difficulty: recipe.difficulty ?? null,
    summary: recipe.summary ?? null,
    cachedAt: recipe.cachedAt || new Date().toISOString(),
  };
  list.unshift(entry);
  const trimmed = list.slice(0, MAX_CACHED_RECIPES);
  writeJson(OFFLINE_KEYS.recipes, trimmed);
  return trimmed;
}

export function removeCachedRecipe(recipeId: string): OfflineRecipe[] {
  const updated = getCachedRecipes().filter((r) => r.id !== recipeId);
  writeJson(OFFLINE_KEYS.recipes, updated);
  return updated;
}

export function clearCachedRecipes(): void {
  localStorage.removeItem(OFFLINE_KEYS.recipes);
}

export function savePantrySnapshot(userId: string, items: OfflinePantryItem[]): OfflinePantrySnapshot {
  const snapshot: OfflinePantrySnapshot = {
    userId,
    items,
    updatedAt: new Date().toISOString(),
  };
  writeJson(OFFLINE_KEYS.pantry, snapshot);
  return snapshot;
}

export function getPantrySnapshot(userId?: string | null): OfflinePantrySnapshot | null {
  const snap = readJson<OfflinePantrySnapshot | null>(OFFLINE_KEYS.pantry, null);
  if (!snap) return null;
  if (userId && snap.userId !== userId) return null;
  return snap;
}

export function saveMealPlanSnapshot(
  userId: string,
  plan: OfflineMealPlanSnapshot["plan"],
  meals: OfflineMealPlanMeal[]
): OfflineMealPlanSnapshot {
  const snapshot: OfflineMealPlanSnapshot = {
    userId,
    plan,
    meals,
    updatedAt: new Date().toISOString(),
  };
  writeJson(OFFLINE_KEYS.mealPlan, snapshot);
  return snapshot;
}

export function getMealPlanSnapshot(userId?: string | null): OfflineMealPlanSnapshot | null {
  const snap = readJson<OfflineMealPlanSnapshot | null>(OFFLINE_KEYS.mealPlan, null);
  if (!snap) return null;
  if (userId && snap.userId !== userId) return null;
  return snap;
}

export function getPantryQueue(): PantryQueueOp[] {
  return readJson<PantryQueueOp[]>(OFFLINE_KEYS.pantryQueue, []);
}

type PantryQueueOpInput =
  | Omit<Extract<PantryQueueOp, { type: "insert" }>, "id" | "createdAt"> & { id?: string }
  | Omit<Extract<PantryQueueOp, { type: "update" }>, "id" | "createdAt"> & { id?: string }
  | Omit<Extract<PantryQueueOp, { type: "delete" }>, "id" | "createdAt"> & { id?: string };

export function enqueuePantryOp(op: PantryQueueOpInput): PantryQueueOp[] {
  const queue = getPantryQueue();
  const full = {
    ...op,
    id: op.id || `pq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  } as PantryQueueOp;
  queue.push(full);
  writeJson(OFFLINE_KEYS.pantryQueue, queue);
  window.dispatchEvent(new CustomEvent("ladhaquest:pantry-queue", { detail: queue.length }));
  return queue;
}

export function setPantryQueue(queue: PantryQueueOp[]): void {
  writeJson(OFFLINE_KEYS.pantryQueue, queue);
  window.dispatchEvent(new CustomEvent("ladhaquest:pantry-queue", { detail: queue.length }));
}

export function clearPantryQueue(): void {
  localStorage.removeItem(OFFLINE_KEYS.pantryQueue);
  window.dispatchEvent(new CustomEvent("ladhaquest:pantry-queue", { detail: 0 }));
}

export function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}
