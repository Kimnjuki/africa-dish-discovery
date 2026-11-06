import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight, CheckCircle2, Timer } from "lucide-react";
import { stepToText, prepareIngredientLine } from "@/lib/recipeUnits";
import type { IngredientValue, StepValue } from "@/types/content";

interface CookModeProps {
  recipeName: string;
  steps: StepValue[] | null;
  ingredients?: IngredientValue[] | null;
  multiplier?: number;
  startIndex?: number;
  onClose: (lastIndex: number) => void;
}

/**
 * Distraction-free, large-type cooking stepper. Keeps the screen awake via the
 * Screen Wake Lock API where supported, and responds to arrow keys.
 */
export const CookMode = ({
  recipeName,
  steps,
  ingredients,
  multiplier = 1,
  startIndex = 0,
  onClose,
}: CookModeProps) => {
  const list: string[] = Array.isArray(steps) ? steps.map(stepToText).filter(Boolean) : [];
  const [index, setIndex] = useState(Math.min(startIndex, Math.max(0, list.length - 1)));
  const [done, setDone] = useState<number[]>([]);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    let released = false;
    const request = async () => {
      try {
        const nav = navigator;
        if (nav.wakeLock?.request) {
          wakeLock.current = await nav.wakeLock.request("screen");
        }
      } catch {
        /* wake lock unavailable — cook mode still works */
      }
    };
    request();
    return () => {
      released = true;
      try {
        wakeLock.current?.release?.();
      } catch {
        /* noop */
      }
      void released;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, list.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
      if (e.key === "Escape") onClose(index);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, list.length, onClose]);

  const ingredientLines: string[] = Array.isArray(ingredients)
    ? ingredients.map((ing) => prepareIngredientLine(ing, multiplier, "original")).filter(Boolean)
    : [];

  const progress = list.length ? ((index + 1) / list.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center justify-between gap-4 px-6 py-4 border-b">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Cook Mode</p>
          <h2 className="text-lg font-semibold truncate">{recipeName}</h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            Step {index + 1} of {list.length || 1}
          </Badge>
          <Button variant="outline" size="icon" aria-label="Exit cook mode" onClick={() => onClose(index)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <Progress value={progress} className="h-1.5 rounded-none" />

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-6 py-10 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-2xl md:text-3xl leading-relaxed font-medium">
              {list[index] || "No steps available for this recipe yet."}
            </p>
            <Button
              className="mt-8"
              size="lg"
              variant={done.includes(index) ? "default" : "outline"}
              onClick={() =>
                setDone((d) => (d.includes(index) ? d.filter((i) => i !== index) : [...d, index]))
              }
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {done.includes(index) ? "Step done" : "Mark step done"}
            </Button>
          </div>

          {ingredientLines.length > 0 && (
            <aside className="lg:col-span-1">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                <Timer className="w-4 h-4" /> Ingredients
              </h3>
              <ul className="space-y-2 text-base">
                {ingredientLines.map((line, i) => (
                  <li key={i} className="text-muted-foreground">
                    {line}
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>

      <footer className="flex items-center justify-between gap-4 px-6 py-4 border-t">
        <Button
          variant="outline"
          size="lg"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground hidden sm:block">
          Use ← → keys · Esc to exit
        </span>
        <Button
          variant="hero"
          size="lg"
          disabled={index >= list.length - 1}
          onClick={() => setIndex((i) => Math.min(list.length - 1, i + 1))}
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </footer>
    </div>
  );
};

export default CookMode;
