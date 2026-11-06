import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Trash2,
  Edit2,
  Calendar,
  Package,
  ChevronDown,
  LayoutGrid,
  List,
  Layers,
  Refrigerator,
  Search,
  SortAsc
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PantryItemWithExpiry,
  FreshnessIndicator,
  FreshnessProgressBar,
  ExpirationSummary,
  getFreshnessStatus
} from "./ExpirationTracker";

type ViewMode = 'grid' | 'category' | 'storage' | 'list';
type SortOption = 'name' | 'expiry' | 'recent' | 'category';

const CATEGORIES = [
  { id: 'vegetables', name: 'Vegetables', emoji: '🥬' },
  { id: 'fruits', name: 'Fruits', emoji: '🍎' },
  { id: 'proteins', name: 'Proteins', emoji: '🍗' },
  { id: 'grains', name: 'Grains & Starches', emoji: '🍚' },
  { id: 'spices', name: 'Spices & Seasonings', emoji: '🌶️' },
  { id: 'dairy', name: 'Dairy & Eggs', emoji: '🥛' },
  { id: 'oils', name: 'Oils & Condiments', emoji: '🫒' },
  { id: 'legumes', name: 'Legumes & Beans', emoji: '🫘' },
  { id: 'herbs', name: 'Fresh Herbs', emoji: '🌿' },
  { id: 'frozen', name: 'Frozen Items', emoji: '🧊' },
  { id: 'canned', name: 'Canned Goods', emoji: '🥫' },
  { id: 'baking', name: 'Baking Supplies', emoji: '🧁' },
  { id: 'other', name: 'Other', emoji: '📦' }
];

const STORAGE_LOCATIONS = [
  { id: 'fridge', name: 'Refrigerator', emoji: '🥶', icon: Refrigerator },
  { id: 'freezer', name: 'Freezer', emoji: '🧊', icon: Package },
  { id: 'pantry', name: 'Pantry/Cupboard', emoji: '🗄️', icon: Layers },
  { id: 'counter', name: 'Counter/Basket', emoji: '🍎', icon: Package }
];

// Simple category detection based on ingredient name
const detectCategory = (name: string): string => {
  const lowered = name.toLowerCase();
  
  if (/tomato|onion|pepper|carrot|spinach|kale|lettuce|cabbage|broccoli|okra|eggplant/.test(lowered)) return 'vegetables';
  if (/apple|banana|orange|mango|lemon|lime|pineapple|plantain|coconut/.test(lowered)) return 'fruits';
  if (/chicken|beef|fish|shrimp|egg|meat|pork|lamb|goat|crayfish/.test(lowered)) return 'proteins';
  if (/rice|flour|yam|cassava|potato|bread|pasta|couscous|fufu/.test(lowered)) return 'grains';
  if (/salt|pepper|cumin|curry|paprika|thyme|bay|bouillon|maggi|stock/.test(lowered)) return 'spices';
  if (/milk|cheese|yogurt|cream|butter/.test(lowered)) return 'dairy';
  if (/oil|palm|olive|vinegar|sauce|mayo/.test(lowered)) return 'oils';
  if (/bean|lentil|chickpea|groundnut|peanut/.test(lowered)) return 'legumes';
  if (/basil|parsley|cilantro|mint|scent/.test(lowered)) return 'herbs';
  
  return 'other';
};

interface VisualPantryGridProps {
  items: PantryItemWithExpiry[];
  onRemove: (id: string) => void;
  onEdit: (item: PantryItemWithExpiry) => void;
  onSetExpiry: (id: string, date: string) => void;
}

const VisualPantryGrid = ({ items, onRemove, onEdit, onSetExpiry }: VisualPantryGridProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('expiry');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Filter items
  const filteredItems = items.filter(item =>
    item.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'expiry':
        if (!a.expires_at && !b.expires_at) return 0;
        if (!a.expires_at) return 1;
        if (!b.expires_at) return -1;
        return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
      case 'name':
        return a.ingredient_name.localeCompare(b.ingredient_name);
      case 'category':
        return detectCategory(a.ingredient_name).localeCompare(detectCategory(b.ingredient_name));
      default:
        return 0;
    }
  });

  // Group by category
  const itemsByCategory = sortedItems.reduce((acc, item) => {
    const category = item.category || detectCategory(item.ingredient_name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, PantryItemWithExpiry[]>);

  // Group by storage location
  const itemsByStorage = sortedItems.reduce((acc, item) => {
    const storage = item.storage_location || 'pantry';
    if (!acc[storage]) acc[storage] = [];
    acc[storage].push(item);
    return acc;
  }, {} as Record<string, PantryItemWithExpiry[]>);

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const renderItemCard = (item: PantryItemWithExpiry, compact = false) => {
    const { status } = getFreshnessStatus(item.expires_at);
    const borderColors = {
      expired: 'border-destructive/50',
      urgent: 'border-orange-400/50',
      soon: 'border-yellow-400/50',
      fresh: 'border-green-400/50',
      unknown: 'border-border'
    };

    return (
      <Card
        key={item.id}
        className={cn(
          "group relative overflow-hidden transition-all hover:shadow-md",
          borderColors[status],
          compact ? "border-l-4" : "border-t-4"
        )}
      >
        <CardContent className={cn("p-3", compact && "py-2")}>
          {/* Ingredient Image Placeholder */}
          {!compact && (
            <div className="w-full h-16 rounded-md bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-2 text-2xl">
              {CATEGORIES.find(c => c.id === detectCategory(item.ingredient_name))?.emoji || '🥘'}
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{item.ingredient_name}</h4>
              {item.quantity && item.unit && (
                <p className="text-xs text-muted-foreground">
                  {item.quantity} {item.unit}
                </p>
              )}
            </div>
            {compact && <FreshnessIndicator expiresAt={item.expires_at} showText={false} />}
          </div>

          {!compact && (
            <>
              <FreshnessProgressBar expiresAt={item.expires_at} />
              <div className="mt-2">
                <FreshnessIndicator expiresAt={item.expires_at} />
              </div>
            </>
          )}

          {/* Quick Actions */}
          <div className={cn(
            "flex gap-1 mt-2",
            compact ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
          )}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => {
                const date = prompt('Enter expiry date (YYYY-MM-DD):');
                if (date) onSetExpiry(item.id, date);
              }}
            >
              <Calendar className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => onEdit(item)}
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-destructive hover:text-destructive"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Expiration Summary */}
      <ExpirationSummary items={items} />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex border rounded-lg overflow-hidden">
          {[
            { mode: 'grid' as ViewMode, icon: LayoutGrid, label: 'Grid' },
            { mode: 'category' as ViewMode, icon: Layers, label: 'Category' },
            { mode: 'storage' as ViewMode, icon: Refrigerator, label: 'Storage' },
            { mode: 'list' as ViewMode, icon: List, label: 'List' }
          ].map(({ mode, icon: Icon, label }) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none h-9"
              onClick={() => setViewMode(mode)}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SortAsc className="w-4 h-4" />
              Sort
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy('expiry')}>
              By Expiry Date
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('name')}>
              Alphabetical
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('category')}>
              By Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          {searchQuery ? (
            <p>No ingredients match "{searchQuery}"</p>
          ) : (
            <p>Your pantry is empty. Start adding ingredients!</p>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {sortedItems.map(item => renderItemCard(item))}
        </div>
      )}

      {/* Category View */}
      {viewMode === 'category' && filteredItems.length > 0 && (
        <div className="space-y-4">
          {CATEGORIES.filter(cat => itemsByCategory[cat.id]?.length > 0).map(category => (
            <div key={category.id} className="border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <span className="flex items-center gap-2 font-medium">
                  <span className="text-lg">{category.emoji}</span>
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {itemsByCategory[category.id].length}
                  </Badge>
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    collapsedCategories.has(category.id) && "rotate-180"
                  )}
                />
              </button>
              {!collapsedCategories.has(category.id) && (
                <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {itemsByCategory[category.id].map(item => renderItemCard(item, true))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Storage Location View */}
      {viewMode === 'storage' && filteredItems.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {STORAGE_LOCATIONS.map(location => (
            <Card key={location.id} className="overflow-hidden">
              <div className="p-3 bg-muted/30 flex items-center gap-2">
                <span className="text-xl">{location.emoji}</span>
                <span className="font-medium">{location.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  {itemsByStorage[location.id]?.length || 0}
                </Badge>
              </div>
              <CardContent className="p-3">
                {itemsByStorage[location.id]?.length > 0 ? (
                  <div className="space-y-2">
                    {itemsByStorage[location.id].map(item => renderItemCard(item, true))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No items in {location.name.toLowerCase()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredItems.length > 0 && (
        <div className="space-y-2">
          {sortedItems.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {CATEGORIES.find(c => c.id === detectCategory(item.ingredient_name))?.emoji || '🥘'}
                </span>
                <div>
                  <p className="font-medium">{item.ingredient_name}</p>
                  {item.quantity && item.unit && (
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FreshnessIndicator expiresAt={item.expires_at} />
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisualPantryGrid;
