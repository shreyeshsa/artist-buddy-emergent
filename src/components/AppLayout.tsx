
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Grid, PenTool, Palette, BookOpen, LogOut, Droplet, Pipette } from "lucide-react";
import { cn } from "@/lib/utils";
import GridTab from "@/components/tabs/GridTab";
import ColorPickerTab from "@/components/tabs/ColorPickerTab";
import ColorTheoryTab from "@/components/tabs/ColorTheoryTab";
import ColorMixerTab from "@/components/tabs/ColorMixerTab";
import YourPaletteTab from "@/components/tabs/YourPaletteTab";
import { BottomNavigation } from "./BottomNavigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type TabType = "grid" | "colorPicker" | "colorTheory" | "colorMixer" | "yourPalette";

const AppLayout = () => {
  const [activeTab, setActiveTab] = useState<TabType>("grid");
  const { logout } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Add viewport meta control to prevent page zooming
  useEffect(() => {
    // Add meta viewport tag to prevent zooming
    const metaViewport = document.createElement('meta');
    metaViewport.name = 'viewport';
    metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(metaViewport);

    // Add touch-action CSS to prevent default zooming
    document.documentElement.style.touchAction = 'manipulation';
    
    return () => {
      document.head.removeChild(metaViewport);
      document.documentElement.style.touchAction = '';
    };
  }, []);

  // Remove Lovable badge from the app (including login screen)
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

  const tabComponents = {
    grid: <GridTab />,
    colorPicker: <ColorPickerTab />,
    colorTheory: <ColorTheoryTab />,
    colorMixer: <ColorMixerTab />,
    yourPalette: <YourPaletteTab />,
  };

  const tabs = [
    { id: "grid", label: "Grids", icon: <Grid className="h-5 w-5" /> },
    { id: "colorPicker", label: "Color Picker", icon: <Pipette className="h-5 w-5" /> },
    { id: "colorTheory", label: "Color Theory", icon: <Palette className="h-5 w-5" /> },
    { id: "colorMixer", label: "Color Mixer", icon: <Droplet className="h-5 w-5" /> },
    { id: "yourPalette", label: "Your Palette", icon: <BookOpen className="h-5 w-5" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b sticky top-0 z-10 bg-background">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-artify-pink to-artify-purple flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
              />
            </svg>
          </div>
          <h1 className="text-lg font-bold">Your Artist Buddy by Aasuri</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to logout?</DialogTitle>
              </DialogHeader>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button 
                  onClick={logout}
                  className="bg-gradient-to-r from-artify-pink to-artify-purple hover:opacity-90"
                >
                  Logout
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      
      {/* Navigation Menu - Mobile Bottom, Desktop Top */}
      {!isMobile && (
        <div className="border-b sticky top-[73px] z-10 bg-background overflow-x-auto shadow-sm">
          <div className="container px-4 py-2">
            <NavigationMenu>
              <NavigationMenuList className="flex flex-nowrap">
                {tabs.map(tab => (
                  <NavigationMenuItem key={tab.id}>
                    <Button 
                      className={cn(
                        "px-4 whitespace-nowrap",
                        activeTab === tab.id 
                          ? "bg-accent text-accent-foreground font-medium" 
                          : "bg-transparent hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => setActiveTab(tab.id as TabType)}
                    >
                      {tab.icon}
                      <span className="ml-2">{tab.label}</span>
                    </Button>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto pb-16 md:pb-0">
        <div className="animate-in">{tabComponents[activeTab]}</div>

        {/* Footer with Aasuri link */}
        <div className="text-center pb-4 text-xs text-muted-foreground mt-4">
          Powered by <a 
            href="https://aasuri.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-artify-pink hover:underline"
          >
            aasuri.com
          </a>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNavigation 
          tabs={tabs} 
          activeTab={activeTab} 
          setActiveTab={(id) => setActiveTab(id as TabType)} 
        />
      )}
    </div>
  );
};

export default AppLayout;
