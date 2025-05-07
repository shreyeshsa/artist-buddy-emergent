
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user was previously authenticated
  useEffect(() => {
    const storedAuth = localStorage.getItem("artify-auth");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === "app@123") {
      setIsAuthenticated(true);
      localStorage.setItem("artify-auth", "true");
      toast.success("Login successful!");
      return true;
    } else {
      toast.error("Invalid password!");
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("artify-auth");
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
