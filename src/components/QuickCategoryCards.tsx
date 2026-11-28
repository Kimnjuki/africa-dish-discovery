import { useNavigate } from "react-router-dom";
import { Utensils, Coffee, Wine, Moon, Salad, Map, Timer, Flame } from "lucide-react";

const categories = [
  { label: "Breakfast", icon: Coffee, color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30", path: "/meals", query: "?category=Breakfast" },
  { label: "Lunch", icon: Utensils, color: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30", path: "/meals", query: "?category=Lunch" },
  { label: "Dinner", icon: Moon, color: "from-indigo-500/20 to-purple-500/20", border: "border-indigo-500/30", path: "/meals", query: "?category=Dinner" },
  { label: "Drinks", icon: Wine, color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30", path: "/meals", query: "?category=Drinks" },
  { label: "Quick & Easy", icon: Timer, color: "from-cyan-500/20 to-teal-500/20", border: "border-cyan-500/30", path: "/recipes", query: "" },
  { label: "Healthy", icon: Salad, color: "from-lime-500/20 to-green-500/20", border: "border-lime-500/30", path: "/meals", query: "?category=Healthy" },
  { label: "Islands", icon: Map, color: "from-sky-500/20 to-teal-500/20", border: "border-sky-500/30", path: "/atlas", query: "" },
  { label: "Spicy & Bold", icon: Flame, color: "from-red-500/20 to-orange-500/20", border: "border-red-500/30", path: "/recipes", query: "" },
];

const QuickCategoryCards = () => {
  const navigate = useNavigate();

  return (
    <section className="py-10 bg-background sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-bold sm:mb-8 sm:text-2xl md:text-3xl">
          What are you in the mood for?
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-8 sm:gap-3">
          {categories.map((cat) => (
            <button
              key={cat.label}
              type="button"
              className={`category-mood-card flex min-h-[4.75rem] w-full touch-manipulation flex-col items-center justify-center gap-1.5 overflow-hidden rounded-lg border bg-gradient-to-br px-2 py-3 shadow-sm transition-[box-shadow,colors] duration-200 sm:min-h-[5.5rem] ${cat.border} ${cat.color} [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-warm [@media(hover:hover)_and_(pointer:fine)]:hover:[&_svg]:text-primary`}
              onClick={() => navigate(`${cat.path}${cat.query}`)}
              aria-label={`Browse ${cat.label}`}
            >
              <cat.icon className="h-6 w-6 shrink-0 text-foreground/70 md:h-7 md:w-7" aria-hidden />
              <span className="line-clamp-2 min-h-[1.5rem] text-center text-xs font-medium leading-tight text-foreground/80 sm:text-xs">
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
