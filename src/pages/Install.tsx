import { Download, Smartphone, Wifi, WifiOff, Check, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePWA } from "@/hooks/usePWA";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { useToast } from "@/hooks/use-toast";

const Install = () => {
  const { isInstallable, isInstalled, isOffline, installApp } = usePWA();
  const { toast } = useToast();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast({
        title: "App Installed!",
        description: "TasteAfrica is now on your home screen.",
      });
    }
  };

  const features = [
    {
      icon: WifiOff,
      title: "Works Offline",
      description: "Access saved recipes even without internet connection"
    },
    {
      icon: Smartphone,
      title: "Home Screen Access",
      description: "Launch TasteAfrica like a native app from your device"
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
        title="Install TasteAfrica App | Offline African Recipes"
        description="Install TasteAfrica on your device for offline access to authentic African recipes. Works without internet connection."
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
            Install TasteAfrica
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
                  TasteAfrica is ready on your home screen
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

          {/* Features grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
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
            <CardContent className="text-left">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  Recently viewed recipes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  Saved favorites and meal plans
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  Your pantry ingredients list
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  Shopping lists
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Install;
