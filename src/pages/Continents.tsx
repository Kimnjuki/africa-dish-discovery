import Navigation from "@/components/Navigation";
import ContinentsExplorer from "@/components/ContinentsExplorer";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";

const Continents = () => {
  return (
    <div className="min-h-screen">
      <PageMeta
        title="Explore African Continents | Regional Cuisines | TasteAfrica"
        description="Discover authentic recipes from West, East, North, Central, and Southern Africa. Explore 54 countries and their unique culinary traditions on an interactive map."
        keywords="african regions, west african cuisine, east african food, north african recipes, southern african dishes, african continents, interactive map"
        canonical="https://tasteafrica.com/continents"
      />
      
      <Navigation />
      <main>
        <ContinentsExplorer />
      </main>
      <Footer />
    </div>
  );
};

export default Continents;