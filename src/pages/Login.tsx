import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneInput } from "@/components/PhoneInput";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  // Add effect to remove Lovable badge from login screen
  useEffect(() => {
    // Find and remove the Lovable badge or link
    const removeBadge = () => {
      // Target any element with 'lovable' in its id, class, or content
      const badges = document.querySelectorAll('[id*="lovable"], [class*="lovable"]');
      badges.forEach(badge => {
        if (badge.parentNode) {
          badge.parentNode.removeChild(badge);
        }
      });
      
      // Also target elements with specific CSS classes that might be part of the badge
      const badgeClasses = document.querySelectorAll('.fixed.bottom-0, .fixed.bottom-2, .fixed.bottom-4, .fixed.bottom-5');
      badgeClasses.forEach(element => {
        if (element.innerHTML && (
            element.innerHTML.toLowerCase().includes('lovable') || 
            element.innerHTML.toLowerCase().includes('made with') ||
            element.innerHTML.toLowerCase().includes('powered by')
        )) {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        }
      });
      
      // Remove elements with 'love' in the text that might be badges
      document.querySelectorAll('a, div, span, p').forEach(el => {
        if (el.textContent && (
            el.textContent.toLowerCase().includes('made with') ||
            el.textContent.toLowerCase().includes('powered by lovable')
        )) {
          const isFixed = 
            window.getComputedStyle(el).position === 'fixed' || 
            (el.parentElement && window.getComputedStyle(el.parentElement).position === 'fixed');
          
          if (isFixed && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }
      });
    };
    
    // Run once and then observe for any dynamically added elements
    removeBadge();
    
    // Create a mutation observer to detect if the badge is added dynamically
    const observer = new MutationObserver((mutations) => {
      removeBadge();
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => observer.disconnect();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await signup(email, password, phoneNumber);
    setIsLoading(false);
    if (success) {
      setEmail("");
      setPassword("");
      setPhoneNumber("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-accent">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md animate-in">
        <Card className="border-primary/20">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-artify-pink to-artify-purple flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                  />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Your Artist Buddy
            </CardTitle>
            <CardDescription className="text-center">
              Sign in or create an account to access your artist toolkit
            </CardDescription>
            <div className="text-xs text-center text-muted-foreground">
              Powered by <a
                href="https://aasuri.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-artify-pink hover:underline"
              >
                aasuri.com
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-artify-pink to-artify-purple hover:opacity-90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignup}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Choose a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="border-primary/20 focus:border-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 6 characters
                      </p>
                    </div>
                    <PhoneInput
                      id="signup-phone"
                      label="Phone Number"
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      required={false}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-artify-pink to-artify-purple hover:opacity-90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <p className="text-center mt-4 text-sm text-muted-foreground">
          Artist tools for precision grid drawing & color matching
        </p>
      </div>
    </div>
  );
};

export default Login;
