import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat, Menu, X, Search, User, LogOut, Package, Calendar, LayoutGrid, Heart, Home, WifiOff } from "lucide-react";
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

  const navItems = [
    { label: "Home", href: "/", isRoute: true, protected: false },
    { label: "Recipes", href: "/recipes", isRoute: true, protected: false },
    { label: "Browse All", href: "/recipe-index", isRoute: true, protected: false },
    { label: "Countries", href: "/countries", isRoute: true, protected: false },
    { label: "Atlas", href: "/atlas", isRoute: true, protected: false },
    { label: "Map", href: "/cuisine-map", isRoute: true, protected: false },
    { label: "Meals", href: "/meals", isRoute: true, protected: false },
    { label: "Blog", href: "/blog", isRoute: true, protected: false },
  ];

  const protectedNavItems = [
    { label: "Pantry", href: "/pantry", icon: Package, featureName: "Pantry Intelligence" },
    { label: "Planner", href: "/meal-planner", icon: Calendar, featureName: "Meal Planner" },
    { label: "Compare", href: "/recipe-comparison", icon: LayoutGrid, featureName: "Recipe Comparison" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/10 bg-background md:bg-background/80 md:backdrop-blur-lg">
      <div className="container mx-auto px-6">
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
          <div className="hidden md:flex items-center gap-6">
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
          <div className="hidden md:flex items-center gap-3">
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
                  <DropdownMenuItem onClick={() => navigate('/offline-recipes')}>
                    <WifiOff className="w-4 h-4 mr-2" />
                    Offline Mode
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
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/10 animate-slide-in-up">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Protected Items */}
              {protectedNavItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleProtectedNavigation(item.href, item.featureName)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 text-left flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {!user && <span className="text-xs opacity-50">🔒</span>}
                </button>
              ))}

              <Link
                to="/offline-recipes"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <WifiOff className="w-4 h-4" />
                Offline Mode
              </Link>
              
              <div className="flex items-center gap-3 pt-4 border-t border-primary/10">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1"
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
                    className="flex-1"
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
                    <Button variant="earth" size="sm" className="w-full">
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
