
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  icon: JSX.Element;
};

type BottomNavigationProps = {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export function BottomNavigation({ tabs, activeTab, setActiveTab }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-10">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center h-full w-full rounded-none border-0 space-y-1",
              activeTab === tab.id 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            <span className="text-xs font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 h-0.5 w-1/2 bg-primary rounded-t-full" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
