import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Leaf,
  DollarSign,
  ChefHat,
  Package,
  Flame,
  Award,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PantryItemWithExpiry, getFreshnessStatus } from "./ExpirationTracker";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface PantryAnalyticsProps {
  items: PantryItemWithExpiry[];
  cookingHistory?: { ingredient: string; count: number }[];
}

// Estimated prices for common ingredients (in cents)
const INGREDIENT_PRICES: Record<string, number> = {
  tomato: 50, tomatoes: 150, onion: 30, onions: 100, garlic: 20,
  rice: 200, chicken: 500, beef: 800, fish: 600, eggs: 300,
  milk: 200, flour: 150, oil: 300, salt: 50, pepper: 100,
  plantain: 100, yam: 250, cassava: 200, beans: 300,
  default: 100
};

const estimatePrice = (name: string): number => {
  const lowered = name.toLowerCase();
  for (const [key, price] of Object.entries(INGREDIENT_PRICES)) {
    if (lowered.includes(key)) return price;
  }
  return INGREDIENT_PRICES.default;
};

const PantryAnalytics = ({ items, cookingHistory = [] }: PantryAnalyticsProps) => {
  const [wasteScore, setWasteScore] = useState(0);

  // Calculate freshness distribution
  const freshnessData = items.reduce((acc, item) => {
    const { status } = getFreshnessStatus(item.expires_at);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Fresh', value: freshnessData.fresh || 0, color: '#22c55e' },
    { name: 'Soon', value: freshnessData.soon || 0, color: '#eab308' },
    { name: 'Urgent', value: freshnessData.urgent || 0, color: '#f97316' },
    { name: 'Expired', value: freshnessData.expired || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Calculate pantry value
  const totalValue = items.reduce((sum, item) => {
    const price = estimatePrice(item.ingredient_name);
    const qty = item.quantity || 1;
    return sum + (price * qty);
  }, 0);

  // Calculate waste reduction score
  useEffect(() => {
    const total = items.length;
    if (total === 0) {
      setWasteScore(100);
      return;
    }
    const expired = freshnessData.expired || 0;
    const fresh = freshnessData.fresh || 0;
    const score = Math.round(((total - expired) / total) * 100);
    setWasteScore(score);
  }, [items, freshnessData]);

  // Detect ingredient categories for insights
  const categoryCount = items.reduce((acc, item) => {
    const name = item.ingredient_name.toLowerCase();
    if (/vegetable|tomato|onion|pepper|carrot|spinach|okra/.test(name)) acc.vegetables = (acc.vegetables || 0) + 1;
    else if (/fruit|apple|banana|mango|plantain/.test(name)) acc.fruits = (acc.fruits || 0) + 1;
    else if (/chicken|beef|fish|meat|egg/.test(name)) acc.proteins = (acc.proteins || 0) + 1;
    else if (/rice|flour|yam|cassava|bread/.test(name)) acc.grains = (acc.grains || 0) + 1;
    else if (/salt|pepper|cumin|curry|spice/.test(name)) acc.spices = (acc.spices || 0) + 1;
    else acc.other = (acc.other || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryBarData = Object.entries(categoryCount).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: value
  })).sort((a, b) => b.count - a.count);

  // Most used ingredients (mock data for now - would come from cooking history)
  const mostUsedIngredients = cookingHistory.length > 0 
    ? cookingHistory.slice(0, 5) 
    : items.slice(0, 5).map(i => ({ ingredient: i.ingredient_name, count: Math.floor(Math.random() * 10) + 1 }));

  // Cooking insights
  const getInsights = () => {
    const insights = [];
    
    if (freshnessData.urgent && freshnessData.urgent > 0) {
      insights.push({
        type: 'warning',
        icon: Flame,
        text: `${freshnessData.urgent} item(s) need to be used within 2 days!`
      });
    }
    
    if (freshnessData.expired && freshnessData.expired > 0) {
      insights.push({
        type: 'error',
        icon: TrendingDown,
        text: `${freshnessData.expired} item(s) have expired. Consider removing them.`
      });
    }
    
    if (categoryCount.proteins && categoryCount.vegetables) {
      insights.push({
        type: 'success',
        icon: ChefHat,
        text: 'Your pantry is balanced for complete meals!'
      });
    }
    
    if (wasteScore >= 90) {
      insights.push({
        type: 'success',
        icon: Award,
        text: 'Excellent! You\'re a waste reduction champion!'
      });
    }
    
    if (items.length < 10) {
      insights.push({
        type: 'info',
        icon: Package,
        text: 'Add more items to get better recipe suggestions.'
      });
    }

    return insights;
  };

  const insights = getInsights();

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No Analytics Yet</h3>
          <p className="text-muted-foreground">Add items to your pantry to see analytics and insights.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Waste Reduction Score */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Waste Score</span>
            </div>
            <div className="flex items-end gap-2">
              <span className={cn(
                "text-3xl font-bold",
                wasteScore >= 80 ? "text-green-500" : 
                wasteScore >= 50 ? "text-yellow-500" : "text-red-500"
              )}>
                {wasteScore}%
              </span>
              {wasteScore >= 80 && <TrendingUp className="w-4 h-4 text-green-500 mb-1" />}
            </div>
            <Progress 
              value={wasteScore} 
              className={cn(
                "h-2 mt-2",
                wasteScore >= 80 ? "[&>div]:bg-green-500" : 
                wasteScore >= 50 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500"
              )} 
            />
          </CardContent>
        </Card>

        {/* Pantry Value */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Pantry Value</span>
            </div>
            <div className="text-3xl font-bold text-primary">
              ${(totalValue / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated total value
            </p>
          </CardContent>
        </Card>

        {/* Total Items */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Items</span>
            </div>
            <div className="text-3xl font-bold">
              {items.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In your pantry
            </p>
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Expiring Soon</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">
              {(freshnessData.urgent || 0) + (freshnessData.soon || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use within 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Freshness Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Freshness Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="flex items-center">
                <ResponsiveContainer width="50%" height={150}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }} 
                      />
                      <span className="text-sm">{entry.name}</span>
                      <span className="text-sm font-medium ml-auto">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data</p>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={categoryBarData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cooking Insights */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            Cooking Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight, i) => {
                const Icon = insight.icon;
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg",
                      insight.type === 'error' ? "bg-destructive/10 text-destructive" :
                      insight.type === 'warning' ? "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400" :
                      insight.type === 'success' ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" :
                      "bg-muted"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{insight.text}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Add more items to see insights.</p>
          )}
        </CardContent>
      </Card>

      {/* Most Used Ingredients */}
      {mostUsedIngredients.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Most Used Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mostUsedIngredients.map((item, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {item.ingredient}
                  <span className="text-xs opacity-60">×{item.count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PantryAnalytics;
