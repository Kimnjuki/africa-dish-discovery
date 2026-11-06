import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NutritionBadge } from "@/components/NutritionBadge";
import { PrintRecipeButton } from "@/components/PrintRecipeButton";
import { Clock, Users, ChefHat, Flame, ListChecks, PlaySquare, Minus, Plus, MonitorPlay } from "lucide-react";
import type { IngredientValue, StepValue } from "@/types/content";

interface RecipeCardPanelProps {
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
  servingMultiplier: number;
  onServingMultiplierChange: (value: number) => void;
  onStartCookMode?: () => void;
  hasVideo?: boolean;
}

/**
 * At-a-glance recipe card: yield, times, difficulty, nutrition, jump links,
 * print and cook mode. Sticks to the top of the viewport on large screens.
 */
export const RecipeCardPanel = ({
  recipe,
  servingMultiplier,
  onServingMultiplierChange,
  onStartCookMode,
  hasVideo,
}: RecipeCardPanelProps) => {
  const prep = recipe.prep_time || 0;
  const cook = recipe.cook_time || 0;
  const total = prep + cook;
  const servings = Math.max(1, Math.round((recipe.servings || 1) * servingMultiplier));

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Card className="border-primary/20 shadow-warm">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="hero" onClick={() => jump("recipe-ingredients")}>
            <ListChecks className="w-4 h-4 mr-2" />
            Jump to Recipe
          </Button>
          {hasVideo && (
            <Button size="sm" variant="outline" onClick={() => jump("recipe-video")}>
              <PlaySquare className="w-4 h-4 mr-2" />
              Jump to Video
            </Button>
          )}
          {onStartCookMode && (
            <Button size="sm" variant="outline" onClick={onStartCookMode}>
              <MonitorPlay className="w-4 h-4 mr-2" />
              Cook Mode
            </Button>
          )}
          <PrintRecipeButton recipe={recipe} servingMultiplier={servingMultiplier} />
        </div>

        <Separator />

        <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
          <div>
            <dt className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Prep
            </dt>
            <dd className="font-semibold">{prep} min</dd>
          </div>
          <div>
            <dt className="text-muted-foreground flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Cook
            </dt>
            <dd className="font-semibold">{cook} min</dd>
          </div>
          <div>
            <dt className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Total
            </dt>
            <dd className="font-semibold">{total} min</dd>
          </div>
          <div>
            <dt className="text-muted-foreground flex items-center gap-1">
              <ChefHat className="w-3.5 h-3.5" /> Difficulty
            </dt>
            <dd className="font-semibold">{recipe.difficulty || "—"}</dd>
          </div>
        </dl>

        <Separator />

        <div>
          <div className="text-muted-foreground text-sm flex items-center gap-1 mb-2">
            <Users className="w-3.5 h-3.5" /> Yield
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="Decrease servings"
              onClick={() => onServingMultiplierChange(Math.max(0.5, servingMultiplier - 0.5))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold tabular-nums">
              {servings} {servings === 1 ? "serving" : "servings"}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Increase servings"
              onClick={() => onServingMultiplierChange(servingMultiplier + 0.5)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {servingMultiplier !== 1 && (
            <p className="text-xs text-muted-foreground mt-2">
              Ingredient amounts scaled ×{servingMultiplier}
            </p>
          )}
        </div>

        {recipe.calories ? (
          <>
            <Separator />
            <div>
              <div className="text-muted-foreground text-sm mb-2">Per serving</div>
              <NutritionBadge
                calories={Math.round(recipe.calories || 0)}
                protein={Math.round((recipe.protein || 0) * 10) / 10}
                carbs={Math.round((recipe.carbs || 0) * 10) / 10}
                fats={Math.round((recipe.fats || 0) * 10) / 10}
              />
            </div>
          </>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="secondary">{recipe.country}</Badge>
          {Array.isArray(recipe.ingredients) && (
            <Badge variant="outline">{recipe.ingredients.length} ingredients</Badge>
          )}
          {Array.isArray(recipe.steps) && (
            <Badge variant="outline">{recipe.steps.length} steps</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCardPanel;
