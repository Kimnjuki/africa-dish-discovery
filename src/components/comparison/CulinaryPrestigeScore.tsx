import { Award, Globe, Star, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PrestigeData {
  globalRank: number;
  tasteAtlasRank?: number;
  heritageStatus: "UNESCO" | "Regional Heritage" | "Emerging" | "None";
  worldEquivalent?: string;
  similarityScore: number;
}

interface CulinaryPrestigeScoreProps {
  dishName: string;
  prestige: PrestigeData;
  prestigeScore: number;
}

export const CulinaryPrestigeScore = ({ 
  dishName, 
  prestige, 
  prestigeScore 
}: CulinaryPrestigeScoreProps) => {
  const getHeritageColor = (status: string) => {
    switch (status) {
      case "UNESCO": return "bg-amber-500/20 text-amber-600 border-amber-500/30";
      case "Regional Heritage": return "bg-emerald-500/20 text-emerald-600 border-emerald-500/30";
      case "Emerging": return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: "S", color: "text-amber-500", label: "World-Class" };
    if (score >= 80) return { grade: "A", color: "text-emerald-500", label: "Exceptional" };
    if (score >= 70) return { grade: "B", color: "text-blue-500", label: "Outstanding" };
    if (score >= 60) return { grade: "C", color: "text-purple-500", label: "Notable" };
    return { grade: "D", color: "text-muted-foreground", label: "Rising" };
  };

  const scoreGrade = getScoreGrade(prestigeScore);

  return (
    <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/5 via-background to-primary/5 border border-amber-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          <h3 className="font-bold text-lg">{dishName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-3xl font-black ${scoreGrade.color}`}>
            {scoreGrade.grade}
          </span>
          <div className="text-right">
            <div className="text-2xl font-bold">{prestigeScore}</div>
            <div className="text-xs text-muted-foreground">{scoreGrade.label}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Culinary Prestige</span>
            <span className="font-medium">{prestigeScore}/100</span>
          </div>
          <Progress value={prestigeScore} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Global Rank</span>
            </div>
            <span className="text-xl font-bold">#{prestige.globalRank}</span>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">TasteAtlas</span>
            </div>
            <span className="text-xl font-bold">
              {prestige.tasteAtlasRank ? `#${prestige.tasteAtlasRank}` : "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Heritage Status</span>
          <Badge className={getHeritageColor(prestige.heritageStatus)}>
            {prestige.heritageStatus}
          </Badge>
        </div>

        {prestige.worldEquivalent && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Global Equivalent</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">{prestige.worldEquivalent}</span>
              <span className="text-sm text-primary">{prestige.similarityScore}% similar</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
