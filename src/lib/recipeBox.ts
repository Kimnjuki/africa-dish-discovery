/**
 * Recipe Box — local cookbooks / folders for saved recipes (F03).
 * Works offline; optional sync notes live in localStorage until a DB collection
 * table is migrated.
 */

const BOX_KEY = "ladhaquest_recipe_box";

export type RecipeBoxEntry = {
  recipeId: string;
  slug: string;
  name: string;
  country?: string;
  imageUrl?: string | null;
  folderId: string;
  cookedAt?: string | null;
  savedAt: string;
};

export type RecipeFolder = {
  id: string;
  name: string;
  createdAt: string;
};

export type RecipeBoxState = {
  folders: RecipeFolder[];
  entries: RecipeBoxEntry[];
};

function emptyState(): RecipeBoxState {
  return {
    folders: [
      {
        id: "favorites",
        name: "Favorites",
        createdAt: new Date(0).toISOString(),
      },
      {
        id: "weeknight",
        name: "Weeknight staples",
        createdAt: new Date(0).toISOString(),
      },
      {
        id: "cooked",
        name: "Cooked",
        createdAt: new Date(0).toISOString(),
      },
    ],
    entries: [],
  };
}

function readBox(): RecipeBoxState {
  try {
    const raw = localStorage.getItem(BOX_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as RecipeBoxState;
    if (!parsed.folders?.length) return emptyState();
    return {
      folders: parsed.folders,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    return emptyState();
  }
}

function writeBox(state: RecipeBoxState): RecipeBoxState {
  try {
    localStorage.setItem(BOX_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("ladhaquest:recipe-box", { detail: state }));
  } catch (error) {
    console.warn("recipeBox write failed", error);
  }
  return state;
}

export function getRecipeBox(): RecipeBoxState {
  return readBox();
}

export function createFolder(name: string): RecipeBoxState {
  const state = readBox();
  const trimmed = name.trim();
  if (!trimmed) return state;
  const id = `folder_${Date.now().toString(36)}`;
  state.folders.push({ id, name: trimmed, createdAt: new Date().toISOString() });
  return writeBox(state);
}

export function renameFolder(folderId: string, name: string): RecipeBoxState {
  const state = readBox();
  const folder = state.folders.find((f) => f.id === folderId);
  if (folder && name.trim()) folder.name = name.trim();
  return writeBox(state);
}

export function deleteFolder(folderId: string): RecipeBoxState {
  if (folderId === "favorites" || folderId === "weeknight" || folderId === "cooked") {
    return readBox();
  }
  const state = readBox();
  state.folders = state.folders.filter((f) => f.id !== folderId);
  state.entries = state.entries.map((e) =>
    e.folderId === folderId ? { ...e, folderId: "favorites" } : e
  );
  return writeBox(state);
}

export function saveToFolder(
  entry: Omit<RecipeBoxEntry, "savedAt" | "folderId"> & { folderId?: string }
): RecipeBoxState {
  const state = readBox();
  const folderId = entry.folderId || "favorites";
  state.entries = state.entries.filter(
    (e) => !(e.recipeId === entry.recipeId && e.folderId === folderId)
  );
  state.entries.unshift({
    recipeId: entry.recipeId,
    slug: entry.slug,
    name: entry.name,
    country: entry.country,
    imageUrl: entry.imageUrl,
    folderId,
    cookedAt: entry.cookedAt ?? null,
    savedAt: new Date().toISOString(),
  });
  return writeBox(state);
}

export function moveToFolder(recipeId: string, fromFolder: string, toFolder: string): RecipeBoxState {
  const state = readBox();
  state.entries = state.entries.map((e) =>
    e.recipeId === recipeId && e.folderId === fromFolder
      ? { ...e, folderId: toFolder }
      : e
  );
  return writeBox(state);
}

export function removeFromFolder(recipeId: string, folderId?: string): RecipeBoxState {
  const state = readBox();
  state.entries = state.entries.filter((e) =>
    folderId ? !(e.recipeId === recipeId && e.folderId === folderId) : e.recipeId !== recipeId
  );
  return writeBox(state);
}

export function markCooked(recipeId: string, slug: string, name: string, country?: string): RecipeBoxState {
  const state = readBox();
  const cookedAt = new Date().toISOString();
  // Update any existing entries
  state.entries = state.entries.map((e) =>
    e.recipeId === recipeId ? { ...e, cookedAt } : e
  );
  // Ensure it appears in Cooked folder
  if (!state.entries.some((e) => e.recipeId === recipeId && e.folderId === "cooked")) {
    state.entries.unshift({
      recipeId,
      slug,
      name,
      country,
      folderId: "cooked",
      cookedAt,
      savedAt: cookedAt,
    });
  }
  return writeBox(state);
}

export function isInBox(recipeId: string, folderId?: string): boolean {
  const state = readBox();
  return state.entries.some(
    (e) => e.recipeId === recipeId && (!folderId || e.folderId === folderId)
  );
}

export function entriesInFolder(folderId: string): RecipeBoxEntry[] {
  return readBox().entries.filter((e) => e.folderId === folderId);
}
