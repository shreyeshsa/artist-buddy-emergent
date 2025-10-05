import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, phoneNumber?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session fetch error:', error);
          toast.error('Failed to connect to authentication service. Please refresh the page.');
        }

        if (mounted) {
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session?.user);
          setLoading(false);
          console.log('Auth initialized:', session?.user ? 'User logged in' : 'No user session');
        }
      } catch (error) {
        console.error('Auth initialization exception:', error);
        if (mounted) {
          setLoading(false);
          toast.error('Authentication service unavailable. Please check your connection.');
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timed out after 5 seconds');
        setLoading(false);
        toast.error('Connection timeout. Please refresh the page.');
      }
    }, 5000);

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        console.log('Auth state changed:', _event);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login...');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';
      const apiUrl = `${supabaseUrl}/functions/v1/auth-login`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        console.error('Login error:', result.error);
        toast.error(result.error || 'Login failed. Please check your credentials.');
        return false;
      }

      if (result.success && result.user) {
        console.log('Login successful:', result.user.email);

        if (result.session) {
          await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          });
        }

        setUser(result.user);
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

  const signup = async (email: string, password: string, phoneNumber?: string): Promise<boolean> => {
    try {
      console.log('Attempting signup...');

      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address.');
        return false;
      }

      if (!password || password.length < 6) {
        toast.error('Password must be at least 6 characters long.');
        return false;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';
      const apiUrl = `${supabaseUrl}/functions/v1/auth-signup`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, phoneNumber }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        console.error('Signup error:', result.error);

        if (result.error.includes('already registered')) {
          toast.error('This email is already registered. Please login instead.');
        } else if (result.error.includes('password')) {
          toast.error('Password must be at least 6 characters long.');
        } else {
          toast.error(result.error || 'Signup failed. Please try again.');
        }
        return false;
      }

      if (result.success && result.user) {
        console.log('Signup successful:', result.user.email);
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
