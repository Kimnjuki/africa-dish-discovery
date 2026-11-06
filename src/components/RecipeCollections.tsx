import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Star, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const collections = [
  {
    title: "African Comfort Food",
    description: "Warming, soul-satisfying dishes from across the continent",
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&q=80",
    count: 24,
    tag: "Most Popular",
    color: "from-orange-600/80 to-amber-900/80",
  },
  {
    title: "30-Minute Meals",
    description: "Quick and delicious recipes for busy weeknights",
    image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80",
    count: 18,
    tag: "Quick & Easy",
    color: "from-emerald-600/80 to-teal-900/80",
  },
  {
    title: "Street Food Favorites",
    description: "Iconic street foods from Lagos to Marrakech",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
    count: 15,
    tag: "Editor's Pick",
    color: "from-rose-600/80 to-pink-900/80",
  },
  {
    title: "Healthy & Nutritious",
    description: "Balanced meals packed with traditional superfoods",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    count: 20,
    tag: "Wellness",
    color: "from-lime-600/80 to-green-900/80",
  },
];

const RecipeCollections = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Curated <span className="text-gradient">Collections</span>
            </h2>
            <p className="text-muted-foreground">
              Hand-picked recipe collections for every occasion
            </p>
          </div>
          <Button variant="ghost" className="gap-2 hidden md:flex" onClick={() => navigate('/recipes')}>
            View All <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <Card
              key={collection.title}
              className="group cursor-pointer overflow-hidden border-0 shadow-soft hover:shadow-warm transition-all duration-300"
              onClick={() => navigate('/recipes')}
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${collection.color}`} />
                <Badge className="absolute top-3 left-3 bg-background/90 text-foreground text-xs">
                  {collection.tag}
                </Badge>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg mb-1">
                    {collection.title}
                  </h3>
                  <p className="text-white/80 text-sm line-clamp-2">
                    {collection.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-white/70 text-xs">
                    <BookOpen className="w-3 h-3" />
                    <span>{collection.count} recipes</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecipeCollections;
