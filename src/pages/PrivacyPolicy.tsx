import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";

const PrivacyPolicy = () => {
  const lastUpdated = "January 12, 2026";

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Privacy Policy | LadhaQuest"
        description="Learn how LadhaQuest collects, uses, and protects your personal information. Our privacy policy explains your rights under GDPR and CCPA."
        keywords="privacy policy, data protection, GDPR, CCPA, cookies, LadhaQuest"
        canonical="https://www.ladhaquest.com/privacy-policy"
      />
      
      <Navigation />
      
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last Updated: {lastUpdated}</p>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information Collection</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly to us (e.g., name/email via contact forms, account registration, newsletter subscriptions) and information collected automatically through cookies when you navigate our site. This includes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Account information (email, username, profile preferences)</li>
              <li>Pantry and recipe interaction data to personalize your experience</li>
              <li>Device information and browsing patterns for analytics</li>
              <li>Location data (if you choose to share it) for regional recipe recommendations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies for authentication and site functionality. Optional analytics cookies are only set if you enable them in Cookie Settings. We do not currently run advertising networks or Google AdSense on LadhaQuest.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can manage your cookie preferences using the "Cookie Settings" button at the bottom of our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2b. Subprocessors & retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We process account and content data with Supabase (database/auth/storage) and may use email providers for transactional or newsletter messages once configured for ladhaquest.com. Account data is retained while your account remains active. Contact submissions and newsletter records are retained until you request deletion or unsubscribe.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To export or delete your data, email{" "}
              <a href="mailto:privacy@ladhaquest.com" className="text-primary hover:underline">
                privacy@ladhaquest.com
              </a>
              . Company legal entity and registered address will be published here once domain registration and business filings are complete.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Usage</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the collected data to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Improve site performance and user experience</li>
              <li>Analyze traffic patterns and popular recipes</li>
              <li>Provide personalized recipe recommendations</li>
              <li>Send newsletters and updates (with your consent)</li>
              <li>Maintain your pantry and meal planning features</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>We do not sell your personal data to third parties.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. CCPA/GDPR Compliance (2026 Update)</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are a resident of the European Economic Area (EEA) or California, you have specific rights regarding your data, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You may manage your consent via the "Cookie Settings" button at the bottom of our site, or by contacting us directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              LadhaQuest is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions regarding this policy or to exercise your data rights, please contact us at:{" "}
              <a href="mailto:privacy@ladhaquest.com" className="text-primary hover:underline">
                privacy@ladhaquest.com
              </a>
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
