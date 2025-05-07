
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, FilterX, Upload, Droplet, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

// Define the type for pencil color with accuracy
type PencilColorWithAccuracy = {
  id: number;
  brand: string;
  name: string;
  code: string;
  color: string;
  sets: string[];
  distance?: number;
  accuracy?: number;
};

// Function to convert RGB to HEX
const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
};

// Function to calculate color distance (simple Euclidean distance in RGB space)
const colorDistance = (color1: string, color2: string) => {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
};

// Function to find closest pencil matches
const findClosestPencils = (targetColor: string): PencilColorWithAccuracy[] => {
  return pencilColors
    .map(pencil => ({
      ...pencil,
      distance: colorDistance(targetColor, pencil.color),
      accuracy: Math.max(0, Math.min(100, 100 - (colorDistance(targetColor, pencil.color) / 4)))
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 8);
};

// Simple color quantization to extract dominant colors
const extractDominantColors = (imageData: ImageData, maxColors: number = 8) => {
  const pixels = imageData.data;
  const colors: {[key: string]: number} = {};
  
  // Sample pixels (every 10th pixel to improve performance)
  for (let i = 0; i < pixels.length; i += 40) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    const hex = rgbToHex(r, g, b);
    colors[hex] = (colors[hex] || 0) + 1;
  }
  
  // Sort colors by frequency and take the top maxColors
  return Object.entries(colors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors)
    .map(([color]) => color);
};

const ColorReferenceTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);
  const [paletteMatches, setPaletteMatches] = useState<PencilColorWithAccuracy[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({x: 0, y: 0});
  
  const toggleFavorite = (id: number) => {
    setFavoriteIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
        setSelectionRect(null);
        setExtractedPalette([]);
        setPaletteMatches([]);
        toast.success('Image uploaded successfully');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to load image');
    };
    reader.readAsDataURL(file);
  };
  
  // Draw the image on the canvas when it changes
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0);
    };
    img.src = image;
  }, [image]);
  
  // Redraw canvas with selection rectangle
  useEffect(() => {
    if (!image || !canvasRef.current || !selectionRect) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw selection rectangle
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
      
      // Draw selection overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
    };
    img.src = image;
  }, [image, selectionRect]);
  
  const startSelection = () => {
    setIsSelectionMode(true);
    setSelectionRect(null);
    toast.info('Click and drag to select an area of the image');
  };
  
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelectionMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({x, y});
    setSelectionRect({x, y, width: 0, height: 0});
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelectionMode || !isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setSelectionRect({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      width: Math.abs(x - dragStart.x),
      height: Math.abs(y - dragStart.y)
    });
  };
  
  const handleMouseUp = () => {
    if (!isSelectionMode || !isDragging || !selectionRect) return;
    
    setIsDragging(false);
    setIsSelectionMode(false);
    
    extractColorsFromSelection();
  };
  
  const extractColorsFromSelection = () => {
    if (!canvasRef.current || !selectionRect) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get image data from selection
    const imageData = ctx.getImageData(
      selectionRect.x, 
      selectionRect.y, 
      selectionRect.width, 
      selectionRect.height
    );
    
    // Extract dominant colors
    const dominantColors = extractDominantColors(imageData);
    setExtractedPalette(dominantColors);
    
    // Find pencil matches for each color
    const matches = dominantColors.flatMap(color => {
      return findClosestPencils(color).slice(0, 2);
    });
    
    // Remove duplicates
    const uniqueMatches = matches.filter((pencil, index, self) => 
      index === self.findIndex(p => p.id === pencil.id)
    ).slice(0, 12);
    
    setPaletteMatches(uniqueMatches);
    
    toast.success(`Extracted ${dominantColors.length} colors from the selection`);
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
      
      {/* Image Upload and Color Selection */}
      <div className="rounded-lg border bg-card mb-6 overflow-hidden">
        <div className="aspect-[3/2] bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
          {image ? (
            <canvas 
              ref={canvasRef} 
              className={cn(
                "max-w-full max-h-full",
                isSelectionMode ? "cursor-crosshair" : "cursor-default"
              )}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          ) : (
            <div className="text-center px-4">
              <p className="text-muted-foreground mb-4">Upload an image to extract color palettes</p>
              <Button 
                variant="outline"
                className="mr-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <input 
                ref={fileInputRef}
                id="reference-image-input" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>
          )}
          
          {/* Floating action button for selection */}
          {image && (
            <Button 
              size="icon" 
              className={cn(
                "absolute bottom-4 right-4 rounded-full shadow-lg",
                isSelectionMode ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
              )}
              onClick={startSelection}
            >
              <Droplet className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Extracted Palette */}
      {extractedPalette.length > 0 && (
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
                          onClick={() => toggleFavorite(pencil.id)}
                        />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
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
