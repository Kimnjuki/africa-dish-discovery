import { useEffect } from 'react';
import { toCanonicalUrl } from '@/lib/recipeSeoOverrides';

interface PageMetaProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  type?: 'website' | 'article';
  /** App-only surfaces that should not compete in organic search. */
  noIndex?: boolean;
}

/** Prefer sentence/word boundaries so SERP snippets stay readable. */
function clipText(text: string, max: number): string {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max - 1);
  const cut = Math.max(sliced.lastIndexOf(". "), sliced.lastIndexOf(" "));
  return `${(cut > Math.floor(max * 0.4) ? sliced.slice(0, cut) : sliced).trim()}…`;
}

export const PageMeta = ({
  title,
  description,
  keywords,
  ogImage = 'https://www.ladhaquest.com/og-image.jpg',
  canonical,
  type = 'website',
  noIndex = false,
}: PageMetaProps) => {
  useEffect(() => {
    const safeTitle = clipText(title, 60);
    const safeDescription = clipText(description, 155);
    const safeCanonical = canonical ? toCanonicalUrl(canonical) : undefined;
    // Set title
    document.title = safeTitle;
    const absoluteOg = ogImage.startsWith('http')
      ? ogImage
      : `https://www.ladhaquest.com${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Primary meta tags
    updateMeta('title', safeTitle);
    updateMeta('description', safeDescription);
    if (keywords) updateMeta('keywords', keywords);
    updateMeta(
      'robots',
      noIndex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // Open Graph tags
    updateMeta('og:type', type, true);
    updateMeta('og:title', safeTitle, true);
    updateMeta('og:description', safeDescription, true);
    updateMeta('og:image', absoluteOg, true);
    updateMeta('og:url', safeCanonical || toCanonicalUrl(window.location.href), true);
    updateMeta('og:site_name', 'LadhaQuest', true);

    // Twitter tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', safeTitle);
    updateMeta('twitter:description', safeDescription);
    updateMeta('twitter:image', absoluteOg);

    // Canonical URL (always slash-free on www)
    if (safeCanonical) {
      let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.rel = 'canonical';
        document.head.appendChild(linkElement);
      }
      linkElement.href = safeCanonical;
    }
  }, [title, description, keywords, ogImage, canonical, type, noIndex]);

  return null;
};
