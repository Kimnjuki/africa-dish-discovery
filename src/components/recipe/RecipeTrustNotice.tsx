import { AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecipeTrustNoticeProps {
  verificationStatus?: string | null;
  safetyNotes?: string | null;
  itemType?: string | null;
  className?: string;
}

/**
 * Shows how well-sourced an entry is plus any food-safety guidance
 * (fermentation, home-brewed alcohol, raw preparations).
 */
export const RecipeTrustNotice = ({
  verificationStatus,
  safetyNotes,
  itemType,
  className = "",
}: RecipeTrustNoticeProps) => {
  if (!verificationStatus && !safetyNotes && !itemType) return null;

  const documented = !!verificationStatus && /documented/i.test(verificationStatus);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {itemType && (
          <Badge variant="outline" className="capitalize">
            {itemType.replace(/_/g, " ")}
          </Badge>
        )}
        {verificationStatus && (
          <Badge variant={documented ? "secondary" : "outline"} className="flex items-center gap-1">
            {documented ? <ShieldCheck className="w-3 h-3" /> : <Info className="w-3 h-3" />}
            {verificationStatus}
          </Badge>
        )}
      </div>

      {safetyNotes && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-muted-foreground">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
          <p>
            <span className="font-medium text-foreground">Safety note: </span>
            {safetyNotes}
          </p>
        </div>
      )}
    </div>
  );
};
