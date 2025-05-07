
import { useState } from "react";
import { cn } from "@/lib/utils";
import { pencilColors, PencilColorWithAccuracy } from "@/data/pencilColors";
import ColorSearch from "@/components/color-reference/ColorSearch";
import ColorList from "@/components/color-reference/ColorList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ColorPaletteGroup, { ColorItem } from "@/components/palette/ColorPaletteGroup";

// Mock data for initial palettes
const initialPalettes = [
  {
    id: "palette-1",
    name: "Landscape Set",
    colors: [
      { id: 1, color: "#008000", name: "Green", brand: "Prismacolor", code: "PC909" },
      { id: 2, color: "#4169E1", name: "Blue Violet", brand: "Prismacolor", code: "PC933" },
      { id: 3, color: "#FFD700", name: "Yellow", brand: "Prismacolor", code: "PC916" },
      { id: 4, color: "#8B4513", name: "Brown", brand: "Prismacolor", code: "PC945" },
    ]
  },
  {
    id: "palette-2",
    name: "Portrait Set",
    colors: [
      { id: 1, color: "#E0115F", name: "Ruby Red", brand: "Caran d'Ache", code: "CA085" },
      { id: 2, color: "#FFB6C1", name: "Blush Pink", brand: "Prismacolor", code: "PC928" },
      { id: 3, color: "#D2B48C", name: "Tan", brand: "Faber-Castell", code: "FC283" },
    ]
  }
];

const YourPaletteTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [palettes, setPalettes] = useState(initialPalettes);
  const [newPaletteName, setNewPaletteName] = useState("");
  
  const toggleFavorite = (id: number) => {
    setFavoriteIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  const filteredPencils = pencilColors.filter(pencil => {
    const matchesSearch = pencil.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pencil.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === "all" || pencil.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBrand("all");
  };

  const handleAddPalette = () => {
    if (!newPaletteName.trim()) {
      toast.error("Please enter a palette name");
      return;
    }

    const newPalette = {
      id: `palette-${Date.now()}`,
      name: newPaletteName,
      colors: []
    };

    setPalettes([...palettes, newPalette]);
    setNewPaletteName("");
    toast.success("New palette created");
  };

  const handleRemovePalette = (id: string) => {
    setPalettes(palettes.filter(p => p.id !== id));
    toast.success("Palette removed");
  };

  const handleRenamePalette = (id: string, newName: string) => {
    setPalettes(palettes.map(p => p.id === id ? { ...p, name: newName } : p));
    toast.success("Palette renamed");
  };

  const handleRemoveColor = (paletteId: string, colorId: number) => {
    setPalettes(palettes.map(p => {
      if (p.id === paletteId) {
        return {
          ...p,
          colors: p.colors.filter(c => c.id !== colorId)
        };
      }
      return p;
    }));
    toast.success("Color removed from palette");
  };

  const handleAddToPalette = (pencil: PencilColorWithAccuracy, paletteId: string) => {
    setPalettes(palettes.map(p => {
      if (p.id === paletteId) {
        // Check if color already exists in palette
        if (p.colors.some(c => c.color === pencil.color)) {
          toast.info("This color is already in the palette");
          return p;
        }
        
        return {
          ...p,
          colors: [
            ...p.colors,
            {
              id: Date.now(),
              color: pencil.color,
              name: pencil.name,
              brand: pencil.brand,
              code: pencil.code
            }
          ]
        };
      }
      return p;
    }));
    toast.success(`Added ${pencil.name} to palette`);
  };
  
  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Your Palette</h2>
        <p className="text-muted-foreground">Save and organize your favorite colors</p>
      </div>
      
      {/* Palette Management Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">My Color Palettes</h3>
        
        {/* Add New Palette */}
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="New palette name"
            value={newPaletteName}
            onChange={(e) => setNewPaletteName(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleAddPalette}
            className="bg-gradient-to-r from-artify-pink to-artify-purple hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Palette
          </Button>
        </div>
        
        {/* Palette List */}
        {palettes.length > 0 ? (
          <div className="space-y-4">
            {palettes.map(palette => (
              <ColorPaletteGroup
                key={palette.id}
                id={palette.id}
                name={palette.name}
                colors={palette.colors}
                onRemoveGroup={handleRemovePalette}
                onRenameGroup={handleRenamePalette}
                onRemoveColor={handleRemoveColor}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-6 border rounded-md bg-muted/10">
            <p className="text-muted-foreground">No palettes created yet. Create your first color palette above.</p>
          </div>
        )}
      </div>
      
      {/* Divider */}
      <div className="border-t my-6"></div>
      
      {/* Browse Color Section */}
      <div>
        <h3 className="text-lg font-medium mb-3">Browse Color References</h3>
        <p className="text-muted-foreground mb-4">Find and add colors to your palettes</p>
        
        {/* Search and Filter */}
        <ColorSearch 
          searchTerm={searchTerm}
          selectedBrand={selectedBrand}
          onSearchChange={setSearchTerm}
          onBrandChange={setSelectedBrand}
        />
        
        {/* Color List */}
        <div className="mt-4">
          {filteredPencils.map(pencil => (
            <div 
              key={pencil.id} 
              className="flex items-center justify-between p-3 mb-2 rounded-lg bg-card border"
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
              <div className="flex">
                {palettes.length > 0 && (
                  <div className="flex items-center">
                    <select
                      className="text-xs mr-2 border rounded px-2 py-1 bg-background"
                      onChange={(e) => e.target.value && handleAddToPalette(pencil, e.target.value)}
                      value=""
                    >
                      <option value="" disabled>Add to palette</option>
                      {palettes.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleFavorite(pencil.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn(
                      "h-4 w-4",
                      favoriteIds.includes(pencil.id)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
          
          {filteredPencils.length === 0 && (
            <div className="text-center p-6 border rounded-md bg-muted/10">
              <p className="text-muted-foreground">No colors match your search criteria.</p>
              <Button variant="link" onClick={clearFilters}>Clear filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YourPaletteTab;
