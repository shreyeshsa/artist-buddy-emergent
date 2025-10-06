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
        }
      }
    };

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
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with Supabase auth...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || 'Login failed. Please check your credentials.');
        return false;
      }

      if (data.user && data.session) {
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
      toast.error(error?.message || "Login failed. Please try again.");
      return false;
    }
  };

  const signup = async (email: string, password: string, phoneNumber?: string): Promise<boolean> => {
    try {
      console.log('Attempting signup with Supabase auth...');

      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address.');
        return false;
      }

      if (!password || password.length < 6) {
        toast.error('Password must be at least 6 characters long.');
        return false;
      }

      const signupOptions: any = {
        email,
        password,
        options: {
          data: {}
        }
      };

      if (phoneNumber && phoneNumber.trim()) {
        signupOptions.options.data.phone_number = phoneNumber;
      }

      const { data, error } = await supabase.auth.signUp(signupOptions);

      if (error) {
        console.error('Signup error:', error);

        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          toast.error('This email is already registered. Please login instead.');
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
          } catch (profileException) {
            console.error('Profile creation exception:', profileException);
          }
        }

        toast.success("Account created successfully! You can now login.");
        return true;
      }

      toast.error("Signup failed. No user data returned.");
      return false;
    } catch (error: any) {
      console.error('Signup exception:', error);
      toast.error(error?.message || "Signup failed. Please try again.");
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
