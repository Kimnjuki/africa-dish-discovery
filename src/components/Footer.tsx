import { ChefHat, MapPin, Mail, Heart, ExternalLink } from "lucide-react";
import { NewsletterSignup } from "./NewsletterSignup";
import { CookieSettingsButton } from "./CookieConsent";
import { SocialLinks } from "./SocialShare";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand - Takes 2 columns on mobile, 1 on desktop */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-lg">TasteAfrica</div>
                <div className="text-xs text-background/70">Recipe Discovery</div>
              </div>
            </div>
            <p className="text-sm text-background/80 leading-relaxed mb-4">
              Exploring the rich culinary traditions of Africa, one recipe at a time.
            </p>
            <SocialLinks />
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold mb-4 text-primary text-sm uppercase tracking-wide">Explore</h4>
            <div className="space-y-2">
              <Link to="/recipes" className="block text-sm text-background/80 hover:text-primary transition-colors">
                All Recipes
              </Link>
              <Link to="/continents" className="block text-sm text-background/80 hover:text-primary transition-colors">
                Discover Africa
              </Link>
              <Link to="/meals" className="block text-sm text-background/80 hover:text-primary transition-colors">
                Meal Types
              </Link>
              <Link to="/blog" className="block text-sm text-background/80 hover:text-primary transition-colors">
                Food Blog
              </Link>
            </div>
          </div>

          {/* Regions */}
          <div>
            <h4 className="font-semibold mb-4 text-primary text-sm uppercase tracking-wide">Regions</h4>
            <div className="space-y-2">
              {[
                "West Africa",
                "East Africa", 
                "North Africa",
                "Central Africa",
                "Southern Africa"
              ].map((region) => (
                <Link 
                  key={region}
                  to="/continents"
                  className="block text-sm text-background/80 hover:text-primary transition-colors"
                >
                  {region}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-primary text-sm uppercase tracking-wide">Company</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-sm text-background/80 hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="block text-sm text-background/80 hover:text-primary transition-colors">
                Contact
              </Link>
              <Link to="/privacy-policy" className="block text-sm text-background/80 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="block text-sm text-background/80 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <CookieSettingsButton />
            </div>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <div className="bg-background/5 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-primary flex items-center gap-2 text-sm uppercase tracking-wide">
                <Mail className="w-4 h-4" />
                Weekly Recipes
              </h4>
              <p className="text-sm text-background/80 mb-4">
                Get authentic recipes delivered weekly.
              </p>
              <NewsletterSignup variant="footer" />
            </div>
          </div>
        </div>

        {/* Affiliate Partners */}
        <div className="border-t border-background/20 pt-8 mb-8">
          <h4 className="font-semibold mb-4 text-primary text-sm uppercase tracking-wide">Where to Buy Ingredients</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { name: "Amazon African Foods", region: "Global" },
              { name: "AfricanFoodShop.com", region: "US, UK, EU" },
              { name: "Jumia", region: "Africa" },
              { name: "Konga", region: "Nigeria" },
              { name: "Etsy African Spices", region: "Global" }
            ].map((partner) => (
              <a 
                key={partner.name}
                href="#"
                className="p-3 border border-background/20 rounded-lg hover:border-primary/50 transition-colors text-center"
              >
                <div className="text-xs font-medium text-background/90 truncate">{partner.name}</div>
                <div className="text-xs text-background/60">{partner.region}</div>
                <ExternalLink className="w-3 h-3 text-background/60 mx-auto mt-1" />
              </a>
            ))}
          </div>
          <p className="text-xs text-background/60 mt-4">
            * We may earn a commission from affiliate links at no extra cost to you.
          </p>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-background/80">
            <span>© 2026 TasteAfrica</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-400 fill-current" /> for African cuisine
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm text-background/80">
            <MapPin className="w-3 h-3" />
            <span>50+ Recipes • 54 Countries • 5 Regions</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
