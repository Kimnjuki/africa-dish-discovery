import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import PantryDashboard from "@/components/pantry/PantryDashboard";
import pantryHero from "@/assets/pantry-hero.jpg";

const Pantry = () => {
  return (
    <div className="min-h-screen">
      <PageMeta
        title="Smart Pantry Intelligence | AI Recipe Matching | LadhaQuest"
        description="AI-powered pantry management for African cooking. Get personalized recipe suggestions based on your ingredients, smart substitutions, and reduce food waste."
        keywords="pantry management, recipe matching, ingredient substitution, african cooking, smart kitchen, meal planning, food waste reduction"
        canonical="https://www.ladhaquest.com/pantry"
      />

      <Navigation />

      <main className="pt-16">
        {/* Hero Section */}
        <section
          className="relative py-16 bg-cover bg-center"
          style={{ backgroundImage: `url(${pantryHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-primary/20" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              AI Pantry Intelligence
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Transform your ingredients into delicious African dishes with AI-powered 
              recipe matching and smart substitution suggestions.
            </p>
          </div>
        </section>

        {/* Dashboard Section */}
        <section className="py-12 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-6">
            <PantryDashboard />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pantry;
