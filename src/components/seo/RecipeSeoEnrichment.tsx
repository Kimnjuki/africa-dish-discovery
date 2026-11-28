import { Link } from "react-router-dom";
import { HelpCircle, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaqSchema } from "@/components/seo/FaqSchema";
import type { RecipeEnrichment } from "@/lib/recipeSeoEnrichment";

interface RecipeSeoEnrichmentProps {
  slug: string;
  enrichment: RecipeEnrichment;
}

/** Visible FAQ + curated internal links for Week 2 page-2 recipe upgrades. */
export function RecipeSeoEnrichmentBlock({ slug, enrichment }: RecipeSeoEnrichmentProps) {
  const { faqs, internalLinks, keyPhrases } = enrichment;

  return (
    <>
      {faqs.length > 0 && (
        <>
          <FaqSchema faqs={faqs} idKey={slug} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Frequently asked questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {keyPhrases && keyPhrases.length > 0 && (
                <p className="mb-4 text-sm text-muted-foreground">
                  Common searches: {keyPhrases.join(" · ")}
                </p>
              )}
              <Accordion type="multiple" className="w-full">
                {faqs.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-sm sm:text-base">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </>
      )}

      {internalLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Explore related dishes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {internalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}
