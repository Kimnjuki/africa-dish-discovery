import { useNavigate } from "react-router-dom";
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
        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-8">
          {categories.map((cat) => (
            <button
              key={cat.label}
              type="button"
              className={`category-mood-card flex h-[5.5rem] w-full touch-manipulation flex-col items-center justify-center gap-1.5 overflow-hidden rounded-lg border bg-gradient-to-br px-1 py-2 shadow-sm transition-[box-shadow,colors] duration-200 ${cat.border} ${cat.color} [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-warm [@media(hover:hover)_and_(pointer:fine)]:hover:[&_svg]:text-primary`}
              onClick={() => navigate(`${cat.path}${cat.query}`)}
              aria-label={`Browse ${cat.label}`}
            >
              <cat.icon className="h-6 w-6 shrink-0 text-foreground/70 md:h-7 md:w-7" aria-hidden />
              <span className="line-clamp-2 min-h-[2rem] text-center text-[11px] font-medium leading-tight text-foreground/80 sm:text-xs">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickCategoryCards;
