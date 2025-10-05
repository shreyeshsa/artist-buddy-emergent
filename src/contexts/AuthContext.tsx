import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
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

      const signupData: any = {
        email,
        password,
        options: {
          data: {}
        }
      };

      if (phoneNumber && phoneNumber.trim()) {
        signupData.options.data.phone_number = phoneNumber;
      }

      const { data, error } = await supabase.auth.signUp(signupData);

      if (error) {
        console.error('Signup error:', error);

        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please login instead.');
        } else if (error.message.includes('password')) {
          toast.error('Password must be at least 6 characters long.');
        } else {
          toast.error(error.message || 'Signup failed. Please try again.');
        }
        return false;
      }

      if (data.user) {
        console.log('Signup successful:', data.user.email);

        if (phoneNumber && phoneNumber.trim()) {
          try {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: data.user.id,
                phone_number: phoneNumber,
              });

            if (profileError) {
              console.error('Error saving phone number:', profileError);
            }
          } catch (e) {
            console.error('Profile creation error:', e);
          }
        }

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

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Configuration Required</h1>
          <p className="text-muted-foreground mb-4">
            Environment variables are not configured. Please set up VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting platform.
          </p>
          <div className="bg-muted p-4 rounded-lg text-left text-sm">
            <p className="font-semibold mb-2">For Netlify:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Go to Site settings → Environment variables</li>
              <li>Add VITE_SUPABASE_URL</li>
              <li>Add VITE_SUPABASE_ANON_KEY</li>
              <li>Redeploy your site</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

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
