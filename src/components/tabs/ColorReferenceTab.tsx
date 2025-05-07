
import { useState } from "react";
import { cn } from "@/lib/utils";
import { pencilColors, PencilColorWithAccuracy } from "@/data/pencilColors";
import ImageColorExtractor from "@/components/color-reference/ImageColorExtractor";
import ExtractedPalette from "@/components/color-reference/ExtractedPalette";
import ColorSearch from "@/components/color-reference/ColorSearch";
import ColorList from "@/components/color-reference/ColorList";

const ColorReferenceTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);
  const [paletteMatches, setPaletteMatches] = useState<PencilColorWithAccuracy[]>([]);
  
  const toggleFavorite = (id: number) => {
    setFavoriteIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  const handleExtractPalette = (palette: string[], matches: PencilColorWithAccuracy[]) => {
    setExtractedPalette(palette);
    setPaletteMatches(matches);
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
  
  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Color Code Reference</h2>
        <p className="text-muted-foreground">Browse pencil and paint color codes</p>
      </div>
      
      {/* Image Upload and Color Selection */}
      <ImageColorExtractor onExtractPalette={handleExtractPalette} />
      
      {/* Extracted Palette */}
      <ExtractedPalette 
        extractedPalette={extractedPalette} 
        paletteMatches={paletteMatches}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
      />
      
      {/* Search and Filter */}
      <ColorSearch 
        searchTerm={searchTerm}
        selectedBrand={selectedBrand}
        onSearchChange={setSearchTerm}
        onBrandChange={setSelectedBrand}
      />
      
      {/* Color List */}
      <ColorList 
        pencils={filteredPencils}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        onClearFilters={clearFilters}
      />
    </div>
  );
};

export default ColorReferenceTab;
