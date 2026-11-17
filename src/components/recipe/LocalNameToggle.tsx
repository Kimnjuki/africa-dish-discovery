import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { readPreferLocalNames, writePreferLocalNames } from "@/lib/namePreference";

export function usePreferLocalNames() {
  const [preferLocal, setPreferLocal] = useState(false);

  useEffect(() => {
    setPreferLocal(readPreferLocalNames());
  }, []);

  const toggle = () => {
    setPreferLocal((current) => {
      const next = !current;
      writePreferLocalNames(next);
      return next;
    });
  };

  return { preferLocal, toggle };
}

export function LocalNameToggle({
  preferLocal,
  onToggle,
  disabled = false,
}: {
  preferLocal: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-11"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={preferLocal}
    >
      <Languages className="mr-2 h-4 w-4" />
      {preferLocal ? "Showing local names" : "Show local names"}
    </Button>
  );
}
