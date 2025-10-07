import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: {
    phone_number?: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, phoneNumber?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'artist_buddy_users';
const CURRENT_USER_KEY = 'artist_buddy_current_user';

interface StoredUser {
  id: string;
  email: string;
  password: string;
  created_at: string;
  phone_number?: string;
}

const getStoredUsers = (): StoredUser[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveStoredUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

const hashPassword = async (password: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      console.log('Initializing authentication...');
      const currentUser = getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        console.log('User session restored:', currentUser.email);
      } else {
        console.log('No user session found');
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Email:', email);
      console.log('Password length:', password.length);

      if (!email || !password) {
        console.log('Missing email or password');
        toast.error('Please enter both email and password.');
        return false;
      }

      const users = getStoredUsers();
      console.log('Stored users count:', users.length);
      console.log('Stored users:', users.map(u => ({ email: u.email, id: u.id })));
      
      const hashedPassword = await hashPassword(password);
      console.log('Hashed password:', hashedPassword);

      const foundUser = users.find(u => u.email === email && u.password === hashedPassword);
      console.log('Found user:', foundUser ? 'YES' : 'NO');

      if (!foundUser) {
        console.log('User not found or password mismatch');
        toast.error('Invalid email or password.');
        return false;
      }

      const userSession: User = {
        id: foundUser.id,
        email: foundUser.email,
        created_at: foundUser.created_at,
        user_metadata: foundUser.phone_number ? { phone_number: foundUser.phone_number } : undefined,
      };

      console.log('Setting user session:', userSession);
      setUser(userSession);
      setIsAuthenticated(true);
      saveCurrentUser(userSession);

      console.log('Login successful for:', email);
      toast.success("Login successful!");
      return true;
    } catch (error: any) {
      console.error('Login exception:', error);
      toast.error("Login failed. Please try again.");
      return false;
    }
  };

  const signup = async (email: string, password: string, phoneNumber?: string): Promise<boolean> => {
    try {
      console.log('Attempting signup for:', email);

      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address.');
        return false;
      }

      if (!password || password.length < 6) {
        toast.error('Password must be at least 6 characters long.');
        return false;
      }

      const users = getStoredUsers();

      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        toast.error('This email is already registered. Please login instead.');
        return false;
      }

      const hashedPassword = await hashPassword(password);

      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        phone_number: phoneNumber,
      };

      users.push(newUser);
      saveStoredUsers(users);

      console.log('Signup successful:', email);
      toast.success("Account created successfully! You can now login.");
      return true;
    } catch (error: any) {
      console.error('Signup exception:', error);
      toast.error("Signup failed. Please try again.");
      return false;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      saveCurrentUser(null);
      console.log('User logged out');
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
