import { Suspense, lazy, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { PantryShowcase } from "@/components/PantryShowcase";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { TasteOnboarding } from "@/components/onboarding/TasteOnboarding";
import { useOnboarding } from "@/hooks/useOnboarding";
import QuickCategoryCards from "@/components/QuickCategoryCards";

// Below-fold sections — defer JS/CSS until after first paint
const TrendingRecipes = lazy(() => import("@/components/TrendingRecipes"));
const PersonalizedRecommendations = lazy(() =>
  import("@/components/PersonalizedRecommendations").then((m) => ({
    default: m.PersonalizedRecommendations,
  }))
);
const RecipeCollections = lazy(() => import("@/components/RecipeCollections"));
const EnhancedPantryIntelligence = lazy(() => import("@/components/EnhancedPantryIntelligence"));
const AfricaMap = lazy(() => import("@/components/AfricaMap"));
const FeaturedRecipes = lazy(() => import("@/components/FeaturedRecipes"));

const NAV_OFFSET_PX = 72;

const SectionFallback = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="h-48 animate-pulse rounded-lg bg-muted/60" />
  </div>
);

const Index = () => {
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const scroll = () => {
      const target = document.getElementById(hash);
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET_PX;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };
    // Allow lazy sections to mount before scrolling
    const t = window.setTimeout(scroll, hash === "recommendations" ? 400 : 0);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      {showOnboarding && (
        <TasteOnboarding onComplete={completeOnboarding} onSkip={skipOnboarding} />
      )}
      <div className="min-h-screen">
        <PageMeta
          title="LadhaQuest | Authentic African Recipes from 54 Countries"
          description="Cook authentic African food at home. 2,100+ recipes with local ingredient names, substitutions, meal planning, and offline cook mode."
          keywords="african recipes, african food, nigerian recipes, jollof rice, egusi soup, ethiopian recipes, kenyan food, ghanaian recipes, moroccan tagine, african cooking"
          canonical="https://www.ladhaquest.com/"
          ogImage="https://www.ladhaquest.com/og-image.jpg"
        />

        <Navigation />
        <main>
          <Hero />
          <QuickCategoryCards />
          <Suspense fallback={<SectionFallback />}>
            <TrendingRecipes />
          </Suspense>
          <PantryShowcase />
          <Suspense fallback={<SectionFallback />}>
            <PersonalizedRecommendations />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <RecipeCollections />
          </Suspense>
          <div id="pantry-intelligence" className="scroll-mt-20">
            <Suspense fallback={<SectionFallback />}>
              <EnhancedPantryIntelligence />
            </Suspense>
          </div>
          <div id="explore-africa">
            <Suspense fallback={<SectionFallback />}>
              <AfricaMap />
            </Suspense>
          </div>
          <Suspense fallback={<SectionFallback />}>
            <FeaturedRecipes />
          </Suspense>
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
