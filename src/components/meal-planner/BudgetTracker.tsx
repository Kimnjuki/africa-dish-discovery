import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PiggyBank,
  Receipt,
  AlertCircle
} from "lucide-react";

interface BudgetTrackerProps {
  weeklyBudget: number;
  spent: number;
  plannedCost: number;
  onBudgetChange?: (budget: number) => void;
}

export const BudgetTracker = ({ 
  weeklyBudget, 
  spent, 
  plannedCost,
  onBudgetChange 
}: BudgetTrackerProps) => {
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(weeklyBudget);

  const remaining = weeklyBudget - spent;
  const percentSpent = Math.round((spent / weeklyBudget) * 100);
  const percentPlanned = Math.round((plannedCost / weeklyBudget) * 100);

  const getStatusColor = () => {
    if (percentSpent > 100) return "text-red-500";
    if (percentSpent > 80) return "text-amber-500";
    return "text-green-500";
  };

  const saveBudget = () => {
    if (onBudgetChange && newBudget > 0) {
      onBudgetChange(newBudget);
    }
    setEditingBudget(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
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
        {/* Weekly Budget */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Weekly Budget</Label>
            {!editingBudget ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setEditingBudget(true)}
              >
                Edit
              </Button>
            ) : null}
          </div>
          
          {editingBudget ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(parseFloat(e.target.value) || 0)}
                  className="pl-8"
                />
              </div>
              <Button size="sm" onClick={saveBudget}>Save</Button>
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
              ${weeklyBudget.toFixed(2)}
            </div>
          )}
        </div>

        {/* Spending Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Receipt className="w-4 h-4" />
              Spent
            </span>
            <span className={`font-medium ${getStatusColor()}`}>
              ${spent.toFixed(2)}
            </span>
          </div>
          <Progress value={Math.min(percentSpent, 100)} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-500/10 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Remaining</span>
            </div>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${Math.abs(remaining).toFixed(2)}
              {remaining < 0 && ' over'}
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Planned</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">
              ${plannedCost.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Warning if over budget */}
        {percentPlanned > 100 && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong>Budget Alert:</strong> Your planned meals exceed your weekly budget by ${(plannedCost - weeklyBudget).toFixed(2)}. Consider adjusting your meal plan.
            </div>
          </div>
        )}

        {/* Daily Breakdown */}
        <div className="space-y-2">
          <Label>Daily Average</Label>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Target</span>
            <span className="font-medium">${(weeklyBudget / 7).toFixed(2)}/day</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Actual</span>
            <span className={`font-medium ${spent / 7 > weeklyBudget / 7 ? 'text-red-500' : 'text-green-500'}`}>
              ${(spent / 7).toFixed(2)}/day
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
