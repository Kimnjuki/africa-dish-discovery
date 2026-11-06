import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Utensils, Coffee, Wine, Moon, Salad, Globe, Timer, Flame } from "lucide-react";

const categories = [
  { label: "Breakfast", icon: Coffee, color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30", path: "/meals", query: "?category=Breakfast" },
  { label: "Lunch", icon: Utensils, color: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30", path: "/meals", query: "?category=Lunch" },
  { label: "Dinner", icon: Moon, color: "from-indigo-500/20 to-purple-500/20", border: "border-indigo-500/30", path: "/meals", query: "?category=Dinner" },
  { label: "Drinks", icon: Wine, color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30", path: "/meals", query: "?category=Drinks" },
  { label: "Quick & Easy", icon: Timer, color: "from-cyan-500/20 to-teal-500/20", border: "border-cyan-500/30", path: "/recipes", query: "" },
  { label: "Healthy", icon: Salad, color: "from-lime-500/20 to-green-500/20", border: "border-lime-500/30", path: "/meals", query: "?category=Healthy" },
  { label: "World Cuisine", icon: Globe, color: "from-blue-500/20 to-indigo-500/20", border: "border-blue-500/30", path: "/continents", query: "" },
  { label: "Spicy & Bold", icon: Flame, color: "from-red-500/20 to-orange-500/20", border: "border-red-500/30", path: "/recipes", query: "" },
];

const QuickCategoryCards = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          What are you in the mood for?
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Card
              key={cat.label}
              className={`group cursor-pointer hover:shadow-warm transition-all duration-300 border ${cat.border} bg-gradient-to-br ${cat.color} hover:scale-105`}
              onClick={() => navigate(`${cat.path}${cat.query}`)}
            >
              <div className="flex flex-col items-center justify-center p-4 gap-2">
                <cat.icon className="w-6 h-6 md:w-8 md:h-8 text-foreground/70 group-hover:text-primary transition-colors" />
                <span className="text-xs md:text-sm font-medium text-center text-foreground/80">
                  {cat.label}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickCategoryCards;
