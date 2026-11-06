import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { Users, Heart, Globe, Award, BookOpen, ChefHat } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="About LadhaQuest | Our Mission & Story"
        description="Learn about LadhaQuest's mission to share authentic African recipes with the world. Meet our team and discover our passion for African culinary heritage."
        keywords="about LadhaQuest, African cuisine, mission, team, African recipes, culinary heritage"
        canonical="https://www.ladhaquest.com/about"
      />
      
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Celebrating Africa's Culinary Heritage
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              LadhaQuest is more than a recipe platform—it's a journey through the diverse flavors, 
              traditions, and stories that make African cuisine truly extraordinary.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We're on a mission to make authentic African recipes accessible to everyone, 
                  regardless of where they are in the world. From the aromatic spices of North 
                  Africa to the bold flavors of West Africa, the unique tastes of East Africa 
                  to the diverse cuisine of Southern Africa—we're here to guide you through it all.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our smart pantry technology helps you discover recipes you can make with 
                  ingredients you already have, reducing food waste while expanding your 
                  culinary horizons.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                  <Globe className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">54 Countries</h3>
                  <p className="text-sm text-muted-foreground">Recipes from across the African continent</p>
                </div>
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                  <BookOpen className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">50+ Recipes</h3>
                  <p className="text-sm text-muted-foreground">Growing collection of authentic dishes</p>
                </div>
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">10,000+ Cooks</h3>
                  <p className="text-sm text-muted-foreground">Active community members</p>
                </div>
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                  <ChefHat className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Expert Verified</h3>
                  <p className="text-sm text-muted-foreground">Recipes tested for authenticity</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Authenticity</h3>
                <p className="text-muted-foreground">
                  Every recipe is researched and verified to ensure it represents true African 
                  culinary traditions. We work with local chefs and food historians.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Accessibility</h3>
                <p className="text-muted-foreground">
                  We provide ingredient substitutions and smart pantry matching so you can 
                  cook African dishes with what's available in your local stores.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Cultural Respect</h3>
                <p className="text-muted-foreground">
                  We honor the cultural significance of each dish, sharing the stories and 
                  traditions behind the food you're preparing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-foreground text-center mb-6">Meet Our Team</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              LadhaQuest is built by a passionate team of food lovers, technologists, and 
              cultural enthusiasts dedicated to sharing Africa's rich culinary heritage.
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">AO</span>
                </div>
                <h3 className="font-semibold text-foreground">Amara Okonkwo</h3>
                <p className="text-sm text-muted-foreground">Founder & Head Chef</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">KM</span>
                </div>
                <h3 className="font-semibold text-foreground">Kwame Mensah</h3>
                <p className="text-sm text-muted-foreground">Food Historian</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">FH</span>
                </div>
                <h3 className="font-semibold text-foreground">Fatima Hassan</h3>
                <p className="text-sm text-muted-foreground">Recipe Developer</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Culinary Journey</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Whether you're a seasoned cook or just starting your African food adventure, 
              we're here to guide you every step of the way.
            </p>
            <a 
              href="/recipes" 
              className="inline-block bg-background text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-background/90 transition-colors"
            >
              Explore Recipes
            </a>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
