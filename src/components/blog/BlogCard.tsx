import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, User, Calendar } from "lucide-react";
import { BlogImagePlaceholder } from "./BlogImagePlaceholder";
import { BlogPost } from "@/data/blogPosts";

interface BlogCardProps {
  post: BlogPost;
  variant?: "default" | "featured" | "compact";
}

export const BlogCard = ({ post, variant = "default" }: BlogCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (variant === "featured") {
    return (
      <Card className="overflow-hidden hover:shadow-warm transition-all duration-300 group border-0 bg-card">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-video md:aspect-auto">
            {post.image && post.image !== "/placeholder.svg" ? (
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <BlogImagePlaceholder 
                category={post.category} 
                title={post.title}
                className="w-full h-full min-h-[250px]"
              />
            )}
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary text-primary-foreground shadow-lg">
                Featured
              </Badge>
            </div>
          </div>
          
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="secondary" className="text-xs">
                {post.category}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
            </div>
            
            <Link to={`/blog/${post.slug}`}>
              <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>
            
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
                <span className="text-muted-foreground/50">·</span>
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              
              <Link 
                to={`/blog/${post.slug}`}
                className="text-primary font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
              >
                Read More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Card className="overflow-hidden hover:shadow-soft transition-all duration-300 group border-0 bg-card">
        <div className="flex gap-4 p-4">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
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
          </div>
          
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className="text-xs mb-2">
              {post.category}
            </Badge>
            <Link to={`/blog/${post.slug}`}>
              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h4>
            </Link>
            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="overflow-hidden hover:shadow-warm transition-all duration-300 group border-0 bg-card h-full flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden">
        {post.image && post.image !== "/placeholder.svg" ? (
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <BlogImagePlaceholder 
            category={post.category} 
            title={post.title}
            className="w-full h-full"
          />
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="secondary" className="text-xs">
            {post.category}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>
        <Link to={`/blog/${post.slug}`}>
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {formatDate(post.publishedAt)}
          </span>
          <Link 
            to={`/blog/${post.slug}`}
            className="text-primary font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            Read
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
