import { useEffect } from "react";
import type { FaqItem } from "@/lib/recipeSeoEnrichment";

interface FaqSchemaProps {
  faqs: FaqItem[];
  /** Stable id fragment so multiple pages don't collide in head. */
  idKey: string;
}

/**
 * Emits FAQPage JSON-LD only when matching visible FAQs are on the page.
 * Blueprint rule: never ship FAQ schema without visible Q&A.
 */
export function FaqSchema({ faqs, idKey }: FaqSchemaProps) {
  useEffect(() => {
    if (!faqs?.length) return;
    const scriptId = `faq-schema-${idKey}`;
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    };

    const scriptTag = document.createElement("script");
    scriptTag.type = "application/ld+json";
    scriptTag.id = scriptId;
    scriptTag.text = JSON.stringify(schema);
    document.getElementById(scriptId)?.remove();
    document.head.appendChild(scriptTag);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [faqs, idKey]);

  return null;
}
