import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, Search, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useRequireAuth from "@/hooks/useRequireAuth";
import pantryHero from "@/assets/pantry-hero.jpg";

export const PantryShowcase = () => {
  const navigate = useNavigate();
  const { user } = useRequireAuth({ showToast: false });

  const openPantryIntelligence = () => {
    if (user) {
      navigate("/pantry");
      return;
    }
    toast.info("Sign in to access Pantry Intelligence", {
      action: {
        label: "Sign In",
        onClick: () => navigate("/auth?redirect=/pantry"),
      },
    });
    navigate("/auth?redirect=/pantry");
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Smart Kitchen Technology</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              <span className="text-gradient">Pantry Intelligence</span>
              <br />
              <span className="text-foreground">Your Smart Cooking Assistant</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Stop wasting food and money. Our AI-powered pantry system tracks your ingredients, 
              suggests recipes you can make right now, and alerts you before items expire.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                {
                  icon: Search,
                  title: "Instant Recipe Matching",
                  description: "Find recipes based on ingredients you already have"
                },
                {
                  icon: CheckCircle,
                  title: "Smart Expiration Tracking",
                  description: "Never waste food again with expiration alerts"
                },
                {
                  icon: ChefHat,
                  title: "Ingredient Substitutions",
                  description: "Missing an ingredient? Get smart alternatives"
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="hero"
                size="lg"
                type="button"
                className="touch-manipulation hover:scale-100 active:scale-100"
                onClick={openPantryIntelligence}
              >
                Try Pantry Intelligence
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button variant="outline" size="lg" asChild>
                <Link to="/recipes">
                  Browse All Recipes
                </Link>
              </Button>
            </div>

          </div>

          {/* Right: Visual Demo */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={pantryHero} 
                alt="Smart pantry management interface showing ingredient tracking and recipe matching"
                className="w-full h-auto"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>

            {/* Floating Cards */}
            <Card className="absolute -left-6 top-1/4 hidden w-48 shadow-warm md:block md:animate-float">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🍅</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Tomatoes</div>
                    <div className="text-xs text-green-600">Fresh - 5 days</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="absolute -right-6 bottom-1/4 hidden w-56 shadow-warm md:block md:animate-float" style={{ animationDelay: '0.5s' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm">Jollof Rice</div>
                  <div className="text-lg font-bold text-green-600">95%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }} />
                </div>
                <div className="text-xs text-muted-foreground mt-2">You have 19/20 ingredients</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
