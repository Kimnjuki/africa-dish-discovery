import { Link } from "react-router-dom";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { usePWA } from "@/hooks/usePWA";
import { getPantryQueue } from "@/lib/offlineStore";

export function OfflineIndicator() {
  const { isOffline } = usePWA();
  const [pending, setPending] = useState(() =>
    typeof window !== "undefined" ? getPantryQueue().length : 0
  );

  useEffect(() => {
    const onQueue = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      setPending(typeof detail === "number" ? detail : getPantryQueue().length);
    };
    const onOnline = () => setPending(getPantryQueue().length);
    window.addEventListener("ladhaquest:pantry-queue", onQueue as EventListener);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("ladhaquest:pantry-queue", onQueue as EventListener);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  if (!isOffline && pending === 0) return null;

  if (!isOffline && pending > 0) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-left-4">
        <span>
          Syncing {pending} pantry change{pending === 1 ? "" : "s"}…
        </span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-amber-500/90 text-amber-950 px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-left-4">
      <WifiOff className="h-4 w-4" />
      <span>You're offline</span>
      {pending > 0 && (
        <span className="opacity-80">· {pending} queued</span>
      )}
      <Link to="/offline-recipes" className="underline underline-offset-2 ml-1">
        View cache
      </Link>
    </div>
  );
}
