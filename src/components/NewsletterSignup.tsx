import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterSignupProps {
  variant?: "default" | "hero" | "footer" | "inline" | "blog";
  source?: string;
}

export const NewsletterSignup = ({ variant = "default", source = "website" }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from("newsletter_subscribers")
        .select("id, is_active")
        .eq("email", email.toLowerCase())
        .single();

      if (existing) {
        if (existing.is_active) {
          toast({
            title: "Already subscribed! 📧",
            description: "This email is already on our list. Check your inbox for our latest recipes!",
          });
        } else {
          // Reactivate subscription
          await supabase
            .from("newsletter_subscribers")
            .update({ is_active: true, unsubscribed_at: null })
            .eq("id", existing.id);
          
          toast({
            title: "Welcome back! 🎉",
            description: "Your subscription has been reactivated. Expect delicious recipes soon!",
          });
          setSubscribed(true);
        }
      } else {
        // Create new subscription
        const { error } = await supabase
          .from("newsletter_subscribers")
          .insert({
            email: email.toLowerCase(),
            name: name || null,
            source: source,
            preferences: { weekly_recipes: true, special_offers: false }
          });

        if (error) throw error;

        toast({
          title: "Welcome to LadhaQuest! 🎉",
          description: "You'll receive weekly African recipes and cooking tips.",
        });
        setSubscribed(true);
      }
      
      setEmail("");
      setName("");
    } catch (error: unknown) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again later or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (subscribed && variant !== "footer") {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center border border-primary/20">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">You're In! 🎉</h3>
        <p className="text-muted-foreground">
          Check your inbox for a welcome email with your first exclusive recipe.
        </p>
      </div>
    );
  }

  if (variant === "blog") {
    return (
      <div className="bg-gradient-to-br from-primary via-primary to-accent rounded-2xl p-8 md:p-12 shadow-warm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Join 10,000+ Food Lovers</span>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            Get Exclusive African Recipes
          </h3>
          <p className="text-primary-foreground/90 mb-6">
            Weekly recipes, cooking tips, and ingredient guides delivered straight to your inbox. 
            Plus, get our free "Essential African Spices" PDF guide!
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/95 border-0 text-foreground flex-1"
              />
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/95 border-0 text-foreground flex-1"
              />
            </div>
            <Button 
              type="submit" 
              variant="secondary"
              size="lg"
              disabled={loading}
              className="w-full sm:w-auto px-8"
            >
              {loading ? "Subscribing..." : "Get Free Recipes"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
          
          <p className="text-xs text-primary-foreground/70 mt-4">
            ✓ Free weekly newsletter · ✓ No spam ever · ✓ Unsubscribe anytime
          </p>
        </div>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className="bg-gradient-primary rounded-2xl p-8 shadow-warm">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-background/20 backdrop-blur-sm rounded-full mb-4">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            Get Weekly African Recipes
          </h3>
          <p className="text-primary-foreground/90 mb-6">
            Join 10,000+ home cooks receiving authentic recipes, cooking tips, and ingredient guides every week.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/95 border-0 text-foreground flex-1"
            />
            <Button 
              type="submit" 
              variant="secondary"
              disabled={loading}
              className="px-8"
            >
              {loading ? "Subscribing..." : "Subscribe"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
          <p className="text-xs text-primary-foreground/70 mt-3">
            Free weekly newsletter. Unsubscribe anytime.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="bg-muted/50 border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Enjoying this article?</h4>
              <p className="text-sm text-muted-foreground">Get more recipes delivered weekly</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-background border-background/20 text-foreground"
        />
        <Button type="submit" variant="secondary" size="sm" className="w-full" disabled={loading}>
          {loading ? "Subscribing..." : subscribed ? "Subscribed! ✓" : "Subscribe"}
          {!subscribed && <ArrowRight className="w-3 h-3 ml-2" />}
        </Button>
        <p className="text-xs text-background/60">
          Unsubscribe anytime.
        </p>
      </form>
    );
  }

  // Default variant
  return (
    <div className="bg-card border border-primary/10 rounded-xl p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Weekly Recipes</h4>
          <p className="text-sm text-muted-foreground">Join 10,000+ subscribers</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" variant="hero" className="w-full" disabled={loading}>
          {loading ? "Subscribing..." : "Get Free Recipes"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Unsubscribe anytime. Privacy guaranteed.
        </p>
      </form>
    </div>
  );
};
