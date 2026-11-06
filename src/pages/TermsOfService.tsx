import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";

const TermsOfService = () => {
  const lastUpdated = "January 12, 2026";

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Terms of Service | LadhaQuest"
        description="Read LadhaQuest's terms of service. Understand your rights and responsibilities when using our African recipe platform."
        keywords="terms of service, terms and conditions, user agreement, LadhaQuest"
        canonical="https://www.ladhaquest.com/terms-of-service"
      />
      
      <Navigation />
      
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last Updated: {lastUpdated}</p>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using LadhaQuest ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              LadhaQuest is an online platform that provides:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Authentic African recipes from across the continent</li>
              <li>Smart pantry management and ingredient tracking</li>
              <li>Personalized recipe recommendations</li>
              <li>Meal planning and shopping list features</li>
              <li>Cultural context and cooking guides</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              To access certain features, you may need to create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may submit recipes, reviews, and other content ("User Content"). By submitting User Content, you:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Grant us a non-exclusive, royalty-free license to use, display, and distribute your content</li>
              <li>Warrant that you own or have the right to share the content</li>
              <li>Agree not to submit content that is illegal, offensive, or infringes on others' rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on LadhaQuest, including recipes, images, text, logos, and design elements, is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Scrape or harvest content without permission</li>
              <li>Impersonate others or provide false information</li>
              <li>Use automated systems to access the Service without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Recipe Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              Recipes and cooking instructions are provided for informational purposes only. LadhaQuest is not responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Allergic reactions to ingredients</li>
              <li>Food safety issues arising from improper preparation</li>
              <li>Nutritional information accuracy (always verify with certified sources)</li>
              <li>Ingredient substitution outcomes</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Always exercise caution and consult professionals for dietary or health concerns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              LadhaQuest is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes by posting an announcement on the site. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws of the operator's jurisdiction once the LadhaQuest business entity and registered address are published. Until then, disputes will be handled in good faith via{" "}
              <a href="mailto:legal@ladhaquest.com" className="text-primary hover:underline">
                legal@ladhaquest.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, please contact us at:{" "}
              <a href="mailto:legal@ladhaquest.com" className="text-primary hover:underline">
                legal@ladhaquest.com
              </a>
              . Company legal entity and postal address will be added after domain registration and business filing are complete.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
