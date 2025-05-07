
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, FilterX } from "lucide-react";

// Mock pencil data
const pencilBrands = ["Prismacolor", "Faber-Castell", "Caran d'Ache"];

const pencilColors = [
  { id: 1, brand: "Prismacolor", name: "Crimson Red", code: "PC924", color: "#C41E3A", sets: ["24", "36", "72", "150"] },
  { id: 2, brand: "Prismacolor", name: "Poppy Red", code: "PC922", color: "#FF4500", sets: ["36", "72", "150"] },
  { id: 3, brand: "Prismacolor", name: "Blush Pink", code: "PC928", color: "#FFB6C1", sets: ["72", "150"] },
  { id: 4, brand: "Prismacolor", name: "Process Red", code: "PC994", color: "#ED2939", sets: ["24", "36", "72", "150"] },
  { id: 5, brand: "Prismacolor", name: "Magenta", code: "PC930", color: "#C71585", sets: ["36", "72", "150"] },
  { id: 6, brand: "Prismacolor", name: "Mulberry", code: "PC995", color: "#C54B8C", sets: ["72", "150"] },
  { id: 7, brand: "Prismacolor", name: "Violet", code: "PC932", color: "#8A2BE2", sets: ["24", "36", "72", "150"] },
  { id: 8, brand: "Prismacolor", name: "Lilac", code: "PC956", color: "#C8A2C8", sets: ["36", "72", "150"] },
  { id: 9, brand: "Prismacolor", name: "Blue Violet", code: "PC933", color: "#4169E1", sets: ["24", "36", "72", "150"] },
  { id: 10, brand: "Faber-Castell", name: "Dark Red", code: "FC118", color: "#8B0000", sets: ["24", "36", "60", "120"] },
  { id: 11, brand: "Faber-Castell", name: "Pompeian Red", code: "FC191", color: "#A52A2A", sets: ["36", "60", "120"] },
  { id: 12, brand: "Faber-Castell", name: "Middle Purple Pink", code: "FC125", color: "#DB7093", sets: ["60", "120"] },
  { id: 13, brand: "Caran d'Ache", name: "Purple", code: "CA120", color: "#800080", sets: ["40", "80"] },
  { id: 14, brand: "Caran d'Ache", name: "Ruby Red", code: "CA085", color: "#E0115F", sets: ["40", "80"] },
  { id: 15, brand: "Caran d'Ache", name: "Light Purple", code: "CA131", color: "#D8BFD8", sets: ["80"] },
];

const ColorReferenceTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  
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
  
  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Color Code Reference</h2>
        <p className="text-muted-foreground">Browse pencil and paint color codes</p>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1.5 h-7 w-7"
              onClick={() => setSearchTerm("")}
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="all" onValueChange={setSelectedBrand}>
          <TabsList className="w-full flex overflow-x-auto">
            <TabsTrigger value="all" className="flex-1">All Brands</TabsTrigger>
            {pencilBrands.map(brand => (
              <TabsTrigger key={brand} value={brand} className="flex-1">
                {brand}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Color List */}
      <div className="space-y-2">
        {filteredPencils.length > 0 ? (
          filteredPencils.map(pencil => (
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
                  onClick={() => toggleFavorite(pencil.id)}
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
              onClick={() => {
                setSearchTerm("");
                setSelectedBrand("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorReferenceTab;
