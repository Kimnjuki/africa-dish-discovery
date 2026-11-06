import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Star, ChefHat, CheckCircle, Circle, Timer, ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { itemText } from "@/lib/recipeText";
import type { IngredientValue, StepValue } from "@/types/content";

interface Recipe {
  id: string;
  name: string;
  country: string;
  summary: string;
  ingredients: IngredientValue[] | null;
  steps: StepValue[] | null;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  tags: string[];
  image_url?: string;
}

interface RecipePreparationProps {
  recipe: Recipe;
  onBack: () => void;
}

export const RecipePreparation = ({ recipe, onBack }: RecipePreparationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [phase, setPhase] = useState<'prep' | 'cooking'>('prep');
  const { toast } = useToast();

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const progress = ((currentStep + 1) / (recipe.steps?.length || 1)) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      toast({
        title: "Timer Complete!",
        description: "Time's up for this step.",
      });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleStepCompletion = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter(i => i !== stepIndex));
    } else {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const nextStep = () => {
    if (currentStep < (recipe.steps?.length || 1) - 1) {
      setCurrentStep(currentStep + 1);
      // Switch to cooking phase if we're past prep time
      if (currentStep + 1 >= Math.floor((recipe.steps?.length || 1) * 0.4)) {
        setPhase('cooking');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Switch back to prep if needed
      if (currentStep - 1 < Math.floor((recipe.steps?.length || 1) * 0.4)) {
        setPhase('prep');
      }
    }
  };

  const startTimer = (minutes: number) => {
    setTimer(minutes * 60);
    setIsTimerRunning(true);
  };

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recipe
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gradient">{recipe.name}</h1>
            <p className="text-muted-foreground">{recipe.country} • {recipe.difficulty}</p>
          </div>
          <Badge variant={phase === 'prep' ? 'default' : 'secondary'} className="text-sm">
            {phase === 'prep' ? 'Preparation' : 'Cooking'}
          </Badge>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {recipe.steps?.length || 0}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Total: {totalTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recipe.servings} servings</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{recipe.difficulty}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Cooking Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Step */}
            <Card className="shadow-warm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-primary" />
                    Current Step
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {timer > 0 && (
                      <div className="flex items-center gap-2 text-primary">
                        <Timer className="w-4 h-4" />
                        <span className="font-mono">{formatTime(timer)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                        >
                          {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTimer(0);
                            setIsTimerRunning(false);
                          }}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg mb-6 leading-relaxed">
                  {typeof recipe.steps?.[currentStep] === 'string' 
                    ? recipe.steps[currentStep]
                    : recipe.steps?.[currentStep]?.instruction || recipe.steps?.[currentStep]?.step || "No steps available"}
                </div>
                
                {/* Quick Timer Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button variant="outline" size="sm" onClick={() => startTimer(5)}>
                    5 min timer
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => startTimer(10)}>
                    10 min timer
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => startTimer(15)}>
                    15 min timer
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => startTimer(30)}>
                    30 min timer
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    Previous Step
                  </Button>
                  
                  <Button
                    variant={completedSteps.includes(currentStep) ? "default" : "outline"}
                    onClick={() => toggleStepCompletion(currentStep)}
                  >
                    {completedSteps.includes(currentStep) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </>
                    )}
                  </Button>

                  <Button 
                    variant="hero" 
                    onClick={nextStep}
                    disabled={currentStep === (recipe.steps?.length || 1) - 1}
                  >
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recipe Image */}
            {recipe.image_url && (
              <Card className="overflow-hidden">
                <div className="h-64">
                  <img 
                    src={recipe.image_url}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ingredients Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.isArray(recipe.ingredients) ? (
                    recipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50">
                        <Circle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{itemText(ingredient)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No ingredients listed</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* All Steps Overview */}
            <Card>
              <CardHeader>
                <CardTitle>All Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recipe.steps?.map((step, index) => (
                    <div key={index}>
                      <div 
                        className={`
                          flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all
                          ${currentStep === index 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-secondary/50'
                          }
                        `}
                        onClick={() => setCurrentStep(index)}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {completedSteps.includes(index) ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : currentStep === index ? (
                            <div className="w-4 h-4 rounded-full bg-primary" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">Step {index + 1}</div>
                          <div className="text-sm line-clamp-2">
                            {typeof step === 'string' ? step : step?.instruction || step?.step || ''}
                          </div>
                        </div>
                      </div>
                      {index < (recipe.steps?.length || 1) - 1 && (
                        <Separator className="my-2 ml-7" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recipe Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipePreparation;