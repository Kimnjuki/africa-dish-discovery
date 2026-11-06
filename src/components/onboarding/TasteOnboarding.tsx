import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ChefHat, 
  Flame, 
  Leaf, 
  Globe2, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Sparkles
} from "lucide-react";

interface TasteOnboardingProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

const CUISINES = [
  { id: "west_african", label: "West African", emoji: "🍲" },
  { id: "east_african", label: "East African", emoji: "🥘" },
  { id: "north_african", label: "North African", emoji: "🫕" },
  { id: "southern_african", label: "Southern African", emoji: "🍖" },
  { id: "central_african", label: "Central African", emoji: "🥣" },
  { id: "ethiopian", label: "Ethiopian", emoji: "🫓" },
  { id: "moroccan", label: "Moroccan", emoji: "🍵" },
  { id: "nigerian", label: "Nigerian", emoji: "🌶️" },
  { id: "ghanaian", label: "Ghanaian", emoji: "🍛" },
  { id: "kenyan", label: "Kenyan", emoji: "🥗" },
  { id: "south_african", label: "South African", emoji: "🥩" },
  { id: "senegalese", label: "Senegalese", emoji: "🐟" },
];

const SPICE_LEVELS = [
  { id: "mild", label: "Mild", description: "I prefer subtle flavors", icon: "🌱" },
  { id: "medium", label: "Medium", description: "Some heat is nice", icon: "🌶️" },
  { id: "hot", label: "Hot", description: "I love spicy food", icon: "🔥" },
  { id: "very_hot", label: "Very Hot", description: "The spicier the better!", icon: "💥" },
];

const DIETARY_RESTRICTIONS = [
  { id: "vegetarian", label: "Vegetarian", icon: "🥬" },
  { id: "vegan", label: "Vegan", icon: "🌱" },
  { id: "halal", label: "Halal", icon: "☪️" },
  { id: "kosher", label: "Kosher", icon: "✡️" },
  { id: "gluten_free", label: "Gluten-Free", icon: "🌾" },
  { id: "dairy_free", label: "Dairy-Free", icon: "🥛" },
  { id: "nut_free", label: "Nut-Free", icon: "🥜" },
  { id: "none", label: "No Restrictions", icon: "✅" },
];

const COOKING_TIMES = [
  { id: 30, label: "Quick & Easy", description: "Under 30 minutes", icon: "⚡" },
  { id: 45, label: "Moderate", description: "30-45 minutes", icon: "⏱️" },
  { id: 60, label: "Taking My Time", description: "45-60 minutes", icon: "🍳" },
  { id: 90, label: "Weekend Chef", description: "60+ minutes", icon: "👨‍🍳" },
];

const SKILL_LEVELS = [
  { id: 0.3, label: "Beginner", description: "Learning the basics" },
  { id: 0.5, label: "Intermediate", description: "Comfortable cooking" },
  { id: 0.7, label: "Advanced", description: "Experienced home cook" },
  { id: 0.9, label: "Expert", description: "Culinary enthusiast" },
];

export function TasteOnboarding({ onComplete, onSkip }: TasteOnboardingProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [preferences, setPreferences] = useState({
    cuisines: [] as string[],
    spiceLevel: "medium",
    dietaryRestrictions: [] as string[],
    cookingTime: 45,
    skillLevel: 0.5,
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const toggleCuisine = (cuisineId: string) => {
    setPreferences(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisineId)
        ? prev.cuisines.filter(c => c !== cuisineId)
        : [...prev.cuisines, cuisineId]
    }));
  };

  const toggleDietary = (restrictionId: string) => {
    if (restrictionId === "none") {
      setPreferences(prev => ({ ...prev, dietaryRestrictions: [] }));
    } else {
      setPreferences(prev => ({
        ...prev,
        dietaryRestrictions: prev.dietaryRestrictions.includes(restrictionId)
          ? prev.dietaryRestrictions.filter(r => r !== restrictionId)
          : [...prev.dietaryRestrictions.filter(r => r !== "none"), restrictionId]
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to save your preferences",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("user_taste_profiles")
        .upsert({
          user_id: session.user.id,
          preferred_cuisines: preferences.cuisines,
          spice_tolerance: preferences.spiceLevel,
          time_availability_weekday: preferences.cookingTime,
          time_availability_weekend: preferences.cookingTime + 30,
          cooking_skill_level: preferences.skillLevel,
          confidence_score: 0.3,
          training_data_points: 1,
        }, { onConflict: "user_id" });

      if (error) throw error;

      // Also update profile dietary restrictions
      await supabase
        .from("profiles")
        .update({
          dietary_restrictions: preferences.dietaryRestrictions,
          favorite_cuisines: preferences.cuisines,
        })
        .eq("id", session.user.id);

      toast({
        title: "Preferences saved!",
        description: "We'll personalize your recommendations based on your taste.",
      });

      onComplete?.();
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error saving preferences",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Globe2 className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">What cuisines excite you?</h3>
              <p className="text-muted-foreground">Select all that interest you</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CUISINES.map(cuisine => (
                <button
                  key={cuisine.id}
                  onClick={() => toggleCuisine(cuisine.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    preferences.cuisines.includes(cuisine.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl">{cuisine.emoji}</span>
                  <p className="text-sm font-medium mt-1">{cuisine.label}</p>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Flame className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">How spicy do you like it?</h3>
              <p className="text-muted-foreground">We'll adjust recipe recommendations</p>
            </div>
            <div className="grid gap-3">
              {SPICE_LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => setPreferences(prev => ({ ...prev, spiceLevel: level.id }))}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                    preferences.spiceLevel === level.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-3xl">{level.icon}</span>
                  <div className="text-left">
                    <p className="font-medium">{level.label}</p>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                  {preferences.spiceLevel === level.id && (
                    <Check className="h-5 w-5 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Leaf className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Any dietary restrictions?</h3>
              <p className="text-muted-foreground">Select all that apply</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DIETARY_RESTRICTIONS.map(restriction => (
                <button
                  key={restriction.id}
                  onClick={() => toggleDietary(restriction.id)}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    (restriction.id === "none" && preferences.dietaryRestrictions.length === 0) ||
                    preferences.dietaryRestrictions.includes(restriction.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-xl">{restriction.icon}</span>
                  <span className="font-medium text-sm">{restriction.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Clock className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">How much time do you have?</h3>
              <p className="text-muted-foreground">For weekday cooking</p>
            </div>
            <div className="grid gap-3">
              {COOKING_TIMES.map(time => (
                <button
                  key={time.id}
                  onClick={() => setPreferences(prev => ({ ...prev, cookingTime: time.id }))}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                    preferences.cookingTime === time.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-3xl">{time.icon}</span>
                  <div className="text-left">
                    <p className="font-medium">{time.label}</p>
                    <p className="text-sm text-muted-foreground">{time.description}</p>
                  </div>
                  {preferences.cookingTime === time.id && (
                    <Check className="h-5 w-5 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <ChefHat className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Your cooking skill level?</h3>
              <p className="text-muted-foreground">We'll match recipe difficulty</p>
            </div>
            <div className="grid gap-3">
              {SKILL_LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => setPreferences(prev => ({ ...prev, skillLevel: level.id }))}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                    preferences.skillLevel === level.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-left flex-1">
                    <p className="font-medium">{level.label}</p>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                  {preferences.skillLevel === level.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <Badge variant="secondary">Personalization</Badge>
          </div>
          <CardTitle>Let's personalize your experience</CardTitle>
          <CardDescription>
            Step {step} of {totalSteps}
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-4 border-t">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={onSkip}>
                Skip for now
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button onClick={() => setStep(s => s + 1)}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Complete"}
                <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
