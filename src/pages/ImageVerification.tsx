import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ImageVerificationTool } from "@/components/ImageVerificationTool";
import { PageMeta } from "@/components/seo/PageMeta";

const ImageVerification = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageMeta
        title="Image Verification Tool | Ensure Authentic Dish Photos | TasteAfrica"
        description="Verify that recipe images accurately represent their authentic cultural dishes. Flag incorrect or low-quality images for review."
      />
      <Navigation />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-6">
          <ImageVerificationTool />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ImageVerification;
