import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { loading, isAuthenticated } = useRequireAuth({ showToast: false });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Checking sign-in…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Sign in required</h1>
          <p className="text-muted-foreground">
            Create a free account to use pantry matching, meal planning, and recipe comparison.
          </p>
          <Link to="/auth" className="inline-flex px-4 py-2 rounded-md bg-primary text-primary-foreground">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
