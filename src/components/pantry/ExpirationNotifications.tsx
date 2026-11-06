import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Mail, Smartphone, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PantryItemWithExpiry, getFreshnessStatus } from "./ExpirationTracker";

interface ExpirationNotificationsProps {
  items: PantryItemWithExpiry[];
  userEmail?: string;
}

const ExpirationNotifications = ({ items, userEmail }: ExpirationNotificationsProps) => {
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [emailDigest, setEmailDigest] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Get expiring items
  const expiringItems = items.filter(item => {
    const { status } = getFreshnessStatus(item.expires_at);
    return ['expired', 'urgent', 'soon'].includes(status);
  });

  const urgentItems = items.filter(item => {
    const { status } = getFreshnessStatus(item.expires_at);
    return ['expired', 'urgent'].includes(status);
  });

  useEffect(() => {
    // Check notification permission on mount
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error("Your browser doesn't support notifications");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setBrowserNotifications(true);
        toast.success("Notifications enabled!");
        
        // Send a test notification
        new Notification("LadhaQuest Pantry", {
          body: "You'll now receive alerts for expiring ingredients!",
          icon: "/favicon.ico"
        });
      } else {
        toast.error("Notification permission denied");
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      toast.error("Failed to enable notifications");
    }
  };

  const toggleBrowserNotifications = async () => {
    if (browserNotifications) {
      setBrowserNotifications(false);
      toast.success("Notifications disabled");
    } else {
      if (notificationPermission === 'granted') {
        setBrowserNotifications(true);
        toast.success("Notifications enabled");
      } else {
        await requestNotificationPermission();
      }
    }
  };

  const sendTestNotification = () => {
    if (notificationPermission !== 'granted') {
      toast.error("Please enable notifications first");
      return;
    }

    if (urgentItems.length > 0) {
      new Notification("⚠️ Expiring Items Alert!", {
        body: `You have ${urgentItems.length} item(s) expiring soon: ${urgentItems.map(i => i.ingredient_name).slice(0, 3).join(", ")}${urgentItems.length > 3 ? '...' : ''}`,
        icon: "/favicon.ico",
        tag: "expiry-alert"
      });
    } else {
      new Notification("✅ Pantry Status: All Good!", {
        body: "No urgent items to use. Keep tracking your ingredients!",
        icon: "/favicon.ico"
      });
    }
    toast.success("Test notification sent!");
  };

  const sendEmailDigest = async () => {
    if (!userEmail) {
      toast.error("Please sign in to receive email digests");
      return;
    }

    if (expiringItems.length === 0) {
      toast.info("No expiring items to report");
      return;
    }

    setSendingEmail(true);

    try {
      const { data, error } = await supabase.functions.invoke('pantry-expiry-email', {
        body: {
          email: userEmail,
          expiringItems: expiringItems.map(item => ({
            name: item.ingredient_name,
            expiresAt: item.expires_at,
            status: getFreshnessStatus(item.expires_at).status,
            daysLeft: getFreshnessStatus(item.expires_at).daysLeft
          }))
        }
      });

      if (error) throw error;
      
      toast.success("Email digest sent!");
      setEmailDigest(true);
    } catch (error) {
      console.error('Email error:', error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  // Schedule browser notifications for expiring items
  useEffect(() => {
    if (!browserNotifications || notificationPermission !== 'granted') return;

    // Check for urgent items and notify
    if (urgentItems.length > 0) {
      // Schedule a notification (immediate for now, could be scheduled)
      const timeout = setTimeout(() => {
        new Notification("🔔 Pantry Alert", {
          body: `${urgentItems.length} item(s) need attention: ${urgentItems.map(i => i.ingredient_name).slice(0, 3).join(", ")}`,
          icon: "/favicon.ico",
          tag: "expiry-reminder"
        });
      }, 5000); // 5 second delay to not spam on page load

      return () => clearTimeout(timeout);
    }
  }, [browserNotifications, notificationPermission, urgentItems]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Expiration Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert Summary */}
        {expiringItems.length > 0 ? (
          <div className="flex items-center gap-3 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-medium text-orange-700 dark:text-orange-400">
                {expiringItems.length} items need attention
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-300">
                {urgentItems.length} urgent, {expiringItems.length - urgentItems.length} expiring soon
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="font-medium text-green-700 dark:text-green-400">
              All items are fresh!
            </p>
          </div>
        )}

        {/* Browser Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Browser Notifications</p>
              <p className="text-sm text-muted-foreground">
                Get instant alerts for expiring items
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notificationPermission === 'denied' && (
              <Badge variant="destructive">Blocked</Badge>
            )}
            <Switch
              checked={browserNotifications}
              onCheckedChange={toggleBrowserNotifications}
              disabled={notificationPermission === 'denied'}
            />
          </div>
        </div>

        {/* Test Notification Button */}
        {browserNotifications && (
          <Button variant="outline" size="sm" onClick={sendTestNotification}>
            <Bell className="w-4 h-4 mr-2" />
            Send Test Notification
          </Button>
        )}

        {/* Email Digest */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Email Digest</p>
              <p className="text-sm text-muted-foreground">
                {userEmail ? `Send to ${userEmail}` : 'Sign in to enable'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={sendEmailDigest}
            disabled={!userEmail || sendingEmail || expiringItems.length === 0}
          >
            {sendingEmail ? "Sending..." : "Send Now"}
          </Button>
        </div>

        {/* Expiring Items List */}
        {expiringItems.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Items needing attention:</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {expiringItems.slice(0, 10).map((item) => {
                const { status, daysLeft } = getFreshnessStatus(item.expires_at);
                return (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
                  >
                    <span>{item.ingredient_name}</span>
                    <Badge 
                      variant="outline" 
                      className={
                        status === 'expired' ? 'border-destructive text-destructive' :
                        status === 'urgent' ? 'border-orange-500 text-orange-500' :
                        'border-yellow-500 text-yellow-500'
                      }
                    >
                      {status === 'expired' ? 'Expired' : 
                       daysLeft === 0 ? 'Today' : 
                       daysLeft === 1 ? '1 day' : `${daysLeft} days`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {notificationPermission === 'denied' && (
          <p className="text-xs text-muted-foreground">
            Browser notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpirationNotifications;
