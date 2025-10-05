import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization timed out after 10 seconds');
      setLoading(false);
    }, 10000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        setLoading(false);
        clearTimeout(timeoutId);
      })
      .catch((error) => {
        console.error('Failed to get session:', error);
        setLoading(false);
        clearTimeout(timeoutId);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || 'Login failed. Please check your credentials.');
        return false;
      }

      if (data.user) {
        console.log('Login successful:', data.user.email);
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success("Login successful!");
        return true;
      }

      toast.error("Login failed. No user data returned.");
      return false;
    } catch (error: any) {
      console.error('Login exception:', error);
      toast.error(error?.message || "Login failed. Please check your internet connection.");
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting signup...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Signup error:', error);
        toast.error(error.message || 'Signup failed. Please try again.');
        return false;
      }

      if (data.user) {
        console.log('Signup successful:', data.user.email);
        toast.success("Account created successfully! You can now login.");
        return true;
      }

      toast.error("Signup failed. No user data returned.");
      return false;
    } catch (error: any) {
      console.error('Signup exception:', error);
      toast.error(error?.message || "Signup failed. Please check your internet connection.");
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      toast.info("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
