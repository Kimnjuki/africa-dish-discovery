import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Clock3, Refrigerator, Snowflake } from "lucide-react";
import { EquipmentRecommendations } from "@/components/EquipmentRecommendations";
import type { StepValue } from "@/types/content";

interface RecipeNotesProps {
  recipe: {
    name: string;
    country?: string | null;
    difficulty?: string;
    prep_time?: number;
    cook_time?: number;
    tags?: string[];
    tips?: string[] | string | null;
    make_ahead?: string | null;
    storage?: string | null;
    freezer_notes?: string | null;
    steps?: StepValue[] | null;
  };
}

const DIFFICULTY_TIPS: Record<string, string[]> = {
  Easy: [
    "Measure and lay out every ingredient before you turn on the heat.",
    "Taste as you go and adjust salt at the end, not the start.",
  ],
  Medium: [
    "Read all steps once through before starting, so nothing catches you out.",
    "Prep aromatics first — most African stews build flavour on a slow-cooked base.",
    "Keep a timer running for anything simmering unattended.",
  ],
  Hard: [
    "Full mise en place is essential: every component measured and within reach.",
    "Work in stages and rest components as directed rather than rushing the finish.",
    "If a technique is new to you, watch it once before your first attempt.",
  ],
};

function asList(value?: string[] | string | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(/\n|(?<=\.)\s{1,}(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Tips · Make-Ahead · Storage · Freezer · Equipment blocks — the depth
 * signals readers expect from a best-in-class recipe page.
 */
export const RecipeNotes = ({ recipe }: RecipeNotesProps) => {
  const tips = asList(recipe.tips);
  const fallbackTips = DIFFICULTY_TIPS[recipe.difficulty || ""] || DIFFICULTY_TIPS.Medium;
  const shownTips = tips.length > 0 ? tips : fallbackTips;

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const isStewy = (recipe.tags || []).some((t) =>
    /stew|soup|sauce|braise|curry|bean/i.test(t || "")
  );

  const makeAhead =
    recipe.make_ahead ||
    (isStewy
      ? `The base of ${recipe.name} can be cooked a day ahead — flavours deepen overnight. Reheat gently and finish any fresh garnishes just before serving.`
      : `Prep components up to 24 hours ahead and keep them covered in the fridge, then cook fresh — total active time is about ${totalTime} minutes.`);

  const storage =
    recipe.storage ||
    `Cool to room temperature within two hours, then refrigerate in an airtight container for 3–4 days. Reheat over low heat with a splash of water or stock to loosen.`;

  const freezer =
    recipe.freezer_notes ||
    (isStewy
      ? `Freezes very well for up to 3 months. Portion before freezing, thaw overnight in the fridge, and reheat slowly on the stovetop.`
      : `Freeze for up to 2 months in a sealed container. Texture is best when thawed in the fridge and reheated gently rather than in a microwave.`);

  return (
    <div id="recipe-notes" className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-primary" />
            Tips &amp; Tricks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {shownTips.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock3 className="w-4 h-4 text-primary" />
              Make Ahead
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{makeAhead}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Refrigerator className="w-4 h-4 text-primary" />
              Storage &amp; Reheating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{storage}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Snowflake className="w-4 h-4 text-primary" />
              Freezer Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{freezer}</p>
          </CardContent>
        </Card>
      </div>

      <EquipmentRecommendations recipeName={recipe.name} />
    </div>
  );
};

export default RecipeNotes;
