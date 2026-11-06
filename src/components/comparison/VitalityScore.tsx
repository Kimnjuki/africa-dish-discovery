import { Heart, Leaf, Zap, Shield, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface NutritionComparison {
  africanDish: {
    name: string;
    antioxidants: number;
    fiber: number;
    vitamins: number;
    minerals: number;
    processedLevel: number;
  };
  westernCounterpart: {
    name: string;
    antioxidants: number;
    fiber: number;
    vitamins: number;
    minerals: number;
    processedLevel: number;
  };
}

interface VitalityScoreProps {
  comparison: NutritionComparison;
  vitalityScore: number;
  superfoods: string[];
}

export const VitalityScore = ({ comparison, vitalityScore, superfoods }: VitalityScoreProps) => {
  const getTrend = (african: number, western: number) => {
    const diff = african - western;
    if (diff > 10) return { icon: TrendingUp, color: "text-emerald-500", label: `+${diff}%` };
    if (diff < -10) return { icon: TrendingDown, color: "text-red-500", label: `${diff}%` };
    return { icon: Minus, color: "text-muted-foreground", label: "Same" };
  };

  const metrics = [
    { 
      label: "Antioxidants", 
      icon: Shield, 
      african: comparison.africanDish.antioxidants,
      western: comparison.westernCounterpart.antioxidants 
    },
    { 
      label: "Fiber Content", 
      icon: Leaf, 
      african: comparison.africanDish.fiber,
      western: comparison.westernCounterpart.fiber 
    },
    { 
      label: "Vitamins", 
      icon: Zap, 
      african: comparison.africanDish.vitamins,
      western: comparison.westernCounterpart.vitamins 
    },
    { 
      label: "Minerals", 
      icon: Heart, 
      african: comparison.africanDish.minerals,
      western: comparison.westernCounterpart.minerals 
    },
  ];

  const getVitalityGrade = (score: number) => {
    if (score >= 90) return { emoji: "🌟", label: "Superfood" };
    if (score >= 75) return { emoji: "💪", label: "High Vitality" };
    if (score >= 60) return { emoji: "✨", label: "Good" };
    return { emoji: "🌱", label: "Moderate" };
  };

  const grade = getVitalityGrade(vitalityScore);

  return (
    <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-background to-green-500/5 border border-emerald-500/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald-500" />
            Ancestral Health Index
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {comparison.africanDish.name} vs {comparison.westernCounterpart.name}
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl">{grade.emoji}</div>
          <div className="text-2xl font-black text-emerald-500">{vitalityScore}</div>
          <div className="text-xs text-muted-foreground">{grade.label}</div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {metrics.map((metric) => {
          const trend = getTrend(metric.african, metric.western);
          const TrendIcon = trend.icon;
          
          return (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                <div className={`flex items-center gap-1 text-sm ${trend.color}`}>
                  <TrendIcon className="h-3 w-3" />
                  <span>{trend.label}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Progress value={metric.african} className="h-2 bg-muted" />
                  <span className="absolute -top-0.5 right-0 text-xs text-muted-foreground">
                    {metric.african}%
                  </span>
                </div>
                <div className="relative">
                  <Progress value={metric.western} className="h-2 bg-muted [&>div]:bg-orange-400" />
                  <span className="absolute -top-0.5 right-0 text-xs text-muted-foreground">
                    {metric.western}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <span>{comparison.africanDish.name}</span>
                <span>{comparison.westernCounterpart.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {superfoods.length > 0 && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">African Superfoods Present</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {superfoods.map((food, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-600 font-medium"
              >
                {food}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
