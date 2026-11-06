import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { IngredientValue, StepValue } from "@/types/content";

interface PrintRecipeButtonProps {
  recipe: {
    name: string;
    country?: string | null;
    summary?: string;
    prep_time?: number;
    cook_time?: number;
    servings?: number;
    difficulty?: string;
    ingredients?: IngredientValue[] | null;
    steps?: StepValue[] | null;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  servingMultiplier?: number;
}

export const PrintRecipeButton = ({ recipe, servingMultiplier = 1 }: PrintRecipeButtonProps) => {
  const handlePrint = () => {
    const ingredients = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map((ing: IngredientValue) => {
          if (typeof ing === 'string') return ing;
          if (typeof ing === 'object') {
            const amt = ing.amount ? `${parseFloat(String(ing.amount)) * servingMultiplier}` : '';
            return `${amt} ${ing.unit || ''} ${ing.name || ''}`.trim();
          }
          return String(ing);
        })
      : [];

    const steps = Array.isArray(recipe.steps)
      ? recipe.steps.map((s: StepValue) =>
          typeof s === 'string' ? s : s.instruction || s.description || s.step || String(s)
        )
      : [];

    const adjServings = (recipe.servings || 4) * servingMultiplier;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>${recipe.name} - LadhaQuest</title>
      <style>
        body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #333; }
        h1 { font-size: 28px; margin-bottom: 4px; }
        .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
        .meta span { margin-right: 16px; }
        .summary { font-style: italic; color: #555; margin-bottom: 24px; border-left: 3px solid #d97706; padding-left: 12px; }
        h2 { font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-top: 28px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 6px; line-height: 1.5; }
        ol li { margin-bottom: 12px; line-height: 1.6; }
        .nutrition { display: flex; gap: 24px; margin-top: 16px; }
        .nutrition div { text-align: center; }
        .nutrition .val { font-size: 20px; font-weight: bold; color: #d97706; }
        .nutrition .label { font-size: 12px; color: #888; }
        .footer { margin-top: 32px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
        @media print { body { margin: 20px; } }
      </style></head><body>
      <h1>${recipe.name}</h1>
      <div class="meta">
        <span>📍 ${recipe.country}</span>
        <span>⏱ ${(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
        <span>🍽 ${adjServings} servings</span>
        <span>📊 ${recipe.difficulty || 'Medium'}</span>
      </div>
      ${recipe.summary ? `<p class="summary">${recipe.summary}</p>` : ''}
      ${recipe.calories ? `
        <div class="nutrition">
          <div><div class="val">${recipe.calories}</div><div class="label">Calories</div></div>
          <div><div class="val">${recipe.protein || 0}g</div><div class="label">Protein</div></div>
          <div><div class="val">${recipe.carbs || 0}g</div><div class="label">Carbs</div></div>
          <div><div class="val">${recipe.fats || 0}g</div><div class="label">Fat</div></div>
        </div>
      ` : ''}
      <h2>Ingredients</h2>
      <ul>${ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
      <h2>Instructions</h2>
      <ol>${steps.map(s => `<li>${s}</li>`).join('')}</ol>
      <div class="footer">Printed from LadhaQuest • www.ladhaquest.com</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
      <Printer className="w-4 h-4" />
      Print
    </Button>
  );
};
