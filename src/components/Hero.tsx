import { Button } from "@/components/ui/button";
import { ChefHat, MapPin, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";

const Hero = () => {
  const scrollToExplore = () => {
    const exploreSection = document.getElementById('explore-africa');
    exploreSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/40 to-primary/20" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="animate-slide-in-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Discover African Cuisine</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gradient">Taste the</span>
            <br />
            <span className="text-foreground">Continent</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Explore 50+ iconic African recipes. From Nigerian Jollof to Ethiopian Injera. 
            Discover stories, ingredients, and step-by-step guides to cook Africa at home.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="hero" 
              size="lg" 
              onClick={scrollToExplore}
              className="text-lg px-8 py-6 rounded-full"
            >
              <ChefHat className="w-5 h-5" />
              Start Exploring
            </Button>
            
            <Link to="/continents">
              <Button 
                variant="earth" 
                size="lg"
                className="text-lg px-8 py-6 rounded-full"
              >
                <MapPin className="w-5 h-5" />
                View Interactive Map
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Floating Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
          {[
            { number: "50+", label: "African Recipes", icon: ChefHat },
            { number: "5", label: "Regions Covered", icon: MapPin },
            { number: "54", label: "Countries", icon: Globe },
          ].map((stat, index) => (
            <div 
              key={index} 
              className="bg-card/80 backdrop-blur-sm border border-primary/10 rounded-xl p-6 shadow-soft hover:shadow-warm transition-all duration-300 animate-float"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{stat.number}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-1 h-8 bg-gradient-to-b from-primary to-transparent rounded-full" />
      </div>
    </section>
  );
};

export default Hero;