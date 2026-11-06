import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, User, Calendar, Share2, Bookmark, Tag } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { BlogSchema } from "@/components/blog/BlogSchema";
import { BlogImagePlaceholder } from "@/components/blog/BlogImagePlaceholder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/data/blogPosts";
import { toast } from "sonner";

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The article you're looking for doesn't exist.
            </p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleBookmark = () => {
    toast.success("Article saved to your reading list!");
  };

  // Convert markdown-like content to HTML-like structure
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let inList = false;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Handle headers
      if (trimmedLine.startsWith("## ")) {
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-6 mb-6 space-y-2">
              {listItems.map((item, i) => (
                <li key={i} className="text-foreground/90">{item}</li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-foreground">
            {trimmedLine.replace("## ", "")}
          </h2>
        );
      }
      // Handle bold text headers (like **Bold:**)
      else if (trimmedLine.startsWith("**") && trimmedLine.includes(":**")) {
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-6 mb-6 space-y-2">
              {listItems.map((item, i) => (
                <li key={i} className="text-foreground/90">{item}</li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        const boldText = trimmedLine.replace(/\*\*/g, "");
        elements.push(
          <h3 key={index} className="text-lg font-semibold mt-6 mb-3 text-foreground">
            {boldText}
          </h3>
        );
      }
      // Handle list items
      else if (trimmedLine.startsWith("- ")) {
        inList = true;
        listItems.push(trimmedLine.replace("- ", ""));
      }
      // Handle numbered list items
      else if (/^\d+\.\s/.test(trimmedLine)) {
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-6 mb-6 space-y-2">
              {listItems.map((item, i) => (
                <li key={i} className="text-foreground/90">{item}</li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <p key={index} className="mb-2 text-foreground/90 pl-4">
            {trimmedLine}
          </p>
        );
      }
      // Handle regular paragraphs
      else if (trimmedLine.length > 0) {
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-6 mb-6 space-y-2">
              {listItems.map((item, i) => (
                <li key={i} className="text-foreground/90">{item}</li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <p key={index} className="mb-4 text-foreground/90 leading-relaxed">
            {trimmedLine}
          </p>
        );
      }
    });

    // Handle any remaining list items
    if (listItems.length > 0) {
      elements.push(
        <ul key="final-list" className="list-disc pl-6 mb-6 space-y-2">
          {listItems.map((item, i) => (
            <li key={i} className="text-foreground/90">{item}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  // Get related posts
  const relatedPosts = blogPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <PageMeta
        title={`${post.title} | LadhaQuest Blog`}
        description={post.excerpt}
        keywords={post.tags.join(", ")}
        canonical={`https://www.ladhaquest.com/blog/${post.slug}`}
      />
      <BlogSchema post={post} />

      <Navigation />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative">
          <div className="aspect-[21/9] w-full overflow-hidden">
            {post.image && post.image !== "/placeholder.svg" ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BlogImagePlaceholder
                category={post.category}
                title={post.title}
                className="w-full h-full"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>

          <div className="container mx-auto px-6 relative -mt-32 z-10">
            <div className="max-w-4xl mx-auto">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>

              <Badge className="mb-4">{post.category}</Badge>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={handleBookmark}>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <article className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="border-t border-border pt-8">
                {renderContent(post.content)}
              </div>
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center gap-3 flex-wrap">
                <Tag className="w-4 h-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Author Card */}
            <div className="mt-8 p-6 bg-muted rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{post.author}</h4>
                  <p className="text-muted-foreground text-sm">
                    Bringing authentic African recipes and culinary stories to food lovers worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-muted/30 py-16">
            <div className="container mx-auto px-6">
              <h2 className="text-2xl font-bold mb-8 text-center">
                Related Articles
              </h2>
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="group"
                  >
                    <div className="bg-card rounded-xl overflow-hidden hover:shadow-warm transition-all duration-300">
                      <div className="aspect-video overflow-hidden">
                        {relatedPost.image && relatedPost.image !== "/placeholder.svg" ? (
                          <img
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <BlogImagePlaceholder
                            category={relatedPost.category}
                            title={relatedPost.title}
                            className="w-full h-full"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <Badge variant="secondary" className="text-xs mb-2">
                          {relatedPost.category}
                        </Badge>
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          {relatedPost.readTime}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogArticle;
