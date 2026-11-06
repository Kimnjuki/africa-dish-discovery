import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Share2, Copy, Check, Link, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MealPlanShareProps {
  mealPlanId: string;
  mealPlanName: string;
  isPublic?: boolean;
  shareToken?: string | null;
  onShareUpdate?: (isPublic: boolean, shareToken: string | null) => void;
}

const generateShareToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const MealPlanShare = ({ 
  mealPlanId, 
  mealPlanName, 
  isPublic = false, 
  shareToken,
  onShareUpdate 
}: MealPlanShareProps) => {
  const [isSharing, setIsSharing] = useState(isPublic);
  const [token, setToken] = useState(shareToken);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const shareUrl = token 
    ? `${window.location.origin}/shared-meal-plan/${token}` 
    : null;

  const toggleSharing = async (enabled: boolean) => {
    setLoading(true);
    try {
      const newToken = enabled ? generateShareToken() : null;
      
      const { error } = await supabase
        .from('meal_plans')
        .update({ 
          is_public: enabled, 
          share_token: newToken 
        })
        .eq('id', mealPlanId);

      if (error) throw error;

      setIsSharing(enabled);
      setToken(newToken);
      onShareUpdate?.(enabled, newToken);

      toast.success(enabled 
        ? "Meal plan is now shareable!" 
        : "Sharing disabled"
      );
    } catch (error) {
      console.error('Error updating share settings:', error);
      toast.error("Failed to update share settings");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareViaWebShare = async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Meal Plan: ${mealPlanName}`,
          text: `Check out my meal plan "${mealPlanName}" on LadhaQuest!`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== 'AbortError') {
          toast.error("Failed to share");
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Share Meal Plan
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="share-toggle" className="text-base">
                Enable sharing
              </Label>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can view this meal plan
              </p>
            </div>
            <Switch
              id="share-toggle"
              checked={isSharing}
              onCheckedChange={toggleSharing}
              disabled={loading}
            />
          </div>

          {isSharing && shareUrl && (
            <div className="space-y-3">
              <Label>Share link</Label>
              <div className="flex gap-2">
                <Input 
                  value={shareUrl} 
                  readOnly 
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={shareViaWebShare}
                  className="flex-1"
                  variant="default"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share with Friends
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Share via WhatsApp, email, or any messaging app
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};