import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

const SITE = "https://www.ladhaquest.com";

/** Visible breadcrumb trail plus matching BreadcrumbList JSON-LD. */
export const Breadcrumbs = ({ items }: { items: Crumb[] }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${SITE}${c.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {items.map((c, i) => (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1">
              {c.href ? (
                <Link to={c.href} className="hover:text-foreground transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{c.label}</span>
              )}
              {i < items.length - 1 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};
