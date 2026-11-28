/**
 * African Food Atlas hub SEO — shared by DishAtlas.tsx and prerender-seo.mjs.
 * Winner clusters mirror GSC converters (bonbon coco, mahamri, katapa).
 */

export const ATLAS_SEO = {
  title: "African Food Atlas | Landmark Dishes to Cook",
  description:
    "Explore Africa’s landmark dishes: cassava-leaf stews, East African street breads, Malagasy snacks, and ranked lists of top dishes, stews, and foods to try.",
  h1: "African Food Atlas",
  keywords:
    "african food atlas, top african dishes, katapa, mahamri, bonbon coco, african stews, foods to try in africa",
};

/** @type {{ q: string, a: string }[]} */
export const ATLAS_FAQS = [
  {
    q: "What is the African Food Atlas?",
    a: "LadhaQuest’s Food Atlas is a ranked guide to landmark African dishes — top dishes, best stews, and a 100-foods bucket list — plus curated clusters of recipes that already attract cooks from search.",
  },
  {
    q: "Which African dishes should I cook first?",
    a: "Start with proven favorites on LadhaQuest: Zambian katapa (cassava leaves), Kenyan mahamri (sweet fried bread), and Malagasy bonbon coco. Then explore related dishes in each cluster.",
  },
  {
    q: "How are atlas rankings calculated?",
    a: "Lists blend reader ratings with authenticity depth: cultural documentation, verified country attribution, and dish photography — so iconic recipes surface even before many reviews exist.",
  },
  {
    q: "Where can I browse by country or map?",
    a: "Use the cuisine map for regional discovery, the countries index for cuisine hubs, or open any dish’s full recipe for ingredients and step-by-step method.",
  },
];

/**
 * @typedef {{ slug: string, label: string }} ClusterLink
 * @typedef {{
 *   id: string,
 *   title: string,
 *   blurb: string,
 *   winner: ClusterLink,
 *   satellites: ClusterLink[],
 *   hubs: ClusterLink[],
 * }} WinnerCluster
 */

/** @type {WinnerCluster[]} */
export const ATLAS_WINNER_CLUSTERS = [
  {
    id: "cassava-greens",
    title: "Cassava leaves & greens",
    blurb:
      "Central and Southern African greens: pounded cassava leaves, wild greens, and feuille de manioc stews.",
    winner: { slug: "katapa-zambia", label: "Katapa (Zambia)" },
    satellites: [
      { slug: "lumanda-zambia", label: "Lumanda greens" },
      { slug: "chiponde-malawi", label: "Chiponde (Malawi)" },
      { slug: "feuilles-de-manioc-gabon-gabon", label: "Feuilles de manioc" },
      { slug: "sauce-feuille-guinée-guinea", label: "Sauce feuille" },
    ],
    hubs: [
      { slug: "/country/zambia", label: "Zambia" },
      { slug: "/country/malawi", label: "Malawi" },
    ],
  },
  {
    id: "east-african-street",
    title: "East African street & tea-time",
    blurb:
      "Coastal breads and snacks: mahamri with tea, Zanzibar mix soup, and related Swahili favorites.",
    winner: { slug: "mahamri-kenya", label: "Mahamri (Kenya)" },
    satellites: [
      { slug: "urojo-tanzania", label: "Urojo (Zanzibar mix)" },
      { slug: "ugali-kenya", label: "Ugali" },
      { slug: "morsik-kenya", label: "Mursik" },
    ],
    hubs: [
      { slug: "/country/kenya", label: "Kenya" },
      { slug: "/country/tanzania", label: "Tanzania" },
      { slug: "/cuisine-map", label: "Cuisine map" },
    ],
  },
  {
    id: "malagasy-snacks",
    title: "Malagasy sweets & fritters",
    blurb:
      "Island snacks from Madagascar: coconut bonbons, greens fritters, and related Malagasy bites.",
    winner: { slug: "bonbon-coco-madagascar", label: "Bonbon coco" },
    satellites: [
      { slug: "mofo-anana-madagascar", label: "Mofo anana" },
      { slug: "koba-akondro-madagascar", label: "Koba akondro" },
    ],
    hubs: [
      { slug: "/country/madagascar", label: "Madagascar" },
      { slug: "/meals", label: "Meals by time of day" },
    ],
  },
  {
    id: "lusophone-islands",
    title: "Cape Verde & São Tomé",
    blurb:
      "Lusophone Atlantic islands: cachupa, djagacida, roasted breadfruit and Santomean cabidela.",
    winner: { slug: "cachupa", label: "Cachupa (Cape Verde)" },
    satellites: [
      { slug: "djagacida-cape-verde", label: "Djagacida" },
      { slug: "fruta-pão-assada-sao-tome-and-principe", label: "Fruta pão assada" },
      {
        slug: "frango-à-cabidela-santomense-sao-tome-and-principe",
        label: "Frango à cabidela",
      },
      { slug: "jollof-rice-liberian", label: "Liberian jollof" },
    ],
    hubs: [
      { slug: "/country/cape-verde", label: "Cape Verde" },
      { slug: "/country/sao-tome-and-principe", label: "São Tomé" },
      { slug: "/country/liberia", label: "Liberia" },
    ],
  },
  {
    id: "indian-ocean-creole",
    title: "Indian Ocean Creole islands",
    blurb:
      "Mauritius, Seychelles and Comoros: Creole fish, coconut curries, and spice-coast snacks.",
    winner: { slug: "bourgeois-grillé-seychelles", label: "Bourgeois grillé" },
    satellites: [
      { slug: "vindaye-poisson-mauritius", label: "Vindaye poisson" },
      { slug: "gateau-patate-mauritius", label: "Gateau patate" },
      { slug: "achard-légumes-mauricien-mauritius", label: "Achard légumes" },
      { slug: "pweza-wa-nazi-comoros", label: "Pweza wa nazi" },
    ],
    hubs: [
      { slug: "/country/mauritius", label: "Mauritius" },
      { slug: "/country/seychelles", label: "Seychelles" },
      { slug: "/country/comoros", label: "Comoros" },
    ],
  },
  {
    id: "zanzibar-coast",
    title: "Zanzibar & Swahili coast",
    blurb:
      "Spice-island street food under Tanzania: urojo, coastal breads, and coconut seafood.",
    winner: { slug: "urojo-tanzania", label: "Urojo (Zanzibar mix)" },
    satellites: [
      { slug: "mahamri-kenya", label: "Mahamri" },
      { slug: "ugali-kenya", label: "Ugali" },
      { slug: "morsik-kenya", label: "Mursik" },
    ],
    hubs: [
      { slug: "/country/tanzania", label: "Tanzania" },
      { slug: "/country/kenya", label: "Kenya" },
      { slug: "/cuisine-map", label: "Cuisine map" },
    ],
  },
];
