import { useEffect } from "react";
import type { IngredientValue, StepValue } from "@/types/content";

export interface RecipeSchemaRating {
  average: number;
  count: number;
}

export interface RecipeSchemaNutrition {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
}

interface RecipeSchemaProps {
  recipe: {
    name: string;
    image_url?: string | null;
    summary?: string | null;
    brief_description?: string | null;
    country?: string | null;
    cuisine_type?: string | null;
    category?: string | null;
    prep_time?: number | null;
    cook_time?: number | null;
    servings?: number | null;
    difficulty?: string | null;
    ingredients?: IngredientValue[] | null;
    steps?: StepValue[] | null;
    tags?: string[] | null;
    dietary_tags?: string[] | null;
    occasion_tags?: string[] | null;
    local_names?: string[] | null;
    ethnic_group?: string | null;
    created_at?: string | null;
    slug?: string | null;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fats?: number | null;
  };
  /** Only pass when real reviews exist — never invent ratings for SEO. */
  rating?: RecipeSchemaRating | null;
  siteOrigin?: string;
}

function toIsoDuration(minutes?: number | null): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  return `PT${Math.round(minutes)}M`;
}

function ingredientText(ing: IngredientValue): string {
  if (typeof ing === "string") return ing;
  const qty = ing.quantity ?? ing.amount;
  const unit = ing.unit ? ` ${ing.unit}` : "";
  const name = ing.name || ing.ingredient || ing.item || "";
  if (qty != null && name) return `${qty}${unit} ${name}`.trim();
  return name || String(ing);
}

function stepText(step: StepValue): string {
  if (typeof step === "string") return step;
  return String(step.instruction || step.text || step.description || step.name || "");
}

function buildKeywords(recipe: RecipeSchemaProps["recipe"]): string {
  const parts = [
    ...(recipe.tags || []),
    ...(recipe.dietary_tags || []),
    ...(recipe.occasion_tags || []),
    ...(recipe.local_names || []),
    recipe.ethnic_group || "",
    recipe.country ? `${recipe.country} cuisine` : "",
    "african recipes",
    recipe.name,
  ].filter(Boolean);
  const unique = [...new Set(parts.map((p) => String(p).trim().toLowerCase()).filter(Boolean))];
  return unique.slice(0, 24).join(", ");
}

function buildNutrition(recipe: RecipeSchemaProps["recipe"]) {
  if (
    recipe.calories == null &&
    recipe.protein == null &&
    recipe.carbs == null &&
    recipe.fats == null
  ) {
    return undefined;
  }
  return {
    "@type": "NutritionInformation",
    ...(recipe.calories != null ? { calories: `${recipe.calories} calories` } : {}),
    ...(recipe.protein != null ? { proteinContent: `${recipe.protein} g` } : {}),
    ...(recipe.carbs != null ? { carbohydrateContent: `${recipe.carbs} g` } : {}),
    ...(recipe.fats != null ? { fatContent: `${recipe.fats} g` } : {}),
  };
}

function suitableForDiet(tags?: string[] | null): string[] | undefined {
  if (!tags?.length) return undefined;
  const map: Record<string, string> = {
    vegan: "https://schema.org/VeganDiet",
    vegetarian: "https://schema.org/VegetarianDiet",
    "gluten-free": "https://schema.org/GlutenFreeDiet",
    "gluten free": "https://schema.org/GlutenFreeDiet",
    keto: "https://schema.org/KetogenicDiet",
    "low-carb": "https://schema.org/LowCalorieDiet",
    halal: "https://schema.org/HalalDiet",
  };
  const urls = tags
    .map((t) => map[t.toLowerCase().trim()])
    .filter((u): u is string => Boolean(u));
  return urls.length ? [...new Set(urls)] : undefined;
}

/** Injects schema.org/Recipe JSON-LD into document head for the current recipe. */
export const RecipeSchema = ({
  recipe,
  rating = null,
  siteOrigin = "https://www.ladhaquest.com",
}: RecipeSchemaProps) => {
  useEffect(() => {
    const slug = recipe.slug || "";
    const prep = recipe.prep_time ?? undefined;
    const cook = recipe.cook_time ?? undefined;
    const total =
      prep != null || cook != null ? (prep || 0) + (cook || 0) : undefined;

    const images = recipe.image_url
      ? [recipe.image_url]
      : [`${siteOrigin}/placeholder.svg`];

    const schema: Record<string, unknown> = {
      "@context": "https://schema.org/",
      "@type": "Recipe",
      name: recipe.name,
      image: images,
      author: {
        "@type": "Organization",
        name: "LadhaQuest",
        url: siteOrigin,
      },
      publisher: {
        "@type": "Organization",
        name: "LadhaQuest",
        url: siteOrigin,
      },
      datePublished: recipe.created_at || undefined,
      description:
        recipe.summary ||
        recipe.brief_description ||
        `Authentic ${recipe.country || "African"} recipe for ${recipe.name}`,
      recipeCuisine: recipe.cuisine_type || recipe.country || "African",
      recipeCategory: recipe.category || "Main Course",
      keywords: buildKeywords(recipe),
      recipeYield: `${recipe.servings || 4} servings`,
      prepTime: toIsoDuration(prep),
      cookTime: toIsoDuration(cook),
      totalTime: toIsoDuration(total),
      recipeIngredient: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.map(ingredientText).filter(Boolean)
        : [],
      recipeInstructions: Array.isArray(recipe.steps)
        ? recipe.steps.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: `Step ${index + 1}`,
            text: stepText(step),
            url: slug ? `${siteOrigin}/recipe/${slug}#step${index + 1}` : undefined,
          }))
        : [],
      nutrition: buildNutrition(recipe),
      suitableForDiet: suitableForDiet(recipe.dietary_tags),
      isAccessibleForFree: true,
      mainEntityOfPage: slug ? `${siteOrigin}/recipe/${slug}` : undefined,
    };

    if (rating && rating.count > 0 && rating.average > 0) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: Number(rating.average.toFixed(2)),
        reviewCount: rating.count,
        bestRating: 5,
        worstRating: 1,
      };
    }

    // Drop undefined keys so JSON-LD stays clean for crawlers
    const cleaned = JSON.parse(
      JSON.stringify(schema, (_k, v) => (v === undefined || v === null || v === "" ? undefined : v))
    );

    const scriptId = `recipe-schema-${slug || recipe.name}`;
    const scriptTag = document.createElement("script");
    scriptTag.type = "application/ld+json";
    scriptTag.text = JSON.stringify(cleaned);
    scriptTag.id = scriptId;

    document.getElementById(scriptId)?.remove();
    document.head.appendChild(scriptTag);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [recipe, rating, siteOrigin]);

  return null;
};
