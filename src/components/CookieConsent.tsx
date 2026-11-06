import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

const COOKIE_CONSENT_KEY = "tasteafrica_cookie_consent";
const COOKIE_PREFERENCES_KEY = "tasteafrica_cookie_preferences";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    personalization: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  const saveConsent = (accepted: boolean, prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, accepted ? "accepted" : "rejected");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    setPreferences(allAccepted);
    saveConsent(true, allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    setPreferences(allRejected);
    saveConsent(false, allRejected);
  };

  const handleSavePreferences = () => {
    saveConsent(true, preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return; // Cannot toggle necessary cookies
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!showBanner && !showSettings) return null;

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && !showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-4xl mx-auto bg-card border rounded-xl shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  We Value Your Privacy
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We use cookies to enhance your browsing experience, serve personalized ads or content, 
                  and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
                  Read our{" "}
                  <a href="/privacy-policy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>{" "}
                  for more information.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleAcceptAll}>
                    Accept All
                  </Button>
                  <Button variant="outline" onClick={handleRejectAll}>
                    Reject All
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSettings(true)}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Cookie Settings
                  </Button>
                </div>
              </div>
              <button 
                onClick={handleRejectAll}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close cookie banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Cookie Settings
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. You can enable or disable different types of cookies below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label className="text-base font-medium">Necessary Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Essential for the website to function properly. Cannot be disabled.
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label className="text-base font-medium">Analytics Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
              <Switch 
                checked={preferences.analytics}
                onCheckedChange={() => togglePreference("analytics")}
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label className="text-base font-medium">Marketing Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Used for advertising and tracking across websites (Google AdSense).
                </p>
              </div>
              <Switch 
                checked={preferences.marketing}
                onCheckedChange={() => togglePreference("marketing")}
              />
            </div>

            {/* Personalization Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label className="text-base font-medium">Personalization Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Remember your preferences and provide personalized features.
                </p>
              </div>
              <Switch 
                checked={preferences.personalization}
                onCheckedChange={() => togglePreference("personalization")}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSavePreferences} className="flex-1">
              Save Preferences
            </Button>
            <Button variant="outline" onClick={handleAcceptAll} className="flex-1">
              Accept All
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            For more details, see our{" "}
            <a href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Export a button component to open cookie settings from footer
export const CookieSettingsButton = () => {
  const openSettings = () => {
    // Remove consent to show banner again with settings
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.location.reload();
  };

  return (
    <button 
      onClick={openSettings}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      Cookie Settings
    </button>
  );
};
