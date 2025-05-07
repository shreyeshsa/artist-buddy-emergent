
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Grid, PenTool, Palette, BookOpen, LogOut } from "lucide-react";
import GridTab from "@/components/tabs/GridTab";
import ColorPickerTab from "@/components/tabs/ColorPickerTab";
import ColorTheoryTab from "@/components/tabs/ColorTheoryTab";
import ColorReferenceTab from "@/components/tabs/ColorReferenceTab";

type TabType = "grid" | "colorPicker" | "colorTheory" | "colorReference";

const AppLayout = () => {
  const [activeTab, setActiveTab] = useState<TabType>("grid");
  const { logout } = useAuth();

  const tabComponents = {
    grid: <GridTab />,
    colorPicker: <ColorPickerTab />,
    colorTheory: <ColorTheoryTab />,
    colorReference: <ColorReferenceTab />,
  };

  const tabs = [
    {
      id: "grid",
      label: "Grids",
      icon: <Grid className="h-5 w-5" />,
    },
    {
      id: "colorPicker",
      label: "Color Picker",
      icon: <PenTool className="h-5 w-5" />,
    },
    {
      id: "colorTheory",
      label: "Color Theory",
      icon: <Palette className="h-5 w-5" />,
    },
    {
      id: "colorReference",
      label: "Reference",
      icon: <BookOpen className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b">
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
          <h1 className="text-lg font-bold hidden sm:inline-block">ArtifyPalette Lab</h1>
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

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="animate-in">{tabComponents[activeTab]}</div>
      </main>

      {/* Bottom Nav */}
      <BottomNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab as any} />
    </div>
  );
};

export default AppLayout;
