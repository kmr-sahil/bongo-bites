import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, AlertCircle, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function AdminPasscodeGate({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

async function check() {
  console.log("Checking admin authentication...");

  try {
    const { data, error } = await Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000)
      ),
    ]);

    console.log("getUser result:", data, error);
  } catch (e) {
    console.error("Auth request failed:", e);
  }
}



  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }

    check();
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect is handled by useEffect
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated but not admin, show access denied
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Admin access required</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Go to Shop
              </Button>
              <Button onClick={() => navigate("/account")} className="flex-1">
                My Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If authenticated and admin, show children
  return <>{children}</>;
}
