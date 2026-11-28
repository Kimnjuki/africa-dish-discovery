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
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden sm:min-h-screen">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/40 to-primary/20" />
      </div>
      
      {/* Content — mobile-first: brand, one headline, one sentence, CTAs only */}
      <div className="relative z-10 container mx-auto px-4 text-center sm:px-6">
        <div className="animate-slide-in-up">
          <p className="mb-3 text-sm font-semibold tracking-wide text-primary sm:mb-6">
            LadhaQuest
          </p>
          
          <h1 className="mb-4 text-4xl font-bold leading-tight sm:mb-6 sm:text-5xl md:text-7xl">
            <span className="text-gradient">Taste the</span>
            <br />
            <span className="text-foreground">Continent</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl md:text-2xl">
            Authentic African recipes from the mainland and islands — cook Jollof, Injera,
            Cachupa, and more with local names and step-by-step guides.
          </p>
          
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button 
              variant="hero" 
              size="lg" 
              onClick={scrollToExplore}
              className="h-12 rounded-full px-8 text-base sm:h-auto sm:py-6 sm:text-lg"
            >
              <ChefHat className="w-5 h-5" />
              Explore African dishes
            </Button>
            
            <Link to="/atlas" className="w-full sm:w-auto">
              <Button 
                variant="earth" 
                size="lg"
                className="h-12 w-full rounded-full px-8 text-base sm:h-auto sm:w-auto sm:py-6 sm:text-lg"
              >
                <MapPin className="w-5 h-5" />
                Open the food atlas
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Stats — desktop/tablet only so mobile first viewport stays clean */}
        <div className="mx-auto mt-16 hidden w-full max-w-2xl grid-cols-3 items-stretch justify-items-stretch gap-8 sm:grid">
          {[
            { number: "1,400+", label: "African recipes", icon: ChefHat },
            { number: "5", label: "Regions", icon: MapPin },
            { number: "54", label: "Countries & islands", icon: Globe },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex h-full flex-col items-center justify-center rounded-xl border border-primary/10 bg-card/95 p-6 text-center shadow-soft"
            >
              <stat.icon className="mb-2 h-8 w-8 text-primary" aria-hidden="true" />
              <div className="text-2xl font-bold leading-none text-primary">{stat.number}</div>
              <div className="mt-1 text-sm leading-tight text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block sm:animate-bounce">
        <div className="w-1 h-8 bg-gradient-to-b from-primary to-transparent rounded-full" />
      </div>
    </section>
  );
};

export default Hero;