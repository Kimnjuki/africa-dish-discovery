import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Sparkles, 
  Clock, 
  Filter, 
  X, 
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { readErrorMessage } from "@/lib/errors";
import type { CookableRecipe } from "@/types/content";
import { expandSearchQuery, searchRecipes } from "@/lib/recipeSearch";

interface SearchFilters {
  country?: string;
  difficulty?: string;
  maxTime?: number;
  dietary?: string[];
  ingredients?: string[];
}

interface AdvancedSearchProps {
  onSearchResults: (recipes: CookableRecipe[], aiEnhanced: boolean) => void;
  onLoading: (loading: boolean) => void;
}

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "dairy-free", label: "Dairy-Free" },
  { id: "halal", label: "Halal" },
  { id: "low-carb", label: "Low Carb" },
  { id: "high-protein", label: "High Protein" },
];

const countries = [
  "Nigeria", "Ghana", "Ethiopia", "Morocco", "South Africa", 
  "Kenya", "Egypt", "Tunisia", "Senegal", "Tanzania"
];

const difficulties = ["Easy", "Medium", "Hard"];

export const AdvancedSearch = ({ onSearchResults, onLoading }: AdvancedSearchProps) => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [maxTime, setMaxTime] = useState([60]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    onLoading(true);

    try {
      const searchFilters: SearchFilters = {
        ...filters,
        maxTime: maxTime[0] < 120 ? maxTime[0] : undefined,
        dietary: selectedDietary.length > 0 ? selectedDietary : undefined,
        ingredients: ingredients.length > 0 ? ingredients : undefined,
      };

      // Expand African dish aliases / light typos for edge fallback + local re-rank
      const expansion = expandSearchQuery(query);
      let searchQuery = query;
      if (ingredients.length > 0 && !query.toLowerCase().includes("ingredient")) {
        searchQuery = `${query} with ingredients: ${ingredients.join(", ")}`.trim();
      }

      const { data, error } = await supabase.functions.invoke("ai-search", {
        body: {
          query: searchQuery || null,
          filters: searchFilters,
          search_terms: expansion.terms.length ? expansion.terms : undefined,
          suggestion: expansion.suggestion || undefined,
        },
      });

      if (error) throw error;

      let recipes = (data.recipes || []) as CookableRecipe[];
      // When AI is off, re-rank with local synonym-aware scoring
      if (!data.ai_enhanced && query.trim()) {
        recipes = searchRecipes(recipes, query);
      }

      onSearchResults(recipes, data.ai_enhanced || false);

      if (data.ai_enhanced) {
        toast.success("AI-powered search complete", {
          description: data.query_interpretation,
        });
      } else if (expansion.suggestion && expansion.suggestion !== expansion.normalized) {
        toast.message(`Including matches for “${expansion.suggestion}”`, {
          description: "Typo-tolerant search with African dish aliases",
        });
      }
    } catch (error: unknown) {
      console.error("Search error:", error);
      toast.error("Search failed", {
        description: readErrorMessage(error) || "Please try again",
      });
      onSearchResults([], false);
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim() && !ingredients.includes(ingredientInput.trim())) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const toggleDietary = (id: string) => {
    setSelectedDietary(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setFilters({});
    setMaxTime([60]);
    setSelectedDietary([]);
    setIngredients([]);
    setQuery("");
  };

  const hasActiveFilters = 
    filters.country || 
    filters.difficulty || 
    maxTime[0] < 120 || 
    selectedDietary.length > 0 || 
    ingredients.length > 0;

  return (
    <div className="w-full space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Try: 'quick vegetarian dinner with tomatoes' or 'spicy Nigerian soup'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 pr-10 h-12 text-base"
          />
          {query && (
            <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary animate-pulse" />
          )}
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isSearching}
          className="h-12 px-6"
        >
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Search
            </>
          )}
        </Button>
      </div>

      {/* Filter Toggle */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Advanced Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {[
                    filters.country,
                    filters.difficulty,
                    maxTime[0] < 120,
                    ...selectedDietary,
                    ...ingredients
                  ].filter(Boolean).length}
                </Badge>
              )}
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Country & Difficulty Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country/Region</Label>
                  <Select 
                    value={filters.country || ""} 
                    onValueChange={(v) => setFilters({...filters, country: v || undefined})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Countries</SelectItem>
                      {countries.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select 
                    value={filters.difficulty || ""} 
                    onValueChange={(v) => setFilters({...filters, difficulty: v || undefined})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Difficulty</SelectItem>
                      {difficulties.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Max Cooking Time
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {maxTime[0] >= 120 ? 'Any time' : `${maxTime[0]} min`}
                  </span>
                </div>
                <Slider
                  value={maxTime}
                  onValueChange={setMaxTime}
                  max={120}
                  min={15}
                  step={15}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>15 min</span>
                  <span>60 min</span>
                  <span>Any</span>
                </div>
              </div>

              {/* Dietary Filters */}
              <div className="space-y-3">
                <Label>Dietary Preferences</Label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(option => (
                    <div 
                      key={option.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={option.id}
                        checked={selectedDietary.includes(option.id)}
                        onCheckedChange={() => toggleDietary(option.id)}
                      />
                      <label 
                        htmlFor={option.id}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingredient Search */}
              <div className="space-y-3">
                <Label>Search by Ingredients</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., chicken, tomatoes, rice..."
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  />
                  <Button variant="secondary" onClick={addIngredient}>
                    Add
                  </Button>
                </div>
                {ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map(ing => (
                      <Badge key={ing} variant="secondary" className="gap-1">
                        {ing}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeIngredient(ing)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
