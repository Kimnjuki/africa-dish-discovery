import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdminRole";

export const AdminGate = ({ children }: { children: ReactNode }) => {
  const { loading, isAuthenticated, isAdmin } = useAdminRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Checking access…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <p className="text-muted-foreground">
            This tool is limited to LadhaQuest admins and moderators.
          </p>
          <Link to={isAuthenticated ? "/" : "/auth"} className="text-primary hover:underline">
            {isAuthenticated ? "Back to home" : "Sign in"}
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
