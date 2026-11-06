import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import AfricaMap from "@/components/AfricaMap";
import FeaturedRecipes from "@/components/FeaturedRecipes";
import EnhancedPantryIntelligence from "@/components/EnhancedPantryIntelligence";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { PantryShowcase } from "@/components/PantryShowcase";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { PersonalizedRecommendations } from "@/components/PersonalizedRecommendations";
import { TasteOnboarding } from "@/components/onboarding/TasteOnboarding";
import { useOnboarding } from "@/hooks/useOnboarding";
import QuickCategoryCards from "@/components/QuickCategoryCards";
import TrendingRecipes from "@/components/TrendingRecipes";
import RecipeCollections from "@/components/RecipeCollections";
const Index = () => {
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  return (
    <>
      {showOnboarding && (
        <TasteOnboarding 
          onComplete={completeOnboarding} 
          onSkip={skipOnboarding} 
        />
      )}
    <div className="min-h-screen">
      <PageMeta
        title="LadhaQuest | Authentic African & World Recipes | Smart Pantry Matching"
        description="Discover authentic recipes from Africa and around the world. Smart pantry matching, meal planning, cultural stories, and step-by-step cooking guides."
        keywords="african recipes, world recipes, recipe finder, pantry management, meal planning, cooking guide, nigerian recipes, ethiopian food, smart kitchen"
        canonical="https://www.ladhaquest.com/"
      />
      
      <Navigation />
      <main>
        <Hero />
        <QuickCategoryCards />
        <TrendingRecipes />
        <PantryShowcase />
        <PersonalizedRecommendations />
        <RecipeCollections />
        <div id="pantry-intelligence">
          <EnhancedPantryIntelligence />
        </div>
        <div id="explore-africa">
          <AfricaMap />
        </div>
        <FeaturedRecipes />
        <section className="py-16">
          <div className="container mx-auto px-6">
            <NewsletterSignup variant="hero" />
          </div>
        </section>
        <CallToAction />
      </main>
      <Footer />
    </div>
    </>
  );
};

export default Index;
