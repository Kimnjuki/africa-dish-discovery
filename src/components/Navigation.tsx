import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat, Menu, X, Search, User, LogOut, Package, Calendar, LayoutGrid, Heart, Home, WifiOff, FileUp, Upload, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User as AuthUser } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleProtectedNavigation = (path: string, featureName: string) => {
    if (!user) {
      toast.info(`Sign in to access ${featureName}`, {
        action: {
          label: "Sign In",
          onClick: () => navigate("/auth")
        }
      });
      return;
    }
    navigate(path);
    setIsMenuOpen(false);
  };

  /** Primary browse links — kept short on mobile. */
  const primaryNavItems = [
    { label: "Home", href: "/" },
    { label: "Recipes", href: "/recipes" },
    { label: "Countries", href: "/countries" },
    { label: "Atlas", href: "/atlas" },
  ];

  /** Secondary browse — desktop + mobile “More” section. */
  const secondaryNavItems = [
    { label: "Browse All", href: "/recipe-index" },
    { label: "Map", href: "/cuisine-map" },
    { label: "Meals", href: "/meals" },
    { label: "Blog", href: "/blog" },
  ];

  const navItems = [...primaryNavItems, ...secondaryNavItems];

  const protectedNavItems = [
    { label: "Pantry", href: "/pantry", icon: Package, featureName: "Pantry Intelligence" },
    { label: "Planner", href: "/meal-planner", icon: Calendar, featureName: "Meal Planner" },
    { label: "Compare", href: "/recipe-comparison", icon: LayoutGrid, featureName: "Recipe Comparison" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/10 bg-background md:bg-background/80 md:backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-lg text-gradient">LadhaQuest</div>
              <div className="hidden text-xs text-muted-foreground sm:block">Recipe Discovery</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
            
            {/* Protected Items */}
            {protectedNavItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleProtectedNavigation(item.href, item.featureName)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                {item.label}
                {!user && <span className="text-xs opacity-50">🔒</span>}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden xl:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/recipes')}>
              <Search className="w-4 h-4" />
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="earth" size="sm">
                    <User className="w-4 h-4" />
                    {user.user_metadata?.full_name?.split(' ')[0] || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/my-list')}>
                    <Heart className="w-4 h-4 mr-2" />
                    My List
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/pantry')}>
                    <Package className="w-4 h-4 mr-2" />
                    My Pantry
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/household')}>
                    <Home className="w-4 h-4 mr-2" />
                    Household
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/meal-planner')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Meal Planner
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/creator-studio')}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Creator Studio
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/submit-recipe')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit recipe
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/import-recipe')}>
                    <FileUp className="w-4 h-4 mr-2" />
                    Import recipe
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/offline-recipes')}>
                    <WifiOff className="w-4 h-4 mr-2" />
                    Offline Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/install')}>
                    Premium / Install
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="earth" size="sm">
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="xl:hidden h-11 w-11"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu — primary browse first, tools collapsed under More */}
        {isMenuOpen && (
          <div className="xl:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-primary/10 py-4 animate-slide-in-up">
            <div className="flex flex-col gap-1">
              <p className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Browse
              </p>
              {primaryNavItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex min-h-12 items-center rounded-md px-2 text-base font-medium text-foreground hover:bg-primary/5 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <p className="mt-3 px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                More
              </p>
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {protectedNavItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleProtectedNavigation(item.href, item.featureName)}
                  className="flex min-h-11 items-center gap-2 rounded-md px-2 text-left text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {!user && <span className="text-xs opacity-50">Sign in</span>}
                </button>
              ))}

              <Link
                to="/offline-recipes"
                className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <WifiOff className="w-4 h-4" />
                Offline Mode
              </Link>
              <Link
                to="/creator-studio"
                className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Sparkles className="w-4 h-4" />
                Creator Studio
              </Link>
              <Link
                to="/submit-recipe"
                className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Upload className="w-4 h-4" />
                Submit recipe
              </Link>
              <Link
                to="/import-recipe"
                className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileUp className="w-4 h-4" />
                Import recipe
              </Link>
              
              <div className="flex items-center gap-3 border-t border-primary/10 pt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-11 flex-1"
                  onClick={() => {
                    navigate('/recipes');
                    setIsMenuOpen(false);
                  }}
                >
                  <Search className="w-4 h-4" />
                  Search
                </Button>
                {user ? (
                  <Button 
                    variant="earth" 
                    size="sm" 
                    className="h-11 flex-1"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Link to="/auth" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="earth" size="sm" className="h-11 w-full">
                      <User className="w-4 h-4" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
