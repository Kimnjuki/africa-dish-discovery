export interface CountryGuide {
  /** One-paragraph editorial introduction to the cuisine. */
  intro: string;
  /** How meals are typically structured through the day. */
  mealStructure: string[];
  /** Notes on festive / ceremonial eating. */
  festive: string;
  /** Signature flavour notes used in the guide header. */
  flavours: string[];
}

/**
 * Editorial country-guide copy. Countries that are not listed fall back to
 * `buildGenericGuide()` so every hub still renders a full guide.
 */
export const COUNTRY_GUIDES: Record<string, CountryGuide> = {
  Nigeria: {
    intro:
      "Nigerian cooking is built on bold, layered heat: blended scotch bonnet and red bell pepper bases, palm oil, locust bean and smoked fish or crayfish for depth. Regional styles differ sharply — Yoruba kitchens in the south-west lean on stews and steamed bean puddings, Igbo cooking in the south-east on yam, cocoyam thickeners and bitter greens, and northern Hausa food on grains, groundnut and grilled meat.",
    mealStructure: [
      "Breakfast: akara or moi moi with pap (ogi), or bread and tea",
      "Lunch: a swallow (pounded yam, eba, amala) with soup, or jollof and protein",
      "Dinner: rice or yam dishes, lighter soups, roasted plantain",
      "Street food: suya, puff-puff, boli, chin chin",
    ],
    festive:
      "Weddings, naming ceremonies and Christmas call for party jollof cooked over firewood, fried rice, moi moi, small chops and pepper soup. In the north, Eid brings tuwo and miyan taushe; ram is slaughtered and shared with neighbours.",
    flavours: ["scotch bonnet", "palm oil", "locust bean (iru)", "crayfish", "smoked fish"],
  },
  Ethiopia: {
    intro:
      "Ethiopian food centres on injera, a sour teff flatbread that doubles as plate and utensil, topped with wot (stews) seasoned with berbere and nitir kibbeh, the spiced clarified butter. Fasting days in the Orthodox calendar produced one of the world's richest vegan repertoires — lentils, split peas, cabbage, collards and beetroot served side by side.",
    mealStructure: [
      "Breakfast: firfir or chechebsa with tea",
      "Lunch and dinner: a shared injera platter with several wot",
      "Fasting days (Wednesday, Friday, Lent): fully plant-based beyaynetu",
      "Coffee: a three-round jebena ceremony after meals",
    ],
    festive:
      "Meskel, Timkat and Easter (Fasika) are marked with doro wot simmered for hours with hard-boiled eggs, kitfo for honoured guests, and tej, the honey wine, poured from berele flasks.",
    flavours: ["berbere", "nitir kibbeh", "teff", "korerima", "mitmita"],
  },
  Morocco: {
    intro:
      "Moroccan cuisine sits where Amazigh, Andalusian, Arab and Saharan cooking meet: slow tagines balancing salt and sweet, couscous steamed three times, and preserved lemon, saffron and ras el hanout carrying the aroma. Bread (khobz) is the utensil at almost every table.",
    mealStructure: [
      "Breakfast: msemen, baghrir or harcha with amlou, honey and mint tea",
      "Lunch: the main meal — tagine or couscous, always with bread",
      "Friday: couscous with seven vegetables after prayers",
      "Evening: harira soup, salads, grilled skewers",
    ],
    festive:
      "Ramadan evenings open with harira, chebakia and dates. Eid al-Adha brings mechoui and offal tagines; weddings serve pastilla, mrouzia and a whole lamb.",
    flavours: ["ras el hanout", "preserved lemon", "saffron", "argan oil", "cumin"],
  },
  Ghana: {
    intro:
      "Ghanaian cooking is anchored by fermented maize and cassava — kenkey, banku, akple — eaten with intensely peppery soups and shito. Palm nut, groundnut and light tomato soups define the three great soup families, and fufu pounded to order remains the Sunday standard.",
    mealStructure: [
      "Breakfast: koko (millet porridge) with koose, or waakye",
      "Lunch: waakye, jollof, or banku with tilapia",
      "Dinner: fufu or omo tuo with soup",
      "Street food: kelewele, bofrot, roasted plantain with groundnuts",
    ],
    festive:
      "Homowo, Odwira and Christmas centre on kpokpoi, oto (mashed yam with palm oil and eggs) and goat light soup shared across compounds.",
    flavours: ["palm nut", "groundnut", "shito", "dried fish", "kpakpo shito chilli"],
  },
  Kenya: {
    intro:
      "Kenyan food ranges from ugali and sukuma wiki on the highlands to Swahili coastal cooking built on coconut milk, tamarind and pilau spice. Nyama choma — slow-grilled goat with kachumbari — is the national social meal.",
    mealStructure: [
      "Breakfast: uji or chai with mandazi",
      "Lunch: ugali with sukuma wiki, githeri, or pilau at the coast",
      "Dinner: stews with chapati or rice",
      "Weekends: nyama choma with ugali and kachumbari",
    ],
    festive:
      "Christmas and weddings bring pilau, biryani and whole roast goat; coastal Eid tables serve mahamri, mbaazi and viazi karai.",
    flavours: ["coconut milk", "tamarind", "pilau masala", "coriander", "royco-style stews"],
  },
  "South Africa": {
    intro:
      "South African cooking layers Khoisan, Nguni, Cape Malay, Indian and Afrikaner traditions: braai over coals, potjiekos in cast iron, samp and beans, bunny chow in Durban and bobotie with its custard top at the Cape.",
    mealStructure: [
      "Breakfast: mealie pap with milk and sugar, or a full fry-up",
      "Lunch: bunny chow, gatsby, boerewors roll",
      "Dinner: pap and chakalaka with stew, or curry and rice",
      "Weekends: braai as a social event, not just a meal",
    ],
    festive:
      "Heritage Day (National Braai Day), Christmas and weddings feature whole-lamb spit braais, umngqusho, denningvleis and koeksisters or malva pudding to close.",
    flavours: ["braai spice", "Cape Malay curry", "apricot jam", "chakalaka", "rooibos"],
  },
  Egypt: {
    intro:
      "Egyptian food is ancient and grain-first: ful medames simmered overnight, koshari layering rice, lentils and pasta, and molokhia cooked to a green velvet. Baladi bread accompanies nearly everything.",
    mealStructure: [
      "Breakfast: ful medames and taameya with baladi bread",
      "Lunch: the main meal — molokhia, mahshi or koshari",
      "Dinner: lighter mezze, cheese, salads",
      "Street food: hawawshi, kebda, sweet potato in winter",
    ],
    festive:
      "Ramadan iftar begins with dates and qamar al-din; Eid brings fattah with lamb and kahk biscuits. Sham El-Nessim is celebrated with fesikh and spring onions.",
    flavours: ["cumin", "coriander", "garlic and dried mint", "tahina", "dukkah"],
  },
  Senegal: {
    intro:
      "Senegalese cooking gave West Africa its rice canon: thieboudienne, the national dish of broken rice, fish and tamarind-stuffed vegetables, plus yassa's onion-and-lime lift and mafe's groundnut richness.",
    mealStructure: [
      "Breakfast: fondé or bouye porridge, bread with chocolate spread",
      "Lunch: one communal bowl — thieboudienne, yassa or mafe",
      "Dinner: lighter millet dishes such as lakh",
      "Drinks: bissap, bouye and ataya tea in three rounds",
    ],
    festive:
      "Tabaski (Eid al-Adha) means grilled ram and onion yassa; Korité brings lakh, and weddings serve thiakry for dessert.",
    flavours: ["yet and guedj (fermented seafood)", "tamarind", "groundnut", "lime", "nététou"],
  },
};

export const buildGenericGuide = (country: string, region?: string | null): CountryGuide => ({
  intro: `${country}'s kitchens draw on the staples, spice traditions and cooking techniques of ${
    region || "the wider region"
  }. The dishes below are documented with their local names, authentic ingredient lists and the cultural occasions they belong to, so you can cook them the way they are cooked at home.`,
  mealStructure: [
    "Breakfast: grain porridges, breads or fried snacks with tea",
    "Main meal: a starch staple served with a stew, sauce or grilled protein",
    "Evening: lighter soups, leftovers reheated, or street food",
    "Shared eating from a communal dish is common at family meals",
  ],
  festive: `Religious holidays, weddings and harvest celebrations in ${country} call for larger cuts of meat, richer sauces and dishes reserved for guests. Look for the festive tag on the recipes below.`,
  flavours: [],
});

export const getCountryGuide = (country: string, region?: string | null): CountryGuide =>
  COUNTRY_GUIDES[country] || buildGenericGuide(country, region);
