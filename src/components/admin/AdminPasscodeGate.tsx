import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, AlertCircle } from "lucide-react";

export function AdminPasscodeGate({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();



  if (isAuthenticated && user?.role === "admin") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>
            You need admin privileges to access this area. Please log in with an
            admin account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            If you believe you should have access, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
