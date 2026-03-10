import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const mapSupabaseUserToUser = (
  supabaseUser: SupabaseUser,
  dbUser?: any,
): User => ({
  id: supabaseUser.id,
  name:
    dbUser?.full_name ||
    supabaseUser.user_metadata?.name ||
    supabaseUser.email?.split("@")[0] ||
    "User",
  email: supabaseUser.email || "",
  phone: dbUser?.phone || supabaseUser.user_metadata?.phone || undefined,
  role: dbUser?.role || "user",
});

// Helper function to fetch user data from database
const fetchUserData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, phone, role")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.warn("Error fetching user data:", error);
    }

    return data;
  } catch (error) {
    console.warn("Error fetching user data:", error);
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session

    const getInitialSession = async () => {
      console.log("Checking initial session...");
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
      console.log(
        "Supabase Anon Key exists:",
        !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      );
      try {
        const { data, error } = await supabase.auth.getUser();
        console.log("getUser result - data:", data, "error:", error);
        if (error) {
          console.error("Error in getUser:", error);
          setIsLoading(false);
          return;
        }
        console.log("Initial session:", data.user);
        if (data.user) {
          const dbUser = await fetchUserData(data.user.id);
          setUser(mapSupabaseUserToUser(data.user, dbUser));
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Unexpected error in getInitialSession:", err);
        setIsLoading(false);
      }
    };
    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const dbUser = await fetchUserData(session.user.id);
        setUser(mapSupabaseUserToUser(session.user, dbUser));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const dbUser = await fetchUserData(data.user.id);
        setUser(mapSupabaseUserToUser(data.user, dbUser));
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const dbUser = await fetchUserData(data.user.id);
        setUser(mapSupabaseUserToUser(data.user, dbUser));
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
