import { useEffect, useState } from "react";
import { Download, Smartphone, Wifi, WifiOff, Check, ChefHat, Gauge, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePWA } from "@/hooks/usePWA";
import { useDataSaver } from "@/hooks/useDataSaver";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { HubSeoContent } from "@/components/seo/HubSeoContent";
import { useToast } from "@/hooks/use-toast";
import {
  FREE_LIMITS,
  isPremiumUnlocked,
  PREMIUM_COPY,
  setPremiumUnlocked,
} from "@/lib/premium";

const Install = () => {
  const { isInstallable, isInstalled, isOffline, installApp } = usePWA();
  const { dataSaver, setDataSaver } = useDataSaver();
  const { toast } = useToast();
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    setPremium(isPremiumUnlocked());
    const onPremium = () => setPremium(isPremiumUnlocked());
    window.addEventListener("ladhaquest:premium", onPremium);
    return () => window.removeEventListener("ladhaquest:premium", onPremium);
  }, []);

  const togglePremium = (enabled: boolean) => {
    setPremiumUnlocked(enabled);
    setPremium(enabled);
    toast({
      title: enabled ? "Premium unlocked (beta)" : "Back on Free tier",
      description: enabled
        ? "Unlimited offline packs and AI meal plans on this device until Stripe ships."
        : `Free includes ${FREE_LIMITS.offlineCookPacks} offline packs and ${FREE_LIMITS.weeklyAiMealPlans} AI plans/week.`,
    });
  };

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast({
        title: "App Installed!",
        description: "LadhaQuest is now on your home screen.",
      });
    }
  };

  const features = [
    {
      icon: WifiOff,
      title: "Works Offline",
      description: "Saved recipes, last pantry snapshot, and last meal plan"
    },
    {
      icon: Gauge,
      title: "Data Saver",
      description: "Lighter images and no video autoplay on mobile data"
    },
    {
      icon: Smartphone,
      title: "Home Screen Access",
      description: "Launch LadhaQuest like a native app from your device"
    },
    {
      icon: ChefHat,
      title: "Kitchen Mode",
      description: "Large text and screen stays on while cooking"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Install LadhaQuest App | Offline African Recipes"
        description="Install LadhaQuest on your device for offline access to authentic African recipes. Works without internet connection."
        keywords="install app, pwa, offline recipes, african cooking app"
      />
      
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Status indicator */}
          <div className="mb-8 flex justify-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              isOffline 
                ? "bg-amber-500/20 text-amber-400" 
                : "bg-green-500/20 text-green-400"
            }`}>
              {isOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
              {isOffline ? "You're offline" : "You're online"}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Install LadhaQuest
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Get the full app experience with offline access to your favorite African recipes
          </p>

          {/* Install status */}
          {isInstalled ? (
            <Card className="mb-8 border-green-500/30 bg-green-500/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3 text-green-400">
                  <Check className="h-6 w-6" />
                  <span className="text-lg font-medium">App is installed!</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  LadhaQuest is ready on your home screen
                </p>
              </CardContent>
            </Card>
          ) : isInstallable ? (
            <Button 
              size="lg" 
              onClick={handleInstall}
              className="mb-8 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Download className="mr-2 h-5 w-5" />
              Install App
            </Button>
          ) : (
            <Card className="mb-8 border-muted">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  <strong>To install on iOS:</strong> Tap the Share button in Safari, then "Add to Home Screen"
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>To install on Android:</strong> Tap the menu (⋮) in Chrome, then "Install app"
                </p>
              </CardContent>
            </Card>
          )}

          {/* Freemium */}
          <Card className="mb-8 bg-card/50 border-border text-left">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {PREMIUM_COPY.headline}
              </CardTitle>
              <CardDescription>
                Core African cooking stays free. Premium unlocks automation — not the recipe library.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-2">Free includes</p>
                  <ul className="space-y-1 text-muted-foreground">
                    {PREMIUM_COPY.freeIncludes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Premium adds</p>
                  <ul className="space-y-1 text-muted-foreground">
                    {PREMIUM_COPY.premiumIncludes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-border">
                <Label htmlFor="premium-unlock" className="text-sm font-normal cursor-pointer">
                  Unlock Premium on this device (beta — billing coming soon)
                </Label>
                <Switch
                  id="premium-unlock"
                  checked={premium}
                  onCheckedChange={togglePremium}
                  aria-label="Unlock Premium"
                />
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/import-recipe">Import a family recipe</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Data saver */}
          <Card className="mb-8 bg-card/50 border-border text-left">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                Data saver
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <Label htmlFor="install-data-saver" className="text-sm text-muted-foreground font-normal cursor-pointer">
                Prefer lighter images and skip cultural video autoplay.
              </Label>
              <Switch
                id="install-data-saver"
                checked={dataSaver}
                onCheckedChange={setDataSaver}
                aria-label="Enable data saver"
              />
            </CardContent>
          </Card>

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/50 border-border">
                <CardHeader>
                  <feature.icon className="h-10 w-10 mx-auto text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Offline content info */}
          <Card className="mt-12 bg-card/50 border-border">
            <CardHeader>
              <CardTitle>What works offline?</CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  Recently opened recipes (cached on view, capped)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  Last meal plan snapshot
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  Last pantry snapshot + queued edits
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  Installable PWA shell and static assets
                </li>
              </ul>
              <Button asChild variant="outline" size="sm">
                <Link to="/offline-recipes">Open offline mode</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <HubSeoContent path="/install" hideHeading />
      </main>

      <Footer />
    </div>
  );
};

export default Install;
