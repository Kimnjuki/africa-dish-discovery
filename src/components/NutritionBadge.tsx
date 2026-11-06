import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Flame } from "lucide-react";

interface NutritionBadgeProps {
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  compact?: boolean;
}

export const NutritionBadge = ({ calories, protein, carbs, fats, compact = true }: NutritionBadgeProps) => {
  if (!calories) return null;

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1 text-xs cursor-help">
            <Flame className="w-3 h-3 text-orange-500" />
            {calories} cal
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className="text-center">
              <div className="font-bold text-orange-500">{calories}</div>
              <div className="text-muted-foreground">Cal</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-500">{protein || 0}g</div>
              <div className="text-muted-foreground">Protein</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-500">{carbs || 0}g</div>
              <div className="text-muted-foreground">Carbs</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-yellow-500">{fats || 0}g</div>
              <div className="text-muted-foreground">Fat</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
      <div className="text-center">
        <div className="text-lg font-bold text-orange-500">{calories}</div>
        <div className="text-xs text-muted-foreground">Calories</div>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="text-center">
        <div className="text-lg font-bold text-blue-500">{protein || 0}g</div>
        <div className="text-xs text-muted-foreground">Protein</div>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="text-center">
        <div className="text-lg font-bold text-green-500">{carbs || 0}g</div>
        <div className="text-xs text-muted-foreground">Carbs</div>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="text-center">
        <div className="text-lg font-bold text-yellow-500">{fats || 0}g</div>
        <div className="text-xs text-muted-foreground">Fat</div>
      </div>
    </div>
  );
};
