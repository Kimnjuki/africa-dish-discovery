import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChefHat, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { readErrorMessage } from "@/lib/errors";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Memoize profile creation to avoid re-creating on each render
  const createProfileIfNeeded = useCallback(async (authUser: SupabaseUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!profile) {
        await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
          });
      }
    } catch (error) {
      // Silently handle profile creation errors - non-critical
      console.error('Error creating profile:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const recoveryMode = searchParams.get("mode") === "reset";

    // Set up auth state listener FIRST - NO async operations inside!
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;

        // Only synchronous state updates here - prevents deadlock
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setInitializing(false);

        if (event === "PASSWORD_RECOVERY" || recoveryMode) {
          setIsUpdatingPassword(true);
          setIsPasswordReset(false);
          return;
        }

        // Defer navigation and Supabase calls with setTimeout to prevent deadlock
        if (event === 'SIGNED_IN' && currentSession?.user && !recoveryMode) {
          setTimeout(() => {
            if (mounted && !isUpdatingPassword) {
              createProfileIfNeeded(currentSession.user);
              navigate('/', { replace: true });
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!mounted) return;
      
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setInitializing(false);

      if (recoveryMode) {
        setIsUpdatingPassword(true);
        return;
      }
      
      if (existingSession) {
        navigate('/', { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, createProfileIfNeeded, searchParams, isUpdatingPassword]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPassword = password.trim();

    if (trimmedPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      toast({
        title: "Passwords do not match",
        description: "Please confirm your new password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: trimmedPassword });
      if (error) throw error;
      toast({
        title: "Password updated",
        description: "You can now use your new password to sign in.",
      });
      setIsUpdatingPassword(false);
      setPassword("");
      setConfirmPassword("");
      navigate("/", { replace: true });
    } catch (error: unknown) {
      toast({
        title: "Could not update password",
        description: readErrorMessage(error) || "Please request a new reset link.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Google Sign-In Error",
        description: readErrorMessage(error) || "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // RFC 5322 compliant email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(trimmedEmail.toLowerCase())) {
      toast({
        title: "Invalid Email Format",
        description: "Please enter a valid email address (e.g., user@example.com).",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent!",
        description: "Check your email for password reset instructions.",
      });

      setIsPasswordReset(false);
      setIsLogin(true);
      setEmail("");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: readErrorMessage(error) || "Failed to send password reset email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedFullName = fullName.trim();
    
    // Email validation - more permissive regex that accepts valid emails
    if (!trimmedEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // RFC 5322 compliant email regex - accepts most valid email formats
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: "Invalid Email Format",
        description: "Please enter a valid email address (e.g., user@example.com).",
        variant: "destructive",
      });
      return;
    }

    // Password validation
    if (!trimmedPassword) {
      toast({
        title: "Password Required",
        description: "Please enter your password.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    // Full name validation for signup
    if (!isLogin && !trimmedFullName) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in.",
        });
        // Navigation handled by onAuthStateChange
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: trimmedFullName,
            }
          }
        });

        if (error) throw error;

        // Check if user was actually created or already exists
        if (data.user && !data.user.identities?.length) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setIsLogin(true);
          setLoading(false);
          return;
        }

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });

        setIsLogin(true);
        setPassword("");
        setFullName("");
      }
    } catch (error: unknown) {
      let errorMessage = "An error occurred. Please try again.";
      
      if (readErrorMessage(error).includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (readErrorMessage(error).includes("User already registered")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
        setIsLogin(true);
      } else if (readErrorMessage(error).includes("Email not confirmed")) {
        errorMessage = "Please check your email and click the confirmation link.";
      } else if (readErrorMessage(error).includes("Email rate limit exceeded")) {
        errorMessage = "Too many attempts. Please wait a few minutes and try again.";
      } else if (readErrorMessage(error).includes("Invalid email")) {
        errorMessage = "Please enter a valid email address.";
      } else if (readErrorMessage(error)) {
        errorMessage = readErrorMessage(error);
      }

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-earth flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-2xl text-gradient">LadhaQuest</div>
              <div className="text-sm text-muted-foreground">Recipe Discovery</div>
            </div>
          </div>
        </div>

        <Card className="shadow-warm border-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isUpdatingPassword
                ? "Choose a New Password"
                : isPasswordReset
                  ? "Reset Password"
                  : (isLogin ? "Welcome Back" : "Create Account")}
            </CardTitle>
            <CardDescription>
              {isUpdatingPassword
                ? "Enter and confirm your new password"
                : isPasswordReset 
                ? "Enter your email to receive a password reset link"
                : (isLogin 
                  ? "Sign in to access your recipes and pantry" 
                  : "Join LadhaQuest to explore African cuisine"
                )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Google Sign-In Button */}
            {!isPasswordReset && !isUpdatingPassword && (
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-3 h-11"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            )}

            {!isPasswordReset && !isUpdatingPassword && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            )}

            <form
              onSubmit={
                isUpdatingPassword
                  ? handleUpdatePassword
                  : isPasswordReset
                    ? handlePasswordReset
                    : handleSubmit
              }
              className="space-y-4"
            >
              {!isLogin && !isPasswordReset && !isUpdatingPassword && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>
              )}
              
              {!isUpdatingPassword && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              )}
              
              {(isUpdatingPassword || !isPasswordReset) && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {isUpdatingPassword ? "New Password" : "Password"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isUpdatingPassword ? "Enter a new password" : "Enter your password"}
                    disabled={loading}
                    autoComplete={isUpdatingPassword || !isLogin ? "new-password" : "current-password"}
                  />
                  {(isUpdatingPassword || !isLogin) && (
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  )}
                </div>
              )}

              {isUpdatingPassword && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                variant="hero"
                disabled={loading}
              >
                {loading ? "Please wait..." : (
                  isUpdatingPassword
                    ? "Update Password"
                    : isPasswordReset
                      ? "Send Reset Link"
                      : (isLogin ? "Sign In" : "Create Account")
                )}
              </Button>
            </form>
            
            <div className="text-center space-y-2">
              {isUpdatingPassword ? null : isPasswordReset ? (
                <Button
                  variant="link"
                  onClick={() => {
                    setIsPasswordReset(false);
                    setIsLogin(true);
                  }}
                  className="text-primary"
                  disabled={loading}
                >
                  Back to Sign In
                </Button>
              ) : (
                <>
                  <Button
                    variant="link"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setPassword("");
                      setFullName("");
                    }}
                    className="text-primary"
                    disabled={loading}
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </Button>
                  
                  {isLogin && (
                    <div>
                      <Button
                        variant="link"
                        onClick={() => setIsPasswordReset(true)}
                        className="text-sm text-muted-foreground hover:text-primary"
                        disabled={loading}
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By continuing, you agree to our{" "}
          <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default Auth;
