import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ImageScraperChecklist } from "@/components/ImageScraperChecklist";

const ImageScraper = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16">
        <ImageScraperChecklist />
      </main>
      <Footer />
    </div>
  );
};

export default ImageScraper;
