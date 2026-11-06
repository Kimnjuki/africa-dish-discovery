import { useEffect } from 'react';
import { BlogPost } from '@/data/blogPosts';

interface BlogSchemaProps {
  post: BlogPost;
}

export const BlogSchema = ({ post }: BlogSchemaProps) => {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "image": post.image || "https://www.ladhaquest.com/placeholder.svg",
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "LadhaQuest",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.ladhaquest.com/pwa-512x512.png"
        }
      },
      "datePublished": post.publishedAt,
      "dateModified": post.publishedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://www.ladhaquest.com/blog/${post.slug}`
      },
      "articleSection": post.category,
      "keywords": post.tags?.join(", ") || post.category
    };

    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.text = JSON.stringify(schema);
    scriptTag.id = `blog-schema-${post.slug}`;
    
    const existingScript = document.getElementById(`blog-schema-${post.slug}`);
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(scriptTag);

    return () => {
      const script = document.getElementById(`blog-schema-${post.slug}`);
      if (script) {
        script.remove();
      }
    };
  }, [post]);

  return null;
};
