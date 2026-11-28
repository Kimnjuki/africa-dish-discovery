/**
 * Crawlable hub copy for thin-content SEO fixes.
 * Shared by React pages and scripts/prerender-seo.mjs so Screaming Frog /
 * GSC-style crawlers see 150+ words even without executing JS.
 *
 * @typedef {{ heading?: string, paragraphs: string[], links?: { href: string, label: string }[] }} HubSection
 * @typedef {{ h1: string, intro: string, sections: HubSection[] }} HubContent
 */

/** @type {Record<string, HubContent>} */
export const HUB_SEO_CONTENT = {
  "/": {
    h1: "LadhaQuest — Authentic African Recipes from 54 Countries",
    intro:
      "LadhaQuest is an Africa-first cooking platform built for home cooks, diaspora kitchens, and curious food lovers. Browse more than a thousand authentic African recipes with local ingredient names, market-aware substitutions, cultural context, and step-by-step methods you can cook tonight.",
    sections: [
      {
        heading: "Cook Africa from your kitchen",
        paragraphs: [
          "Explore West African jollof and egusi, East African injera and ugali, North African tagines and koshari, Central African cassava-leaf stews, and Southern African braai classics. Island kitchens from Cape Verde, Madagascar, Mauritius, Seychelles, and São Tomé are included alongside mainland staples.",
          "Every recipe page aims to answer how to cook the dish and what it means culturally — with pantry matching, meal planning, and offline cook mode for low-connectivity kitchens.",
        ],
        links: [
          { href: "/recipes", label: "Browse African recipes" },
          { href: "/atlas", label: "Open the food atlas" },
          { href: "/countries", label: "Recipes by country" },
          { href: "/cuisine-map", label: "Cuisine map of Africa" },
        ],
      },
      {
        heading: "Why LadhaQuest is Africa-first",
        paragraphs: [
          "Search and discovery surfaces prioritize African dishes so topical authority stays clear. Global cookbook imports may still be reachable in the app, but organic search and default lists lead with African food from all 54 countries and African islands.",
        ],
      },
    ],
  },
  "/about": {
    h1: "About LadhaQuest — Mission & Story",
    intro:
      "LadhaQuest exists to make authentic African recipes accessible worldwide without stripping away local names, techniques, or cultural context. We document dishes the way they are cooked at home — from Nigerian party jollof to Malagasy bonbon coco — and help cooks adapt ingredients to what their markets actually sell.",
    sections: [
      {
        heading: "What we build",
        paragraphs: [
          "The platform combines a growing African recipe catalog with pantry intelligence, meal planning, offline packs, and an encyclopedia of dishes. We research authenticity signals such as country attribution, cultural history, and native names so cooks can trust what they are making.",
          "Our goal is not just more recipes. It is better cooking outcomes for African food: clearer methods, safer fermented dishes, island and mainland coverage, and tools that work on mobile-first connections.",
        ],
        links: [
          { href: "/recipes", label: "Start cooking" },
          { href: "/atlas", label: "Food atlas" },
          { href: "/contact", label: "Contact the team" },
        ],
      },
      {
        heading: "Who LadhaQuest is for",
        paragraphs: [
          "Home cooks learning African cuisine for the first time, diaspora families preserving taste memory, creators documenting regional food, and travelers who want accurate recipes after a trip. Whether you need Liberian jollof, Cape Verdean cachupa, or Ethiopian injera, LadhaQuest is built to guide the cook step by step.",
          "We also support cooks who already know the dish but need a reliable checklist — timings, servings, substitutions, and related recipes from the same country or region — so weeknight cooking stays practical. Explore the atlas, country guides, and recipe index to see how the mission shows up in every dish page.",
        ],
      },
    ],
  },
  "/blog": {
    h1: "African Food Blog — Recipes, Guides & Stories",
    intro:
      "The LadhaQuest blog publishes practical guides to Africa’s most requested dishes and cooking techniques. Expect clear methods for jollof rice, egusi soup, doro wat, tagines, and street-food classics, plus tips on ingredients, substitutions, and regional differences across the continent.",
    sections: [
      {
        heading: "Learn by cooking",
        paragraphs: [
          "Each guide focuses on one dish or technique so you can go from shopping list to plated meal without guesswork. We cover West African stews, East African breads, North African spices, Southern African braai sides, and Indian Ocean island snacks.",
          "Use the blog alongside the full recipe index and country food guides when you want deeper context — history, local names, and related dishes from the same cuisine.",
          "New articles emphasize Africa-first discovery: how to source specialty spices, when a substitution still tastes right, and how the same dish varies from Lagos to Accra or from Addis Ababa to Nairobi. Bookmark the blog when you want a guided read before opening the full recipe steps.",
        ],
        links: [
          { href: "/recipe-index", label: "Full recipe index" },
          { href: "/countries", label: "Country food guides" },
          { href: "/meals", label: "Meals by time of day" },
        ],
      },
    ],
  },
  "/contact": {
    h1: "Contact LadhaQuest",
    intro:
      "Questions about a recipe, a cultural detail, a partnership, or a bug on the site? Reach the LadhaQuest team and we will point you to the right cook, country guide, or product feature. We read every serious message about African food accuracy and platform improvements.",
    sections: [
      {
        heading: "How we can help",
        paragraphs: [
          "Write to us about recipe corrections, missing island or mainland dishes, media features, ingredient partnerships, or account issues. Most replies arrive within one to two business days. For cooking help, you can also browse the recipe index, atlas clusters, and country pages while you wait.",
          "Email hello@ladhaquest.com for general inquiries. Include the dish name, country, and URL when reporting a content problem so we can verify sources quickly.",
          "If you are a creator or culinary educator, tell us how you want to collaborate — guest guides, country coverage, or community cook-alongs are welcome when they deepen authentic African food storytelling. Press and partnership notes can use the same inbox with a clear subject line so we route them quickly.",
        ],
        links: [
          { href: "/about", label: "About LadhaQuest" },
          { href: "/atlas", label: "Food atlas" },
          { href: "/recipe-index", label: "Recipe index" },
        ],
      },
    ],
  },
  "/continents": {
    h1: "African Regional Cuisines — West, East, North, Central & Southern",
    intro:
      "Africa is not one flavor. LadhaQuest organizes cooking by region so you can explore West African pepper stews and rice dishes, East African teff breads and coconut coasts, North African tagines and breads, Central African greens and forest flavors, and Southern African braai, pap, and Cape Malay curries.",
    sections: [
      {
        heading: "Explore by region",
        paragraphs: [
          "Start with a region map, then open a country hub for pantry notes, meal structure, and authentic recipes. Island cuisines — Cape Verde, Madagascar, Mauritius, Seychelles, Comoros, and São Tomé — sit alongside mainland kitchens so the full African food map stays visible.",
          "Use regional browsing when you want inspiration by climate and trade routes: Atlantic jollof belts, Swahili spice coasts, Sahara edges, and Indian Ocean Creole tables.",
          "Each region page links into recipes and country guides so you can move from a broad map to a specific pot of stew, bread, or grilled fish without losing cultural context.",
        ],
        links: [
          { href: "/countries", label: "All African countries" },
          { href: "/cuisine-map", label: "Interactive cuisine map" },
          { href: "/atlas", label: "Landmark dishes atlas" },
        ],
      },
    ],
  },
  "/countries": {
    h1: "African Recipes by Country & Island",
    intro:
      "Browse authentic African recipes by country and island. Each food guide highlights local staples, how meals are structured through the day, festive dishes, and a growing list of step-by-step recipes with cultural context.",
    sections: [
      {
        heading: "Mainland and island kitchens",
        paragraphs: [
          "Open Nigeria for jollof and egusi, Ethiopia for injera and wot, Kenya for ugali and mahamri, Morocco for tagines, or South Africa for braai classics. Island hubs cover Cape Verdean cachupa, Malagasy snacks, Mauritian Creole curries, Seychellois grilled fish, Comorian coconut cooking, and Santomean breadfruit dishes.",
          "Country pages are built for discovery and SEO clarity: one canonical hub per place, Africa-first coverage, and links into full recipes rather than thin duplicate URLs.",
          "Use this index when you know the cuisine you want — Ghanaian banku, Senegalese yassa, Egyptian koshari, or Tanzanian pilau — and need a stable place to start before opening individual recipes.",
        ],
        links: [
          { href: "/country/nigeria", label: "Nigeria" },
          { href: "/country/ethiopia", label: "Ethiopia" },
          { href: "/country/cape-verde", label: "Cape Verde" },
          { href: "/country/madagascar", label: "Madagascar" },
          { href: "/continents", label: "Browse by region" },
        ],
      },
    ],
  },
  "/cuisine-map": {
    h1: "Cuisine Map of Africa",
    intro:
      "The LadhaQuest cuisine map lets you explore African dishes by region and country pin. Select a region, open a country, and read native names, cultural notes, and links to full cooking recipes without leaving the map experience.",
    sections: [
      {
        heading: "How to use the map",
        paragraphs: [
          "Dashed pins mark countries still growing their catalog. Solid pins open dish lists with encyclopedia and recipe links. Use the map when you want geographic discovery — for example comparing cassava-leaf stews across Central and Southern Africa, or hopping between Indian Ocean islands and the Swahili coast.",
          "After you pick a dish, continue to the recipe page for ingredients and method, or the country guide for pantry and festive context.",
          "The map complements the ranked food atlas: use the map for place-based browsing and the atlas for landmark dish clusters that win searches across related recipes. Zoom into West Africa for rice and pepper stews, North Africa for couscous and tagines, or the islands for Creole coconut cooking and grilled fish.",
        ],
        links: [
          { href: "/atlas", label: "Ranked food atlas" },
          { href: "/countries", label: "Country guides" },
          { href: "/recipes", label: "Latest African recipes" },
        ],
      },
    ],
  },
  "/ingredients": {
    h1: "African Cooking Ingredients Guide",
    intro:
      "African cooking rests on distinctive staples: grains and swallows, leafy greens, fermented seasonings, chili pastes, coconut, groundnuts, dried fish, and spice blends that travel by region. This guide helps you recognize ingredients, find substitutions, and jump into recipes that use them.",
    sections: [
      {
        heading: "Shop smarter for African recipes",
        paragraphs: [
          "Learn which items are essential versus flexible. Palm oil, iru, berbere, teff, plantain, cassava leaves, and smoked fish appear often — and LadhaQuest recipes call out local names plus market-friendly swaps when you cannot find the original.",
          "Browse ingredient categories, then open matching African recipes for breakfast, lunch, dinner, or drinks. Pair this page with pantry tools to see what you can cook from what you already have.",
          "When a recipe calls for a specialty item, check this guide first for the local name, a close substitute, and links to dishes that showcase the ingredient at its best.",
        ],
        links: [
          { href: "/recipes", label: "Recipes using these ingredients" },
          { href: "/meals", label: "Meals by time of day" },
          { href: "/blog", label: "Ingredient deep-dives on the blog" },
        ],
      },
    ],
  },
  "/install": {
    h1: "Install LadhaQuest for Offline African Recipes",
    intro:
      "Install LadhaQuest as an app on your phone or desktop to cook with fewer tabs and better offline access. Save recipes, open cook mode, and keep African meal plans handy even when your connection is slow or unavailable.",
    sections: [
      {
        heading: "Why install the app",
        paragraphs: [
          "Mobile-first kitchens need large tap targets, fast recipe loads, and a cook mode that stays on screen while you stir. The installable LadhaQuest experience keeps your recipe box, pantry shortcuts, and offline packs close — useful for diaspora cooks and travelers alike.",
          "Follow the on-screen install prompt for your browser, or use the instructions on this page for iOS and Android. After install, browse African recipes by country, atlas clusters, or meal type just like on the website.",
          "Offline packs help when you are cooking in low-connectivity homes, traveling between cities, or shopping without burning mobile data. Pair install with the meals and ingredients guides so planning and cooking stay in one place.",
        ],
        links: [
          { href: "/recipes", label: "Browse recipes" },
          { href: "/offline-recipes", label: "Offline recipe packs" },
          { href: "/about", label: "About the platform" },
        ],
      },
    ],
  },
  "/meals": {
    h1: "African Breakfast, Lunch, Dinner & Drinks",
    intro:
      "Plan African meals by time of day. Find breakfast breads and porridges, lunch stews and rice dishes, dinner staples, drinks like bissap and karkade, and snacks from mainland and island kitchens.",
    sections: [
      {
        heading: "Build a day of African cooking",
        paragraphs: [
          "Filter by meal type and ingredients to match your schedule. Morning options may include mahamri, mandazi, ful, or pap. Midday and evening plates range from banku and tilapia to injera platters, cachupa, and groundnut stews. Drinks and festive dishes fill out celebrations and weekends.",
          "Every card links to a full recipe with steps, servings, and cultural notes so meal planning stays practical on mobile. Combine meal filters with country or ingredient picks when you want a themed week — for example Kenyan breakfasts, Nigerian dinners, or Moroccan drinks.",
          "Come back to Meals when you need inspiration by schedule rather than by country — it is the fastest way to fill a day of African cooking without scrolling the entire recipe index.",
        ],
        links: [
          { href: "/recipe-index", label: "Search all recipes" },
          { href: "/ingredients", label: "Ingredient guide" },
          { href: "/countries", label: "Plan by country" },
        ],
      },
    ],
  },
};

/**
 * @param {string} path
 * @returns {HubContent | null}
 */
export function getHubSeoContent(path) {
  const key = path === "" || path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return HUB_SEO_CONTENT[key] || null;
}
