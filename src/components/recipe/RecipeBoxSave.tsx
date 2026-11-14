import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookMarked, Check } from "lucide-react";
import { toast } from "sonner";
import {
  getRecipeBox,
  isInBox,
  saveToFolder,
  type RecipeBoxState,
} from "@/lib/recipeBox";
import { bestCookSubstitutionPrompt } from "@/lib/substitutionGraph";
import { saveCookPack } from "@/lib/offlineStore";
import type { IngredientValue, StepValue } from "@/types/content";
import { ingredientToText } from "@/lib/recipeUnits";

interface RecipeBoxSaveProps {
  recipeId: string;
  slug: string;
  name: string;
  country?: string;
  imageUrl?: string | null;
  ingredients?: IngredientValue[] | null;
  steps?: StepValue[] | null;
  servings?: number | null;
  prepTime?: number | null;
  cookTime?: number | null;
}

export const RecipeBoxSave = ({
  recipeId,
  slug,
  name,
  country,
  imageUrl,
  ingredients,
  steps,
  servings,
  prepTime,
  cookTime,
}: RecipeBoxSaveProps) => {
  const [box, setBox] = useState<RecipeBoxState>(() => getRecipeBox());
  const saved = isInBox(recipeId);

  useEffect(() => {
    const onChange = () => setBox(getRecipeBox());
    window.addEventListener("ladhaquest:recipe-box", onChange);
    return () => window.removeEventListener("ladhaquest:recipe-box", onChange);
  }, []);

  const save = (folderId: string) => {
    saveToFolder({
      recipeId,
      slug,
      name,
      country,
      imageUrl,
      folderId,
    });
    setBox(getRecipeBox());
    toast.success(`Saved to ${box.folders.find((f) => f.id === folderId)?.name || "Recipe Box"}`);
  };

  const downloadCookPack = () => {
    const prompts: { ingredient: string; prompt: string; substitute: string }[] = [];
    if (Array.isArray(ingredients)) {
      for (const ing of ingredients) {
        const raw = ingredientToText(ing);
        const hit = bestCookSubstitutionPrompt(raw, { regionHint: country });
        if (hit?.cookAdjustment?.prompt || hit?.cookHint) {
          prompts.push({
            ingredient: raw,
            prompt: hit.cookAdjustment?.prompt || hit.cookHint || "",
            substitute: hit.name,
          });
        }
      }
    }
    saveCookPack({
      recipeId,
      slug,
      name,
      country: country || "",
      ingredients,
      steps,
      servings: servings ?? null,
      prep_time: prepTime ?? null,
      cook_time: cookTime ?? null,
      substitutionPrompts: prompts.slice(0, 12),
    });
    toast.success("Offline cook pack saved — open Offline recipes anytime");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-12">
            {saved ? <Check className="mr-2 h-4 w-4" /> : <BookMarked className="mr-2 h-4 w-4" />}
            {saved ? "In Recipe Box" : "Recipe Box"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Save to folder</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {box.folders.map((folder) => (
            <DropdownMenuItem key={folder.id} onClick={() => save(folder.id)}>
              {folder.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button type="button" variant="secondary" className="h-12" onClick={downloadCookPack}>
        Download for offline
      </Button>
    </div>
  );
};
