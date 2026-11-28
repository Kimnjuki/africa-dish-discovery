/**
 * Week 2 SEO enrichment: visible FAQs + curated internal links for page-2 /
 * high-impression recipes. Source of truth for React + prerender-seo.
 *
 * FAQPage JSON-LD must only emit when these FAQs are visible on the page.
 */

/**
 * @typedef {{ q: string, a: string }} FaqItem
 * @typedef {{ href: string, label: string }} InternalLink
 * @typedef {{
 *   faqs: FaqItem[],
 *   internalLinks: InternalLink[],
 *   dishSlug?: string,
 *   keyPhrases?: string[],
 * }} RecipeEnrichment
 */

/** @type {Record<string, RecipeEnrichment>} */
export const RECIPE_SEO_ENRICHMENT = {
  injera: {
    dishSlug: "injera",
    keyPhrases: ["Ethiopian flatbread", "teff injera recipe", "how to make injera"],
    faqs: [
      {
        q: "What is injera?",
        a: "Injera is a soft, spongy Ethiopian and Eritrean flatbread made from fermented teff batter. It is both the plate and the utensil for stews like doro wat and lentil dishes.",
      },
      {
        q: "How long does injera batter need to ferment?",
        a: "Most home batters ferment 1–3 days at room temperature until bubbly and tangy. Cooler kitchens take longer; warmer ones ferment faster. A pleasant sour smell means it is ready.",
      },
      {
        q: "Can I make injera without teff flour?",
        a: "Traditional injera uses teff. A common home compromise mixes teff with wheat, sorghum, or self-rising flour when teff is scarce, but 100% teff gives the classic taste and texture.",
      },
      {
        q: "How do you cook injera at home?",
        a: "Pour a thin layer of fermented batter onto a hot nonstick or mitad-style pan, cover briefly so the top sets with eyes (holes), then slide it off—do not flip like a pancake.",
      },
    ],
    internalLinks: [
      { href: "/dish/injera", label: "Injera encyclopedia entry" },
      { href: "/country/ethiopia", label: "Ethiopian recipes" },
      { href: "/blog/ethiopian-doro-wat-recipe", label: "Doro wat guide (pairs with injera)" },
      { href: "/recipe/gurasa-sudan", label: "Gurasa — Sudanese flatbread" },
      { href: "/atlas", label: "African food atlas" },
    ],
  },
  "feseekh-egypt": {
    dishSlug: "feseekh-egypt",
    keyPhrases: ["Egyptian feseekh", "fesikh", "fermented mullet", "Sham El-Nessim fish"],
    faqs: [
      {
        q: "What is feseekh (fesikh)?",
        a: "Feseekh (فسيخ) is Egyptian salted, fermented grey mullet traditionally eaten at Sham El-Nessim. It is intensely savory and must be prepared and stored carefully.",
      },
      {
        q: "Is homemade feseekh safe?",
        a: "Fermented fish can cause serious foodborne illness if mishandled. Prefer trusted producers or follow verified safety notes on the recipe. Never eat feseekh that smells rotten in a wrong way, looks slimy, or was stored warm.",
      },
      {
        q: "When do Egyptians eat feseekh?",
        a: "It is most associated with Sham El-Nessim, the spring festival. Families serve it with raw vegetables, lemon, and baladi bread.",
      },
      {
        q: "What is the difference between feseekh and other salted fish?",
        a: "Feseekh is specifically fermented whole mullet in the Egyptian tradition—not the same as Scandinavian lutefisk, Scandinavian gravlax, or generic salt fish.",
      },
    ],
    internalLinks: [
      { href: "/dish/feseekh-egypt", label: "Feseekh culture & history" },
      { href: "/country/egypt", label: "Egyptian recipes" },
      { href: "/recipe/egyptian-tarb", label: "Egyptian tarb" },
      { href: "/recipe/classic-beef-hawawshi", label: "Hawawshi" },
      { href: "/recipe/baladi-bread-egypt-mina", label: "Baladi bread" },
    ],
  },
  "gurasa-sudan": {
    dishSlug: "gurasa-sudan",
    keyPhrases: ["Sudanese bread", "gurasa recipe", "Sudanese flatbread"],
    faqs: [
      {
        q: "What is gurasa?",
        a: "Gurasa is a soft Sudanese flatbread or pancake-like bread, often made from wheat flour. It is eaten with stews, mullah, or savory sauces across Sudan.",
      },
      {
        q: "How is gurasa different from injera?",
        a: "Injera is usually teff-based and strongly fermented with a spongy sour crumb. Gurasa is typically wheat-based, milder, and closer to a soft pancake or flatbread.",
      },
      {
        q: "What do you serve with gurasa?",
        a: "Common pairings include mullah stews, lentils, meat sauces, and breakfast spreads. Tear pieces of gurasa to scoop the stew.",
      },
      {
        q: "Can I make gurasa without special equipment?",
        a: "Yes. A good nonstick skillet or crepe pan works at home. Cook until set and lightly spotted; keep finished breads covered so they stay soft.",
      },
    ],
    internalLinks: [
      { href: "/dish/gurasa-sudan", label: "Gurasa encyclopedia" },
      { href: "/country/sudan", label: "Sudanese recipes" },
      { href: "/recipe/aseeda-sudan", label: "Sudanese aseeda" },
      { href: "/recipe/karkade-sudani-sudan", label: "Sudanese karkade" },
      { href: "/recipe/injera", label: "Ethiopian injera" },
    ],
  },
  "burukutu-nigeria": {
    dishSlug: "burukutu-nigeria",
    keyPhrases: ["burukutu drink", "brukutu", "Nigerian fermented drink"],
    faqs: [
      {
        q: "What is burukutu?",
        a: "Burukutu (also called brukutu) is a traditional West African fermented drink, popular in parts of Nigeria and neighboring regions, typically made from sorghum or millet.",
      },
      {
        q: "Is burukutu alcoholic?",
        a: "Yes—burukutu is a lightly to moderately alcoholic fermented beverage, depending on fermentation time and local practice. Treat it as a traditional drink, not a soft drink.",
      },
      {
        q: "How is burukutu made?",
        a: "Grains are soaked, milled or mashed, cooked into a mash, then fermented. Time and local starter cultures shape flavor—from tangy to robust.",
      },
      {
        q: "What does burukutu taste like?",
        a: "Expect a sour, grainy, slightly yeasty profile similar to other African sorghum beers. Fresh burukutu is preferred; flavor changes as fermentation continues.",
      },
    ],
    internalLinks: [
      { href: "/dish/burukutu-nigeria", label: "Burukutu encyclopedia" },
      { href: "/country/nigeria", label: "Nigerian recipes" },
      { href: "/recipe/ogi-nigeria", label: "Ogi (pap)" },
      { href: "/recipe/pepe-soup-nigeria", label: "Pepe soup" },
      { href: "/recipe/jollof-rice-liberian", label: "Liberian jollof rice" },
    ],
  },
  "banku-and-tilapia-ghana": {
    dishSlug: "banku-and-tilapia-ghana",
    keyPhrases: ["banku and tilapia", "Ghanaian banku", "grilled tilapia Ghana"],
    faqs: [
      {
        q: "What is banku and tilapia?",
        a: "Banku is a fermented corn and cassava dough dumpling from Ghana, classically served with grilled tilapia and a spicy pepper sauce or okro stew.",
      },
      {
        q: "How do you eat banku with tilapia?",
        a: "Pinch soft banku with your fingers, scoop pepper sauce, and eat alongside the fish. It is a hands-on meal—serve lemon or lime and fresh peppers on the side.",
      },
      {
        q: "Can I make banku without cassava dough?",
        a: "Traditional banku uses both corn and cassava. Some home cooks adjust ratios when cassava dough is hard to find, but cassava helps the stretchy texture.",
      },
    ],
    internalLinks: [
      { href: "/dish/banku-and-tilapia-ghana", label: "Banku & tilapia guide" },
      { href: "/country/ghana", label: "Ghanaian recipes" },
      { href: "/recipe/pepe-soup-nigeria", label: "Pepe soup" },
      { href: "/recipe/jollof-rice-liberian", label: "Liberian jollof" },
      { href: "/cuisine-map", label: "Cuisine map" },
    ],
  },
  "dombolo-steamed-south-africa": {
    dishSlug: "dombolo-steamed-south-africa",
    keyPhrases: ["how to make dombolo", "South African dumplings", "steamed dombolo"],
    faqs: [
      {
        q: "What is dombolo?",
        a: "Dombolo are soft South African steamed dumplings (also called phuthu or dumpling bread in some homes), often cooked over stew so they soak up the gravy.",
      },
      {
        q: "How long do you steam dombolo?",
        a: "Most batches steam 30–45 minutes until cooked through and fluffy. Keep the lid on—lifting too often drops the temperature and can leave them dense.",
      },
      {
        q: "What do you serve with dombolo?",
        a: "Serve with rich stews, oxtail, beef curry, or bean dishes. Dombolo is meant to mop up sauce.",
      },
    ],
    internalLinks: [
      { href: "/dish/dombolo-steamed-south-africa", label: "Dombolo encyclopedia" },
      { href: "/country/south-africa", label: "South African recipes" },
      { href: "/recipe/skopo-south-africa", label: "Skopo" },
      { href: "/recipe/potbrood-namibia", label: "Potbrood" },
      { href: "/atlas", label: "African food atlas" },
    ],
  },
  "feuilles-de-manioc-gabon-gabon": {
    dishSlug: "feuilles-de-manioc-gabon-gabon",
    keyPhrases: ["feuille de manioc", "cassava leaves Gabon", "sauce feuille"],
    faqs: [
      {
        q: "What is feuilles de manioc?",
        a: "Feuilles de manioc are cassava leaves cooked as a savory green stew or sauce—central to Gabonese and wider Central African cooking, often with fish, meat, or peanut.",
      },
      {
        q: "Are cassava leaves safe to eat?",
        a: "Cassava leaves must be thoroughly cooked; raw leaves contain compounds that need proper preparation. Follow the recipe’s cooking time and never serve undercooked leaves.",
      },
      {
        q: "What does feuille de manioc taste like?",
        a: "Deeply savory and earthy, similar to other cassava-leaf dishes like Congolese pondu or Zambian katapa, with regional seasoning differences.",
      },
    ],
    internalLinks: [
      { href: "/dish/feuilles-de-manioc-gabon-gabon", label: "Feuilles de manioc guide" },
      { href: "/country/gabon", label: "Gabonese recipes" },
      { href: "/recipe/katapa-zambia", label: "Zambian katapa" },
      { href: "/recipe/chiponde-malawi", label: "Chiponde (Malawi)" },
      { href: "/recipe/sauce-feuille-guinée-guinea", label: "Sauce feuille (Guinea)" },
      { href: "/recipe/lumanda-zambia", label: "Lumanda greens" },
      { href: "/atlas", label: "African food atlas" },
    ],
  },

  // --- Week 3–4 winner clusters ---
  "katapa-zambia": {
    dishSlug: "katapa-zambia",
    keyPhrases: ["katapa recipe", "Zambian cassava leaves", "how to cook katapa"],
    faqs: [
      {
        q: "What is katapa?",
        a: "Katapa is a Zambian dish of pounded cassava leaves, often cooked with groundnuts (peanuts). It is a staple green stew served with nshima.",
      },
      {
        q: "How long does katapa take to cook?",
        a: "Cassava leaves need thorough cooking—often 45–90 minutes depending on whether leaves are fresh, frozen, or pre-pounded—until soft and safe to eat.",
      },
      {
        q: "What do you serve with katapa?",
        a: "Classic pairing is nshima (maize porridge). Some homes add dried fish, meat, or tomatoes for depth.",
      },
      {
        q: "How is katapa different from Congolese pondu or Gabonese feuilles de manioc?",
        a: "All are cassava-leaf dishes. Katapa is the Zambian groundnut-forward style; pondu and feuilles de manioc use related leaves with different seasonings and fats by region.",
      },
    ],
    internalLinks: [
      { href: "/dish/katapa-zambia", label: "Katapa encyclopedia" },
      { href: "/country/zambia", label: "Zambian recipes" },
      { href: "/recipe/lumanda-zambia", label: "Lumanda greens" },
      { href: "/recipe/chiponde-malawi", label: "Chiponde (Malawi)" },
      { href: "/recipe/feuilles-de-manioc-gabon-gabon", label: "Feuilles de manioc" },
      { href: "/atlas", label: "Cassava-leaf cluster on the atlas" },
    ],
  },
  "bonbon-coco-madagascar": {
    dishSlug: "bonbon-coco-madagascar",
    keyPhrases: ["bonbon coco madagascar recipe", "Malagasy coconut sweets", "bonbon coco"],
    faqs: [
      {
        q: "What is bonbon coco?",
        a: "Bonbon coco are Malagasy coconut sweets—chewy or caramelized coconut confections popular as snacks and treats across Madagascar.",
      },
      {
        q: "What ingredients do I need for bonbon coco?",
        a: "Typically grated coconut, sugar, and often vanilla or citrus. Some versions use condensed milk or caramelize the sugar for a deeper flavor.",
      },
      {
        q: "How do you store bonbon coco?",
        a: "Keep in an airtight container at room temperature for several days. In humid climates, refrigerate lightly and bring to room temperature before serving.",
      },
      {
        q: "What other Malagasy snacks pair with bonbon coco?",
        a: "Try mofo anana (greens fritters) for a savory contrast, or other Malagasy sweets like koba akondro for a full island snack spread.",
      },
    ],
    internalLinks: [
      { href: "/dish/bonbon-coco-madagascar", label: "Bonbon coco encyclopedia" },
      { href: "/country/madagascar", label: "Madagascar recipes" },
      { href: "/recipe/mofo-anana-madagascar", label: "Mofo anana" },
      { href: "/recipe/koba-akondro-madagascar", label: "Koba akondro" },
      { href: "/atlas", label: "Malagasy cluster on the atlas" },
      { href: "/meals", label: "Snacks & meals" },
    ],
  },
  "mahamri-kenya": {
    dishSlug: "mahamri-kenya",
    keyPhrases: ["how to make mahamri", "mahamri recipe", "Kenyan mandazi"],
    faqs: [
      {
        q: "What is mahamri?",
        a: "Mahamri (also related to mandazi) are lightly sweet, cardamom-scented fried breads from the Kenyan and Swahili coast—often eaten with tea or coffee.",
      },
      {
        q: "Is mahamri the same as mandazi?",
        a: "They are closely related East African fried doughs. Mahamri are often richer and more aromatic (cardamom, coconut milk in some kitchens); mandazi are the broader cousin across the region.",
      },
      {
        q: "How do you make mahamri soft inside?",
        a: "Don’t over-flour the dough, let it rest so gluten relaxes, and fry in steady medium heat so the outside browns while the inside cooks through.",
      },
      {
        q: "What should I serve with mahamri?",
        a: "Tea or spiced chai is classic. For a coastal meal, pair with urojo (Zanzibar mix) or a light breakfast spread.",
      },
    ],
    internalLinks: [
      { href: "/dish/mahamri-kenya", label: "Mahamri encyclopedia" },
      { href: "/country/kenya", label: "Kenyan recipes" },
      { href: "/recipe/urojo-tanzania", label: "Urojo (Zanzibar mix)" },
      { href: "/recipe/ugali-kenya", label: "Ugali" },
      { href: "/cuisine-map", label: "Cuisine map" },
      { href: "/atlas", label: "East African cluster on the atlas" },
    ],
  },
  "lumanda-zambia": {
    dishSlug: "lumanda-zambia",
    keyPhrases: ["lumanda", "lumanda in english", "Zambian greens"],
    faqs: [
      {
        q: "What is lumanda?",
        a: "Lumanda is a Zambian leafy green (often a wild or garden green depending on region). It is cooked as a savory relish alongside nshima.",
      },
      {
        q: "How do you cook lumanda?",
        a: "Wash thoroughly, chop, and simmer with onion, tomato, and oil or groundnuts until tender. Season simply so the green flavor stays forward.",
      },
      {
        q: "What is lumanda in English?",
        a: "English names vary by the exact plant used locally—many cooks describe it as a Zambian wild or traditional green similar to other African leaf relishes.",
      },
    ],
    internalLinks: [
      { href: "/dish/lumanda-zambia", label: "Lumanda encyclopedia" },
      { href: "/recipe/katapa-zambia", label: "Katapa (cassava leaves)" },
      { href: "/recipe/chiponde-malawi", label: "Chiponde" },
      { href: "/country/zambia", label: "Zambian recipes" },
      { href: "/atlas", label: "Greens cluster on the atlas" },
    ],
  },
  "mofo-anana-madagascar": {
    dishSlug: "mofo-anana-madagascar",
    keyPhrases: ["mofo anana", "Malagasy fritters", "greens fritters Madagascar"],
    faqs: [
      {
        q: "What is mofo anana?",
        a: "Mofo anana are Malagasy fritters made with batter and leafy greens—crispy outside, soft inside, sold as street snacks and home treats.",
      },
      {
        q: "Which greens work for mofo anana?",
        a: "Traditional local greens are ideal; spinach or similar mild greens work at home when Malagasy greens are unavailable.",
      },
      {
        q: "Are mofo anana sweet or savory?",
        a: "Savory. They pair well with a hot sauce or as a snack beside sweets like bonbon coco for a Malagasy tasting spread.",
      },
    ],
    internalLinks: [
      { href: "/dish/mofo-anana-madagascar", label: "Mofo anana encyclopedia" },
      { href: "/recipe/bonbon-coco-madagascar", label: "Bonbon coco" },
      { href: "/recipe/koba-akondro-madagascar", label: "Koba akondro" },
      { href: "/country/madagascar", label: "Madagascar recipes" },
      { href: "/atlas", label: "Malagasy cluster on the atlas" },
    ],
  },
  "urojo-tanzania": {
    dishSlug: "urojo-tanzania",
    keyPhrases: ["urojo soup", "Zanzibar mix", "urojo recipe"],
    faqs: [
      {
        q: "What is urojo?",
        a: "Urojo (Zanzibar mix) is a tangy Tanzanian street soup—usually a spiced potato-based broth topped with bhajias, boiled eggs, chutneys, and crunchy garnishes.",
      },
      {
        q: "Is urojo the same as Zanzibar mix?",
        a: "Yes—Zanzibar mix is the common English name for urojo, especially in coastal Tanzania and diaspora shops.",
      },
      {
        q: "What do you eat with urojo?",
        a: "It is a full bowl on its own. For a Swahili snack spread, add mahamri or mandazi on the side with tea.",
      },
    ],
    internalLinks: [
      { href: "/dish/urojo-tanzania", label: "Urojo encyclopedia" },
      { href: "/recipe/mahamri-kenya", label: "Mahamri" },
      { href: "/country/tanzania", label: "Tanzanian recipes" },
      { href: "/cuisine-map", label: "Cuisine map" },
      { href: "/atlas", label: "East African cluster on the atlas" },
    ],
  },
  "chiponde-malawi": {
    dishSlug: "chiponde-malawi",
    keyPhrases: ["chiponde malawi", "Malawian dish chiponde"],
    faqs: [
      {
        q: "What is chiponde?",
        a: "Chiponde is a Malawian dish featured on LadhaQuest’s Southern African greens and relish cluster—cook it as a savory accompaniment in the Malawian style.",
      },
      {
        q: "What goes well with chiponde?",
        a: "Serve with nsima (Malawi’s maize staple) and explore related greens like Zambian katapa and lumanda for a regional tasting set.",
      },
      {
        q: "Where else should I explore after chiponde?",
        a: "Browse Malawi and Zambia country pages, or open the African Food Atlas cassava-leaf and greens cluster for related recipes.",
      },
    ],
    internalLinks: [
      { href: "/dish/chiponde-malawi", label: "Chiponde encyclopedia" },
      { href: "/recipe/katapa-zambia", label: "Katapa" },
      { href: "/recipe/lumanda-zambia", label: "Lumanda" },
      { href: "/country/malawi", label: "Malawian recipes" },
      { href: "/atlas", label: "Greens cluster on the atlas" },
    ],
  },
};

/**
 * @param {string|null|undefined} slug
 * @returns {RecipeEnrichment | null}
 */
export function getRecipeSeoEnrichment(slug) {
  if (!slug) return null;
  return RECIPE_SEO_ENRICHMENT[String(slug)] || null;
}

/**
 * Prefer an explicit recipe slug when the dish page knows one; otherwise
 * fall back to the dish slug (shared-slug convention on LadhaQuest).
 * @param {{ recipeSlug?: string|null, dishSlug?: string|null }} input
 */
export function dishToRecipePath(input) {
  const recipeSlug = String(input?.recipeSlug || "").trim();
  const dishSlug = String(input?.dishSlug || "").trim();
  const slug = recipeSlug || dishSlug;
  return slug ? `/recipe/${slug}` : null;
}
