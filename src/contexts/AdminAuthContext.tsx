import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./useAuth";

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  // Check if user is authenticated and has admin role
  const isAdminAuthenticated = user?.role === "admin";

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
