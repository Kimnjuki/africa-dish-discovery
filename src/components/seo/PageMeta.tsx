import { useEffect } from 'react';

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
    // Set title
    document.title = title;
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
    updateMeta('title', title);
    updateMeta('description', description);
    if (keywords) updateMeta('keywords', keywords);
    updateMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph tags
    updateMeta('og:type', type, true);
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', absoluteOg, true);
    updateMeta('og:url', canonical || window.location.href, true);
    updateMeta('og:site_name', 'LadhaQuest', true);

    // Twitter tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', absoluteOg);

    // Canonical URL
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.rel = 'canonical';
        document.head.appendChild(linkElement);
      }
      linkElement.href = canonical;
    }
  }, [title, description, keywords, ogImage, canonical, type, noIndex]);

  return null;
};
