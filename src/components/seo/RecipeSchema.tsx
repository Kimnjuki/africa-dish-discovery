import { useEffect } from 'react';
import type { IngredientValue, StepValue } from "@/types/content";

interface RecipeSchemaProps {
  recipe: {
    name: string;
    image_url?: string;
    summary?: string;
    country?: string;
    prep_time?: number;
    cook_time?: number;
    servings?: number;
    difficulty?: string;
    ingredients?: IngredientValue[] | null;
    steps?: StepValue[] | null;
    tags?: string[];
    created_at?: string;
    slug?: string;
  };
}

export const RecipeSchema = ({ recipe }: RecipeSchemaProps) => {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Recipe",
      "name": recipe.name,
      "image": recipe.image_url ? [
        recipe.image_url,
        recipe.image_url,
        recipe.image_url
      ] : ["https://www.ladhaquest.com/placeholder.svg"],
      "author": {
        "@type": "Organization",
        "name": "LadhaQuest"
      },
      "datePublished": recipe.created_at || new Date().toISOString(),
      "description": recipe.summary || `Authentic ${recipe.country} recipe for ${recipe.name}`,
      "recipeCuisine": recipe.country || "African",
      "prepTime": recipe.prep_time ? `PT${recipe.prep_time}M` : "PT30M",
      "cookTime": recipe.cook_time ? `PT${recipe.cook_time}M` : "PT45M",
      "totalTime": `PT${(recipe.prep_time || 30) + (recipe.cook_time || 45)}M`,
      "recipeYield": `${recipe.servings || 4} servings`,
      "recipeCategory": "Main Course",
      "keywords": recipe.tags?.join(', ') || `${recipe.name}, ${recipe.country} cuisine, african recipes`,
      "recipeIngredient": Array.isArray(recipe.ingredients) 
        ? recipe.ingredients.map(ing => typeof ing === 'string' ? ing : ing.name || ing.ingredient)
        : [],
      "recipeInstructions": Array.isArray(recipe.steps)
        ? recipe.steps.map((step, index) => ({
            "@type": "HowToStep",
            "name": `Step ${index + 1}`,
            "text": typeof step === 'string' ? step : step.instruction || step.text || step,
            "url": `https://www.ladhaquest.com/recipe/${recipe.slug}#step${index + 1}`
          }))
        : [],
      "isAccessibleForFree": true
    };

    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.text = JSON.stringify(schema);
    scriptTag.id = `recipe-schema-${recipe.slug}`;
    
    const existingScript = document.getElementById(`recipe-schema-${recipe.slug}`);
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(scriptTag);

    return () => {
      const script = document.getElementById(`recipe-schema-${recipe.slug}`);
      if (script) {
        script.remove();
      }
    };
  }, [recipe]);

  return null;
};
