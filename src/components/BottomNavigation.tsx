
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
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-2 px-4 flex justify-around z-50">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex flex-col items-center justify-center space-y-1 text-xs px-3",
            activeTab === tab.id
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <div className={cn(
            "p-1 rounded-full",
            activeTab === tab.id && "bg-primary/10"
          )}>
            {tab.icon}
          </div>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
