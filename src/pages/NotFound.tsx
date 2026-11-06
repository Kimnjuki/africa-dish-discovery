import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageMeta
        title="Page Not Found | LadhaQuest"
        description="The page you requested could not be found on LadhaQuest."
        canonical="https://www.ladhaquest.com/404"
      />
      <Navigation />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-5xl font-bold text-foreground">404</h1>
          <p className="text-lg text-muted-foreground">
            That page does not exist. Try browsing recipes or return home.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/" className="px-4 py-2 rounded-md bg-primary text-primary-foreground">
              Home
            </Link>
            <Link to="/recipe-index" className="px-4 py-2 rounded-md border border-border">
              Browse recipes
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
