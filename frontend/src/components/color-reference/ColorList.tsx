
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { PencilColor } from "@/data/pencilColors";

interface ColorListProps {
  pencils: PencilColor[];
  favoriteIds: number[];
  onToggleFavorite: (id: number) => void;
  onClearFilters: () => void;
}

const ColorList = ({ 
  pencils, 
  favoriteIds, 
  onToggleFavorite, 
  onClearFilters 
}: ColorListProps) => {
  return (
    <div className="space-y-2">
      {pencils.length > 0 ? (
        pencils.map(pencil => (
          <div 
            key={pencil.id}
            className="flex items-center justify-between p-3 rounded-lg bg-card border"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full border shadow-sm" 
                style={{ backgroundColor: pencil.color }}
              />
              <div>
                <div className="font-medium">{pencil.name}</div>
                <div className="flex space-x-2 text-xs">
                  <span className="text-muted-foreground">{pencil.brand}</span>
                  <span className="font-medium">{pencil.code}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-muted-foreground">
                {pencil.sets.join(", ")}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onToggleFavorite(pencil.id)}
              >
                <Star 
                  className={`h-4 w-4 ${favoriteIds.includes(pencil.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} 
                />
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No matching colors found</p>
          <Button 
            variant="link" 
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ColorList;
