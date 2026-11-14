import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Receipt,
  AlertCircle,
} from "lucide-react";
import {
  MARKET_ORDER,
  MARKETS,
  formatMoney,
  getMarketPreference,
  getWeeklyBudgetPreference,
  setMarketPreference,
  setWeeklyBudgetPreference,
  type MarketId,
} from "@/lib/localMarket";

interface BudgetTrackerProps {
  weeklyBudget?: number;
  spent?: number;
  plannedCost?: number;
  marketId?: MarketId;
  onBudgetChange?: (budget: number, marketId: MarketId) => void;
  onMarketChange?: (marketId: MarketId) => void;
}

export const BudgetTracker = ({
  weeklyBudget: weeklyBudgetProp,
  spent = 0,
  plannedCost = 0,
  marketId: marketProp,
  onBudgetChange,
  onMarketChange,
}: BudgetTrackerProps) => {
  const [marketId, setMarketId] = useState<MarketId>(
    () => marketProp || getMarketPreference()
  );
  const [weeklyBudget, setWeeklyBudget] = useState(
    () => weeklyBudgetProp ?? getWeeklyBudgetPreference(marketId)
  );
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(weeklyBudget);

  useEffect(() => {
    if (marketProp) setMarketId(marketProp);
  }, [marketProp]);

  useEffect(() => {
    if (weeklyBudgetProp != null) {
      setWeeklyBudget(weeklyBudgetProp);
      setNewBudget(weeklyBudgetProp);
    }
  }, [weeklyBudgetProp]);

  const remaining = weeklyBudget - spent;
  const percentSpent =
    weeklyBudget > 0 ? Math.round((spent / weeklyBudget) * 100) : 0;
  const percentPlanned =
    weeklyBudget > 0 ? Math.round((plannedCost / weeklyBudget) * 100) : 0;

  const getStatusColor = () => {
    if (percentSpent > 100) return "text-red-500";
    if (percentSpent > 80) return "text-amber-500";
    return "text-green-500";
  };

  const saveBudget = () => {
    if (newBudget > 0) {
      setWeeklyBudget(newBudget);
      setWeeklyBudgetPreference(newBudget, marketId);
      onBudgetChange?.(newBudget, marketId);
    }
    setEditingBudget(false);
  };

  const handleMarketChange = (id: MarketId) => {
    setMarketId(id);
    setMarketPreference(id);
    const next = getWeeklyBudgetPreference(id);
    setWeeklyBudget(next);
    setNewBudget(next);
    onMarketChange?.(id);
    onBudgetChange?.(next, id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-green-500" />
            Budget Tracker
          </span>
          <Badge variant={percentSpent > 100 ? "destructive" : "outline"}>
            {percentSpent}% used
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Market</Label>
          <Select value={marketId} onValueChange={(v) => handleMarketChange(v as MarketId)}>
            <SelectTrigger aria-label="Budget market">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MARKET_ORDER.map((id) => (
                <SelectItem key={id} value={id}>
                  {MARKETS[id].label} ({MARKETS[id].currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Weekly Budget</Label>
            {!editingBudget ? (
              <Button variant="ghost" size="sm" onClick={() => setEditingBudget(true)}>
                Edit
              </Button>
            ) : null}
          </div>

          {editingBudget ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {MARKETS[marketId].symbol}
                </span>
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(parseFloat(e.target.value) || 0)}
                  className="pl-10"
                />
              </div>
              <Button size="sm" onClick={saveBudget}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setNewBudget(weeklyBudget);
                  setEditingBudget(false);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="text-3xl font-bold text-primary">
              {formatMoney(weeklyBudget, marketId)}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Receipt className="w-4 h-4" />
              Spent
            </span>
            <span className={`font-medium ${getStatusColor()}`}>
              {formatMoney(spent, marketId)}
            </span>
          </div>
          <Progress value={Math.min(percentSpent, 100)} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-500/10 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Remaining</span>
            </div>
            <div
              className={`text-2xl font-bold ${
                remaining >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {formatMoney(Math.abs(remaining), marketId)}
              {remaining < 0 && " over"}
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Planned list</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {formatMoney(plannedCost, marketId)}
            </div>
          </div>
        </div>

        {percentPlanned > 100 && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong>Budget alert:</strong> Your grocery estimate exceeds the weekly
              budget by {formatMoney(plannedCost - weeklyBudget, marketId)}. Swap
              expensive items or trim the plan.
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Daily average</Label>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Target</span>
            <span className="font-medium">
              {formatMoney(weeklyBudget / 7, marketId)}/day
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">From list</span>
            <span
              className={`font-medium ${
                plannedCost / 7 > weeklyBudget / 7 ? "text-red-500" : "text-green-500"
              }`}
            >
              {formatMoney(plannedCost / 7, marketId)}/day
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
