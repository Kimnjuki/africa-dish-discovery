import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Sparkles } from "lucide-react";

const features = [
  "AI-powered meal planning",
  "Unlimited ingredient substitutions",
  "Advanced pantry analytics",
  "Ad-free experience",
  "Priority recipe support",
  "Exclusive chef collections",
];

export const PremiumBanner = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <CardContent className="relative z-10 py-12 px-8 md:px-16">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <Badge className="gap-1 mb-4 bg-primary/10 text-primary border-primary/20">
                  <Crown className="w-3 h-3" />
                  Smart Pantry Pro
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Unlock the Full
                  <br />
                  <span className="text-gradient">Cooking Experience</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  Get AI-powered meal planning, unlimited substitutions, and advanced analytics 
                  to transform your kitchen into a smart cooking hub.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="hero" size="lg" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Start Free Trial
                  </Button>
                  <Button variant="outline" size="lg">
                    $4.99/month
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Cancel anytime • 7-day free trial • No credit card required
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 p-3 bg-background/60 rounded-lg">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
