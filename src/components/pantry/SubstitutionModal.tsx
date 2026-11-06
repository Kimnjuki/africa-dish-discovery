import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, ArrowRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Substitute {
  name: string;
  ratio: string;
  notes: string;
  compatibilityScore: number;
  availabilityScore: number;
}

interface SubstitutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIngredient?: string;
  onSelectSubstitute?: (original: string, substitute: Substitute) => void;
}

const SubstitutionModal = ({
  open,
  onOpenChange,
  initialIngredient = "",
  onSelectSubstitute
}: SubstitutionModalProps) => {
  const [ingredient, setIngredient] = useState(initialIngredient);
  const [substitutes, setSubstitutes] = useState<Substitute[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchSubstitutes = async () => {
    if (!ingredient.trim()) {
      toast.error("Please enter an ingredient");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke('pantry-intelligence', {
        body: {
          mode: 'substitute',
          ingredient: ingredient.trim()
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        setSubstitutes([]);
      } else {
        setSubstitutes(data.substitutes || []);
        if (data.substitutes?.length === 0) {
          toast.info("No substitutes found. Try a different ingredient.");
        }
      }
    } catch (error) {
      console.error("Substitution search error:", error);
      toast.error("Failed to find substitutes");
      setSubstitutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubstitute = (substitute: Substitute) => {
    if (onSelectSubstitute) {
      onSelectSubstitute(ingredient, substitute);
    }
    toast.success(`Selected ${substitute.name} as substitute for ${ingredient}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Ingredient Substitution
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter ingredient (e.g., scotch bonnet, palm oil)"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchSubstitutes()}
            />
            <Button onClick={searchSubstitutes} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                AI is finding the best substitutes for {ingredient}...
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && searched && (
            <div className="space-y-4">
              {substitutes.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Found {substitutes.length} substitutes for <span className="font-medium">{ingredient}</span>
                  </p>

                  {substitutes.map((sub, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{sub.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {sub.ratio}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {sub.notes}
                          </p>

                          {/* Scores */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Compatibility</span>
                                <span className={cn("font-medium", getScoreColor(sub.compatibilityScore))}>
                                  {sub.compatibilityScore}%
                                </span>
                              </div>
                              <Progress value={sub.compatibilityScore} className="h-1.5" />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Availability</span>
                                <span className={cn("font-medium", getScoreColor(sub.availabilityScore))}>
                                  {sub.availabilityScore}%
                                </span>
                              </div>
                              <Progress value={sub.availabilityScore} className="h-1.5" />
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectSubstitute(sub)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Use
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No substitutes found for "{ingredient}". Try a different ingredient.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Common Substitutions Reference */}
          {!searched && !loading && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter an ingredient to find AI-powered substitution suggestions for African cooking.
              </p>

              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-medium mb-3 text-sm">Popular Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Scotch bonnet",
                    "Palm oil",
                    "Egusi seeds",
                    "Cassava flour",
                    "Plantain",
                    "Okra",
                    "Crayfish"
                  ].map((item) => (
                    <Button
                      key={item}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setIngredient(item);
                        setTimeout(() => searchSubstitutes(), 100);
                      }}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubstitutionModal;
