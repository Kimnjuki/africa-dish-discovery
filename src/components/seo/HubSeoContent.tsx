import { Link } from "react-router-dom";
import { getHubSeoContent } from "@/lib/hubSeoContent";

interface HubSeoContentProps {
  path: string;
  /** When true, skip repeating the page H1 (use if the page already has one). */
  hideHeading?: boolean;
  className?: string;
}

/**
 * Visible, crawlable hub prose to fix “low word count” on SPA marketing pages.
 * Content is shared with prerender-seo shells.
 */
export function HubSeoContent({ path, hideHeading = false, className = "" }: HubSeoContentProps) {
  const content = getHubSeoContent(path);
  if (!content) return null;

  return (
    <section
      className={`border-t border-border/60 bg-muted/20 ${className}`}
      aria-label="About this page"
    >
      <div className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        {!hideHeading && (
          <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">{content.h1}</h2>
        )}
        <p className="mb-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {content.intro}
        </p>
        {content.sections.map((section) => (
          <div key={section.heading || section.paragraphs[0]?.slice(0, 24)} className="mb-8 last:mb-0">
            {section.heading && (
              <h3 className="mb-3 text-lg font-semibold text-foreground sm:text-xl">
                {section.heading}
              </h3>
            )}
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {p}
              </p>
            ))}
            {section.links && section.links.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-primary hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
