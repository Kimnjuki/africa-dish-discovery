import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChefHat, Clock, Users, Star, Play, Pause, RotateCcw, 
  Volume2, VolumeX, Minus, Plus, CheckCircle2, AlertTriangle,
  ShoppingCart, Utensils, Timer, ChevronLeft, ChevronRight,
  Lightbulb, Thermometer, Mic, MicOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import cookingStepsHero from "@/assets/cooking-steps-hero.jpg";
import type { CookableRecipe, IngredientValue, StepValue } from "@/types/content";
import type { User } from "@supabase/supabase-js";

interface ChecklistItem {
  id: string;
  name: string;
  completed: boolean;
  category: 'ingredient' | 'equipment' | 'prep';
  available?: boolean;
}

interface CookingStep {
  number: number;
  instruction: string;
  duration?: number;
  temperature?: string;
  tips?: string[];
  completed: boolean;
}

const CookingPopup = ({ recipe, isOpen, onClose }: {
  recipe: CookableRecipe | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  // Core state
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [servings, setServings] = useState(recipe?.servings || 4);
  
  // Checklist states
  const [ingredientChecklist, setIngredientChecklist] = useState<ChecklistItem[]>([]);
  const [equipmentChecklist, setEquipmentChecklist] = useState<ChecklistItem[]>([]);
  const [prepChecklist, setPrepChecklist] = useState<ChecklistItem[]>([]);
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([]);
  
  // User and pantry states
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState<'checklist' | 'cooking'>('checklist');
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  
  const { toast } = useToast();

  // Initialize checklists when recipe or pantry changes
  useEffect(() => {
    if (recipe && isOpen) {
      loadUserPantry();
    }
  }, [recipe, isOpen]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer && isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev && prev > 1) {
            return prev - 1;
          } else {
            setIsTimerActive(false);
            toast({
              title: "Timer Complete!",
              description: "Time's up for this step.",
            });
            if (voiceEnabled) {
              speakText("Timer complete");
            }
            return 0;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, isTimerActive, voiceEnabled, toast]);

  // Load user's pantry items
  const loadUserPantry = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        initializeChecklists();
        return;
      }
      
      setUser(session.user);
      
      const { data: pantryData, error } = await supabase
        .from('pantry_items')
        .select('ingredient_name')
        .eq('user_id', session.user.id);

      if (error) throw error;
      
      const pantryNames = pantryData?.map(item => item.ingredient_name.toLowerCase()) || [];
      setPantryItems(pantryNames);
      
      // Update ingredient checklist after loading pantry
      if (recipe) {
        initializeChecklists();
      }
    } catch (error) {
      console.error('Error loading pantry:', error);
    }
  };

  const initializeChecklists = useCallback(() => {
    if (!recipe) return;
    
    // Initialize ingredient checklist
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const ingredientItems: ChecklistItem[] = ingredients.map((ingredient: IngredientValue, index: number) => {
      // Handle both string and object ingredient formats
      let ingredientDisplay = '';
      let ingredientName = '';
      
      if (typeof ingredient === 'string') {
        ingredientDisplay = ingredient;
        ingredientName = ingredient.toLowerCase().replace(/^\d+\s*(cups?|tbsp?|tsp?|oz|lbs?|g|kg|ml|l)\s+/i, '').trim();
      } else if (ingredient && typeof ingredient === 'object') {
        // Format: {name: "ingredient", amount: "2", unit: "cups"}
        const amount = ingredient.amount || '';
        const unit = ingredient.unit || '';
        const name = ingredient.name || '';
        ingredientDisplay = `${amount} ${unit} ${name}`.trim();
        ingredientName = name.toLowerCase();
      } else {
        ingredientDisplay = String(ingredient);
        ingredientName = String(ingredient).toLowerCase();
      }
        
      const isAvailable = pantryItems.some(pantryItem => {
        const cleanPantryItem = pantryItem.replace(/[^a-z\s]/g, '').trim();
        const cleanIngredient = ingredientName.replace(/[^a-z\s]/g, '').trim();
        return cleanPantryItem.includes(cleanIngredient) || 
               cleanIngredient.includes(cleanPantryItem) ||
               cleanIngredient.split(' ').some(word => 
                 word.length > 2 && cleanPantryItem.includes(word)
               );
      });
      
      return {
        id: `ingredient-${index}`,
        name: ingredientDisplay,
        completed: false,
        available: isAvailable,
        category: 'ingredient' as const
      };
    });
    
    setIngredientChecklist(ingredientItems);
    
    // Set missing ingredients for shopping list
    const missing = ingredientItems.filter(item => !item.available).map(item => item.name);
    setMissingIngredients(missing);
    
    // Initialize equipment checklist
    const equipment = [
      'Large pot or Dutch oven',
      'Wooden spoon',
      'Cutting board',
      'Sharp knife',
      'Measuring cups',
      'Measuring spoons'
    ];
    
    const equipmentItems: ChecklistItem[] = equipment.map((item, index) => ({
      id: `equipment-${index}`,
      name: item,
      completed: false,
      category: 'equipment' as const
    }));
    
    setEquipmentChecklist(equipmentItems);
    
    // Initialize prep checklist
    const prepTasks = [
      'Wash hands thoroughly',
      'Clean work surface',
      'Gather all ingredients',
      'Prepare mise en place',
      'Preheat cooking equipment'
    ];
    
    const prepItems: ChecklistItem[] = prepTasks.map((task, index) => ({
      id: `prep-${index}`,
      name: task,
      completed: false,
      category: 'prep' as const
    }));
    
    setPrepChecklist(prepItems);
    
    // Initialize cooking steps
    const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
    const cookingStepItems: CookingStep[] = steps.map((step: StepValue, index: number) => {
      // Handle both string and object step formats
      let instruction = '';
      if (typeof step === 'string') {
        instruction = step;
      } else if (step && typeof step === 'object') {
        instruction = String(step.instruction || step.description || step.step || "");
      } else {
        instruction = String(step);
      }
      
      return {
        number: index + 1,
        instruction,
        completed: false,
        duration: typeof step === "object" && (step.duration != null || step.time != null)
          ? Number(step.duration ?? step.time) || undefined
          : undefined,
        temperature: typeof step === 'object' ? step.temperature : undefined,
        tips: typeof step === 'object' && step.tips ? step.tips : []
      };
    });
    
    setCookingSteps(cookingStepItems);
  }, [recipe, pantryItems]);

  // Checklist toggle functions
  const toggleChecklistItem = (category: 'ingredient' | 'equipment' | 'prep', id: string) => {
    const setterMap = {
      ingredient: setIngredientChecklist,
      equipment: setEquipmentChecklist,
      prep: setPrepChecklist
    };
    
    const setter = setterMap[category];
    setter(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
    
    // Voice feedback
    if (voiceEnabled) {
      const item = [...ingredientChecklist, ...equipmentChecklist, ...prepChecklist]
        .find(item => item.id === id);
      if (item) {
        const message = item.completed ? `${item.name} unchecked` : `${item.name} checked`;
        speakText(message);
      }
    }
  };

  const toggleCookingStep = (stepNumber: number) => {
    setCookingSteps(prev => 
      prev.map(step => 
        step.number === stepNumber ? { ...step, completed: !step.completed } : step
      )
    );
    
    // Voice feedback
    if (voiceEnabled) {
      const step = cookingSteps.find(s => s.number === stepNumber);
      if (step) {
        const message = step.completed ? `Step ${stepNumber} uncompleted` : `Step ${stepNumber} completed`;
        speakText(message);
      }
    }
  };

  // Shopping list functionality
  const addToShoppingList = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to shopping list",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const missingItems = missingIngredients.map(ingredient => ({
        ingredient_name: ingredient,
        user_id: user.id,
        recipe_id: recipe.id
      }));

      const { error } = await supabase
        .from('shopping_list_items')
        .insert(missingItems);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${missingItems.length} ingredients added to shopping list`,
      });
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      toast({
        title: "Error",
        description: "Failed to add ingredients to shopping list",
        variant: "destructive"
      });
    }
  };

  // Progress calculations
  const getChecklistProgress = () => {
    const allItems = [...ingredientChecklist, ...equipmentChecklist, ...prepChecklist];
    const completed = allItems.filter(item => item.completed).length;
    return allItems.length > 0 ? (completed / allItems.length) * 100 : 0;
  };

  const getCookingProgress = () => {
    const completed = cookingSteps.filter(step => step.completed).length;
    return cookingSteps.length > 0 ? (completed / cookingSteps.length) * 100 : 0;
  };

  const isReadyToCook = () => {
    const ingredientsReady = ingredientChecklist.every(item => item.completed || item.available);
    const equipmentReady = equipmentChecklist.every(item => item.completed);
    const prepReady = prepChecklist.every(item => item.completed);
    return ingredientsReady && equipmentReady && prepReady;
  };

  // Timer functions
  const startTimer = (minutes: number) => {
    setTimer(minutes * 60);
    setIsTimerActive(true);
    if (voiceEnabled) {
      speakText(`Timer started for ${minutes} minutes`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Voice synthesis
  const speakText = (text: string) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen || !recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
        {/* Header with Hero Image */}
        <div 
          className="relative h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${cookingStepsHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
          <div className="relative p-6 h-full flex flex-col justify-end">
            <DialogTitle className="text-white text-2xl font-bold mb-2">
              {recipe.name}
            </DialogTitle>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{servings} servings</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{recipe.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-background">
          <Button
            variant={activeTab === 'checklist' ? 'default' : 'ghost'}
            className="rounded-none border-0"
            onClick={() => setActiveTab('checklist')}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Preparation Checklist
          </Button>
          <Button
            variant={activeTab === 'cooking' ? 'default' : 'ghost'}
            className="rounded-none border-0"
            onClick={() => setActiveTab('cooking')}
            disabled={!isReadyToCook()}
          >
            <Utensils className="w-4 h-4 mr-2" />
            Start Cooking
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          {activeTab === 'checklist' && (
            <div className="space-y-8">
              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Preparation Progress</h3>
                    <Badge variant={isReadyToCook() ? 'default' : 'secondary'}>
                      {Math.round(getChecklistProgress())}% Complete
                    </Badge>
                  </div>
                  <Progress value={getChecklistProgress()} className="mt-2" />
                </CardHeader>
              </Card>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                  >
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    {voiceEnabled ? 'Voice On' : 'Voice Off'}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServings(Math.max(1, servings - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium px-2">{servings} servings</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServings(servings + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMissingOnly(!showMissingOnly)}
                  >
                    {showMissingOnly ? 'Show All' : 'Show Missing Only'}
                  </Button>
                  
                  {missingIngredients.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addToShoppingList}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add Missing to Cart
                    </Button>
                  )}
                </div>
              </div>

              {/* Ingredients Checklist */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Utensils className="w-5 h-5" />
                      Ingredients ({ingredientChecklist.filter(item => item.completed).length}/{ingredientChecklist.length})
                    </h3>
                    <Badge variant={missingIngredients.length === 0 ? 'default' : 'destructive'}>
                      {missingIngredients.length === 0 ? 'All Available' : `${missingIngredients.length} Missing`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ingredientChecklist
                    .filter(ingredient => !showMissingOnly || !ingredient.available)
                    .map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        ingredient.available 
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
                          : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
                      }`}
                    >
                      <Checkbox
                        checked={ingredient.completed}
                        onCheckedChange={() => toggleChecklistItem('ingredient', ingredient.id)}
                      />
                      <span className={`flex-1 ${ingredient.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {String(ingredient.name)}
                      </span>
                      {ingredient.available ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Equipment Checklist */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Thermometer className="w-5 h-5" />
                    Equipment ({equipmentChecklist.filter(item => item.completed).length}/{equipmentChecklist.length})
                  </h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  {equipmentChecklist.map((equipment) => (
                    <div key={equipment.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Checkbox
                        checked={equipment.completed}
                        onCheckedChange={() => toggleChecklistItem('equipment', equipment.id)}
                      />
                      <span className={`flex-1 ${equipment.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {equipment.name}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Preparation Tasks */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Preparation ({prepChecklist.filter(item => item.completed).length}/{prepChecklist.length})
                  </h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  {prepChecklist.map((prep) => (
                    <div key={prep.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Checkbox
                        checked={prep.completed}
                        onCheckedChange={() => toggleChecklistItem('prep', prep.id)}
                      />
                      <span className={`flex-1 ${prep.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {prep.name}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Ready to Cook Status */}
              {isReadyToCook() && (
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-200">Ready to Cook!</h4>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          All ingredients and equipment are ready. You can now start cooking!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'cooking' && (
            <div className="space-y-6">
              {/* Cooking Progress */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Cooking Progress</h3>
                    <Badge variant="secondary">
                      Step {currentStep + 1} of {cookingSteps.length}
                    </Badge>
                  </div>
                  <Progress value={getCookingProgress()} className="mt-2" />
                </CardHeader>
              </Card>

              {/* Current Step */}
              {cookingSteps[currentStep] && (
                <Card className="border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Step {cookingSteps[currentStep].number}</h3>
                      <div className="flex items-center gap-2">
                        {cookingSteps[currentStep].duration && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startTimer(cookingSteps[currentStep].duration!)}
                          >
                            <Timer className="w-4 h-4 mr-1" />
                            {cookingSteps[currentStep].duration}min
                          </Button>
                        )}
                        {timer && (
                          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                            <Timer className="w-4 h-4" />
                            <span className="font-mono">
                              {formatTime(timer)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsTimerActive(!isTimerActive)}
                            >
                              {isTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setTimer(null)}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg mb-4">{cookingSteps[currentStep].instruction}</p>
                    
                    {cookingSteps[currentStep].temperature && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        <Thermometer className="w-4 h-4" />
                        <span>Temperature: {cookingSteps[currentStep].temperature}</span>
                      </div>
                    )}
                    
                    {cookingSteps[currentStep].tips && cookingSteps[currentStep].tips!.length > 0 && (
                      <div className="bg-muted/50 p-3 rounded-lg mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          <span className="font-medium">Pro Tips:</span>
                        </div>
                        <ul className="text-sm space-y-1">
                          {cookingSteps[currentStep].tips!.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                          disabled={currentStep === 0}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(Math.min(cookingSteps.length - 1, currentStep + 1))}
                          disabled={currentStep === cookingSteps.length - 1}
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                      
                      <Button
                        variant={cookingSteps[currentStep].completed ? "secondary" : "default"}
                        onClick={() => toggleCookingStep(cookingSteps[currentStep].number)}
                      >
                        {cookingSteps[currentStep].completed ? 'Mark Incomplete' : 'Mark Complete'}
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Steps Overview */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">All Steps</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  {cookingSteps.map((step, index) => (
                    <div
                      key={step.number}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        index === currentStep ? 'border-primary bg-primary/5' : ''
                      } ${step.completed ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : ''}`}
                      onClick={() => setCurrentStep(index)}
                    >
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={() => toggleCookingStep(step.number)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Step {step.number}</span>
                          {step.duration && (
                            <Badge variant="outline" className="text-xs">
                              {step.duration}min
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${step.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                          {step.instruction.slice(0, 100)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Completion Status */}
              {cookingSteps.every(step => step.completed) && (
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                        Congratulations! 🎉
                      </h3>
                      <p className="text-green-600 dark:text-green-400">
                        You've successfully completed cooking {recipe.name}! Enjoy your delicious meal.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CookingPopup;