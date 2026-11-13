import { ChefHat } from "lucide-react";

interface RecipeImagePlaceholderProps {
  name?: string;
  country?: string;
  className?: string;
  imageUrl?: string | null;
}

const RecipeImagePlaceholder = ({ 
  name, 
  country, 
  className = "", 
  imageUrl 
}: RecipeImagePlaceholderProps) => {
  // Get gradient based on country/region for visual variety
  const getGradient = () => {
    const countryLower = (country || "").toLowerCase();
    
    // African countries - warm earth tones
    if (["nigeria", "ghana", "senegal", "ivory coast", "mali"].includes(countryLower)) {
      return "from-orange-400 via-red-500 to-amber-600";
    }
    if (["ethiopia", "kenya", "uganda", "tanzania", "somalia"].includes(countryLower)) {
      return "from-yellow-400 via-orange-500 to-red-500";
    }
    if (["morocco", "egypt", "algeria", "tunisia", "libya"].includes(countryLower)) {
      return "from-amber-400 via-yellow-500 to-orange-500";
    }
    if (["dr congo", "cameroon", "central african republic", "chad", "gabon"].includes(countryLower)) {
      return "from-green-400 via-teal-500 to-emerald-600";
    }
    if (["south africa", "zimbabwe", "zambia", "namibia", "botswana"].includes(countryLower)) {
      return "from-blue-400 via-purple-500 to-indigo-600";
    }
    
    // Asian countries
    if (["china", "japan", "korea", "taiwan"].includes(countryLower)) {
      return "from-red-400 via-pink-500 to-rose-600";
    }
    if (["thailand", "vietnam", "indonesia", "malaysia"].includes(countryLower)) {
      return "from-green-400 via-emerald-500 to-teal-600";
    }
    if (["india", "pakistan", "bangladesh", "sri lanka"].includes(countryLower)) {
      return "from-orange-400 via-amber-500 to-yellow-600";
    }
    
    // European countries
    if (["italy", "greece", "spain", "portugal", "france"].includes(countryLower)) {
      return "from-blue-400 via-cyan-500 to-sky-600";
    }
    
    // Americas
    if (["mexico", "brazil", "argentina", "peru"].includes(countryLower)) {
      return "from-green-400 via-yellow-500 to-red-500";
    }
    
    // Default gradient
    return "from-primary/60 via-primary/80 to-primary";
  };

  const frame = `relative flex h-full w-full min-h-[8rem] items-center justify-center overflow-hidden ${className}`;

  // If there's a valid image URL, show the image
  if (imageUrl) {
    return (
      <div className={frame}>
        <img
          src={imageUrl}
          alt={name || "Recipe"}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it to show placeholder
            e.currentTarget.style.display = 'none';
            const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
            if (placeholder) placeholder.style.display = 'flex';
          }}
        />
        {/* Hidden placeholder that shows if image fails */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${getGradient()} items-center justify-center hidden`}
        >
          <div className="text-center text-white p-4">
            <ChefHat className="w-10 h-10 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium line-clamp-2 opacity-90">{name}</p>
            {country && (
              <p className="text-xs opacity-70 mt-1">{country}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show placeholder if no image
  return (
    <div className={`${frame} bg-gradient-to-br ${getGradient()}`}>
      <div className="text-center text-white p-4">
        <ChefHat className="w-10 h-10 mx-auto mb-2 opacity-80" />
        <p className="text-sm font-medium line-clamp-2 opacity-90">{name}</p>
        {country && (
          <p className="text-xs opacity-70 mt-1">{country}</p>
        )}
      </div>
    </div>
  );
};

export default RecipeImagePlaceholder;
