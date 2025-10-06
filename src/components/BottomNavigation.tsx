
import { Grid, PenTool, Palette, BookOpen, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
  icon: JSX.Element;
}

interface BottomNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export const BottomNavigation = ({ tabs, activeTab, setActiveTab }: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t py-2 px-2 flex justify-around z-50 shadow-lg">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex flex-col items-center justify-center space-y-1 text-xs px-2 py-1 rounded-lg transition-all",
            activeTab === tab.id
              ? "text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <div className={cn(
            "p-2 rounded-full transition-all",
            activeTab === tab.id && "bg-gradient-to-br from-artify-pink to-artify-purple shadow-md"
          )}>
            {tab.icon}
          </div>
          <span className={cn(
            activeTab === tab.id && "font-semibold bg-gradient-to-r from-artify-pink to-artify-purple bg-clip-text text-transparent"
          )}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
