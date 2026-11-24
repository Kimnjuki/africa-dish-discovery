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
  ShoppingCart,
  Home,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  fetchMyHousehold,
  fetchSharedHouseholdPantry,
  type SharedPantryItem,
} from "@/lib/household";
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
  splitPantryInput,
  sortByCookability,
} from "@/utils/recipeMatching";
import { matchPantryViaIngredientGraph } from "@/lib/graphPantryMatch";
import {
  loadPantryConstraints,
  recipeViolatesConstraints,
  savePantryConstraints,
  type PantryMatchConstraints,
} from "@/lib/pantryConstraints";
import { track, EVENTS } from "@/lib/analytics";
import {
  loadOrAssignVariant,
  trackPantryExperimentExposure,
  type PantryExperimentVariant,
} from "@/lib/pantryExperiment";
import type { CookableRecipe } from "@/types/content";
import type { User } from "@supabase/supabase-js";
import {
  enqueuePantryOp,
  getPantrySnapshot,
  isBrowserOffline,
  savePantrySnapshot,
} from "@/lib/offlineStore";
import { useOfflinePantrySync } from "@/hooks/useOfflinePantrySync";
import { usePWA } from "@/hooks/usePWA";

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
  const [householdName, setHouseholdName] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [experimentVariant, setExperimentVariant] = useState<PantryExperimentVariant | null>(null);
  const [sharedHouseholdItems, setSharedHouseholdItems] = useState<SharedPantryItem[]>([]);
  const [usingOfflineSnapshot, setUsingOfflineSnapshot] = useState(false);
  const [pantryConstraints, setPantryConstraints] = useState<PantryMatchConstraints>(() =>
    typeof window !== "undefined"
      ? loadPantryConstraints()
      : { allergies: [], diets: [], equipment: ["stove"], maxTotalMinutes: null }
  );
  const [allergyInput, setAllergyInput] = useState("");
  const { isOffline } = usePWA();

  useOfflinePantrySync(user?.id);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadPantryItems();
      loadHouseholdPantry();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    setLoading(false);
  };

  const persistSnapshot = (items: PantryItemWithExpiry[], userId: string) => {
    savePantrySnapshot(userId, items);
  };

  const loadPantryItems = async () => {
    if (!user) return;

    if (isBrowserOffline()) {
      const snap = getPantrySnapshot(user.id);
      if (snap) {
        setPantryItems(snap.items as PantryItemWithExpiry[]);
        setUsingOfflineSnapshot(true);
        toast.info("Showing offline pantry snapshot");
        return;
      }
      toast.error("No offline pantry snapshot available");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      const items = data || [];
      setPantryItems(items);
      setUsingOfflineSnapshot(false);
      persistSnapshot(items, user.id);
    } catch (error) {
      console.error('Error loading pantry:', error);
      const snap = getPantrySnapshot(user.id);
      if (snap) {
        setPantryItems(snap.items as PantryItemWithExpiry[]);
        setUsingOfflineSnapshot(true);
        toast.info("Using cached pantry (network error)");
      } else {
        toast.error("Failed to load pantry items");
      }
    }
  };

  const loadHouseholdPantry = async () => {
    if (!user) return;
    try {
      const { household, members } = await fetchMyHousehold();
      const hhId = household?.id ?? null;
      setHouseholdId(hhId);
      const assignKey = hhId || user.id;
      const variant = loadOrAssignVariant(assignKey);
      setExperimentVariant(variant);
      trackPantryExperimentExposure(variant, { household_id: hhId, user_id: user.id });
      if (!household?.share_pantry) {
        setHouseholdName(household?.name ?? null);
        setSharedHouseholdItems([]);
        return;
      }
      setHouseholdName(household.name);
      const shared = await fetchSharedHouseholdPantry(user.id, members);
      setSharedHouseholdItems(shared);
    } catch (error) {
      console.error("Error loading household pantry:", error);
      setHouseholdName(null);
      setHouseholdId(null);
      setSharedHouseholdItems([]);
      if (user) {
        const variant = loadOrAssignVariant(user.id);
        setExperimentVariant(variant);
        trackPantryExperimentExposure(variant, { user_id: user.id });
      }
    }
  };

  const addIngredient = async (name?: string, quantity?: number, unit?: string) => {
    const ingredientName = name || newIngredient.trim();
    if (!ingredientName || !user) return;

    const parts = splitPantryInput(ingredientName);

    if (isBrowserOffline()) {
      const localItems: PantryItemWithExpiry[] = parts.map((part, i) => {
        const localId = `local_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`;
        enqueuePantryOp({
          type: "insert",
          localId,
          payload: {
            ingredient_name: part,
            quantity: quantity || 1,
            unit: unit || "piece",
          },
        });
        return {
          id: localId,
          ingredient_name: part,
          quantity: quantity || 1,
          unit: unit || "piece",
        };
      });
      const next = [...localItems, ...pantryItems];
      setPantryItems(next);
      persistSnapshot(next, user.id);
      if (!name) setNewIngredient("");
      toast.success(
        parts.length > 1
          ? `Queued ${parts.length} ingredients (offline)`
          : `Queued ${parts[0]} (offline)`
      );
      return;
    }

    try {
      const rows = parts.map((part) => ({
        ingredient_name: part,
        user_id: user.id,
        quantity: quantity || 1,
        unit: unit || "piece",
      }));
      const { error } = await supabase.from("pantry_items").insert(rows);

      if (error) throw error;

      if (!name) setNewIngredient("");
      loadPantryItems();
      if (!name) {
        toast.success(
          parts.length > 1
            ? `Added ${parts.length} ingredients to pantry`
            : `Added ${parts[0]} to pantry`
        );
      }
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
    if (!user) return;

    if (isBrowserOffline()) {
      enqueuePantryOp({ type: "delete", payload: { id } });
      const next = pantryItems.filter((item) => item.id !== id);
      setPantryItems(next);
      persistSnapshot(next, user.id);
      toast.success("Removed offline — will sync later");
      return;
    }

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
    if (!user) return;

    if (isBrowserOffline()) {
      enqueuePantryOp({
        type: "update",
        payload: { id, expires_at: expiresAt },
      });
      const next = pantryItems.map((item) =>
        item.id === id ? { ...item, expires_at: expiresAt } : item
      );
      setPantryItems(next);
      persistSnapshot(next, user.id);
      toast.success("Expiry queued offline");
      return;
    }

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
    if (!editingItem || !user) return;

    const patch = {
      ingredient_name: editForm.name,
      quantity: editForm.quantity ? parseFloat(editForm.quantity) : null,
      unit: editForm.unit || null,
      expires_at: editForm.expires_at || null,
    };

    if (isBrowserOffline()) {
      enqueuePantryOp({
        type: "update",
        payload: { id: editingItem.id, ...patch },
      });
      const next = pantryItems.map((item) =>
        item.id === editingItem.id ? { ...item, ...patch } : item
      );
      setPantryItems(next);
      persistSnapshot(next, user.id);
      setEditingItem(null);
      toast.success("Update queued offline");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('pantry_items')
        .update(patch)
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

  const findAIMatches = useCallback(async (opts?: { silent?: boolean; jumpToResults?: boolean }) => {
    const silent = opts?.silent === true;
    const jumpToResults = opts?.jumpToResults !== false && !silent;

    if (pantryItems.length === 0) {
      if (!silent) toast.info("Add ingredients to your pantry first");
      return;
    }

    setMatchLoading(true);

    try {
      const prioritizedItems = getItemsForMatching();
      const pantryPayload = prioritizedItems.map((item) => ({
        id: item.id,
        name: item.ingredient_name,
        ingredient_name: item.ingredient_name,
        quantity: item.quantity ?? undefined,
        unit: item.unit || undefined,
        expires_at: item.expires_at || undefined,
      }));

      // A/B: control = strict JSON cookability; treatment = graph-first hybrid
      const variant =
        experimentVariant ??
        (user ? loadOrAssignVariant(householdId || user.id) : "treatment");
      let localMatches: ReturnType<typeof findMatchingRecipes> = [];
      let usedGraph = false;

      if (variant === "treatment") {
        try {
          const graph = await matchPantryViaIngredientGraph(pantryPayload, 40);
          if (graph.matches.length > 0) {
            localMatches = sortByCookability(
              graph.matches
                .map((m) => {
                  const { blocked, reasons } = recipeViolatesConstraints(m.recipe, pantryConstraints);
                  if (!blocked) return m;
                  return {
                    ...m,
                    canMakeNow: false,
                    constraintBlocked: true,
                    constraintReasons: reasons,
                    priority: "low" as const,
                    priorityReason: reasons[0] || m.priorityReason,
                  };
                })
                .filter((m) => !m.constraintBlocked)
            );
            usedGraph = graph.meta.usedGraph;
          }
        } catch (graphErr) {
          console.warn("Graph pantry match failed, falling back to JSON", graphErr);
        }
      }

      if (!localMatches.length) {
        const pageSize = 500;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- paginated recipe corpus for matcher
        let recipes: any[] = [];
        let from = 0;
        while (from < 1000) {
          const { data, error } = await supabase
            .from("recipes")
            .select(
              "id,name,slug,country,summary,prep_time,cook_time,servings,difficulty,image_url,tags,ingredients,cuisine_type,category,allergen_tags,dietary_tags"
            )
            .not("ingredients", "is", null)
            .order("name")
            .range(from, from + pageSize - 1);
          if (error) throw error;
          if (!data?.length) break;
          recipes = recipes.concat(data);
          if (data.length < pageSize) break;
          from += pageSize;
        }

        localMatches = findMatchingRecipes(pantryPayload, recipes, {
          minMatchPercentage: 18,
          mode: "cook_now",
          constraints: pantryConstraints,
          excludeBlocked: true,
        }).slice(0, 40);
      }

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
      track(EVENTS.PANTRY_MATCH, {
        count: enrichedMatches.length,
        source: usedGraph ? "ingredient_graph" : "json_fallback",
        pantrySize: pantryItems.length,
        experiment_variant: variant,
        can_cook_now: enrichedMatches.filter((m) => m.canCookNow).length,
      });
      // Local results are enough — stop the spinner before optional AI enrichment
      setMatchLoading(false);

      if (jumpToResults) {
        setActiveTab("recipes");
      }

      if (!silent) {
        if (enrichedMatches.length === 0) {
          toast.info("No strong matches found. Try adding more ingredients.");
        } else {
          toast.success(
            `Found ${enrichedMatches.length} pantry match${enrichedMatches.length === 1 ? "" : "es"}${
              usedGraph ? " (ingredient graph)" : ""
            }`
          );
        }
      }

      // Optional AI narrative — never blocks or re-enters the loading spinner
      if (!silent && localMatches.length > 0) {
        void (async () => {
          try {
            const topForAi = localMatches.slice(0, 20).map((m) => ({
              id: m.recipe.id,
              name: m.recipe.name,
              ingredients: m.recipe.ingredients,
              difficulty: m.recipe.difficulty,
              prep_time: m.recipe.prep_time,
              cook_time: m.recipe.cook_time,
            }));
            const invoke = supabase.functions.invoke("pantry-intelligence", {
              body: {
                mode: "match",
                pantryItems: prioritizedItems.map((item) => ({
                  ...item,
                  freshness: getFreshnessStatus(item.expires_at),
                })),
                recipes: topForAi,
              },
            });
            const timed = await Promise.race([
              invoke,
              new Promise<{ data: null }>((resolve) =>
                setTimeout(() => resolve({ data: null }), 8000)
              ),
            ]);
            const data = timed && "data" in timed ? timed.data : null;
            if (data?.insights && !data?.error) {
              setAiInsights(data.insights);
            }
            if (Array.isArray(data?.matches) && data.matches.length) {
              const byId = new Map(enrichedMatches.map((m) => [m.id, m]));
              const merged = data.matches
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- edge AI match payload
                .map((ai: any) => {
                  const base = byId.get(ai.recipeId);
                  if (!base) return null;
                  // Never let LLM mark Ready when local cookability said no.
                  const canCookNow =
                    base.canCookNow && (ai.canCookNow === undefined || ai.canCookNow === true)
                      ? true
                      : false;
                  return {
                    ...base,
                    matchScore: Math.max(base.matchScore, ai.matchScore || 0),
                    substitutionSuggestions:
                      ai.substitutionSuggestions?.length
                        ? ai.substitutionSuggestions
                        : base.substitutionSuggestions,
                    priority: ai.priority || base.priority,
                    priorityReason: ai.priorityReason || base.priorityReason,
                    canCookNow,
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
            // Local matches already shown
          }
        })();
      }
    } catch (error) {
      console.error("Pantry matching error:", error);
      if (!silent) toast.error("Failed to find recipe matches");
      setMatchLoading(false);
    }
  }, [pantryItems, pantryConstraints]);

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
    track(EVENTS.COOK_MODE_STARTED, {
      recipe_id: recipe.id,
      experiment_variant: experimentVariant,
      from: "pantry",
    });
  };

  const reportPantryCookConfirmed = (recipeId: string, meta?: Record<string, unknown>) => {
    track(EVENTS.PANTRY_COOK_CONFIRMED, {
      recipe_id: recipeId,
      experiment_variant: experimentVariant,
      household_id: householdId,
      ...meta,
    });
    track(EVENTS.COOK_MODE_COMPLETED, {
      recipe_id: recipeId,
      experiment_variant: experimentVariant,
      from: "pantry",
    });
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
      {(isOffline || usingOfflineSnapshot) && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          {isOffline
            ? "You're offline. Showing your last pantry snapshot — edits queue and sync when you reconnect."
            : "Showing a cached pantry snapshot after a network issue."}{" "}
          <Link to="/offline-recipes" className="underline font-medium">
            Offline mode
          </Link>
        </div>
      )}
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
                    <Button
                      size="sm"
                      onClick={() => findAIMatches({ jumpToResults: true })}
                      disabled={matchLoading}
                    >
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

          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Household pantry
                  {householdName ? (
                    <span className="font-normal text-muted-foreground">· {householdName}</span>
                  ) : null}
                </span>
                <Button asChild size="sm" variant="outline">
                  <Link to="/household">
                    <Home className="w-4 h-4 mr-2" />
                    Manage
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!householdName ? (
                <p className="text-sm text-muted-foreground">
                  Create or join a household to see shared ingredients from family members.
                </p>
              ) : sharedHouseholdItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No shared items from other members yet (or sharing is off).
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {sharedHouseholdItems.slice(0, 24).map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span className="font-medium">{item.ingredient_name}</span>
                      <span className="text-muted-foreground shrink-0">
                        {item.owner_name || "Member"}
                      </span>
                    </li>
                  ))}
                  {sharedHouseholdItems.length > 24 && (
                    <li className="text-muted-foreground">
                      +{sharedHouseholdItems.length - 24} more on Household
                    </li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Recipe Matching */}
        <TabsContent value="recipes" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Cookability constraints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Hard filters for Ready-to-cook. Allergies never become Ready. Set a time budget to hide long cooks.
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                {(pantryConstraints.allergies || []).map((a) => (
                  <Badge key={a} variant="secondary" className="gap-1">
                    {a}
                    <button
                      type="button"
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${a}`}
                      onClick={() => {
                        const next = {
                          ...pantryConstraints,
                          allergies: (pantryConstraints.allergies || []).filter((x) => x !== a),
                        };
                        setPantryConstraints(next);
                        savePantryConstraints(next);
                      }}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <Input
                  className="h-9 w-40"
                  placeholder="Add allergy…"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    const v = allergyInput.trim().toLowerCase();
                    if (!v) return;
                    const next = {
                      ...pantryConstraints,
                      allergies: [...new Set([...(pantryConstraints.allergies || []), v])],
                    };
                    setPantryConstraints(next);
                    savePantryConstraints(next);
                    setAllergyInput("");
                  }}
                />
                <div className="flex items-center gap-2 text-sm">
                  <label htmlFor="max-mins" className="text-muted-foreground">
                    Max minutes
                  </label>
                  <Input
                    id="max-mins"
                    type="number"
                    min={0}
                    className="h-9 w-24"
                    placeholder="Any"
                    value={pantryConstraints.maxTotalMinutes ?? ""}
                    onChange={(e) => {
                      const n = e.target.value === "" ? null : Number(e.target.value);
                      const next = {
                        ...pantryConstraints,
                        maxTotalMinutes: n != null && Number.isFinite(n) ? n : null,
                      };
                      setPantryConstraints(next);
                      savePantryConstraints(next);
                    }}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(pantryConstraints.equipment || []).includes("blender")}
                    onChange={(e) => {
                      const set = new Set(pantryConstraints.equipment || ["stove"]);
                      if (e.target.checked) set.add("blender");
                      else set.delete("blender");
                      set.add("stove");
                      const next = { ...pantryConstraints, equipment: [...set] };
                      setPantryConstraints(next);
                      savePantryConstraints(next);
                    }}
                  />
                  I have a blender
                </label>
              </div>
            </CardContent>
          </Card>
          <SmartRecipeMatch
            matches={recipeMatches}
            loading={matchLoading}
            onRefresh={() => findAIMatches({ jumpToResults: true })}
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
            if (selectedRecipe?.id) {
              reportPantryCookConfirmed(selectedRecipe.id, { close_source: "popup" });
            }
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
