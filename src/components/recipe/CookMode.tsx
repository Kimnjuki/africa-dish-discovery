import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ChevronLeft, ChevronRight, CheckCircle2, ListChecks } from "lucide-react";
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
 * Full-screen cooking stepper for a phone on the counter.
 * Large type, thumb-sized controls, swipe between steps, and the screen
 * stays awake where the Wake Lock API is available.
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
  const [showIngredients, setShowIngredients] = useState(false);
  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const request = async () => {
      try {
        if (navigator.wakeLock?.request && document.visibilityState === "visible") {
          wakeLock.current = await navigator.wakeLock.request("screen");
        }
      } catch {
        /* wake lock unavailable — cook mode still works */
      }
    };
    request();
    const onVisible = () => {
      if (document.visibilityState === "visible") request();
    };
    document.addEventListener("visibilitychange", onVisible);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      document.body.style.overflow = previousOverflow;
      try {
        wakeLock.current?.release?.();
      } catch {
        /* noop */
      }
    };
  }, []);

  const go = (next: number) => {
    setIndex(Math.max(0, Math.min(next, Math.max(0, list.length - 1))));
    setShowIngredients(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "Escape") onClose(index);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, list.length, onClose]);

  const ingredientLines: string[] = Array.isArray(ingredients)
    ? ingredients.map((ing) => prepareIngredientLine(ing, multiplier, "original")).filter(Boolean)
    : [];

  const progress = list.length ? ((index + 1) / list.length) * 100 : 0;
  const atEnd = list.length === 0 || index >= list.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex h-dvh flex-col bg-background">
      <header className="flex items-center gap-3 border-b px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Step {index + 1} of {list.length || 1}
          </p>
          <h2 className="truncate text-base font-semibold sm:text-lg">{recipeName}</h2>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 shrink-0"
          aria-label="Exit cook mode"
          onClick={() => onClose(index)}
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      <Progress value={progress} className="h-1.5 rounded-none" />

      <div
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-6"
        onTouchStart={(e) => {
          const t = e.changedTouches[0];
          touch.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - touch.current.x;
          const dy = t.clientY - touch.current.y;
          touch.current = null;
          if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
          if (dx < 0) go(index + 1);
          else go(index - 1);
        }}
      >
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-[1.65rem] font-medium leading-snug sm:text-3xl sm:leading-relaxed">
              {list[index] || "No steps available for this recipe yet."}
            </p>
            <Button
              className="mt-6 h-12 hover:scale-100"
              size="lg"
              variant={done.includes(index) ? "default" : "outline"}
              onClick={() =>
                setDone((d) => (d.includes(index) ? d.filter((i) => i !== index) : [...d, index]))
              }
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              {done.includes(index) ? "Step done" : "Mark step done"}
            </Button>

            {ingredientLines.length > 0 && (
              <div className="mt-8 lg:hidden">
                <Button
                  variant="secondary"
                  className="h-12 w-full hover:scale-100"
                  onClick={() => setShowIngredients((v) => !v)}
                >
                  <ListChecks className="mr-2 h-5 w-5" />
                  {showIngredients ? "Hide ingredients" : `Ingredients (${ingredientLines.length})`}
                </Button>
                {showIngredients && (
                  <ul className="mt-4 space-y-3 text-base">
                    {ingredientLines.map((line, i) => (
                      <li key={i} className="border-b border-border/60 pb-3 text-foreground">
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {ingredientLines.length > 0 && (
            <aside className="hidden lg:block">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <ListChecks className="h-4 w-4" /> Ingredients
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

      <footer className="grid grid-cols-2 gap-3 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button
          variant="outline"
          size="lg"
          className="h-14 hover:scale-100"
          disabled={index === 0}
          onClick={() => go(index - 1)}
        >
          <ChevronLeft className="mr-1 h-5 w-5" />
          Previous
        </Button>
        <Button
          variant="hero"
          size="lg"
          className="h-14 hover:scale-100"
          onClick={() => (atEnd ? onClose(index) : go(index + 1))}
        >
          {atEnd ? "Finish" : "Next"}
          {!atEnd && <ChevronRight className="ml-1 h-5 w-5" />}
        </Button>
      </footer>
    </div>
  );
};

export default CookMode;
