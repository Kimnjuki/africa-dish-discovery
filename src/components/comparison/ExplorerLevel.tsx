import { useState, useEffect } from "react";
import { Trophy, Star, Compass, BookOpen, Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ExplorerLevelProps {
  comparisonsCount: number;
  recipesViewed: number;
  regionsExplored: number;
}

const LEVELS = [
  { 
    name: "Novice", 
    icon: Compass, 
    minPoints: 0, 
    maxPoints: 100,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20"
  },
  { 
    name: "Foodie", 
    icon: Star, 
    minPoints: 100, 
    maxPoints: 300,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  { 
    name: "Diplomat", 
    icon: BookOpen, 
    minPoints: 300, 
    maxPoints: 600,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  { 
    name: "Culinary Historian", 
    icon: Crown, 
    minPoints: 600, 
    maxPoints: 1000,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20"
  },
];

export const ExplorerLevel = ({ 
  comparisonsCount, 
  recipesViewed, 
  regionsExplored 
}: ExplorerLevelProps) => {
  const [animatedPoints, setAnimatedPoints] = useState(0);
  
  const totalPoints = (comparisonsCount * 10) + (recipesViewed * 5) + (regionsExplored * 25);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPoints(totalPoints);
    }, 300);
    return () => clearTimeout(timer);
  }, [totalPoints]);

  const getCurrentLevel = () => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalPoints >= LEVELS[i].minPoints) {
        return { level: LEVELS[i], index: i };
      }
    }
    return { level: LEVELS[0], index: 0 };
  };

  const { level: currentLevel, index: levelIndex } = getCurrentLevel();
  const nextLevel = LEVELS[levelIndex + 1];
  
  const progressInLevel = nextLevel 
    ? ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  const LevelIcon = currentLevel.icon;

  return (
    <div className={`p-4 rounded-xl ${currentLevel.bgColor} border ${currentLevel.borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${currentLevel.bgColor}`}>
            <LevelIcon className={`h-6 w-6 ${currentLevel.color}`} />
          </div>
          <div>
            <h3 className={`font-bold text-lg ${currentLevel.color}`}>
              {currentLevel.name}
            </h3>
            <p className="text-xs text-muted-foreground">Explorer Level</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Trophy className={`h-4 w-4 ${currentLevel.color}`} />
            <span className="font-bold">{animatedPoints}</span>
          </div>
          <span className="text-xs text-muted-foreground">Total XP</span>
        </div>
      </div>

      {nextLevel && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to {nextLevel.name}</span>
            <span className="font-medium">{Math.round(progressInLevel)}%</span>
          </div>
          <Progress value={progressInLevel} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {nextLevel.minPoints - totalPoints} XP to next level
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-background/50">
          <div className="font-bold text-lg">{comparisonsCount}</div>
          <div className="text-[10px] text-muted-foreground">Comparisons</div>
        </div>
        <div className="p-2 rounded-lg bg-background/50">
          <div className="font-bold text-lg">{recipesViewed}</div>
          <div className="text-[10px] text-muted-foreground">Recipes</div>
        </div>
        <div className="p-2 rounded-lg bg-background/50">
          <div className="font-bold text-lg">{regionsExplored}</div>
          <div className="text-[10px] text-muted-foreground">Regions</div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {LEVELS.map((lvl, idx) => {
          const Icon = lvl.icon;
          const isActive = idx === levelIndex;
          const isCompleted = idx < levelIndex;
          
          return (
            <Badge 
              key={lvl.name}
              variant={isActive ? "default" : "outline"}
              className={`flex items-center gap-1 whitespace-nowrap ${
                isCompleted ? lvl.bgColor + ' ' + lvl.color : ''
              } ${isActive ? '' : 'opacity-60'}`}
            >
              <Icon className="h-3 w-3" />
              {lvl.name}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
