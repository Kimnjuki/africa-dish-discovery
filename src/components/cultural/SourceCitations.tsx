import { ExternalLink, Library } from "lucide-react";

export interface CulturalSource {
  title: string;
  publisher?: string;
  url: string;
}

/** Normalises whatever shape the DB jsonb holds into a safe list of citations. */
export function parseSources(raw: unknown): CulturalSource[] {
  if (!raw) return [];
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((s): CulturalSource | null => {
      if (!s || typeof s !== "object") return null;
      const item = s as Record<string, unknown>;
      const url = typeof item.url === "string" ? item.url : "";
      const title = typeof item.title === "string" ? item.title : "";
      if (!url || !/^https?:\/\//i.test(url) || !title) return null;
      return {
        title,
        publisher: typeof item.publisher === "string" ? item.publisher : undefined,
        url,
      };
    })
    .filter((s): s is CulturalSource => s !== null);

}

interface SourceCitationsProps {
  sources: unknown;
  label?: string;
  className?: string;
}

export function SourceCitations({ sources, label = "Sources", className }: SourceCitationsProps) {
  const list = parseSources(sources);
  if (list.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
        <Library className="h-3.5 w-3.5" />
        {label}
      </p>
      <ol className="space-y-1 list-decimal list-inside">
        {list.map((s) => (
          <li key={s.url} className="text-xs text-muted-foreground">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary hover:underline inline-flex items-start gap-1"
            >
              <span>{s.title}</span>
              <ExternalLink className="h-3 w-3 mt-0.5 shrink-0" />
            </a>
            {s.publisher && <span className="ml-1">— {s.publisher}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
