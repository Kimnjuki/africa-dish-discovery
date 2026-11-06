import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { CookieConsent } from "@/components/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminGate } from "@/components/AdminGate";

// Eager load only the most critical pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load all other pages for code-splitting
const Continents = lazy(() => import("./pages/Continents"));
const Recipes = lazy(() => import("./pages/Recipes"));
const RecipeIndex = lazy(() => import("./pages/RecipeIndex"));
const Meals = lazy(() => import("./pages/Meals"));
const Ingredients = lazy(() => import("./pages/Ingredients"));
const Auth = lazy(() => import("./pages/Auth"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const RecipeUploader = lazy(() => import("./pages/RecipeUploader"));
const MealPlanner = lazy(() => import("./pages/MealPlanner"));
const MealPlannerCalendar = lazy(() => import("./pages/MealPlannerCalendar"));
const RecipeComparison = lazy(() => import("./pages/RecipeComparison"));
const Pantry = lazy(() => import("./pages/Pantry"));
const SharedMealPlan = lazy(() => import("./pages/SharedMealPlan"));
const Install = lazy(() => import("./pages/Install"));
const OfflineRecipes = lazy(() => import("./pages/OfflineRecipes"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const RecipeGallery = lazy(() => import("./pages/RecipeGallery"));
const ImageVerification = lazy(() => import("./pages/ImageVerification"));
const ImageScraper = lazy(() => import("./pages/ImageScraper"));
const CulturalStory = lazy(() => import("./pages/CulturalStory"));
const CountryRecipes = lazy(() => import("./pages/CountryRecipes"));
const CountriesIndex = lazy(() => import("./pages/CountriesIndex"));
const DishAtlas = lazy(() => import("./pages/DishAtlas"));
const DishEncyclopedia = lazy(() => import("./pages/DishEncyclopedia"));
const SubmitRecipe = lazy(() => import("./pages/SubmitRecipe"));
const EditorialReview = lazy(() => import("./pages/EditorialReview"));
const AdminDishQA = lazy(() => import("./pages/AdminDishQA"));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail"));
const MyList = lazy(() => import("./pages/MyList"));
const CuisineMap = lazy(() => import("./pages/CuisineMap"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OfflineIndicator />
      <CookieConsent />
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/continents" element={<Continents />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipe-index" element={<RecipeIndex />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogArticle />} />
              <Route path="/meals" element={<Meals />} />
              <Route path="/ingredients" element={<Ingredients />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/recipe-uploader" element={<AdminGate><RecipeUploader /></AdminGate>} />
              <Route path="/meal-planner" element={<MealPlanner />} />
              <Route path="/meal-planner-calendar" element={<MealPlannerCalendar />} />
              <Route path="/recipe-comparison" element={<RecipeComparison />} />
              <Route path="/pantry" element={<Pantry />} />
              <Route path="/shared-meal-plan/:shareToken" element={<SharedMealPlan />} />
              <Route path="/install" element={<Install />} />
              <Route path="/offline-recipes" element={<OfflineRecipes />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/recipe-gallery" element={<AdminGate><RecipeGallery /></AdminGate>} />
              <Route path="/image-verification" element={<AdminGate><ImageVerification /></AdminGate>} />
              <Route path="/image-scraper" element={<AdminGate><ImageScraper /></AdminGate>} />
              <Route path="/story/:dishSlug" element={<CulturalStory />} />
              <Route path="/countries" element={<CountriesIndex />} />
              <Route path="/atlas" element={<DishAtlas />} />
              <Route path="/dish/:dishSlug" element={<DishEncyclopedia />} />
              <Route path="/country/:countrySlug" element={<CountryRecipes />} />
              <Route path="/submit-recipe" element={<SubmitRecipe />} />
              <Route path="/editorial-review" element={<EditorialReview />} />
              <Route path="/admin/dish-qa" element={<AdminGate><AdminDishQA /></AdminGate>} />
              <Route path="/recipe/:slug" element={<RecipeDetail />} />
              <Route path="/my-list" element={<MyList />} />
              <Route path="/cuisine-map" element={<CuisineMap />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
