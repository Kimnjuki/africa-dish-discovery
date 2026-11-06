import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Plus,
  Trash2,
  ExternalLink,
  Store,
  DollarSign,
  Sparkles,
  RefreshCw,
  Package
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShoppingItem {
  id: string;
  ingredient_name: string;
  checked: boolean;
  store_suggestion: string | null;
  affiliate_link: string | null;
  is_pantry_missing: boolean | null;
  added_at: string;
}

interface PriceComparison {
  store: string;
  price: string;
  link: string;
  logo?: string;
}

const STORE_SEARCHES = [
  { name: "Google Shopping", logo: "🔎" },
  { name: "Amazon", logo: "📦" },
  { name: "Jumia", logo: "🛒" },
];

const generateStoreSearches = (ingredient: string): PriceComparison[] => {
  const q = encodeURIComponent(ingredient);
  return [
    {
      store: STORE_SEARCHES[0].name,
      price: "Compare live",
      link: `https://www.google.com/search?tbm=shop&q=${q}`,
      logo: STORE_SEARCHES[0].logo,
    },
    {
      store: STORE_SEARCHES[1].name,
      price: "View listings",
      link: `https://www.amazon.com/s?k=${q}`,
      logo: STORE_SEARCHES[1].logo,
    },
    {
      store: STORE_SEARCHES[2].name,
      price: "View listings",
      link: `https://www.jumia.com/catalog/?q=${q}`,
      logo: STORE_SEARCHES[2].logo,
    },
  ];
};

interface SmartShoppingListProps {
  pantryItems: Array<{ ingredient_name: string }>;
  userId: string;
}

const SmartShoppingList = ({ pantryItems, userId }: SmartShoppingListProps) => {
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [priceComparisons, setPriceComparisons] = useState<Record<string, PriceComparison[]>>({});
  const [loadingPrices, setLoadingPrices] = useState<string | null>(null);

  useEffect(() => {
    loadShoppingList();
  }, [userId]);

  const loadShoppingList = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setShoppingItems(data || []);
    } catch (error) {
      console.error('Error loading shopping list:', error);
      toast.error("Failed to load shopping list");
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    const itemName = newItem.trim();
    if (!itemName) return;

    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .insert({
          ingredient_name: itemName,
          user_id: userId,
          checked: false
        });

      if (error) throw error;
      setNewItem("");
      loadShoppingList();
      toast.success(`Added ${itemName}`);
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error("Failed to add item");
    }
  };

  const toggleItem = async (id: string, checked: boolean) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ checked: !checked })
        .eq('id', id);

      if (error) throw error;
      setShoppingItems(items =>
        items.map(item =>
          item.id === id ? { ...item, checked: !checked } : item
        )
      );
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setShoppingItems(items => items.filter(item => item.id !== id));
      toast.success("Item removed");
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error("Failed to remove item");
    }
  };

  const generateFromPantry = async () => {
    // Find common ingredients that might be running low
    const commonStaples = [
      "rice", "oil", "salt", "pepper", "onion", "garlic", "tomato",
      "flour", "sugar", "eggs", "milk", "butter", "chicken", "fish"
    ];

    const pantryNames = pantryItems.map(p => p.ingredient_name.toLowerCase());
    const missing = commonStaples.filter(
      staple => !pantryNames.some(p => p.includes(staple))
    );

    if (missing.length === 0) {
      toast.info("Your pantry looks well-stocked!");
      return;
    }

    try {
      const itemsToAdd = missing.slice(0, 5).map(item => ({
        ingredient_name: item,
        user_id: userId,
        checked: false,
        is_pantry_missing: true
      }));

      const { error } = await supabase
        .from('shopping_list_items')
        .insert(itemsToAdd);

      if (error) throw error;
      loadShoppingList();
      toast.success(`Added ${itemsToAdd.length} suggested items`);
    } catch (error) {
      console.error('Error generating list:', error);
      toast.error("Failed to generate list");
    }
  };

  const fetchPriceComparison = async (itemName: string) => {
    if (priceComparisons[itemName]) {
      setSelectedItem(selectedItem === itemName ? null : itemName);
      return;
    }

    setLoadingPrices(itemName);
    const prices = generateStoreSearches(itemName);
    setPriceComparisons(prev => ({ ...prev, [itemName]: prices }));
    setSelectedItem(itemName);
    setLoadingPrices(null);
  };

  const clearChecked = async () => {
    const checkedIds = shoppingItems.filter(i => i.checked).map(i => i.id);
    if (checkedIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .in('id', checkedIds);

      if (error) throw error;
      setShoppingItems(items => items.filter(i => !i.checked));
      toast.success(`Removed ${checkedIds.length} items`);
    } catch (error) {
      console.error('Error clearing items:', error);
      toast.error("Failed to clear items");
    }
  };

  const uncheckedItems = shoppingItems.filter(i => !i.checked);
  const checkedItems = shoppingItems.filter(i => i.checked);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Smart Shopping List ({shoppingItems.length})
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={generateFromPantry}>
              <Sparkles className="w-4 h-4 mr-2" />
              Suggest Items
            </Button>
            {checkedItems.length > 0 && (
              <Button size="sm" variant="outline" onClick={clearChecked}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Done ({checkedItems.length})
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Item */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Add item to shopping list..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <Button onClick={addItem} disabled={!newItem.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {shoppingItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Your shopping list is empty</p>
            <Button variant="link" onClick={generateFromPantry} className="mt-2">
              Generate suggestions from your pantry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unchecked Items */}
            {uncheckedItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">To Buy</h4>
                {uncheckedItems.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => toggleItem(item.id, item.checked)}
                      />
                      <span className="flex-1 font-medium capitalize">
                        {item.ingredient_name}
                      </span>
                      {item.is_pantry_missing && (
                        <Badge variant="secondary" className="text-xs">
                          <Package className="w-3 h-3 mr-1" />
                          Pantry
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => fetchPriceComparison(item.ingredient_name)}
                        disabled={loadingPrices === item.ingredient_name}
                      >
                        {loadingPrices === item.ingredient_name ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <DollarSign className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Price Comparison Panel */}
                    {selectedItem === item.ingredient_name && priceComparisons[item.ingredient_name] && (
                      <div className="ml-8 p-3 rounded-lg bg-muted/30 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Store className="w-4 h-4" />
                          Price Comparison
                        </div>
                        <div className="grid gap-2">
                          {priceComparisons[item.ingredient_name]
                            .sort((a, b) => parseFloat(a.price.slice(1)) - parseFloat(b.price.slice(1)))
                            .map((price, idx) => (
                              <a
                                key={idx}
                                href={price.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2 rounded bg-background hover:bg-accent transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{price.logo}</span>
                                  <span className="text-sm">{price.store}</span>
                                  {idx === 0 && (
                                    <Badge variant="default" className="text-xs">Best</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${idx === 0 ? 'text-green-600' : ''}`}>
                                    {price.price}
                                  </span>
                                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                </div>
                              </a>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          * Prices are estimates. Click to view actual prices.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Checked Items */}
            {checkedItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Done</h4>
                {checkedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border opacity-60"
                  >
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => toggleItem(item.id, item.checked)}
                    />
                    <span className="flex-1 line-through capitalize">
                      {item.ingredient_name}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartShoppingList;
