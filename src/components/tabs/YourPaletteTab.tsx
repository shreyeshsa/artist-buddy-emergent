import { useState } from "react";
import { cn } from "@/lib/utils";
import { pencilColors, PencilColorWithAccuracy } from "@/data/pencilColors";
import ColorSearch from "@/components/color-reference/ColorSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Download, Save } from "lucide-react";
import { toast } from "sonner";
import ColorPaletteGroup, { ColorItem } from "@/components/palette/ColorPaletteGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { savePaletteProject } from "@/utils/databaseUtils";
import { usePersistedState } from "@/hooks/usePersistedState";

const YourPaletteTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedSet, setSelectedSet] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [palettes, setPalettes] = usePersistedState<{id: string; name: string; colors: ColorItem[]}[]>("yourPalette_palettes", []);
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
    const matchesSet = selectedSet === "all" || 
                       (selectedSet === "prisma-24" && pencil.sets.includes("24")) ||
                       (selectedSet === "prisma-36" && pencil.sets.includes("36")) ||
                       (selectedSet === "prisma-72" && pencil.sets.includes("72")) ||
                       (selectedSet === "prisma-150" && pencil.sets.includes("150")) ||
                       (selectedSet === "faber-24" && pencil.sets.includes("24")) ||
                       (selectedSet === "faber-36" && pencil.sets.includes("36")) ||
                       (selectedSet === "faber-60" && pencil.sets.includes("60")) ||
                       (selectedSet === "faber-120" && pencil.sets.includes("120")) ||
                       (selectedSet === "caran-20" && pencil.sets.includes("20")) ||
                       (selectedSet === "caran-40" && pencil.sets.includes("40")) ||
                       (selectedSet === "caran-76" && pencil.sets.includes("76")) ||
                       (selectedSet === "caran-100" && pencil.sets.includes("100"));
    return matchesSearch && matchesBrand && matchesSet;
  });
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBrand("all");
    setSelectedSet("all");
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

  const handleSavePaletteToProject = async (palette: {id: string; name: string; colors: ColorItem[]}) => {
    if (palette.colors.length === 0) {
      toast.error("Cannot save an empty palette");
      return;
    }

    const result = await savePaletteProject(palette.name, palette.colors);
    if (result) {
      toast.success(`Saved ${palette.name} to Palette Projects`);
    }
  };

  const handleExportPalette = (palette: {id: string; name: string; colors: ColorItem[]}) => {
    // Create a canvas to render the palette
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const colorSize = 60;
    const padding = 20;
    const spacing = 10;
    const colorsPerRow = 5;

    const rows = Math.ceil(palette.colors.length / colorsPerRow);
    canvas.width = padding * 2 + colorsPerRow * colorSize + (colorsPerRow - 1) * spacing;
    canvas.height = padding * 3 + rows * (colorSize + spacing) + 40; // Extra height for title

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(palette.name, canvas.width / 2, padding + 20);

    // Draw colors
    palette.colors.forEach((color, index) => {
      const row = Math.floor(index / colorsPerRow);
      const col = index % colorsPerRow;

      const x = padding + col * (colorSize + spacing);
      const y = padding * 2 + 40 + row * (colorSize + spacing);

      // Draw color square
      ctx.fillStyle = color.color;
      ctx.fillRect(x, y, colorSize, colorSize);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(x, y, colorSize, colorSize);

      // Draw color info
      ctx.fillStyle = '#000000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${color.code}`, x + colorSize / 2, y + colorSize + 12);
    });

    // Export as PNG
    const link = document.createElement('a');
    link.download = `${palette.name.replace(/\s+/g, '-').toLowerCase()}-palette.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    toast.success(`Exported ${palette.name} palette as PNG`);
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
          <div className="space-y-6">
            {palettes.map(palette => (
              <div key={palette.id} className="border rounded-lg p-4 bg-card shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <div className="flex items-center">
                    <h4 className="font-medium text-lg">{palette.name}</h4>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {palette.colors.length} colors
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSavePaletteToProject(palette)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90 border-0"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Save in Project</span>
                      <span className="sm:hidden">Save</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportPalette(palette)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemovePalette(palette.id)}
                    >
                      <span className="hidden sm:inline">Remove</span>
                      <span className="sm:hidden">×</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {palette.colors.map(color => (
                    <div key={color.id} className="relative group">
                      <div 
                        className="w-12 h-12 rounded border" 
                        style={{ backgroundColor: color.color }}
                      />
                      <button 
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveColor(palette.id, color.id)}
                      >
                        ×
                      </button>
                      <div className="text-xs text-center mt-1 max-w-[48px] truncate">
                        {color.code}
                      </div>
                    </div>
                  ))}
                  
                  {palette.colors.length === 0 && (
                    <div className="text-sm text-muted-foreground italic p-2">
                      Add colors from below
                    </div>
                  )}
                </div>
              </div>
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
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="Prismacolor">Prismacolor</SelectItem>
                <SelectItem value="Faber-Castell">Faber-Castell</SelectItem>
                <SelectItem value="Caran d'Ache">Caran d'Ache</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedSet} onValueChange={setSelectedSet}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sets</SelectItem>
                <SelectItem value="prisma-24">Prismacolor 24</SelectItem>
                <SelectItem value="prisma-36">Prismacolor 36</SelectItem>
                <SelectItem value="prisma-72">Prismacolor 72</SelectItem>
                <SelectItem value="prisma-150">Prismacolor 150</SelectItem>
                <SelectItem value="faber-24">Faber-Castell 24</SelectItem>
                <SelectItem value="faber-36">Faber-Castell 36</SelectItem>
                <SelectItem value="faber-60">Faber-Castell 60</SelectItem>
                <SelectItem value="faber-120">Faber-Castell 120</SelectItem>
                <SelectItem value="caran-20">Caran d'Ache 20</SelectItem>
                <SelectItem value="caran-40">Caran d'Ache 40</SelectItem>
                <SelectItem value="caran-76">Caran d'Ache 76</SelectItem>
                <SelectItem value="caran-100">Caran d'Ache 100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Color List */}
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {filteredPencils.map(pencil => (
                <div 
                  key={pencil.id} 
                  className="flex flex-col items-center p-3 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div 
                    className="w-12 h-12 rounded-full mb-1 shadow-inner" 
                    style={{ backgroundColor: pencil.color }} 
                  />
                  <div className="text-sm font-medium text-center line-clamp-1">{pencil.code}</div>
                  <div className="text-xs text-muted-foreground text-center line-clamp-1">{pencil.name}</div>
                  <div className="text-xs text-muted-foreground text-center mb-2">{pencil.brand}</div>
                  
                  {palettes.length > 0 && (
                    <Select onValueChange={(value) => handleAddToPalette(pencil, value)}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Add to palette" />
                      </SelectTrigger>
                      <SelectContent>
                        {palettes.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-4">
            <div className="space-y-2">
              {filteredPencils.map(pencil => (
                <div 
                  key={pencil.id} 
                  className="flex items-center justify-between p-3 rounded-lg border"
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
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {filteredPencils.length === 0 && (
          <div className="text-center p-6 border rounded-md bg-muted/10">
            <p className="text-muted-foreground">No colors match your search criteria.</p>
            <Button variant="link" onClick={clearFilters}>Clear filters</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourPaletteTab;
