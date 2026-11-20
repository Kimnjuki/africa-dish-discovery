import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight, CheckCircle2, ListChecks, Repeat } from "lucide-react";
import { stepToText, prepareIngredientLine, ingredientToText } from "@/lib/recipeUnits";
import type { IngredientValue, StepValue } from "@/types/content";
import { bestCookSubstitutionPrompt } from "@/lib/substitutionGraph";
import { resolveMarketId, type MarketId } from "@/lib/localMarket";
import { track, EVENTS } from "@/lib/analytics";

interface CookModeProps {
  recipeName: string;
  steps: StepValue[] | null;
  ingredients?: IngredientValue[] | null;
  multiplier?: number;
  startIndex?: number;
  country?: string;
  marketId?: MarketId;
  onClose: (lastIndex: number) => void;
}

/**
 * Full-screen cooking stepper for a phone on the counter.
 * Large type, thumb-sized controls, swipe between steps, local substitution
 * prompts, and the screen stays awake where the Wake Lock API is available.
 */
export const CookMode = ({
  recipeName,
  steps,
  ingredients,
  multiplier = 1,
  startIndex = 0,
  country,
  marketId: marketProp,
  onClose,
}: CookModeProps) => {
  const list: string[] = Array.isArray(steps) ? steps.map(stepToText).filter(Boolean) : [];
  const [index, setIndex] = useState(Math.min(startIndex, Math.max(0, list.length - 1)));
  const [done, setDone] = useState<number[]>([]);
  const [showIngredients, setShowIngredients] = useState(false);
  const [appliedSwaps, setAppliedSwaps] = useState<Record<number, string>>({});
  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const marketId = marketProp || resolveMarketId(country);

  const ingredientMeta = useMemo(() => {
    if (!Array.isArray(ingredients)) return [] as {
      display: string;
      raw: string;
      prompt: string | null;
      substitute: string | null;
    }[];
    return ingredients.map((ing) => {
      const raw = ingredientToText(ing);
      const hit = bestCookSubstitutionPrompt(raw, {
        regionHint: country,
        marketId,
      });
      return {
        display: prepareIngredientLine(ing, multiplier, "original"),
        raw,
        prompt: hit?.cookAdjustment?.prompt || hit?.cookHint || null,
        substitute: hit?.name || null,
      };
    });
  }, [ingredients, multiplier, country, marketId]);

  useEffect(() => {
    // Track cook mode start once on mount.
    track(EVENTS.COOK_MODE_STARTED, { recipeName, stepCount: list.length });

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

  const progress = list.length ? ((index + 1) / list.length) * 100 : 0;
  const atEnd = list.length === 0 || index >= list.length - 1;

  const renderIngredient = (
    meta: (typeof ingredientMeta)[number],
    i: number,
    compact = false
  ) => {
    const swapped = appliedSwaps[i];
    return (
      <li
        key={i}
        className={compact ? "border-b border-border/60 pb-3 text-foreground" : "text-muted-foreground"}
      >
        <div className="flex items-start justify-between gap-2">
          <span className={compact ? "text-base" : "text-base"}>
            {swapped ? (
              <>
                <span className="font-medium text-foreground">{swapped}</span>
                <span className="ml-1 text-xs line-through opacity-60">{meta.display}</span>
              </>
            ) : (
              meta.display
            )}
          </span>
          {meta.substitute && !swapped && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 shrink-0"
              onClick={() =>
                setAppliedSwaps((prev) => ({ ...prev, [i]: meta.substitute as string }))
              }
            >
              <Repeat className="mr-1 h-3.5 w-3.5" />
              Swap
            </Button>
          )}
        </div>
        {meta.prompt && !swapped && (
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
            {meta.prompt}
          </p>
        )}
        {swapped && meta.prompt && (
          <Badge variant="secondary" className="mt-1 text-[10px]">
            Using local substitute
          </Badge>
        )}
      </li>
    );
  };

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

            {ingredientMeta.length > 0 && (
              <div className="mt-8 lg:hidden">
                <Button
                  variant="secondary"
                  className="h-12 w-full hover:scale-100"
                  onClick={() => setShowIngredients((v) => !v)}
                >
                  <ListChecks className="mr-2 h-5 w-5" />
                  {showIngredients
                    ? "Hide ingredients"
                    : `Ingredients (${ingredientMeta.length})`}
                </Button>
                {showIngredients && (
                  <ul className="mt-4 space-y-3 text-base">
                    {ingredientMeta.map((meta, i) => renderIngredient(meta, i, true))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {ingredientMeta.length > 0 && (
            <aside className="hidden lg:block">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <ListChecks className="h-4 w-4" /> Ingredients
              </h3>
              <ul className="space-y-3 text-base">
                {ingredientMeta.map((meta, i) => renderIngredient(meta, i))}
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
