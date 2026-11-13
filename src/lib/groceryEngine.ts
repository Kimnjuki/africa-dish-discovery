import type { IngredientValue } from "@/types/content";
import { formatQuantity, parseQuantity } from "@/lib/recipeUnits";
import { normalizeIngredientName } from "@/utils/recipeMatching";

export type AisleId =
  | "produce"
  | "meat_fish"
  | "dairy"
  | "pantry"
  | "spices"
  | "grains"
  | "frozen"
  | "beverages"
  | "bakery"
  | "other";

export const AISLE_ORDER: AisleId[] = [
  "produce",
  "meat_fish",
  "dairy",
  "grains",
  "pantry",
  "spices",
  "bakery",
  "frozen",
  "beverages",
  "other",
];

export const AISLE_LABELS: Record<AisleId, string> = {
  produce: "Produce / Market stall",
  meat_fish: "Meat & fish",
  dairy: "Dairy & eggs",
  grains: "Grains & staples",
  pantry: "Pantry / dry goods",
  spices: "Spices & seasonings",
  bakery: "Bakery",
  frozen: "Frozen",
  beverages: "Beverages",
  other: "Other",
};

type UnitFamily = "volume_ml" | "mass_g" | "count" | "unknown";

interface UnitDef {
  canonical: string;
  family: UnitFamily;
  toBase: number;
}

const UNIT_DEFS: Record<string, UnitDef> = {
  ml: { canonical: "ml", family: "volume_ml", toBase: 1 },
  milliliter: { canonical: "ml", family: "volume_ml", toBase: 1 },
  milliliters: { canonical: "ml", family: "volume_ml", toBase: 1 },
  millilitre: { canonical: "ml", family: "volume_ml", toBase: 1 },
  millilitres: { canonical: "ml", family: "volume_ml", toBase: 1 },
  l: { canonical: "ml", family: "volume_ml", toBase: 1000 },
  liter: { canonical: "ml", family: "volume_ml", toBase: 1000 },
  liters: { canonical: "ml", family: "volume_ml", toBase: 1000 },
  litre: { canonical: "ml", family: "volume_ml", toBase: 1000 },
  litres: { canonical: "ml", family: "volume_ml", toBase: 1000 },
  cup: { canonical: "ml", family: "volume_ml", toBase: 240 },
  cups: { canonical: "ml", family: "volume_ml", toBase: 240 },
  c: { canonical: "ml", family: "volume_ml", toBase: 240 },
  tbsp: { canonical: "ml", family: "volume_ml", toBase: 15 },
  tablespoon: { canonical: "ml", family: "volume_ml", toBase: 15 },
  tablespoons: { canonical: "ml", family: "volume_ml", toBase: 15 },
  tbs: { canonical: "ml", family: "volume_ml", toBase: 15 },
  tsp: { canonical: "ml", family: "volume_ml", toBase: 5 },
  teaspoon: { canonical: "ml", family: "volume_ml", toBase: 5 },
  teaspoons: { canonical: "ml", family: "volume_ml", toBase: 5 },
  "fl oz": { canonical: "ml", family: "volume_ml", toBase: 30 },
  floz: { canonical: "ml", family: "volume_ml", toBase: 30 },
  g: { canonical: "g", family: "mass_g", toBase: 1 },
  gram: { canonical: "g", family: "mass_g", toBase: 1 },
  grams: { canonical: "g", family: "mass_g", toBase: 1 },
  gr: { canonical: "g", family: "mass_g", toBase: 1 },
  kg: { canonical: "g", family: "mass_g", toBase: 1000 },
  kilogram: { canonical: "g", family: "mass_g", toBase: 1000 },
  kilograms: { canonical: "g", family: "mass_g", toBase: 1000 },
  oz: { canonical: "g", family: "mass_g", toBase: 28 },
  ounce: { canonical: "g", family: "mass_g", toBase: 28 },
  ounces: { canonical: "g", family: "mass_g", toBase: 28 },
  lb: { canonical: "g", family: "mass_g", toBase: 454 },
  lbs: { canonical: "g", family: "mass_g", toBase: 454 },
  pound: { canonical: "g", family: "mass_g", toBase: 454 },
  pounds: { canonical: "g", family: "mass_g", toBase: 454 },
  clove: { canonical: "clove", family: "count", toBase: 1 },
  cloves: { canonical: "clove", family: "count", toBase: 1 },
  piece: { canonical: "piece", family: "count", toBase: 1 },
  pieces: { canonical: "piece", family: "count", toBase: 1 },
  pc: { canonical: "piece", family: "count", toBase: 1 },
  pcs: { canonical: "piece", family: "count", toBase: 1 },
  can: { canonical: "can", family: "count", toBase: 1 },
  cans: { canonical: "can", family: "count", toBase: 1 },
  bunch: { canonical: "bunch", family: "count", toBase: 1 },
  bunches: { canonical: "bunch", family: "count", toBase: 1 },
  pack: { canonical: "pack", family: "count", toBase: 1 },
  packs: { canonical: "pack", family: "count", toBase: 1 },
  pinch: { canonical: "pinch", family: "count", toBase: 1 },
  pinches: { canonical: "pinch", family: "count", toBase: 1 },
};

const NUMBER_RE = /(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/;
const UNIT_RE =
  /\b(cups?|c|tablespoons?|tbsp|tbs|teaspoons?|tsp|fl\.?\s?oz|fluid ounces?|pounds?|lbs?|lb|ounces?|oz|kilograms?|kgs?|kg|grams?|gr|g|litres?|liters?|l|millilitres?|milliliters?|mls?|ml|cloves?|pieces?|pcs?|pc|cans?|bunches?|bunch|packs?|pinches?|pinch)\b/i;

const AISLE_KEYWORDS: { aisle: AisleId; patterns: RegExp[] }[] = [
  {
    aisle: "produce",
    patterns: [
      /\b(tomatoes?|onions?|garlic|peppers?|chilis?|chillies?|chillis?|scotch bonnet|habaneros?|ginger|lemons?|limes?|oranges?|mangos?|mangoes?|plantains?|bananas?|spinach|kale|cabbage|carrots?|potatoes?|yams?|cassava|okra|eggplants?|aubergines?|lettuce|cucumbers?|avocados?|herbs?|parsley|cilantro|coriander leaf|mint|basil|greens?|vegetables?|shallots?|leeks?|celery|beets?|fruit)\b/i,
    ],
  },
  {
    aisle: "meat_fish",
    patterns: [
      /\b(chicken|beef|lamb|goat|pork|turkey|fish|shrimp|prawn|meat|sausage|bacon|liver|offal|tilapia|salmon|cod|mutton|steak|wing|thigh)\b/i,
    ],
  },
  {
    aisle: "dairy",
    patterns: [/\b(milk|butter|cheese|yogurt|yoghurt|cream|egg|ghee|niter kibbeh|labneh)\b/i],
  },
  {
    aisle: "grains",
    patterns: [
      /\b(rice|couscous|fonio|millet|sorghum|quinoa|pasta|noodles?|flour|semolina|cornmeal|ogí|ogi|banku|fufu|injera|bread|teff|oat|wheat|bulgur)\b/i,
    ],
  },
  {
    aisle: "spices",
    patterns: [
      /\b(spice|cumin|coriander|turmeric|paprika|berbere|yaji|curry|cinnamon|clove|cardamom|nutmeg|peppercorn|salt|seasoning|bouillon|stock cube|maggi|suya)\b/i,
    ],
  },
  {
    aisle: "bakery",
    patterns: [/\b(bread|roll|bun|pita|baguette|pastry|croissant)\b/i],
  },
  {
    aisle: "frozen",
    patterns: [/\b(frozen|ice)\b/i],
  },
  {
    aisle: "beverages",
    patterns: [/\b(water|juice|tea|coffee|wine|beer|soda|drink|hibiscus|zobo|bissap)\b/i],
  },
  {
    aisle: "pantry",
    patterns: [
      /\b(oil|vinegar|sauce|paste|tomato paste|beans?|lentil|chickpea|pea|nut|peanut|seed|sugar|honey|syrup|coconut|palm|broth|stock|soy|fish sauce|olive|sesame|tahini|mustard|mayo)\b/i,
    ],
  },
];

export interface ParsedGroceryLine {
  name: string;
  normalizedKey: string;
  quantity: number | null;
  unit: string;
  unitFamily: UnitFamily;
  quantityBase: number | null;
  displayUnit: string;
  raw: string;
  aisle: AisleId;
}

export interface GroceryListItem {
  id: string;
  name: string;
  normalizedKey: string;
  quantity: number | null;
  unit: string;
  unitFamily: UnitFamily;
  quantityDisplay: string;
  aisle: AisleId;
  sources: string[];
  notes: string[];
  checked?: boolean;
}

export interface GroceryAisleGroup {
  aisle: AisleId;
  label: string;
  items: GroceryListItem[];
}

export interface RecipeIngredientSource {
  recipeName?: string;
  ingredients: IngredientValue[] | null | undefined;
  /** Scale relative to recipe base servings (plannedServings / recipeServings). */
  servingsMultiplier?: number;
}

function canonicalizeUnit(raw: string): UnitDef | null {
  const key = raw.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
  if (UNIT_DEFS[key]) return UNIT_DEFS[key];
  const compact = key.replace(/\s/g, "");
  if (UNIT_DEFS[compact]) return UNIT_DEFS[compact];
  return null;
}

function guessAisle(name: string): AisleId {
  for (const entry of AISLE_KEYWORDS) {
    if (entry.patterns.some((re) => re.test(name))) return entry.aisle;
  }
  return "other";
}

function extractNameAndQty(text: string): {
  name: string;
  quantity: number | null;
  unit: string;
  unitDef: UnitDef | null;
} {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return { name: "", quantity: null, unit: "", unitDef: null };

  const numMatch = cleaned.match(NUMBER_RE);
  let quantity: number | null = null;
  let rest = cleaned;
  if (numMatch && cleaned.startsWith(numMatch[0])) {
    quantity = parseQuantity(numMatch[0]);
    rest = cleaned.slice(numMatch[0].length).trim();
  }

  const unitMatch = rest.match(UNIT_RE);
  let unit = "";
  let unitDef: UnitDef | null = null;
  if (unitMatch && rest.toLowerCase().startsWith(unitMatch[0].toLowerCase())) {
    unit = unitMatch[0];
    unitDef = canonicalizeUnit(unit);
    rest = rest.slice(unitMatch[0].length).trim().replace(/^of\s+/i, "");
  } else if (unitMatch) {
    // Unit appears mid-string (e.g. "salt to taste") — leave name intact
    unit = "";
  }

  const name = rest.replace(/^[,:-]\s*/, "").trim() || cleaned;
  return { name, quantity, unit, unitDef };
}

export function parseIngredientValue(
  ingredient: IngredientValue,
  multiplier = 1
): ParsedGroceryLine | null {
  let name = "";
  let quantity: number | null = null;
  let unit = "";
  let unitDef: UnitDef | null = null;
  let raw = "";

  if (typeof ingredient === "string") {
    raw = ingredient;
    const parsed = extractNameAndQty(ingredient);
    name = parsed.name;
    quantity = parsed.quantity;
    unit = parsed.unit;
    unitDef = parsed.unitDef;
  } else if (ingredient && typeof ingredient === "object") {
    name = String(ingredient.item || ingredient.ingredient || ingredient.name || "").trim();
    const qtyRaw = ingredient.quantity ?? ingredient.amount;
    if (qtyRaw !== undefined && qtyRaw !== null && String(qtyRaw).trim() !== "") {
      const asNum = Number(qtyRaw);
      if (!Number.isNaN(asNum)) {
        quantity = asNum;
      } else {
        const token = String(qtyRaw).match(NUMBER_RE)?.[0];
        quantity = token ? parseQuantity(token) : null;
      }
    }
    unit = String(ingredient.unit || "").trim();
    unitDef = unit ? canonicalizeUnit(unit) : null;
    if (!unitDef && !quantity) {
      const line = [qtyRaw, unit, name].filter(Boolean).join(" ").trim();
      const parsed = extractNameAndQty(line || name);
      name = parsed.name || name;
      quantity = parsed.quantity;
      unit = parsed.unit;
      unitDef = parsed.unitDef;
    }
    raw = [qtyRaw, unit, name].filter(Boolean).join(" ").trim();
  }

  if (!name) return null;

  if (quantity !== null && multiplier !== 1) {
    quantity = quantity * multiplier;
  }

  const normalizedKey = normalizeIngredientName(name);
  if (!normalizedKey) return null;

  const quantityBase =
    quantity !== null && unitDef ? quantity * unitDef.toBase : quantity;

  return {
    name: name.replace(/\s+/g, " ").trim(),
    normalizedKey,
    quantity,
    unit: unitDef?.canonical || unit.toLowerCase(),
    unitFamily: unitDef?.family || "unknown",
    quantityBase,
    displayUnit: unitDef?.canonical || unit,
    raw,
    aisle: guessAisle(name),
  };
}

function formatMergedQuantity(
  quantityBase: number | null,
  unitFamily: UnitFamily,
  displayUnit: string
): string {
  if (quantityBase === null || !isFinite(quantityBase)) return "";

  if (unitFamily === "volume_ml") {
    if (quantityBase >= 1000) return `${formatQuantity(quantityBase / 1000)} l`;
    if (quantityBase >= 240 && quantityBase % 240 === 0) {
      return `${formatQuantity(quantityBase / 240)} cups`;
    }
    if (displayUnit === "tsp" || displayUnit === "tbsp") {
      const step = displayUnit === "tsp" ? 5 : 15;
      return `${formatQuantity(quantityBase / step)} ${displayUnit}`;
    }
    return `${formatQuantity(quantityBase)} ml`;
  }

  if (unitFamily === "mass_g") {
    if (quantityBase >= 1000) return `${formatQuantity(quantityBase / 1000)} kg`;
    return `${formatQuantity(quantityBase)} g`;
  }

  if (unitFamily === "count" && displayUnit) {
    return `${formatQuantity(quantityBase)} ${displayUnit}`;
  }

  return formatQuantity(quantityBase);
}

function mergeKey(line: ParsedGroceryLine): string {
  // Same ingredient + compatible unit family can merge; otherwise keep separate
  return `${line.normalizedKey}::${line.unitFamily === "unknown" ? line.unit || "x" : line.unitFamily}`;
}

/**
 * Merge ingredients across recipes: normalize names, convert compatible units,
 * sum quantities, and group by market aisle.
 */
export function buildGroceryList(sources: RecipeIngredientSource[]): GroceryListItem[] {
  const buckets = new Map<
    string,
    {
      name: string;
      normalizedKey: string;
      quantityBase: number | null;
      unitFamily: UnitFamily;
      displayUnit: string;
      aisle: AisleId;
      sources: Set<string>;
      notes: string[];
      unmatchedParts: string[];
    }
  >();

  sources.forEach((source) => {
    const multiplier = source.servingsMultiplier && source.servingsMultiplier > 0
      ? source.servingsMultiplier
      : 1;
    const list = source.ingredients || [];
    list.forEach((ing) => {
      const parsed = parseIngredientValue(ing, multiplier);
      if (!parsed) return;
      const key = mergeKey(parsed);
      const existing = buckets.get(key);
      const recipeLabel = source.recipeName?.trim();

      if (!existing) {
        buckets.set(key, {
          name: parsed.name,
          normalizedKey: parsed.normalizedKey,
          quantityBase: parsed.quantityBase,
          unitFamily: parsed.unitFamily,
          displayUnit: parsed.displayUnit,
          aisle: parsed.aisle,
          sources: new Set(recipeLabel ? [recipeLabel] : []),
          notes: [],
          unmatchedParts: parsed.quantityBase === null && parsed.raw ? [parsed.raw] : [],
        });
        return;
      }

      if (recipeLabel) existing.sources.add(recipeLabel);

      if (
        parsed.quantityBase !== null &&
        existing.quantityBase !== null &&
        parsed.unitFamily === existing.unitFamily &&
        parsed.unitFamily !== "unknown"
      ) {
        existing.quantityBase += parsed.quantityBase;
      } else if (parsed.quantityBase !== null && existing.quantityBase === null) {
        existing.quantityBase = parsed.quantityBase;
        existing.unitFamily = parsed.unitFamily;
        existing.displayUnit = parsed.displayUnit;
      } else if (parsed.raw) {
        existing.unmatchedParts.push(parsed.raw);
      }

      // Prefer shorter display name
      if (parsed.name.length < existing.name.length) existing.name = parsed.name;
    });
  });

  return Array.from(buckets.values())
    .map((bucket, index) => {
      let quantityDisplay = formatMergedQuantity(
        bucket.quantityBase,
        bucket.unitFamily,
        bucket.displayUnit
      );
      if (!quantityDisplay && bucket.unmatchedParts.length) {
        quantityDisplay = [...new Set(bucket.unmatchedParts)].join("; ");
      } else if (bucket.unmatchedParts.length) {
        quantityDisplay = `${quantityDisplay} (+ ${[...new Set(bucket.unmatchedParts)].join("; ")})`;
      }

      return {
        id: `${bucket.normalizedKey}-${index}`,
        name: bucket.name.replace(/\b\w/g, (c) => c.toUpperCase()),
        normalizedKey: bucket.normalizedKey,
        quantity: bucket.quantityBase,
        unit: bucket.displayUnit,
        unitFamily: bucket.unitFamily,
        quantityDisplay,
        aisle: bucket.aisle,
        sources: Array.from(bucket.sources),
        notes: bucket.notes,
        checked: false,
      } satisfies GroceryListItem;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function groupGroceryByAisle(items: GroceryListItem[]): GroceryAisleGroup[] {
  const byAisle = new Map<AisleId, GroceryListItem[]>();
  items.forEach((item) => {
    const list = byAisle.get(item.aisle) || [];
    list.push(item);
    byAisle.set(item.aisle, list);
  });

  return AISLE_ORDER.filter((aisle) => byAisle.has(aisle)).map((aisle) => ({
    aisle,
    label: AISLE_LABELS[aisle],
    items: (byAisle.get(aisle) || []).sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

/** Plain-text export for copy / WhatsApp / notes apps. */
export function exportGroceryListText(
  items: GroceryListItem[],
  title = "LadhaQuest shopping list"
): string {
  const groups = groupGroceryByAisle(items.filter((i) => !i.checked));
  const lines: string[] = [title, ""];
  groups.forEach((group) => {
    lines.push(`## ${group.label}`);
    group.items.forEach((item) => {
      const qty = item.quantityDisplay ? ` — ${item.quantityDisplay}` : "";
      lines.push(`- [ ] ${item.name}${qty}`);
    });
    lines.push("");
  });
  return lines.join("\n").trim();
}

export function updateGroceryItemQuantity(
  items: GroceryListItem[],
  id: string,
  quantityDisplay: string
): GroceryListItem[] {
  return items.map((item) =>
    item.id === id ? { ...item, quantityDisplay, quantity: null } : item
  );
}

export function toggleGroceryItemChecked(
  items: GroceryListItem[],
  id: string
): GroceryListItem[] {
  return items.map((item) =>
    item.id === id ? { ...item, checked: !item.checked } : item
  );
}

export function removeGroceryItem(items: GroceryListItem[], id: string): GroceryListItem[] {
  return items.filter((item) => item.id !== id);
}

export function addManualGroceryItem(
  items: GroceryListItem[],
  name: string,
  quantityDisplay = "",
  aisle: AisleId = "other"
): GroceryListItem[] {
  const trimmed = name.trim();
  if (!trimmed) return items;
  const normalizedKey = normalizeIngredientName(trimmed);
  return [
    ...items,
    {
      id: `manual-${normalizedKey}-${Date.now()}`,
      name: trimmed,
      normalizedKey,
      quantity: null,
      unit: "",
      unitFamily: "unknown",
      quantityDisplay,
      aisle: aisle === "other" ? guessAisle(trimmed) : aisle,
      sources: ["Manual"],
      notes: [],
      checked: false,
    },
  ];
}
