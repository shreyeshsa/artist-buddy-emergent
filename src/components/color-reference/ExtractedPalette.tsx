
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { PencilColorWithAccuracy } from "@/data/pencilColors";

interface ExtractedPaletteProps {
  extractedPalette: string[];
  paletteMatches: PencilColorWithAccuracy[];
  favoriteIds: number[];
  onToggleFavorite: (id: number) => void;
}

const ExtractedPalette = ({ 
  extractedPalette, 
  paletteMatches, 
  favoriteIds, 
  onToggleFavorite 
}: ExtractedPaletteProps) => {
  
  if (extractedPalette.length === 0) return null;
  
  return (
    <div className="mb-6">
      <Label className="text-sm text-muted-foreground mb-2 block">Extracted Color Palette</Label>
      <div className="flex flex-wrap gap-2 mb-4">
        {extractedPalette.map((color, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="w-12 h-12 rounded-lg shadow-md" 
              style={{ backgroundColor: color }}
            />
            <span className="text-xs mt-1">{color}</span>
          </div>
        ))}
      </div>
      
      {paletteMatches.length > 0 && (
        <div className="space-y-3 mt-4">
          <Label className="text-sm">Best Pencil Matches for Palette</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {paletteMatches.map((pencil, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg bg-card border"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full" 
                    style={{ backgroundColor: pencil.color }} 
                  />
                  <div>
                    <div className="font-medium">{pencil.name}</div>
                    <div className="text-xs text-muted-foreground">{pencil.brand} · {pencil.code}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium mr-2">{Math.round(pencil.accuracy)}% match</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Star 
                      className={`h-4 w-4 ${favoriteIds.includes(pencil.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} 
                      onClick={() => onToggleFavorite(pencil.id)}
                    />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtractedPalette;
