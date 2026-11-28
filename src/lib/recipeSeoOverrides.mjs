/**
 * SERP title/description overrides for high-impression, low-CTR recipe pages.
 * Source of truth for both the React app and scripts/prerender-seo.mjs.
 *
 * Titles target ≤60 chars; descriptions ≤155 chars (PageMeta / prerender clip as backup).
 * Keep dish overrides definitional ("What is…") so /dish/ does not cannibalize /recipe/.
 */

/** @typedef {{ title: string, description: string }} SeoOverride */

/** @type {Record<string, SeoOverride>} */
export const RECIPE_SEO_OVERRIDES = {
  "egyptian-tarb": {
    title: "Egyptian Tarb (طرب) Meat Recipe | LadhaQuest",
    description:
      "How to make Egyptian tarb — spiced minced meat roasted in caul fat. Ingredients, steps, and tips for this Cairo classic.",
  },
  "feseekh-egypt": {
    title: "Feseekh (فسيخ) Egyptian Fish Recipe | LadhaQuest",
    description:
      "Traditional Egyptian feseekh: salted fermented mullet for Sham El-Nessim. Method, safety notes, and serving ideas.",
  },
  injera: {
    title: "Injera Recipe — Ethiopian Flatbread | LadhaQuest",
    description:
      "How to make injera at home: teff batter, fermentation, and cooking soft spongy Ethiopian flatbread step by step.",
  },
  "jollof-rice-liberian": {
    title: "Liberian Jollof Rice Recipe | LadhaQuest",
    description:
      "Authentic Liberian jollof rice — tomato-rich, one-pot West African rice distinct from Nigerian or Ghanaian styles.",
  },
  "aseeda-sudan": {
    title: "Sudanese Aseeda (Asida) Recipe | LadhaQuest",
    description:
      "How to cook Sudanese aseeda (asida): smooth sorghum or wheat porridge with mullah stew, spices, and serving tips.",
  },
  "tente-zambia": {
    title: "Tente Mushroom Recipe — Zambia | LadhaQuest",
    description:
      "Zambian tente wild mushroom recipe — how to cook tente (not camping tents): ingredients, method, and local tips.",
  },
  "matangara-namibia": {
    title: "Matangara Recipe — Namibian Dish | LadhaQuest",
    description:
      "Cook Namibian matangara step by step: traditional ingredients, method, and what this Southern African dish tastes like.",
  },
  "derere-zimbabwe": {
    title: "Derere (Okra) Recipe — Zimbabwe | LadhaQuest",
    description:
      "Zimbabwean derere (okra) stew recipe: how to cook soft derere with traditional seasonings, sadza pairing tips included.",
  },
  "fruta-pão-assada-sao-tome-and-principe": {
    title: "Fruta Pão Assada (Breadfruit) Recipe | LadhaQuest",
    description:
      "São Tomé fruta pão assada — roasted breadfruit the Santomean way. Ingredients, oven method, and how to serve it.",
  },
  "urojo-tanzania": {
    title: "Urojo (Zanzibar Mix) Soup Recipe | LadhaQuest",
    description:
      "Tanzanian urojo (Zanzibar mix) soup: tangy potato-based street soup with bhajias, toppings, and authentic seasoning.",
  },
  "mosutlhane-botswana": {
    title: "Mosutlhane Recipe — Botswana | LadhaQuest",
    description:
      "How to make Botswanan mosutlhane: traditional ingredients, cooking method, and what mosutlhane means in English.",
  },
  "nhedzi-zimbabwe": {
    title: "Nhedzi Mushroom Soup Recipe | LadhaQuest",
    description:
      "Zimbabwean nhedzi wild mushroom soup recipe — earthy, traditional, with ingredients, steps, and sadza pairing tips.",
  },
  "karkade-sudani-sudan": {
    title: "Sudanese Karkade (Hibiscus Tea) | LadhaQuest",
    description:
      "How to brew Sudanese karkade: refreshing hibiscus tea with ginger and spices. Hot or iced, step-by-step method.",
  },
  "mofo-anana-madagascar": {
    title: "Mofo Anana Recipe — Madagascar | LadhaQuest",
    description:
      "Malagasy mofo anana (greens fritters): crispy fried dough with leafy greens. Ingredients, frying tips, and serving ideas.",
  },
  "lumanda-zambia": {
    title: "Lumanda Recipe — Zambian Greens | LadhaQuest",
    description:
      "How to cook Zambian lumanda greens: traditional preparation, ingredients, and what lumanda is called in English.",
  },
  // High-impression winner — lift CTR further (Week 1 bonus).
  "katapa-zambia": {
    title: "Katapa Recipe — Zambian Cassava Leaves | LadhaQuest",
    description:
      "Authentic Zambian katapa: pounded cassava leaves with groundnuts. Ingredients, cooking time, and step-by-step method.",
  },
  // Week 2 page-2 push targets.
  "gurasa-sudan": {
    title: "Gurasa Recipe — Sudanese Flatbread | LadhaQuest",
    description:
      "How to make Sudanese gurasa bread: soft wheat flatbread for stews and mullah, with ingredients and pan method.",
  },
  "burukutu-nigeria": {
    title: "Burukutu (Brukutu) Drink Recipe | LadhaQuest",
    description:
      "Traditional Nigerian burukutu: fermented sorghum or millet drink. How it’s made, taste notes, and cultural context.",
  },
  "banku-and-tilapia-ghana": {
    title: "Banku and Tilapia Recipe — Ghana | LadhaQuest",
    description:
      "Ghanaian banku with grilled tilapia and pepper sauce. Dough method, fish tips, and how to serve this classic meal.",
  },
  "dombolo-steamed-south-africa": {
    title: "Dombolo Recipe — SA Steamed Dumplings | LadhaQuest",
    description:
      "South African dombolo steamed dumplings: fluffy dough cooked over stew. Ingredients, steaming time, and serving ideas.",
  },
  "feuilles-de-manioc-gabon-gabon": {
    title: "Feuilles de Manioc Recipe — Gabon | LadhaQuest",
    description:
      "Gabonese feuilles de manioc (cassava leaf stew): how to cook feuille de manioc safely with traditional seasoning.",
  },
  // Week 3–4 winners + satellites (CTR / cluster titles).
  "bonbon-coco-madagascar": {
    title: "Bonbon Coco Recipe — Madagascar | LadhaQuest",
    description:
      "Malagasy bonbon coco coconut sweets: grated coconut, sugar, and vanilla. Easy method, storage tips, and snack ideas.",
  },
  "mahamri-kenya": {
    title: "Mahamri Recipe — Kenyan Fried Bread | LadhaQuest",
    description:
      "How to make Kenyan mahamri: soft cardamom fried bread for tea time. Dough tips, frying method, and mandazi notes.",
  },
  "chiponde-malawi": {
    title: "Chiponde Recipe — Malawi | LadhaQuest",
    description:
      "Malawian chiponde recipe on LadhaQuest: ingredients, method, and how it fits Southern African relish cooking.",
  },
  // Liberian / Cape Verde / São Tomé (+ Seychelles) long-tails.
  "djagacida-cape-verde": {
    title: "Djagacida Recipe — Cape Verde | LadhaQuest",
    description:
      "Cape Verdean djagacida: traditional island rice dish with beans and savory seasoning. Ingredients and method.",
  },
  cachupa: {
    title: "Cachupa Recipe — Cape Verde Stew | LadhaQuest",
    description:
      "How to make Cape Verdean cachupa: slow-cooked corn, beans, and meat or fish. The national comfort stew of Cabo Verde.",
  },
  "frango-à-cabidela-santomense-sao-tome-and-principe": {
    title: "Frango à Cabidela — São Tomé Recipe | LadhaQuest",
    description:
      "Santomean frango à cabidela: chicken cooked in a rich blood-sauce tradition. Ingredients, method, and serving tips.",
  },
  "bourgeois-grillé-seychelles": {
    title: "Bourgeois Grillé — Seychelles Fish | LadhaQuest",
    description:
      "Seychellois bourgeois grillé: grilled red snapper (bourgeois) with Creole seasoning. Island fish recipe step by step.",
  },
};

/** Dish encyclopedia pages — keep definitional so they don't steal recipe CTR. */
/** @type {Record<string, SeoOverride>} */
export const DISH_SEO_OVERRIDES = {
  "lumanda-zambia": {
    title: "What Is Lumanda? Zambian Greens Guide",
    description:
      "Lumanda explained: native name, region, how Zambians eat these greens, and a link to the full cooking recipe.",
  },
  "mosutlhane-botswana": {
    title: "What Is Mosutlhane? Botswana Dish Guide",
    description:
      "Mosutlhane in English: origin, cultural context, and how this Botswanan dish is traditionally prepared and served.",
  },
  "isijingi-south-africa": {
    title: "What Is Isijingi? South African Dish Guide",
    description:
      "Isijingi explained: pumpkin-and-maize comfort food from South Africa, cultural notes, and where to find the recipe.",
  },
  "injera-pizza-ethiopian": {
    title: "What Is Injera Pizza? Ethiopian Fusion Guide",
    description:
      "Injera pizza explained: Ethiopian flatbread topped like pizza — origins, variations, and how to cook it at home.",
  },
  injera: {
    title: "What Is Injera? Ethiopian Flatbread Guide",
    description:
      "Injera explained: teff flatbread of Ethiopia and Eritrea, how it’s eaten with stews, and where to find the full recipe.",
  },
  "feseekh-egypt": {
    title: "What Is Feseekh? Egyptian Fermented Fish",
    description:
      "Feseekh (fesikh) explained: Egyptian fermented mullet for Sham El-Nessim, cultural notes, and safety context.",
  },
  "gurasa-sudan": {
    title: "What Is Gurasa? Sudanese Bread Guide",
    description:
      "Gurasa explained: soft Sudanese flatbread, how it differs from injera, and where to cook the full recipe.",
  },
  "burukutu-nigeria": {
    title: "What Is Burukutu? Nigerian Drink Guide",
    description:
      "Burukutu (brukutu) explained: traditional fermented grain drink of Nigeria, taste, and cultural serving context.",
  },
  "katapa-zambia": {
    title: "What Is Katapa? Zambian Cassava Leaves",
    description:
      "Katapa explained: Zambian pounded cassava leaves with groundnuts, how it’s eaten with nshima, and the full recipe.",
  },
  "bonbon-coco-madagascar": {
    title: "What Is Bonbon Coco? Malagasy Coconut Sweet",
    description:
      "Bonbon coco explained: Madagascar coconut sweets, ingredients, and where to find the step-by-step recipe.",
  },
  "mahamri-kenya": {
    title: "What Is Mahamri? Kenyan Tea-Time Bread",
    description:
      "Mahamri explained: Swahili-coast fried bread related to mandazi, tea pairings, and the full cooking recipe.",
  },
  cachupa: {
    title: "What Is Cachupa? Cape Verde National Stew",
    description:
      "Cachupa explained: Cabo Verde’s corn-and-bean stew, rica vs pobre styles, and where to cook the full recipe.",
  },
  "djagacida-cape-verde": {
    title: "What Is Djagacida? Cape Verde Rice Dish",
    description:
      "Djagacida explained: Cape Verdean savory rice, how it differs from cachupa, and the step-by-step recipe.",
  },
  "jollof-rice-liberian": {
    title: "What Is Liberian Jollof? West African Rice",
    description:
      "Liberian jollof explained: how it differs from Nigerian and Ghanaian styles, and where to cook it on LadhaQuest.",
  },
};

/**
 * @param {{ slug?: string|null, name?: string|null, country?: string|null, summary?: string|null, briefDescription?: string|null }} input
 * @returns {{ title: string, description: string, overridden: boolean }}
 */
export function resolveRecipeSeo(input) {
  const slug = String(input?.slug || "");
  const override = RECIPE_SEO_OVERRIDES[slug];
  if (override) {
    return { title: override.title, description: override.description, overridden: true };
  }
  const name = input?.name || "Recipe";
  const country = input?.country || "";
  const countryBit = country ? ` — ${country}` : "";
  let title = `${name} Recipe${countryBit} | LadhaQuest`;
  if (title.length > 60) title = `${name}${countryBit} | LadhaQuest`;
  if (title.length > 60) title = `${String(name).slice(0, 40).trim()} | LadhaQuest`;
  const description =
    input?.summary ||
    input?.briefDescription ||
    `How to cook ${name}: ingredients, step-by-step method, tips and cultural history.`;
  return { title, description, overridden: false };
}

/**
 * @param {{ slug?: string|null, name?: string|null, country?: string|null, summary?: string|null }} input
 * @returns {{ title: string, description: string, overridden: boolean }}
 */
export function resolveDishSeo(input) {
  const slug = String(input?.slug || "");
  const override = DISH_SEO_OVERRIDES[slug];
  if (override) {
    return { title: override.title, description: override.description, overridden: true };
  }
  const name = input?.name || "Dish";
  const country = input?.country || "";
  const title = `${name} | Dish Encyclopedia${country ? ` — ${country}` : ""}`;
  const description =
    input?.summary ||
    `${name}: native name, pronunciation, region, cultural history and where to eat it.`;
  return { title, description, overridden: false };
}

/** Strip trailing slashes from a pathname (keeps "/"). */
export function stripTrailingSlash(pathname) {
  const p = String(pathname || "");
  if (!p || p === "/") return "/";
  return p.replace(/\/+$/, "") || "/";
}

/**
 * Build a slash-free absolute canonical on www.ladhaquest.com.
 * @param {string} pathOrUrl
 */
export function toCanonicalUrl(pathOrUrl) {
  const site = "https://www.ladhaquest.com";
  try {
    const u = new URL(pathOrUrl, site);
    u.hostname = "www.ladhaquest.com";
    u.protocol = "https:";
    u.hash = "";
    u.pathname = stripTrailingSlash(u.pathname);
    return `${u.origin}${u.pathname}${u.search}`;
  } catch {
    const path = stripTrailingSlash(String(pathOrUrl || "/"));
    return `${site}${path.startsWith("/") ? path : `/${path}`}`;
  }
}
