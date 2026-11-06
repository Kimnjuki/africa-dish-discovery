import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedItems, type SaveTarget } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";

interface Props extends SaveTarget {
  showLabel?: boolean;
  className?: string;
}

export const SaveButton = ({ showLabel = true, className, ...target }: Props) => {
  const { isSaved, toggleSaved } = useSavedItems();
  const saved = isSaved(target.type, target.slug);
  return (
    <Button
      type="button"
      variant="outline"
      size={showLabel ? "default" : "icon"}
      className={className}
      aria-pressed={saved}
      aria-label={saved ? "Remove from my list" : "Save to my list"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggleSaved(target);
      }}
    >
      <Heart className={cn("w-4 h-4", saved && "fill-primary text-primary")} />
      {showLabel && <span className="ml-2">{saved ? "Saved" : "Save"}</span>}
    </Button>
  );
};

export default SaveButton;
