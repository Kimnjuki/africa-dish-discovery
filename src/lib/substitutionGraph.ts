/**
 * Africa-first ingredient substitution graph.
 * Client-side bootstrap for pantry matching, cook-mode popovers, and pantry modal
 * when the DB `ingredient_substitutions` table is thin or unavailable.
 */

import {
  rankSubstitutesForMarket,
  type DietTag,
  type MarketId,
  type RankedSubstitute,
} from "./localMarket.ts";

export type Authenticity = "high" | "medium" | "low";

export interface CookAdjustment {
  /** Extra minutes to add/subtract when using this substitute */
  timeDeltaMin?: number;
  /** Liquid / moisture guidance for the cook */
  liquidNote?: string;
  /** Short cook-mode prompt shown next to the ingredient */
  prompt?: string;
}

export interface SubstitutionSuggestion {
  name: string;
  ratio: string;
  notes: string;
  reason: string;
  regions: string[];
  flavorRole: string;
  authenticity: Authenticity;
  compatibilityScore: number;
  source: "graph";
  cookAdjustment?: CookAdjustment;
  dietTags?: DietTag[];
  priceTier?: "budget" | "moderate" | "premium" | "specialty";
}

interface SubstitutionEdgeDef {
  /** Canonical / common name of the original ingredient */
  from: string;
  /** Local-language and spelling aliases for `from` */
  fromAliases?: string[];
  /** Substitute ingredient name */
  to: string;
  /** Aliases for the substitute (improves pantry reverse matching) */
  toAliases?: string[];
  /** Quantity multiplier: substitute_qty ≈ original_qty * ratio */
  ratio?: number;
  reason: string;
  notes?: string;
  regions?: string[];
  flavorRole?: string;
  authenticity?: Authenticity;
  compatibilityScore?: number;
  /** When true, also index to→from with the same metadata */
  bidirectional?: boolean;
  cookAdjustment?: CookAdjustment;
  dietTags?: DietTag[];
  priceTier?: "budget" | "moderate" | "premium" | "specialty";
}

/** Seed edges — African staples + practical diaspora swaps with flavor notes. */
export const SUBSTITUTION_EDGE_DEFS: SubstitutionEdgeDef[] = [
  // Leafy greens
  {
    from: "ugwu",
    fromAliases: ["ugu", "fluted pumpkin", "fluted pumpkin leaves", "pumpkin leaves"],
    to: "spinach",
    toAliases: ["baby spinach", "english spinach"],
    reason: "Similar soft leafy texture for soups and stews",
    notes: "Spinach wilts faster — add near the end; milder than ugwu.",
    regions: ["Nigeria", "West Africa"],
    flavorRole: "leafy green",
    authenticity: "medium",
    compatibilityScore: 88,
    bidirectional: true,
    priceTier: "budget",
    dietTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
    cookAdjustment: {
      timeDeltaMin: -3,
      liquidNote: "Spinach releases more water — reduce stock slightly.",
      prompt: "No ugwu? Use spinach; add in the last 2–3 minutes.",
    },
  },
  {
    from: "ugwu",
    fromAliases: ["ugu", "fluted pumpkin leaves"],
    to: "kale",
    toAliases: ["curly kale", "tuscan kale"],
    reason: "Sturdier green with comparable body in egusi / vegetable soups",
    notes: "Strip stems and chop fine; cook a bit longer than ugwu.",
    regions: ["Nigeria", "Diaspora"],
    flavorRole: "leafy green",
    authenticity: "medium",
    compatibilityScore: 82,
    priceTier: "moderate",
    dietTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
    cookAdjustment: {
      timeDeltaMin: 5,
      prompt: "No ugwu? Use kale; strip stems and simmer ~5 min longer.",
    },
  },
  {
    from: "sukuma wiki",
    fromAliases: ["sukuma", "sukumawiki", "collard greens kenya"],
    to: "collard greens",
    toAliases: ["collards", "collard"],
    reason: "Same brassica family; classic East African sukuma swap abroad",
    notes: "Slice thin ribbons; longer simmer softens bitterness.",
    regions: ["Kenya", "Tanzania", "Uganda", "East Africa"],
    flavorRole: "leafy green",
    authenticity: "high",
    compatibilityScore: 95,
    bidirectional: true,
    priceTier: "budget",
    dietTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
    cookAdjustment: {
      timeDeltaMin: 3,
      prompt: "No sukuma? Collards work 1:1 — shred thin and simmer a little longer.",
    },
  },
  {
    from: "sukuma wiki",
    fromAliases: ["sukuma", "sukumawiki"],
    to: "kale",
    reason: "Widely available brassica; works in ugali + greens plates",
    notes: "Slightly sweeter; reduce cook time vs mature sukuma.",
    regions: ["East Africa", "Diaspora"],
    flavorRole: "leafy green",
    authenticity: "medium",
    compatibilityScore: 86,
    priceTier: "moderate",
    dietTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
    cookAdjustment: {
      timeDeltaMin: -2,
      prompt: "No sukuma? Kale is fine — cook a couple minutes less than mature sukuma.",
    },
  },
  {
    from: "bitterleaf",
    fromAliases: ["bitter leaf", "onugbu", "ewuro"],
    to: "kale",
    reason: "Bitter green body for soups when onugbu is scarce",
    notes: "Won't match true bitterleaf bite — add a pinch of bitter herbs if available.",
    regions: ["Nigeria", "West Africa"],
    flavorRole: "bitter leafy",
    authenticity: "low",
    compatibilityScore: 62,
  },
  {
    from: "morogo",
    fromAliases: ["amaranth leaves", "imifino", "african spinach"],
    to: "spinach",
    reason: "Soft cooked green for Southern African relish dishes",
    notes: "Spinach is milder; season boldly with onion and tomato.",
    regions: ["South Africa", "Southern Africa"],
    flavorRole: "leafy green",
    authenticity: "medium",
    compatibilityScore: 80,
    bidirectional: true,
  },
  {
    from: "molokhia",
    fromAliases: ["mulukhiyah", "jute leaf", "egyptian spinach"],
    to: "spinach",
    reason: "Viscous green stew filler when jute leaf is unavailable",
    notes: "Texture won't be as mucilaginous; okra can help thicken.",
    regions: ["Egypt", "North Africa", "Sudan"],
    flavorRole: "leafy green",
    authenticity: "low",
    compatibilityScore: 58,
  },

  // Seeds & thickeners
  {
    from: "egusi",
    fromAliases: ["egusi seeds", "egushi", "melon seeds", "melon seed"],
    to: "pumpkin seeds",
    toAliases: ["pepitas", "hulled pumpkin seeds"],
    reason: "Closest oilseed stand-in for ground egusi soups",
    notes: "Toast and grind; flavor is nuttier and less earthy than true egusi.",
    regions: ["Nigeria", "Ghana", "West Africa", "Diaspora"],
    flavorRole: "oilseed thickener",
    authenticity: "medium",
    compatibilityScore: 84,
    bidirectional: true,
    priceTier: "premium",
    cookAdjustment: {
      timeDeltaMin: 0,
      prompt: "No egusi? Toast and grind pumpkin seeds; soup will taste nuttier.",
    },
  },
  {
    from: "egusi",
    fromAliases: ["egusi seeds", "egushi"],
    to: "sunflower seeds",
    reason: "Budget oilseed thickener for egusi-style soups",
    notes: "Grind fine; color will be paler — palm oil restores hue.",
    regions: ["West Africa", "Diaspora"],
    flavorRole: "oilseed thickener",
    authenticity: "low",
    compatibilityScore: 70,
    priceTier: "budget",
    cookAdjustment: {
      prompt: "Budget egusi swap: grind sunflower seeds; add palm oil for color.",
    },
  },
  {
    from: "ogbono",
    fromAliases: ["ogbolo", "bush mango", "dika nut"],
    to: "okra",
    toAliases: ["okro", "lady finger"],
    reason: "Draw / mucilage thickener when ogbono is unavailable",
    notes: "Chop or blend okra for stretch; flavor differs from bush mango.",
    regions: ["Nigeria", "West Africa"],
    flavorRole: "draw thickener",
    authenticity: "medium",
    compatibilityScore: 72,
  },

  // Oils & fats
  {
    from: "palm oil",
    fromAliases: ["red palm oil", "zomi", "ire", "palm fruit oil"],
    to: "vegetable oil",
    toAliases: ["canola oil", "sunflower oil"],
    reason: "Neutral cooking fat when red palm oil is unavailable",
    notes: "Loses color and palm aroma — add paprika or annatto for hue; won't taste the same.",
    regions: ["West Africa", "Central Africa", "Diaspora"],
    flavorRole: "cooking fat / color",
    authenticity: "low",
    compatibilityScore: 55,
    priceTier: "budget",
    cookAdjustment: {
      prompt: "No palm oil? Use vegetable oil + a pinch of paprika for color.",
      liquidNote: "Neutral oil will not cloud the same way — taste for richness.",
    },
  },
  {
    from: "palm oil",
    fromAliases: ["red palm oil", "zomi"],
    to: "coconut oil",
    reason: "Tropical fat alternative with some aroma",
    notes: "Coconut notes change the dish; use sparingly in stews.",
    regions: ["West Africa", "East Africa", "Diaspora"],
    flavorRole: "cooking fat",
    authenticity: "low",
    compatibilityScore: 60,
    priceTier: "premium",
    cookAdjustment: {
      prompt: "No palm oil? Coconut oil works — use less; flavor will shift.",
    },
  },
  {
    from: "palm oil",
    fromAliases: ["red palm oil"],
    to: "ghee",
    toAliases: ["clarified butter", "samn"],
    reason: "Rich fat for North / East African adaptations",
    notes: "Better for suqaar/stews than for classic Nigerian palm-oil soups.",
    regions: ["North Africa", "Horn of Africa", "Diaspora"],
    flavorRole: "cooking fat",
    authenticity: "low",
    compatibilityScore: 48,
  },

  // Heat / peppers
  {
    from: "scotch bonnet",
    fromAliases: ["scotchbonnet", "bonnet pepper", "ata rodo"],
    to: "habanero",
    toAliases: ["habanero pepper", "habaneros"],
    reason: "Near-identical heat and fruity aroma",
    notes: "Use 1:1; seed to dial heat. Closest diaspora swap.",
    regions: ["Caribbean", "West Africa", "Diaspora"],
    flavorRole: "heat / fruity chili",
    authenticity: "high",
    compatibilityScore: 96,
    bidirectional: true,
    priceTier: "moderate",
    cookAdjustment: {
      prompt: "No scotch bonnet? Habanero is 1:1 — seed to dial heat.",
    },
  },
  {
    from: "scotch bonnet",
    fromAliases: ["ata rodo", "bonnet pepper"],
    to: "cayenne",
    toAliases: ["cayenne pepper", "ground cayenne"],
    reason: "Heat without the fresh fruity top notes",
    notes: "Start with 1/4–1/2 the amount by volume if using dried powder.",
    regions: ["West Africa", "Diaspora"],
    flavorRole: "heat",
    authenticity: "medium",
    compatibilityScore: 74,
    ratio: 0.35,
    priceTier: "budget",
    cookAdjustment: {
      prompt: "No fresh chili? Use ~⅓ the amount of cayenne powder.",
    },
  },
  {
    from: "piri piri",
    fromAliases: ["peri peri", "pili pili", "african bird's eye"],
    to: "cayenne",
    reason: "Sharp dried heat for peri-peri style sauces",
    notes: "Add lemon/garlic to mimic peri-peri brightness.",
    regions: ["Mozambique", "South Africa", "East Africa"],
    flavorRole: "heat",
    authenticity: "medium",
    compatibilityScore: 78,
    bidirectional: true,
  },

  // Tubers, flours, staples
  {
    from: "cassava flour",
    fromAliases: ["manioc flour", "yuca flour", "mhogo flour"],
    to: "tapioca flour",
    toAliases: ["tapioca starch"],
    reason: "Same root family; similar gluten-free binding",
    notes: "Slightly more elastic; blend with other flours for fufu-like doughs.",
    regions: ["West Africa", "Central Africa", "Diaspora"],
    flavorRole: "starch / binder",
    authenticity: "high",
    compatibilityScore: 90,
    bidirectional: true,
  },
  {
    from: "plantain",
    fromAliases: ["plantains", "matoke", "gonja", "green plantain"],
    to: "banana",
    toAliases: ["ripe banana", "cooking banana"],
    reason: "Sweet/ripe plantain stand-in only",
    notes: "Use ripe bananas for sweets; green plantain needs potato/yam instead.",
    regions: ["West Africa", "East Africa", "Caribbean"],
    flavorRole: "starch / sweet",
    authenticity: "low",
    compatibilityScore: 50,
  },
  {
    from: "plantain",
    fromAliases: ["green plantain", "matoke"],
    to: "sweet potato",
    toAliases: ["yam potato", "orange sweet potato"],
    reason: "Starchy roasted/fried side when green plantain is scarce",
    notes: "Sweeter and softer; season with salt and spice.",
    regions: ["East Africa", "Diaspora"],
    flavorRole: "starch",
    authenticity: "medium",
    compatibilityScore: 68,
    priceTier: "budget",
    cookAdjustment: {
      timeDeltaMin: -5,
      prompt: "No green plantain? Sweet potato fries/roasts in less time — season boldly.",
    },
  },
  {
    from: "yam",
    fromAliases: ["puna yam", "white yam", "ji"],
    to: "sweet potato",
    reason: "Accessible tuber for pounding / boiling contexts",
    notes: "Sweeter and wetter than true African yam — drain well for pounded dishes.",
    regions: ["West Africa", "Diaspora"],
    flavorRole: "tuber",
    authenticity: "medium",
    compatibilityScore: 65,
  },
  {
    from: "fonio",
    fromAliases: ["acha"],
    to: "quinoa",
    reason: "Tiny gluten-free grain with similar cook method",
    notes: "Quinoa is nuttier; rinse well. Good diaspora swap for salads/porridge.",
    regions: ["West Africa", "Sahel", "Diaspora"],
    flavorRole: "grain",
    authenticity: "medium",
    compatibilityScore: 75,
  },
  {
    from: "teff",
    fromAliases: ["tef"],
    to: "sorghum flour",
    toAliases: ["sorghum", "mtama flour"],
    reason: "Gluten-free flour for injera-adjacent flatbreads",
    notes: "Won't sour the same as fermented teff; mix with wheat if needed.",
    regions: ["Ethiopia", "Eritrea", "Horn of Africa"],
    flavorRole: "grain / flour",
    authenticity: "medium",
    compatibilityScore: 70,
  },

  // Umami / aromatics
  {
    from: "crayfish",
    fromAliases: ["dried crayfish", "dried shrimp", "ground crayfish"],
    to: "dried shrimp",
    toAliases: ["shrimp powder", "prawn powder"],
    reason: "Same dried seafood umami role in West African stews",
    notes: "Grind and bloom in oil; adjust salt (both are salty).",
    regions: ["Nigeria", "Ghana", "West Africa"],
    flavorRole: "umami / seafood",
    authenticity: "high",
    compatibilityScore: 92,
    bidirectional: true,
  },
  {
    from: "iru",
    fromAliases: ["irú", "locust beans", "dawadawa", "ogiri", "soumbala"],
    to: "miso",
    toAliases: ["white miso", "fermented soybean paste"],
    reason: "Fermented savory depth when locust bean is unavailable",
    notes: "Use sparingly; soy profile differs from irú — still adds funk.",
    regions: ["West Africa", "Diaspora"],
    flavorRole: "fermented umami",
    authenticity: "low",
    compatibilityScore: 58,
  },
  {
    from: "stockfish",
    fromAliases: ["panla", "okporoko", "dried cod"],
    to: "salted cod",
    toAliases: ["bacalao", "saltfish"],
    reason: "Preserved white fish for soups and stews",
    notes: "Soak to desalinate; texture is softer than dried stockfish.",
    regions: ["West Africa", "Caribbean", "Diaspora"],
    flavorRole: "preserved fish",
    authenticity: "medium",
    compatibilityScore: 80,
  },
  {
    from: "groundnut",
    fromAliases: ["groundnuts", "peanut", "peanuts", "arachide"],
    to: "peanut butter",
    toAliases: ["natural peanut butter", "unsweetened peanut butter"],
    reason: "Ready-ground peanut base for maafe / groundnut stews",
    notes: "Use unsweetened; thin with stock. Skip added sugar brands.",
    regions: ["West Africa", "Sahel", "Diaspora"],
    flavorRole: "nut paste",
    authenticity: "high",
    compatibilityScore: 90,
  },

  // Common pantry fallbacks retained from prior matcher
  {
    from: "okra",
    fromAliases: ["okro", "lady finger"],
    to: "zucchini",
    reason: "Vegetable bulk when okra mucilage is not required",
    notes: "No draw — add a spoon of cornstarch if you need thickness.",
    regions: ["Global", "Diaspora"],
    flavorRole: "vegetable",
    authenticity: "low",
    compatibilityScore: 45,
  },
  {
    from: "tomato paste",
    fromAliases: ["tomato puree"],
    to: "tomato sauce",
    toAliases: ["passata", "crushed tomatoes"],
    reason: "Tomato body and color for stews",
    notes: "Reduce longer to concentrate; ratio ~3:1 sauce to paste.",
    regions: ["Global"],
    flavorRole: "tomato concentrate",
    authenticity: "medium",
    compatibilityScore: 78,
    ratio: 3,
  },
  {
    from: "stock cube",
    fromAliases: ["bouillon", "stock powder", "maggi cube"],
    to: "chicken stock",
    toAliases: ["vegetable stock", "broth", "beef stock"],
    reason: "Liquid stock instead of concentrated cube",
    notes: "Reduce other salt; ~250ml stock ≈ 1 cube depending on brand.",
    regions: ["Global", "Africa"],
    flavorRole: "savory base",
    authenticity: "medium",
    compatibilityScore: 85,
  },
  {
    from: "cilantro",
    fromAliases: ["coriander leaves", "fresh coriander"],
    to: "parsley",
    reason: "Fresh green garnish when cilantro is disliked or unavailable",
    notes: "Missing citrusy cilantro note.",
    regions: ["North Africa", "Global"],
    flavorRole: "fresh herb",
    authenticity: "medium",
    compatibilityScore: 70,
    bidirectional: true,
  },
  {
    from: "tahini",
    fromAliases: ["tahina", "sesame paste"],
    to: "peanut butter",
    reason: "Nutty paste for North African / Levantine sauces",
    notes: "Stronger peanut flavor; thin with lemon and water.",
    regions: ["North Africa", "Diaspora"],
    flavorRole: "seed/nut paste",
    authenticity: "low",
    compatibilityScore: 55,
  },
  {
    from: "ghee",
    fromAliases: ["clarified butter", "samn"],
    to: "butter",
    reason: "Dairy fat for finishing and frying",
    notes: "Butter browns faster and has more water — lower heat slightly.",
    regions: ["North Africa", "Horn of Africa", "Global"],
    flavorRole: "cooking fat",
    authenticity: "high",
    compatibilityScore: 88,
    bidirectional: true,
    dietTags: ["vegetarian", "halal", "gluten_free", "nut_free"],
  },
  // Coconut milk — never suggest evaporated milk to vegan / dairy-free cooks
  {
    from: "coconut milk",
    fromAliases: ["thick coconut milk", "tinned coconut milk"],
    to: "cashew cream",
    toAliases: ["ground cashew", "cashew paste", "blended cashews"],
    reason: "Neutral plant cream with similar body for stews and sauces",
    notes: "Blend soaked cashews with water; milder than coconut. Not for nut-allergic cooks.",
    regions: ["West Africa", "Diaspora"],
    flavorRole: "creamy base",
    authenticity: "medium",
    compatibilityScore: 82,
    priceTier: "moderate",
    dietTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free"],
    cookAdjustment: {
      prompt: "No coconut milk? Blend soaked cashews 1:1 with water for body.",
      liquidNote: "Cashew cream is thicker — thin with stock if needed.",
    },
  },
  {
    from: "coconut milk",
    fromAliases: ["thick coconut milk"],
    to: "groundnut cream",
    toAliases: ["peanut cream", "thinned peanut butter", "groundnut paste thinned"],
    reason: "West African creamy body for soups and stews when coconut is scarce",
    notes: "Use unsweetened paste thinned with stock; peanut flavour is stronger.",
    regions: ["West Africa", "Central Africa"],
    flavorRole: "creamy base",
    authenticity: "medium",
    compatibilityScore: 74,
    priceTier: "budget",
    dietTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free"],
    cookAdjustment: {
      prompt: "No coconut milk? Thin unsweetened groundnut paste with stock.",
    },
  },
  {
    from: "coconut milk",
    fromAliases: ["thick coconut milk"],
    to: "blended coconut flesh",
    toAliases: ["fresh coconut puree", "grated coconut blend"],
    reason: "Same fruit — blend fresh or reconstituted coconut flesh with water",
    notes: "Closest flavour; strain for smoothness.",
    regions: ["Coastal Africa", "Diaspora"],
    flavorRole: "creamy base",
    authenticity: "high",
    compatibilityScore: 92,
    priceTier: "moderate",
    dietTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
    cookAdjustment: {
      prompt: "Blend coconut flesh with warm water and strain for milk.",
    },
  },
  {
    from: "coconut milk",
    to: "evaporated milk",
    toAliases: ["tinned milk", "evap"],
    reason: "Emergency dairy creaminess only when diet allows",
    notes: "Introduces dairy — never for vegan or dairy-free cooks. Changes flavour.",
    regions: ["Diaspora"],
    flavorRole: "creamy base",
    authenticity: "low",
    compatibilityScore: 48,
    priceTier: "budget",
    dietTags: ["vegetarian", "halal", "gluten_free", "nut_free"],
    cookAdjustment: {
      prompt: "Evaporated milk is an emergency swap only — not vegan.",
    },
  },

  // ── Expanded African staples (coverage push toward top-frequency ingredients) ──
  {
    from: "water leaves",
    fromAliases: ["waterleaf", "water leaf", "talinum"],
    to: "spinach",
    reason: "Soft mucilaginous green for Afang / edikaikong-style soups",
    notes: "Spinach is less mucilaginous; add a little okra if you need stretch.",
    regions: ["Nigeria", "West Africa"],
    flavorRole: "leafy green",
    authenticity: "medium",
    compatibilityScore: 78,
    dietTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free", "nut_free"],
  },
  {
    from: "utazi",
    fromAliases: ["utasi", "Gongronema"],
    to: "bitterleaf",
    toAliases: ["bitter leaf", "onugbu"],
    reason: "Bitter aromatic leaf for finishing pepper soups and salads",
    notes: "Use sparingly; rinse bitterleaf well. Flavour is stronger than utazi.",
    regions: ["Nigeria", "West Africa"],
    flavorRole: "bitter herb",
    authenticity: "medium",
    compatibilityScore: 70,
  },
  {
    from: "uziza",
    fromAliases: ["uziza leaf", "ashanti pepper leaf", "piper guineense leaf"],
    to: "basil",
    toAliases: ["thai basil", "african basil"],
    reason: "Peppery aromatic leaf when uziza is unavailable",
    notes: "Add late; won't match the peppery bite — crack black pepper on top.",
    regions: ["Nigeria", "West Africa", "Diaspora"],
    flavorRole: "aromatic herb",
    authenticity: "low",
    compatibilityScore: 55,
  },
  {
    from: "alligator pepper",
    fromAliases: ["grains of paradise relative", "atare", "mbongo"],
    to: "grains of paradise",
    toAliases: ["melegueta pepper", "guinea grains"],
    reason: "Related West African warm spice for rituals and stews",
    notes: "Crush lightly; grains of paradise are hotter and more citrusy.",
    regions: ["Nigeria", "Ghana", "West Africa"],
    flavorRole: "warm spice",
    authenticity: "high",
    compatibilityScore: 88,
    bidirectional: true,
  },
  {
    from: "suya spice",
    fromAliases: ["yaji", "suya pepper"],
    to: "cayenne",
    toAliases: ["cayenne pepper", "paprika blend"],
    reason: "Heat base for suya when pre-mixed yaji is unavailable",
    notes: "Mix cayenne + ground ginger + garlic powder + a little groundnut for body.",
    regions: ["Nigeria", "West Africa", "Diaspora"],
    flavorRole: "spice blend",
    authenticity: "low",
    compatibilityScore: 60,
    dietTags: ["vegetarian", "vegan", "halal", "gluten_free", "dairy_free"],
  },
  {
    from: "berbere",
    fromAliases: ["berberé", "ethiopian berbere"],
    to: "cayenne",
    toAliases: ["chili powder", "hot paprika"],
    reason: "Heat core of berbere when the full blend is missing",
    notes: "Add paprika, fenugreek, and garlic for a closer profile.",
    regions: ["Ethiopia", "Eritrea", "Horn of Africa", "Diaspora"],
    flavorRole: "spice blend",
    authenticity: "low",
    compatibilityScore: 58,
  },
  {
    from: "niter kibbeh",
    fromAliases: ["nit'ir qibe", "ethiopian spiced butter"],
    to: "ghee",
    toAliases: ["clarified butter"],
    reason: "Rich cooking fat when spiced butter is unavailable",
    notes: "Infuse ghee with garlic, ginger, and cardamom to approximate aroma.",
    regions: ["Ethiopia", "Eritrea", "Diaspora"],
    flavorRole: "spiced fat",
    authenticity: "medium",
    compatibilityScore: 75,
    dietTags: ["vegetarian", "halal", "gluten_free", "nut_free"],
  },
  {
    from: "injera",
    fromAliases: ["enjera", "teff flatbread"],
    to: "sourdough flatbread",
    toAliases: ["sourdough wrap", "fermented flatbread"],
    reason: "Sour fermented wrap when teff injera is unavailable",
    notes: "Texture differs; teff flour tortillas are closer when available.",
    regions: ["Ethiopia", "Eritrea", "Diaspora"],
    flavorRole: "staple bread",
    authenticity: "low",
    compatibilityScore: 50,
  },
  {
    from: "fufu",
    fromAliases: ["foofoo", "pounded fufu"],
    to: "pounded yam",
    toAliases: ["iyan", "poundo yam"],
    reason: "Swallow staple with similar stretch when cassava fufu is scarce",
    notes: "Yam is denser; adjust liquid. Texture is the goal, not identical flavour.",
    regions: ["West Africa"],
    flavorRole: "swallow starch",
    authenticity: "medium",
    compatibilityScore: 80,
    bidirectional: true,
  },
  {
    from: "garri",
    fromAliases: ["gari", "cassava flakes"],
    to: "cassava flour",
    toAliases: ["manioc flour"],
    reason: "Same root — flour for eba-style swallow when flakes are missing",
    notes: "Stir into hot water gradually; won't have the toasted flake aroma.",
    regions: ["West Africa", "Central Africa"],
    flavorRole: "cassava staple",
    authenticity: "medium",
    compatibilityScore: 78,
  },
  {
    from: "ogiri",
    fromAliases: ["ogiri okpei", "fermented castor seed"],
    to: "iru",
    toAliases: ["dawadawa", "locust beans"],
    reason: "Fermented umami bomb for soups when ogiri is scarce",
    notes: "Both are pungent — start with half and taste.",
    regions: ["Nigeria", "West Africa"],
    flavorRole: "fermented umami",
    authenticity: "high",
    compatibilityScore: 85,
    bidirectional: true,
  },
  {
    from: "smoked fish",
    fromAliases: ["smoked catfish", "smoked mackerel", "dried smoked fish"],
    to: "stockfish",
    toAliases: ["panla", "okporoko"],
    reason: "Preserved fish umami for stews and pepper soups",
    notes: "Soak stockfish; smoked fish is softer and smokier — adjust salt.",
    regions: ["West Africa", "Central Africa"],
    flavorRole: "preserved fish",
    authenticity: "medium",
    compatibilityScore: 76,
  },
  {
    from: "tilapia",
    fromAliases: ["fresh tilapia", "nile tilapia"],
    to: "catfish",
    toAliases: ["african catfish", "sharpenose"],
    reason: "Firm freshwater fish for stews and grilling",
    notes: "Catfish is oilier; reduce added oil slightly.",
    regions: ["East Africa", "West Africa", "Southern Africa"],
    flavorRole: "freshwater fish",
    authenticity: "high",
    compatibilityScore: 88,
    bidirectional: true,
  },
  {
    from: "goat",
    fromAliases: ["goat meat", "chevon", "mutton goat"],
    to: "lamb",
    toAliases: ["mutton"],
    reason: "Closest red meat for pepper soup, suya, and stews",
    notes: "Lamb is fattier; trim and skim. Goat is leaner and more mineral.",
    regions: ["West Africa", "East Africa", "North Africa", "Diaspora"],
    flavorRole: "red meat",
    authenticity: "high",
    compatibilityScore: 90,
    bidirectional: true,
  },
  {
    from: "maize meal",
    fromAliases: ["cornmeal", "ugali flour", "nshima meal", "sadza meal", "posho"],
    to: "polenta",
    toAliases: ["coarse cornmeal", "yellow cornmeal"],
    reason: "Same maize porridge staple under diaspora names",
    notes: "Grind size varies; cook to your preferred firmness for ugali/nshima.",
    regions: ["East Africa", "Southern Africa", "Diaspora"],
    flavorRole: "maize staple",
    authenticity: "high",
    compatibilityScore: 92,
    bidirectional: true,
  },
  {
    from: "millet",
    fromAliases: ["pearl millet", "bajra", "mawele"],
    to: "sorghum",
    toAliases: ["mtama", "guinea corn"],
    reason: "Sahel grain swap for porridge and flatbreads",
    notes: "Sorghum is slightly larger; cooking times similar for porridge.",
    regions: ["Sahel", "West Africa", "East Africa"],
    flavorRole: "grain",
    authenticity: "high",
    compatibilityScore: 86,
    bidirectional: true,
  },
  {
    from: "hibiscus",
    fromAliases: ["zobo", "sorrel", "bissap", "karkade", "sobolo"],
    to: "cranberry",
    toAliases: ["dried cranberry", "cranberry juice unsweetened"],
    reason: "Tart red drink base when dried hibiscus is unavailable",
    notes: "Flavour differs; add ginger and clove to lean toward zobo.",
    regions: ["West Africa", "North Africa", "Diaspora"],
    flavorRole: "tart botanical",
    authenticity: "low",
    compatibilityScore: 52,
  },
  {
    from: "baobab",
    fromAliases: ["baobab powder", "monkey bread fruit", "buyo"],
    to: "tamarind",
    toAliases: ["tamarind paste", "tamarind pulp"],
    reason: "Tangy fruit acid for drinks and sauces",
    notes: "Tamarind is darker and more caramel; start with less.",
    regions: ["Sahel", "West Africa", "East Africa"],
    flavorRole: "sour fruit",
    authenticity: "medium",
    compatibilityScore: 68,
  },
  {
    from: "garden egg",
    fromAliases: ["garden eggs", "african eggplant", "ngai ngai"],
    to: "eggplant",
    toAliases: ["aubergine", "brinjal"],
    reason: "Same nightshade family for stews and sauces",
    notes: "Large aubergine is milder and spongier; salt and drain if needed.",
    regions: ["West Africa", "Central Africa", "Diaspora"],
    flavorRole: "vegetable",
    authenticity: "medium",
    compatibilityScore: 80,
    bidirectional: true,
  },
  {
    from: "cocoyam",
    fromAliases: ["taro", "eddo", "dasheen", "arbi"],
    to: "yam",
    toAliases: ["white yam", "puna yam"],
    reason: "Starchy tuber for soups and pounding when cocoyam is scarce",
    notes: "Yam is less mucilaginous; peel carefully (cocoyam can irritate skin).",
    regions: ["West Africa", "Central Africa", "Caribbean"],
    flavorRole: "tuber",
    authenticity: "medium",
    compatibilityScore: 72,
  },
  {
    from: "periwinkle",
    fromAliases: ["periwinkles", "sea snail", "ngolo"],
    to: "prawns",
    toAliases: ["shrimp", "fresh prawns"],
    reason: "Briny seafood garnish for soups when periwinkles are unavailable",
    notes: "Prawns cook faster; add at the end. Shellfish allergy still applies.",
    regions: ["Nigeria", "West Africa", "Diaspora"],
    flavorRole: "seafood",
    authenticity: "low",
    compatibilityScore: 55,
  },
  {
    from: "palm wine",
    fromAliases: ["tombo", "nsamba", "emu"],
    to: "white wine",
    toAliases: ["dry white wine", "light beer"],
    reason: "Light fermented liquid for marinades and sauces",
    notes: "Misses the yeasty palm character; a splash of vinegar + water helps.",
    regions: ["West Africa", "Central Africa", "Diaspora"],
    flavorRole: "fermented liquid",
    authenticity: "low",
    compatibilityScore: 48,
  },
  {
    from: "shea butter",
    fromAliases: ["shea", "karité"],
    to: "butter",
    toAliases: ["unsalted butter"],
    reason: "Cooking fat for northern stews when shea is unavailable",
    notes: "Butter is dairy — skip for vegan. Coconut oil is the plant alternative.",
    regions: ["Sahel", "West Africa", "Diaspora"],
    flavorRole: "cooking fat",
    authenticity: "low",
    compatibilityScore: 50,
    dietTags: ["vegetarian", "halal", "gluten_free", "nut_free"],
  },
  {
    from: "dawadawa",
    fromAliases: ["soumbala", "netetou", "locust bean cake"],
    to: "iru",
    reason: "Same fermented locust bean under regional names",
    notes: "Grind or crumble into stew bases; aroma is strong.",
    regions: ["Sahel", "West Africa"],
    flavorRole: "fermented umami",
    authenticity: "high",
    compatibilityScore: 95,
    bidirectional: true,
  },
];

function normalizeKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip leading qty/unit noise: "2 cups ugwu leaves" → "ugwu leaves" */
export function stripIngredientNoise(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^\d+([./]\d+)?(\s*-\s*\d+([./]\d+)?)?\s*/, "");
  s = s.replace(
    /^(cups?|tbsps?|tablespoons?|tsps?|teaspoons?|oz|ounces?|lbs?|pounds?|g|kg|ml|l|cloves?|pieces?|cans?|bunch(?:es)?|handfuls?|tins?)\s+/i,
    ""
  );
  s = s.replace(/\s*\(.*?\)\s*/g, " ");
  s = s.replace(/,.*$/, "");
  return s.trim();
}

interface IndexedEdge {
  substitute: string;
  ratio: number;
  reason: string;
  notes: string;
  regions: string[];
  flavorRole: string;
  authenticity: Authenticity;
  compatibilityScore: number;
  cookAdjustment?: CookAdjustment;
  dietTags?: DietTag[];
  priceTier?: SubstitutionSuggestion["priceTier"];
}

function buildIndexes(defs: SubstitutionEdgeDef[]) {
  const aliasToCanonical = new Map<string, string>();
  const edges = new Map<string, IndexedEdge[]>();

  const registerAlias = (alias: string, canonical: string) => {
    const key = normalizeKey(alias);
    if (!key) return;
    if (!aliasToCanonical.has(key)) aliasToCanonical.set(key, normalizeKey(canonical));
  };

  const pushEdge = (from: string, edge: IndexedEdge) => {
    const key = normalizeKey(from);
    const list = edges.get(key) ?? [];
    if (!list.some((e) => normalizeKey(e.substitute) === normalizeKey(edge.substitute))) {
      list.push(edge);
      edges.set(key, list);
    }
  };

  for (const def of defs) {
    const fromCanon = normalizeKey(def.from);
    registerAlias(def.from, def.from);
    for (const a of def.fromAliases ?? []) registerAlias(a, def.from);
    registerAlias(def.to, def.to);
    for (const a of def.toAliases ?? []) registerAlias(a, def.to);

    const forward: IndexedEdge = {
      substitute: def.to,
      ratio: def.ratio ?? 1,
      reason: def.reason,
      notes: def.notes ?? def.reason,
      regions: def.regions ?? [],
      flavorRole: def.flavorRole ?? "",
      authenticity: def.authenticity ?? "medium",
      compatibilityScore: def.compatibilityScore ?? 70,
      cookAdjustment: def.cookAdjustment,
      dietTags: def.dietTags,
      priceTier: def.priceTier,
    };
    pushEdge(fromCanon, forward);
    for (const a of def.fromAliases ?? []) pushEdge(a, forward);

    if (def.bidirectional) {
      const reverse: IndexedEdge = {
        ...forward,
        substitute: def.from,
      };
      pushEdge(def.to, reverse);
      for (const a of def.toAliases ?? []) pushEdge(a, reverse);
    }
  }

  return { aliasToCanonical, edges };
}

const { aliasToCanonical, edges: edgeIndex } = buildIndexes(SUBSTITUTION_EDGE_DEFS);

function resolveCanonical(normalized: string): string {
  return aliasToCanonical.get(normalized) ?? normalized;
}

function lookupKeys(ingredient: string): string[] {
  const stripped = normalizeKey(stripIngredientNoise(ingredient));
  if (!stripped) return [];
  const keys = new Set<string>([stripped, resolveCanonical(stripped)]);
  // try dropping trailing "leaves/seeds/oil/pepper/flour"
  const withoutTail = stripped.replace(/\b(leaves|leaf|seeds|seed|pepper|peppers|oil|flour|powder|fresh|dried)\b/g, " ").replace(/\s+/g, " ").trim();
  if (withoutTail && withoutTail !== stripped) {
    keys.add(withoutTail);
    keys.add(resolveCanonical(withoutTail));
  }
  return [...keys].filter(Boolean);
}

/**
 * Resolve ranked substitutions for an ingredient name (with notes / regions).
 */
export function lookupSubstitutions(
  ingredient: string,
  options?: { regionHint?: string; limit?: number }
): SubstitutionSuggestion[] {
  const limit = options?.limit ?? 6;
  const regionHint = options?.regionHint ? normalizeKey(options.regionHint) : "";
  const seen = new Set<string>();
  const results: SubstitutionSuggestion[] = [];

  for (const key of lookupKeys(ingredient)) {
    const list = edgeIndex.get(key) ?? [];
    for (const edge of list) {
      const subKey = normalizeKey(edge.substitute);
      if (seen.has(subKey) || subKey === key) continue;
      seen.add(subKey);

      let score = edge.compatibilityScore;
      if (regionHint && edge.regions.some((r) => normalizeKey(r).includes(regionHint) || regionHint.includes(normalizeKey(r)))) {
        score = Math.min(100, score + 6);
      }

      const ratioStr =
        edge.ratio === 1 ? "1:1" : edge.ratio < 1 ? `${edge.ratio}:1` : `${edge.ratio}:1 (sub:orig vol)`;

      results.push({
        name: edge.substitute,
        ratio: ratioStr,
        notes: edge.notes,
        reason: edge.reason,
        regions: edge.regions,
        flavorRole: edge.flavorRole,
        authenticity: edge.authenticity,
        compatibilityScore: score,
        source: "graph",
        cookAdjustment: edge.cookAdjustment,
        dietTags: edge.dietTags,
        priceTier: edge.priceTier,
      });
    }
  }

  results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  return results.slice(0, limit);
}

export type MarketRankedSubstitute = RankedSubstitute & SubstitutionSuggestion;

/**
 * Graph hits re-ranked by local market price, availability, and diet.
 */
export function lookupRankedSubstitutions(
  ingredient: string,
  options?: {
    regionHint?: string;
    marketId?: MarketId;
    diet?: DietTag[];
    preferCheap?: boolean;
    limit?: number;
  }
): MarketRankedSubstitute[] {
  const base = lookupSubstitutions(ingredient, {
    regionHint: options?.regionHint,
    limit: 12,
  });
  const ranked = rankSubstitutesForMarket(base, {
    marketId: options?.marketId,
    countryHint: options?.regionHint,
    diet: options?.diet,
    preferCheap: options?.preferCheap,
    originalName: stripIngredientNoise(ingredient),
    limit: options?.limit ?? 6,
  });

  return ranked.map((r) => {
    const match = base.find((b) => normalizeKey(b.name) === normalizeKey(r.name));
    const authenticity = (match?.authenticity ?? "medium") as Authenticity;
    return {
      name: r.name,
      ratio: match?.ratio ?? "1:1",
      notes: match?.notes ?? r.notes ?? "",
      reason: match?.reason ?? r.reason ?? "",
      regions: match?.regions ?? r.regions ?? [],
      flavorRole: match?.flavorRole ?? "",
      authenticity,
      compatibilityScore: match?.compatibilityScore ?? r.compatibilityScore,
      source: "graph" as const,
      cookAdjustment: match?.cookAdjustment,
      dietTags: match?.dietTags,
      priceTier: match?.priceTier,
      rankScore: r.rankScore,
      market: r.market,
      savingsVsOriginal: r.savingsVsOriginal,
      cookHint: r.cookHint,
    } satisfies MarketRankedSubstitute;
  });
}

/** Best single cook-mode prompt for an ingredient in a given market. */
export function bestCookSubstitutionPrompt(
  ingredient: string,
  options?: { regionHint?: string; marketId?: MarketId }
): MarketRankedSubstitute | null {
  const hits = lookupRankedSubstitutions(ingredient, {
    ...options,
    preferCheap: true,
    limit: 1,
  });
  return hits[0] ?? null;
}

/**
 * Flat substitute names for pantry / recipe matching (includes aliases of substitutes).
 */
export function getSubstituteNames(ingredient: string): string[] {
  const names = new Set<string>();
  for (const s of lookupSubstitutions(ingredient, { limit: 12 })) {
    names.add(normalizeKey(s.name));
    // include aliases that map to this substitute
    for (const [alias, canon] of aliasToCanonical) {
      if (canon === normalizeKey(s.name)) names.add(alias);
    }
  }
  // also: if ingredient is an alias, include other aliases in its group as soft matches
  for (const key of lookupKeys(ingredient)) {
    const canon = resolveCanonical(key);
    for (const [alias, c] of aliasToCanonical) {
      if (c === canon) names.add(alias);
    }
  }
  names.delete(normalizeKey(stripIngredientNoise(ingredient)));
  return [...names];
}

/** Exportable name list for tests / diagnostics */
export function listGraphCanonicalIngredients(): string[] {
  const set = new Set<string>();
  for (const def of SUBSTITUTION_EDGE_DEFS) {
    set.add(normalizeKey(def.from));
    set.add(normalizeKey(def.to));
  }
  return [...set].sort();
}

export function graphEdgeCount(): number {
  return SUBSTITUTION_EDGE_DEFS.length;
}
