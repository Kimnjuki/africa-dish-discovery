import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { ComponentType } from "react";
import {
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplets,
  TrendingUp,
  TrendingDown,
  Target
} from "lucide-react";

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface NutritionTrackerProps {
  dailyNutrition: NutritionData;
  weeklyAverage: NutritionData;
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export const NutritionTracker = ({ 
  dailyNutrition, 
  weeklyAverage, 
  targets 
}: NutritionTrackerProps) => {
  const getPercentage = (value: number, target: number) => 
    Math.min(Math.round((value / target) * 100), 150);

  const getStatusColor = (percentage: number) => {
    if (percentage < 70) return "text-amber-500";
    if (percentage > 120) return "text-red-500";
    return "text-green-500";
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage < 90) return <TrendingDown className="w-4 h-4" />;
    if (percentage > 110) return <TrendingUp className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  const NutrientCard = ({ 
    label, 
    value, 
    target, 
    unit,
    icon: Icon, 
    color,
    bgColor
  }: {
    label: string;
    value: number;
    target: number;
    unit: string;
    icon: ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
  }) => {
    const percentage = getPercentage(value, target);
    const statusColor = getStatusColor(percentage);

    return (
      <div className={`p-4 rounded-xl ${bgColor}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-background/80`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <span className="font-medium">{label}</span>
          </div>
          <div className={`flex items-center gap-1 ${statusColor}`}>
            {getStatusIcon(percentage)}
            <span className="text-sm font-medium">{percentage}%</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress 
            value={Math.min(percentage, 100)} 
            className="h-2"
          />
          <div className="flex justify-between text-sm">
            <span className="font-semibold">{value} {unit}</span>
            <span className="text-muted-foreground">/ {target} {unit}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Nutrition Tracker</span>
          <Badge variant="outline">Today</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NutrientCard
            label="Calories"
            value={dailyNutrition.calories}
            target={targets.calories}
            unit="kcal"
            icon={Flame}
            color="text-orange-500"
            bgColor="bg-orange-500/10"
          />
          <NutrientCard
            label="Protein"
            value={dailyNutrition.protein}
            target={targets.protein}
            unit="g"
            icon={Dumbbell}
            color="text-red-500"
            bgColor="bg-red-500/10"
          />
          <NutrientCard
            label="Carbohydrates"
            value={dailyNutrition.carbs}
            target={targets.carbs}
            unit="g"
            icon={Wheat}
            color="text-amber-500"
            bgColor="bg-amber-500/10"
          />
          <NutrientCard
            label="Fats"
            value={dailyNutrition.fats}
            target={targets.fats}
            unit="g"
            icon={Droplets}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
        </div>

        {/* Weekly Average Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Weekly Average
          </h4>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-500">
                {weeklyAverage.calories}
              </div>
              <div className="text-xs text-muted-foreground">kcal</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">
                {weeklyAverage.protein}g
              </div>
              <div className="text-xs text-muted-foreground">protein</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-500">
                {weeklyAverage.carbs}g
              </div>
              <div className="text-xs text-muted-foreground">carbs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {weeklyAverage.fats}g
              </div>
              <div className="text-xs text-muted-foreground">fats</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
