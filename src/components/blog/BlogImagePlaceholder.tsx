import { UtensilsCrossed, ChefHat, Leaf, Flame, Globe } from "lucide-react";

interface BlogImagePlaceholderProps {
  category: string;
  title: string;
  className?: string;
}

export const BlogImagePlaceholder = ({ category, title, className = "" }: BlogImagePlaceholderProps) => {
  const getCategoryStyle = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "recipes":
        return {
          gradient: "from-orange-500 via-red-500 to-amber-600",
          icon: UtensilsCrossed,
          pattern: "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)"
        };
      case "ingredients":
        return {
          gradient: "from-green-500 via-emerald-500 to-teal-600",
          icon: Leaf,
          pattern: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)"
        };
      case "techniques":
        return {
          gradient: "from-amber-500 via-orange-500 to-red-600",
          icon: Flame,
          pattern: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)"
        };
      case "culture":
        return {
          gradient: "from-purple-500 via-indigo-500 to-blue-600",
          icon: Globe,
          pattern: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)"
        };
      default:
        return {
          gradient: "from-primary via-primary to-accent",
          icon: ChefHat,
          pattern: "radial-gradient(circle at 60% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)"
        };
    }
  };

  const style = getCategoryStyle(category);
  const Icon = style.icon;

  return (
    <div 
      className={`relative overflow-hidden bg-gradient-to-br ${style.gradient} ${className}`}
      style={{ backgroundImage: style.pattern }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 left-4 w-24 h-24 border-2 border-white/30 rounded-full" />
        <div className="absolute bottom-4 right-4 w-32 h-32 border-2 border-white/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/10 rounded-full" />
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <p className="text-white/90 font-medium text-sm line-clamp-2 max-w-[80%]">
          {title}
        </p>
        <span className="text-white/70 text-xs mt-2 uppercase tracking-wider">
          {category}
        </span>
      </div>
      
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
};
