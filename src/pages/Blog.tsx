import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, TrendingUp, Utensils, Globe, Sparkles } from "lucide-react";
import { blogPosts, categories } from "@/data/blogPosts";
import { BlogCard } from "@/components/blog/BlogCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured).slice(0, 2);
  const recentPosts = [...blogPosts].sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  ).slice(0, 6);

  const popularTags = ["jollof rice", "nigerian food", "ethiopian food", "west african", "street food", "grilled meat"];

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="African Food Blog | Authentic Recipes, Guides & Cooking Tips | LadhaQuest"
        description="Discover authentic African recipes with step-by-step guides. From Nigerian Jollof to Ethiopian Doro Wat, learn to cook Africa's most beloved dishes at home."
        keywords="african food blog, african recipes, nigerian food, ethiopian recipes, ghanaian food, west african cooking, east african cuisine"
        canonical="https://www.ladhaquest.com/blog"
      />
      
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section - Inspired by top food blogs */}
        <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6">
                <Utensils className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Discover African Cuisine</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gradient">Authentic African</span>
                <br />
                <span className="text-foreground">Recipes & Stories</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Step-by-step guides to Africa's most beloved dishes. From Nigerian Jollof to Ethiopian Doro Wat, 
                explore the flavors of the continent from your kitchen.
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto mb-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search recipes, ingredients, or techniques..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-6 text-lg bg-background/80 backdrop-blur-sm border-border/50 focus:border-primary shadow-lg"
                />
              </div>

              {/* Popular Tags */}
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Popular:</span>
                {popularTags.map((tag) => (
                  <Button
                    key={tag}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm(tag)}
                    className="text-xs hover:bg-primary/10 hover:text-primary"
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter - Sticky */}
        <section className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-16 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap transition-all ${
                    selectedCategory === category 
                      ? "shadow-md" 
                      : "hover:bg-muted"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Posts - Only show when All is selected and no search */}
        {selectedCategory === "All" && !searchTerm && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-6">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Featured Recipes</h2>
                  <p className="text-sm text-muted-foreground">Editor's picks for your next cooking adventure</p>
                </div>
              </div>
              
              <div className="grid gap-6">
                {featuredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} variant="featured" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Posts Grid */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {searchTerm 
                      ? `Search Results for "${searchTerm}"`
                      : selectedCategory === "All" 
                        ? "All Recipes & Articles" 
                        : `${selectedCategory} Articles`
                    }
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
            </div>
            
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-2xl">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search or browse by category</p>
                <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6 max-w-4xl">
            <NewsletterSignup variant="blog" source="blog_page" />
          </div>
        </section>

        {/* Why African Cuisine Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-4">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Why African Cuisine?</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The World's Most Diverse Culinary Heritage
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From the spice-rich stews of Ethiopia to the smoky grills of Kenya, 
                African cuisine offers endless culinary adventures waiting to be discovered.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "54 Countries, 3000+ Cultures",
                  description: "Each region brings unique ingredients, techniques, and flavors passed down through generations.",
                  icon: Globe
                },
                {
                  title: "Ancient Techniques, Modern Kitchen",
                  description: "Traditional recipes adapted for home cooks worldwide, without losing authentic flavors.",
                  icon: Utensils
                },
                {
                  title: "Health-Conscious Heritage",
                  description: "Many African superfoods like moringa, teff, and baobab are now recognized globally for their nutritional benefits.",
                  icon: Sparkles
                }
              ].map((item, index) => (
                <div key={index} className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:shadow-warm transition-shadow">
                  <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
