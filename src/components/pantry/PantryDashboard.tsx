import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChefHat,
  Plus,
  Sparkles,
  ArrowRight,
  Package,
  Calendar,
  BarChart3,
  Bell,
  Search,
  ShoppingCart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SmartRecipeMatch, { type RecipeMatch } from "./SmartRecipeMatch";
import SubstitutionModal from "./SubstitutionModal";
import CookingPopup from "@/components/CookingPopup";
import VisualPantryGrid from "./VisualPantryGrid";
import PantryAnalytics from "./PantryAnalytics";
import ExpirationNotifications from "./ExpirationNotifications";
import BarcodeScanner from "./BarcodeScanner";
import VoiceInput from "./VoiceInput";
import PhotoRecognition from "./PhotoRecognition";
import SmartShoppingList from "./SmartShoppingList";
import { PantryItemWithExpiry, getFreshnessStatus } from "./ExpirationTracker";
import {
  findMatchingRecipes,
  buildPantryInsights,
} from "@/utils/recipeMatching";
import type { CookableRecipe } from "@/types/content";
import type { User } from "@supabase/supabase-js";

const PantryDashboard = () => {
  const [pantryItems, setPantryItems] = useState<PantryItemWithExpiry[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("pantry");
  const [recipeMatches, setRecipeMatches] = useState<RecipeMatch[]>([]);
  const [aiInsights, setAiInsights] = useState("");
  const [substitutionModalOpen, setSubstitutionModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<CookableRecipe | null>(null);
  const [isCookingPopupOpen, setIsCookingPopupOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItemWithExpiry | null>(null);
  const [editForm, setEditForm] = useState({ name: '', quantity: '', unit: '', expires_at: '' });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadPantryItems();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    setLoading(false);
  };

  const loadPantryItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setPantryItems(data || []);
    } catch (error) {
      console.error('Error loading pantry:', error);
      toast.error("Failed to load pantry items");
    }
  };

  const addIngredient = async (name?: string, quantity?: number, unit?: string) => {
    const ingredientName = name || newIngredient.trim();
    if (!ingredientName || !user) return;

    try {
      const { error } = await supabase
        .from('pantry_items')
        .insert({
          ingredient_name: ingredientName,
          user_id: user.id,
          quantity: quantity || 1,
          unit: unit || 'piece'
        });

      if (error) throw error;

      if (!name) setNewIngredient("");
      loadPantryItems();
      if (!name) toast.success(`Added ${ingredientName} to pantry`);
    } catch (error) {
      console.error('Error adding ingredient:', error);
      toast.error("Failed to add ingredient");
    }
  };

  const handleBarcodeScanned = (productName: string, barcode: string) => {
    addIngredient(productName, 1, 'piece');
  };

  const handleMultipleIngredients = async (ingredients: { name: string; quantity: number; unit: string }[]) => {
    for (const ing of ingredients) {
      await addIngredient(ing.name, ing.quantity, ing.unit);
    }
    toast.success(`Added ${ingredients.length} ingredient(s) to pantry`);
  };

  const removeIngredient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPantryItems();
      toast.success("Removed from pantry");
    } catch (error) {
      console.error('Error removing ingredient:', error);
      toast.error("Failed to remove ingredient");
    }
  };

  const updateExpiry = async (id: string, expiresAt: string) => {
    try {
      const { error } = await supabase
        .from('pantry_items')
        .update({ expires_at: expiresAt })
        .eq('id', id);

      if (error) throw error;
      loadPantryItems();
      toast.success("Updated expiry date");
    } catch (error) {
      console.error('Error updating expiry:', error);
      toast.error("Failed to update expiry");
    }
  };

  const openEditDialog = (item: PantryItemWithExpiry) => {
    setEditingItem(item);
    setEditForm({
      name: item.ingredient_name,
      quantity: item.quantity?.toString() || '',
      unit: item.unit || '',
      expires_at: item.expires_at || ''
    });
  };

  const saveItemEdit = async () => {
    if (!editingItem) return;
    
    try {
      const { error } = await supabase
        .from('pantry_items')
        .update({
          ingredient_name: editForm.name,
          quantity: editForm.quantity ? parseFloat(editForm.quantity) : null,
          unit: editForm.unit || null,
          expires_at: editForm.expires_at || null
        })
        .eq('id', editingItem.id);

      if (error) throw error;
      loadPantryItems();
      setEditingItem(null);
      toast.success("Item updated");
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error("Failed to update item");
    }
  };

  // Sort items by expiration - expiring items first for recipe prioritization
  const getItemsForMatching = () => {
    return [...pantryItems].sort((a, b) => {
      const statusA = getFreshnessStatus(a.expires_at);
      const statusB = getFreshnessStatus(b.expires_at);
      
      const priority = { expired: 0, urgent: 1, soon: 2, fresh: 3, unknown: 4 };
      return (priority[statusA.status as keyof typeof priority] || 4) - 
             (priority[statusB.status as keyof typeof priority] || 4);
    });
  };

  const findAIMatches = useCallback(async () => {
    if (pantryItems.length === 0) {
      toast.info("Add ingredients to your pantry first");
      return;
    }

    setMatchLoading(true);

    try {
      const prioritizedItems = getItemsForMatching();

      // Local matching over a large recipe corpus (core pantry intelligence)
      const pageSize = 1000;
      let recipes: any[] = [];
      let from = 0;
      while (from < 4000) {
        const { data, error } = await supabase
          .from("recipes")
          .select(
            "id,name,country,summary,prep_time,cook_time,servings,difficulty,image_url,tags,ingredients,cuisine_type,category"
          )
          .not("ingredients", "is", null)
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data?.length) break;
        recipes = recipes.concat(data);
        if (data.length < pageSize) break;
        from += pageSize;
      }

      const localMatches = findMatchingRecipes(
        prioritizedItems.map((item) => ({
          id: item.id,
          name: item.ingredient_name,
          ingredient_name: item.ingredient_name,
          expires_at: item.expires_at || undefined,
        })),
        recipes,
        40
      ).slice(0, 40);

      const enrichedMatches: RecipeMatch[] = localMatches.map((match) => ({
        ...match.recipe,
        matchScore: match.matchPercentage,
        matchedIngredients: match.matchedIngredients,
        missingIngredients: match.missingIngredients,
        substitutionSuggestions: match.substitutableIngredients.map((s) => ({
          missing: s.original,
          substitute: s.substitute,
          note: "Pantry substitute",
        })),
        canCookNow: match.canMakeNow,
        priority: match.priority,
        priorityReason: match.priorityReason,
      }));

      setRecipeMatches(enrichedMatches);
      setAiInsights(buildPantryInsights(localMatches, pantryItems.length));
      setActiveTab("matches");

      // Optional AI narrative on top of local ranking (never blocks results)
      try {
        const topForAi = localMatches.slice(0, 25).map((m) => ({
          id: m.recipe.id,
          name: m.recipe.name,
          ingredients: m.recipe.ingredients,
          difficulty: m.recipe.difficulty,
          prep_time: m.recipe.prep_time,
          cook_time: m.recipe.cook_time,
        }));
        const { data } = await supabase.functions.invoke("pantry-intelligence", {
          body: {
            mode: "match",
            pantryItems: prioritizedItems.map((item) => ({
              ...item,
              freshness: getFreshnessStatus(item.expires_at),
            })),
            recipes: topForAi,
          },
        });
        if (data?.insights && !data?.error) {
          setAiInsights(data.insights);
        }
        if (Array.isArray(data?.matches) && data.matches.length) {
          const byId = new Map(enrichedMatches.map((m) => [m.id, m]));
          const merged = data.matches
            .map((ai: any) => {
              const base = byId.get(ai.recipeId);
              if (!base) return null;
              return {
                ...base,
                matchScore: Math.max(base.matchScore, ai.matchScore || 0),
                substitutionSuggestions:
                  ai.substitutionSuggestions?.length
                    ? ai.substitutionSuggestions
                    : base.substitutionSuggestions,
                priority: ai.priority || base.priority,
                priorityReason: ai.priorityReason || base.priorityReason,
                canCookNow: ai.canCookNow ?? base.canCookNow,
              } as RecipeMatch;
            })
            .filter(Boolean) as RecipeMatch[];
          if (merged.length) {
            const leftover = enrichedMatches.filter(
              (m) => !merged.some((x) => x.id === m.id)
            );
            setRecipeMatches([...merged, ...leftover].slice(0, 40));
          }
        }
      } catch {
        // Local matches already set — AI is additive only
      }

      if (enrichedMatches.length === 0) {
        toast.info("No strong matches found. Try adding more ingredients.");
      } else {
        toast.success(
          `Found ${enrichedMatches.length} pantry match${enrichedMatches.length === 1 ? "" : "es"}`
        );
      }
    } catch (error) {
      console.error("Pantry matching error:", error);
      toast.error("Failed to find recipe matches");
    } finally {
      setMatchLoading(false);
    }
  }, [pantryItems]);

  const addToShoppingList = async (ingredients: string[]) => {
    if (!user) return;

    try {
      const itemsToAdd = ingredients.map(ingredient => ({
        ingredient_name: ingredient,
        user_id: user.id,
        checked: false
      }));

      const { error } = await supabase
        .from('shopping_list_items')
        .insert(itemsToAdd);

      if (error) throw error;
      toast.success(`Added ${ingredients.length} items to shopping list`);
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      toast.error("Failed to add to shopping list");
    }
  };

  const startCooking = (recipe: CookableRecipe) => {
    setSelectedRecipe(recipe);
    setIsCookingPopupOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="p-8">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">AI Pantry Intelligence</h3>
          <p className="text-muted-foreground mb-4">
            Sign in to access smart recipe matching and ingredient substitutions.
          </p>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-6">
          <TabsTrigger value="pantry" className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Pantry</span>
          </TabsTrigger>
          <TabsTrigger value="recipes" className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Match</span>
          </TabsTrigger>
          <TabsTrigger value="shopping" className="flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Shop</span>
          </TabsTrigger>
          <TabsTrigger value="substitutes" className="flex items-center gap-1">
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">Substitutes</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
        </TabsList>

        {/* Pantry Management */}
        <TabsContent value="pantry" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  My Pantry ({pantryItems.length})
                </span>
                <div className="flex gap-2">
                  {pantryItems.length > 0 && (
                    <Button size="sm" onClick={findAIMatches} disabled={matchLoading}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Find Recipes
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Quick Input Actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                <BarcodeScanner onScan={handleBarcodeScanned} />
                <VoiceInput onAddIngredients={handleMultipleIngredients} />
                <PhotoRecognition onAddIngredients={handleMultipleIngredients} />
              </div>

              {/* Add Ingredient */}
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Add ingredient (e.g., tomatoes, rice, chicken)"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                />
                <Button onClick={() => addIngredient()} disabled={!newIngredient.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Visual Pantry Grid */}
              <VisualPantryGrid
                items={pantryItems}
                onRemove={removeIngredient}
                onEdit={openEditDialog}
                onSetExpiry={updateExpiry}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Recipe Matching */}
        <TabsContent value="recipes" className="mt-6">
          <SmartRecipeMatch
            matches={recipeMatches}
            loading={matchLoading}
            onRefresh={findAIMatches}
            onStartCooking={startCooking}
            onAddToShoppingList={addToShoppingList}
            insights={aiInsights}
          />
        </TabsContent>

        {/* Smart Shopping List */}
        <TabsContent value="shopping" className="mt-6">
          <SmartShoppingList pantryItems={pantryItems} userId={user.id} />
        </TabsContent>

        {/* Substitution Finder */}
        <TabsContent value="substitutes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Ingredient Substitution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Find smart substitutes for any ingredient using AI. Perfect for when you're missing something for a recipe.
              </p>
              <Button onClick={() => setSubstitutionModalOpen(true)}>
                <Search className="w-4 h-4 mr-2" />
                Find Substitutes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Dashboard */}
        <TabsContent value="analytics" className="mt-6">
          <PantryAnalytics items={pantryItems} />
        </TabsContent>

        {/* Expiration Alerts */}
        <TabsContent value="alerts" className="mt-6">
          <ExpirationNotifications items={pantryItems} userEmail={user?.email} />
        </TabsContent>
      </Tabs>

      {/* Substitution Modal */}
      <SubstitutionModal
        open={substitutionModalOpen}
        onOpenChange={setSubstitutionModalOpen}
      />

      {/* Cooking Popup */}
      {selectedRecipe && (
        <CookingPopup
          recipe={selectedRecipe}
          isOpen={isCookingPopupOpen}
          onClose={() => {
            setIsCookingPopupOpen(false);
            setSelectedRecipe(null);
          }}
        />
      )}

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ingredient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Input
                  placeholder="e.g., pieces, kg, cups"
                  value={editForm.unit}
                  onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Expiry Date
              </label>
              <Input
                type="date"
                value={editForm.expires_at}
                onChange={(e) => setEditForm({ ...editForm, expires_at: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button onClick={saveItemEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PantryDashboard;
