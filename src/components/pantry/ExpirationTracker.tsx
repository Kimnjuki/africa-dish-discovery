import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PantryItemWithExpiry {
  id: string;
  ingredient_name: string;
  quantity?: number;
  unit?: string;
  expires_at?: string;
  storage_location?: string;
  category?: string;
}

export const getFreshnessStatus = (expiresAt?: string) => {
  if (!expiresAt) return { status: 'unknown', daysLeft: null, color: 'gray' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiresAt);
  expiry.setHours(0, 0, 0, 0);
  
  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 0) {
    return { status: 'expired', daysLeft, color: 'red' };
  } else if (daysLeft <= 2) {
    return { status: 'urgent', daysLeft, color: 'orange' };
  } else if (daysLeft <= 7) {
    return { status: 'soon', daysLeft, color: 'yellow' };
  } else {
    return { status: 'fresh', daysLeft, color: 'green' };
  }
};

export const FreshnessIndicator = ({ expiresAt, showText = true }: { expiresAt?: string; showText?: boolean }) => {
  const { status, daysLeft, color } = getFreshnessStatus(expiresAt);
  
  if (status === 'unknown') {
    return showText ? (
      <span className="text-xs text-muted-foreground">No expiry set</span>
    ) : null;
  }

  const statusConfig = {
    expired: {
      icon: AlertCircle,
      text: 'Expired',
      className: 'bg-destructive/10 text-destructive border-destructive/30',
      dotClass: 'bg-destructive'
    },
    urgent: {
      icon: AlertTriangle,
      text: daysLeft === 0 ? 'Expires today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`,
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300',
      dotClass: 'bg-orange-500'
    },
    soon: {
      icon: Clock,
      text: `${daysLeft} days left`,
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300',
      dotClass: 'bg-yellow-500'
    },
    fresh: {
      icon: CheckCircle,
      text: `${daysLeft} days left`,
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300',
      dotClass: 'bg-green-500'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (!showText) {
    return (
      <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", config.dotClass)} 
           title={config.text} />
    );
  }

  return (
    <Badge variant="outline" className={cn("text-xs gap-1 font-normal", config.className)}>
      <Icon className="w-3 h-3" />
      {config.text}
    </Badge>
  );
};

export const FreshnessProgressBar = ({ expiresAt, maxDays = 14 }: { expiresAt?: string; maxDays?: number }) => {
  const { status, daysLeft } = getFreshnessStatus(expiresAt);
  
  if (status === 'unknown' || daysLeft === null) return null;
  
  const percentage = Math.max(0, Math.min(100, (daysLeft / maxDays) * 100));
  
  const colorClass = {
    expired: '[&>div]:bg-destructive',
    urgent: '[&>div]:bg-orange-500',
    soon: '[&>div]:bg-yellow-500',
    fresh: '[&>div]:bg-green-500'
  }[status];

  return (
    <Progress value={percentage} className={cn("h-1.5", colorClass)} />
  );
};

export const CountdownTimer = ({ expiresAt }: { expiresAt?: string }) => {
  const { status, daysLeft } = getFreshnessStatus(expiresAt);
  
  if (status === 'unknown' || daysLeft === null) return null;
  
  if (status === 'expired') {
    return (
      <div className="text-destructive font-bold text-lg">
        Expired {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? 'day' : 'days'} ago
      </div>
    );
  }

  const urgencyClass = {
    urgent: 'text-orange-600 dark:text-orange-400',
    soon: 'text-yellow-600 dark:text-yellow-400',
    fresh: 'text-green-600 dark:text-green-400'
  }[status];

  return (
    <div className={cn("font-semibold", urgencyClass)}>
      <span className="text-2xl font-bold">{daysLeft}</span>
      <span className="text-sm ml-1">{daysLeft === 1 ? 'day' : 'days'} left</span>
    </div>
  );
};

interface ExpirationSummaryProps {
  items: PantryItemWithExpiry[];
}

export const ExpirationSummary = ({ items }: ExpirationSummaryProps) => {
  const itemsByStatus = items.reduce((acc, item) => {
    const { status } = getFreshnessStatus(item.expires_at);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = items.length;
  if (total === 0) return null;

  return (
    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-destructive" />
        <span className="text-sm">{itemsByStatus.expired || 0} expired</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-orange-500" />
        <span className="text-sm">{itemsByStatus.urgent || 0} urgent</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="text-sm">{itemsByStatus.soon || 0} soon</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-sm">{itemsByStatus.fresh || 0} fresh</span>
      </div>
    </div>
  );
};
