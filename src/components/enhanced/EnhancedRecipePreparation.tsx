import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { 
  Clock, Users, Star, ChefHat, CheckCircle, Circle, Timer, ArrowLeft, 
  Play, Pause, RotateCcw, Volume2, VolumeX, Scale, ShoppingCart, 
  Mic, MicOff, Lightbulb, Bookmark, SkipForward, SkipBack, 
  Utensils, Thermometer, AlertCircle, PlayCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import cookingHeroImage from "@/assets/cooking-process-hero.jpg";
import { RecipeReviews } from "@/components/RecipeReviews";
import { RecipeCulturalContext } from "@/components/cultural/RecipeCulturalContext";
import { IngredientSubstitutionPopover } from "@/components/IngredientSubstitutionPopover";
import { NutritionBadge } from "@/components/NutritionBadge";
import { RecipeCardPanel } from "@/components/recipe/RecipeCardPanel";
import { IngredientChecklist } from "@/components/recipe/IngredientChecklist";
import { RecipeNotes } from "@/components/recipe/RecipeNotes";
import { CookMode } from "@/components/recipe/CookMode";
import { PrintRecipeButton } from "@/components/PrintRecipeButton";
import { RecipeTrustNotice } from "@/components/recipe/RecipeTrustNotice";
import { itemText } from "@/lib/recipeText";
import type { IngredientValue, StepValue } from "@/types/content";


interface Recipe {
  id?: string;
  name: string;
  country?: string | null;
  summary?: string | null;
  ingredients?: IngredientValue[] | null;
  steps?: StepValue[] | null;
  prep_time?: number | null;
  cook_time?: number | null;
  servings?: number | null;
  difficulty?: string | null;
  tags?: string[] | null;
  image_url?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
  verification_status?: string | null;
  safety_notes?: string | null;
  item_type?: string | null;
}


interface RecipePreparationProps {
  recipe: Recipe;
  onBack: () => void;
}

interface CookingTimer {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  active: boolean;
}

export const EnhancedRecipePreparation = ({ recipe, onBack }: RecipePreparationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [timers, setTimers] = useState<CookingTimer[]>([]);
  const [phase, setPhase] = useState<'prep' | 'cooking' | 'complete'>('prep');
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isHandsFreeMode, setIsHandsFreeMode] = useState(false);
  const [showNutritionTips, setShowNutritionTips] = useState(false);
  const [cookingProgress, setCookingProgress] = useState(0);
  const [savedProgress, setSavedProgress] = useState(false);
  const [cookModeOpen, setCookModeOpen] = useState(false);
  const { toast } = useToast();
  
  const speechRecognition = useRef<SpeechRecognition | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const stepProgress = ((currentStep + 1) / (recipe.steps?.length || 1)) * 100;
  const estimatedTimePerStep = totalTime / (recipe.steps?.length || 1);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window).webkitSpeechRecognition || (window).SpeechRecognition;
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = true;
      speechRecognition.current.interimResults = false;
      speechRecognition.current.lang = 'en-US';

      speechRecognition.current.onresult = (event: SpeechRecognitionEvent) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        handleVoiceCommand(command);
      };

      speechRecognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.log('Speech recognition error:', event.error);
        setIsVoiceEnabled(false);
      };
    }

    // Initialize audio context for timer sounds
    try {
      audioContext.current = new (window.AudioContext || (window).webkitAudioContext)();
    } catch (error) {
      console.log('Audio context not available:', error);
    }

    return () => {
      if (speechRecognition.current) {
        speechRecognition.current.stop();
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  // Timer management
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (timer.active && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1;
            if (newRemaining === 0) {
              playTimerSound();
              toast({
                title: `${timer.name} Complete!`,
                description: "Time's up for this step.",
              });
              if (isSoundEnabled) {
                speak(`${timer.name} timer is complete`);
              }
              return { ...timer, remaining: 0, active: false };
            }
            return { ...timer, remaining: newRemaining };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isSoundEnabled, toast]);

  // Auto-save progress
  useEffect(() => {
    const saveProgress = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          const progressData = {
            recipe_id: recipe.id,
            current_step: currentStep,
            completed_steps: completedSteps,
            serving_multiplier: servingMultiplier,
            phase,
            last_updated: new Date().toISOString()
          };
          
          localStorage.setItem(`cooking_progress_${recipe.id}`, JSON.stringify(progressData));
          setSavedProgress(true);
        }
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    };

    saveProgress();
  }, [currentStep, completedSteps, servingMultiplier, phase, recipe.id]);

  // Load saved progress
  useEffect(() => {
    const loadProgress = () => {
      try {
        const saved = localStorage.getItem(`cooking_progress_${recipe.id}`);
        if (saved) {
          const progressData = JSON.parse(saved);
          setCurrentStep(progressData.current_step || 0);
          setCompletedSteps(progressData.completed_steps || []);
          setServingMultiplier(progressData.serving_multiplier || 1);
          setPhase(progressData.phase || 'prep');
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };

    loadProgress();
  }, [recipe.id]);

  const handleVoiceCommand = (command: string) => {
    if (command.includes('next step') || command.includes('continue')) {
      nextStep();
    } else if (command.includes('previous step') || command.includes('go back')) {
      prevStep();
    } else if (command.includes('complete step') || command.includes('done')) {
      toggleStepCompletion(currentStep);
    } else if (command.includes('start timer')) {
      // Extract time from command
      const timeMatch = command.match(/(\d+)\s*(minute|min)/);
      if (timeMatch) {
        startQuickTimer(parseInt(timeMatch[1]));
      }
    } else if (command.includes('repeat') || command.includes('read again')) {
      speak(itemText(recipe.steps?.[currentStep] || ""));
    }
  };

  const speak = (text: string) => {
    if (isSoundEnabled && 'speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.log('Error with speech synthesis:', error);
      }
    }
  };

  const playTimerSound = () => {
    if (isSoundEnabled && audioContext.current && audioContext.current.state === 'running') {
      try {
        const oscillator = audioContext.current.createOscillator();
        const gainNode = audioContext.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.current.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.current.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.current.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.current.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.current.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(audioContext.current.currentTime + 0.3);
      } catch (error) {
        console.log('Error playing timer sound:', error);
      }
    }
  };

  const toggleVoiceControl = async () => {
    if (isVoiceEnabled) {
      speechRecognition.current?.stop();
      setIsVoiceEnabled(false);
      toast({
        title: "Voice Control Off",
        description: "Voice commands disabled",
      });
    } else {
      try {
        if (speechRecognition.current) {
          // Resume audio context if needed
          if (audioContext.current && audioContext.current.state === 'suspended') {
            await audioContext.current.resume();
          }
          
          speechRecognition.current.start();
          setIsVoiceEnabled(true);
          speak("Voice control activated. Say 'next step', 'previous step', 'complete step', or 'start timer' to control cooking.");
          
          toast({
            title: "Voice Control On",
            description: "Say voice commands to control cooking",
          });
        }
      } catch (error) {
        console.log('Error starting voice recognition:', error);
        toast({
          title: "Voice Control Error",
          description: "Voice recognition not available",
          variant: "destructive"
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const scaleIngredient = (ingredient: string) => {
    if (servingMultiplier === 1) return ingredient;
    // Handles whole numbers, decimals, and unicode/ascii fractions (e.g. 1/2, ½, 1 1/2)
    const fracMap: Record<string, number> = {
      "½": 0.5, "⅓": 1/3, "⅔": 2/3, "¼": 0.25, "¾": 0.75,
      "⅕": 0.2, "⅖": 0.4, "⅗": 0.6, "⅘": 0.8, "⅙": 1/6, "⅚": 5/6, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
    };
    const re = /(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/;
    const m = ingredient.match(re);
    if (!m) return ingredient;
    const token = m[0];
    let value = 0;
    if (fracMap[token]) value = fracMap[token];
    else if (token.includes(" ")) {
      const [whole, frac] = token.split(/\s+/);
      const [n, d] = frac.split("/").map(Number);
      value = parseInt(whole, 10) + n / d;
    } else if (token.includes("/")) {
      const [n, d] = token.split("/").map(Number);
      value = n / d;
    } else {
      value = parseFloat(token);
    }
    const scaled = +(value * servingMultiplier).toFixed(2);
    const display = Number.isInteger(scaled) ? String(scaled) : String(scaled);
    return ingredient.replace(token, display);
  };

  const toggleStepCompletion = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter(i => i !== stepIndex));
    } else {
      setCompletedSteps([...completedSteps, stepIndex]);
      setCookingProgress(prev => Math.min(prev + (100 / (recipe.steps?.length || 1)), 100));
      
      if (isSoundEnabled) {
        speak("Step completed");
      }
    }
  };

  const nextStep = () => {
    if (currentStep < (recipe.steps?.length || 1) - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // Auto-read next step if hands-free mode is on
      if (isHandsFreeMode && isSoundEnabled) {
        setTimeout(() => {
          speak(itemText(recipe.steps?.[newStep] || ""));
        }, 500);
      }
      
      // Switch phases based on progress
      const progress = ((newStep + 1) / (recipe.steps?.length || 1)) * 100;
      if (progress > 40 && phase === 'prep') {
        setPhase('cooking');
        if (isSoundEnabled) {
          speak("Now entering cooking phase");
        }
      } else if (progress === 100) {
        setPhase('complete');
        if (isSoundEnabled) {
          speak("Recipe complete! Well done!");
        }
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      
      if (isHandsFreeMode && isSoundEnabled) {
        setTimeout(() => {
          speak(itemText(recipe.steps?.[newStep] || ""));
        }, 500);
      }
      
      // Update phase if going back
      const progress = ((newStep + 1) / (recipe.steps?.length || 1)) * 100;
      if (progress <= 40 && phase === 'cooking') {
        setPhase('prep');
      }
    }
  };

  const startQuickTimer = (minutes: number, name?: string) => {
    const timerId = `timer_${Date.now()}`;
    const newTimer: CookingTimer = {
      id: timerId,
      name: name || `${minutes} min timer`,
      duration: minutes * 60,
      remaining: minutes * 60,
      active: true
    };
    
    setTimers(prev => [...prev, newTimer]);
    
    if (isSoundEnabled) {
      speak(`${minutes} minute timer started`);
    }
  };

  const stopTimer = (timerId: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === timerId ? { ...timer, active: false } : timer
      )
    );
  };

  const addToShoppingList = async (ingredient: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to add to shopping list",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('shopping_list_items')
        .insert({
          ingredient_name: ingredient,
          recipe_id: recipe.id,
          user_id: session.session.user.id
        });

      if (error) throw error;

      toast({
        title: "Added to Shopping List",
        description: `${ingredient} has been added to your shopping list`,
      });
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      toast({
        title: "Error",
        description: "Failed to add to shopping list",
        variant: "destructive"
      });
    }
  };

  const getDifficultyTips = () => {
    const tips = {
      Easy: ["Take your time with each step", "Have all ingredients ready before starting"],
      Medium: ["Read through all steps first", "Prep ingredients in advance", "Keep a timer handy"],
      Hard: ["Professional technique required", "Consider watching video tutorials", "Practice mise en place"]
    };
    return tips[recipe.difficulty as keyof typeof tips] || [];
  };

  const getPhaseIcon = () => {
    switch (phase) {
      case 'prep': return <Utensils className="w-5 h-5" />;
      case 'cooking': return <ChefHat className="w-5 h-5" />;
      case 'complete': return <CheckCircle className="w-5 h-5" />;
      default: return <Circle className="w-5 h-5" />;
    }
  };

  if (cookModeOpen) {
    return (
      <CookMode
        recipeName={recipe.name}
        steps={recipe.steps}
        ingredients={recipe.ingredients}
        multiplier={servingMultiplier}
        startIndex={currentStep}
        onClose={(lastIndex) => {
          setCurrentStep(lastIndex);
          setCookModeOpen(false);
        }}
      />
    );
  }

  if (phase === 'complete') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-earth px-4">
        <Card className="max-w-md mx-auto text-center shadow-glow">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Recipe Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Congratulations! You've successfully prepared {recipe.name}.
            </p>
            <div className="space-y-3">
              <Button variant="hero" className="w-full" onClick={() => {
                localStorage.removeItem(`cooking_progress_${recipe.id}`);
                onBack();
              }}>
                Back to Recipes
              </Button>
              <Button variant="outline" className="w-full" onClick={() => {
                setPhase('prep');
                setCurrentStep(0);
                setCompletedSteps([]);
                setCookingProgress(0);
              }}>
                Cook Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-earth pb-28 md:pb-8">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Enhanced Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8">
          <div className="flex items-start gap-3">
          <Button variant="outline" className="h-11 shrink-0" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gradient sm:text-3xl">{recipe.name}</h1>
            <p className="text-sm text-muted-foreground">{recipe.country} • {recipe.difficulty}</p>
          </div>
          </div>
          
          {/* Control Panel */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={isVoiceEnabled ? "default" : "outline"}
              size="icon"
              className="h-11 w-11"
              aria-label={isVoiceEnabled ? "Turn voice commands off" : "Turn voice commands on"}
              onClick={toggleVoiceControl}
            >
              {isVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button
              variant={isSoundEnabled ? "default" : "outline"}
              size="icon"
              className="h-11 w-11"
              aria-label={isSoundEnabled ? "Mute timer sounds" : "Unmute timer sounds"}
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant={isHandsFreeMode ? "default" : "outline"}
              size="icon"
              className="h-11 w-11"
              aria-label={isHandsFreeMode ? "Turn hands-free mode off" : "Turn hands-free mode on"}
              onClick={() => setIsHandsFreeMode(!isHandsFreeMode)}
            >
              <PlayCircle className="w-4 h-4" />
            </Button>
            <Badge variant={phase === 'prep' ? 'default' : 'secondary'} className="flex items-center gap-1">
              {getPhaseIcon()}
              {phase === 'prep' ? 'Preparation' : phase === 'cooking' ? 'Cooking' : 'Complete'}
            </Badge>
          </div>
        </div>

        {/* Jump links + print */}
        <nav
          aria-label="Jump to section"
          className="flex flex-wrap items-center gap-2 mb-6"
        >
          <Button variant="secondary" size="sm" asChild>
            <a href="#recipe-ingredients">Jump to Recipe</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="#recipe-steps">Jump to Steps</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="#recipe-notes">Tips &amp; Storage</a>
          </Button>
          <PrintRecipeButton recipe={recipe} servingMultiplier={servingMultiplier} />
        </nav>

        <Button
          variant="hero"
          className="mb-6 h-12 w-full hover:scale-100 md:hidden"
          onClick={() => setCookModeOpen(true)}
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          Open cook mode
        </Button>

        <RecipeTrustNotice
          verificationStatus={(recipe).verification_status}
          safetyNotes={(recipe).safety_notes}
          itemType={(recipe).item_type}
          className="mb-6"
        />



        {/* Enhanced Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Cooking Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {recipe.steps?.length || 0}
              </span>
            </div>
            <Progress value={stepProgress} className="h-3 mb-4" />
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-primary" />
                <span>Total: {totalTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary" />
                <span>{recipe.servings * servingMultiplier} servings</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary" />
                <span>{recipe.difficulty}</span>
              </div>
              <div className="flex items-center gap-1">
                <Thermometer className="w-4 h-4 text-primary" />
                <span>~{Math.round(estimatedTimePerStep)} min/step</span>
              </div>
              {savedProgress && (
                <div className="flex items-center gap-1 text-green-600">
                  <Bookmark className="w-4 h-4" />
                  <span>Auto-saved</span>
                </div>
              )}
            </div>
            {recipe.calories ? (
              <div className="mt-4">
                <NutritionBadge
                  calories={Math.round((recipe.calories || 0) * servingMultiplier)}
                  protein={Math.round(((recipe.protein || 0) * servingMultiplier) * 10) / 10}
                  carbs={Math.round(((recipe.carbs || 0) * servingMultiplier) * 10) / 10}
                  fats={Math.round(((recipe.fats || 0) * servingMultiplier) * 10) / 10}
                  compact={false}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>


        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enhanced Main Cooking Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Step */}
            <Card id="recipe-steps" className="shadow-warm scroll-mt-24">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-primary" />
                    Step {currentStep + 1}
                    {recipe.difficulty === 'Hard' && (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                  </CardTitle>
                  
                  {/* Active Timers */}
                  <div className="flex flex-wrap items-center gap-2">
                    {timers.filter(timer => timer.active && timer.remaining > 0).map(timer => (
                      <div key={timer.id} className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                        <Timer className="w-4 h-4 text-primary" />
                        <span className="font-mono text-sm">{formatTime(timer.remaining)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => stopTimer(timer.id)}
                          className="h-6 w-6 p-0"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 text-xl leading-relaxed sm:text-lg">
                  {typeof recipe.steps?.[currentStep] === 'string' 
                    ? recipe.steps[currentStep]
                    : recipe.steps?.[currentStep]?.instruction || recipe.steps?.[currentStep]?.step || "No steps available"}
                </div>
                
                {/* Difficulty Tips */}
                {showNutritionTips && getDifficultyTips().length > 0 && (
                  <div className="bg-secondary/50 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <span className="font-medium">Chef's Tips</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {getDifficultyTips().map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Quick Timer Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button variant="outline" size="sm" onClick={() => startQuickTimer(1)}>
                    1 min
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => startQuickTimer(5)}>
                    5 min
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => startQuickTimer(10)}>
                    10 min
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => startQuickTimer(15)}>
                    15 min
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => startQuickTimer(30)}>
                    30 min
                  </Button>
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline" size="sm">
                        Custom Timer
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Set Custom Timer</DrawerTitle>
                      </DrawerHeader>
                      <div className="p-4 space-y-4">
                        <Input 
                          type="number" 
                          placeholder="Minutes" 
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const minutes = parseInt((e.target as HTMLInputElement).value);
                              if (minutes > 0) {
                                startQuickTimer(minutes);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>

                {/* Navigation Controls */}
                <div className="hidden items-center justify-between md:flex">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <SkipBack className="w-4 h-4 mr-2" />
                    Previous
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
                    Next
                    <SkipForward className="w-4 h-4 ml-2" />
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

            {/* Tips, make-ahead, storage, freezer and equipment */}
            <div id="recipe-notes" className="scroll-mt-24"><RecipeNotes recipe={recipe} /></div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* At-a-glance recipe card */}
            <RecipeCardPanel
              recipe={recipe}
              servingMultiplier={servingMultiplier}
              onServingMultiplierChange={setServingMultiplier}
              onStartCookMode={() => setCookModeOpen(true)}
            />

            {/* Ingredients with checkboxes, scaling and unit toggle */}
            <IngredientChecklist
              ingredients={recipe.ingredients}
              multiplier={servingMultiplier}
              country={recipe.country}
              dishName={recipe.name}
              onAddToShoppingList={addToShoppingList}
            />

            {/* All Steps Overview */}
            <Card>
              <CardHeader>
                <CardTitle>All Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
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
                            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">
                            Step {index + 1} • ~{Math.round(estimatedTimePerStep)} min
                          </div>
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

            {/* Cultural Context */}
            <RecipeCulturalContext 
              recipeId={recipe.id} 
              recipeName={recipe.name}
              country={recipe.country}
            />

            {/* Recipe Reviews */}
            <RecipeReviews recipeId={recipe.id} recipeName={recipe.name} />
          </div>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t bg-background/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <Button variant="outline" className="h-12 px-2" onClick={prevStep} disabled={currentStep === 0}>
          <SkipBack className="h-4 w-4" />
          Prev
        </Button>
        <Button
          variant={completedSteps.includes(currentStep) ? "default" : "outline"}
          className="h-12 px-2"
          onClick={() => toggleStepCompletion(currentStep)}
        >
          {completedSteps.includes(currentStep) ? "Done" : "Mark"}
        </Button>
        <Button
          variant="hero"
          className="h-12 px-2 hover:scale-100"
          onClick={nextStep}
          disabled={currentStep === (recipe.steps?.length || 1) - 1}
        >
          Next
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EnhancedRecipePreparation;