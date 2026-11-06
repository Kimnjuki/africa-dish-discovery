import { WifiOff } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

export function OfflineIndicator() {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-amber-500/90 text-amber-950 px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-left-4">
      <WifiOff className="h-4 w-4" />
      <span>You're offline</span>
    </div>
  );
}
