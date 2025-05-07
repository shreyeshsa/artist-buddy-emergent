
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Droplet, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock data for color matches
const pencilMatches = [
  { brand: "Prismacolor", name: "Crimson Red", code: "PC924", color: "#C41E3A", accuracy: 98 },
  { brand: "Prismacolor", name: "Poppy Red", code: "PC922", color: "#FF4500", accuracy: 95 },
  { brand: "Faber-Castell", name: "Deep Scarlet Red", code: "FC118", color: "#B22222", accuracy: 92 },
  { brand: "Caran d'Ache", name: "Scarlet", code: "CA070", color: "#ED2939", accuracy: 90 },
];

const paintMatches = [
  { brand: "Winsor & Newton", name: "Cadmium Red", medium: "Watercolor", color: "#E30022", accuracy: 97 },
  { brand: "Liquitex", name: "Light Portrait Pink", medium: "Acrylic", color: "#FFD3DB", accuracy: 94 },
  { brand: "Gamblin", name: "Cadmium Red Light", medium: "Oil", color: "#EC5A45", accuracy: 91 },
];

const mixSuggestions = [
  {
    components: [
      { brand: "Prismacolor", name: "Crimson Red", code: "PC924", color: "#C41E3A", ratio: 70 },
      { brand: "Prismacolor", name: "Mulberry", code: "PC995", color: "#C54B8C", ratio: 30 },
    ],
    result: "#C93555",
    accuracy: 97
  },
  {
    components: [
      { brand: "Faber-Castell", name: "Deep Scarlet Red", code: "FC118", color: "#B22222", ratio: 60 },
      { brand: "Faber-Castell", name: "Pale Geranium Lake", code: "FC121", color: "#E63244", ratio: 40 },
    ],
    result: "#C02B30",
    accuracy: 95
  },
];

// Function to find the closest color match
const findColorMatches = (targetColor: string) => {
  // In a real implementation, this would compare the target color to a database of pencil/paint colors
  // For this demo, we'll just return the mock data
  return {
    pencils: pencilMatches,
    paints: paintMatches,
    mixes: mixSuggestions
  };
};

// Function to convert RGB to HEX
const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
};

const ColorPickerTab = () => {
  const [selectedColor, setSelectedColor] = useState("#EC407A");
  const [rgbValue, setRgbValue] = useState("236, 64, 122");
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPickingColor, setIsPickingColor] = useState(false);
  
  // Calculate RGB from HEX when selectedColor changes
  useEffect(() => {
    const hex = selectedColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    setRgbValue(`${r}, ${g}, ${b}`);
  }, [selectedColor]);
  
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
        toast.success('Image uploaded successfully');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to load image');
    };
    reader.readAsDataURL(file);
  };
  
  const handlePickColor = () => {
    setIsPickingColor(true);
    toast.info('Click on the image to pick a color');
  };
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingColor || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
    
    setSelectedColor(hex);
    setIsPickingColor(false);
    toast.success('Color picked successfully');
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

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Color Picker</h2>
        <p className="text-muted-foreground">Extract colors and find matching art supplies</p>
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="aspect-[3/2] bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
          {image ? (
            <canvas 
              ref={canvasRef} 
              onClick={handleCanvasClick}
              className={cn(
                "max-w-full max-h-full",
                isPickingColor ? "cursor-crosshair" : "cursor-default"
              )}
            />
          ) : (
            <div className="text-center px-4">
              <p className="text-muted-foreground mb-4">Upload an image to pick colors</p>
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
                id="color-image-input" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>
          )}
          
          {/* Floating action button for color picking */}
          {image && (
            <Button 
              size="icon" 
              className={cn(
                "absolute bottom-4 right-4 rounded-full shadow-lg",
                isPickingColor ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
              )}
              onClick={handlePickColor}
            >
              <Droplet className="h-5 w-5" />
            </Button>
          )}
        </div>
      </Card>

      {/* Selected Color Display */}
      <div className="mb-6">
        <Label className="text-sm text-muted-foreground mb-2 block">Selected Color</Label>
        <div className="flex items-center space-x-4">
          <div 
            className="w-16 h-16 rounded-lg shadow-md" 
            style={{ backgroundColor: selectedColor }}
          />
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium">HEX:</span>
              <span>{selectedColor}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">RGB:</span>
              <span>{rgbValue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Color Matches */}
      <Tabs defaultValue="pencils" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pencils">Pencils</TabsTrigger>
          <TabsTrigger value="paints">Paints</TabsTrigger>
          <TabsTrigger value="mix">Mix</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pencils" className="space-y-4 mt-4">
          <div className="space-y-3">
            <Label className="text-sm">Best Pencil Matches</Label>
            {pencilMatches.map((pencil, index) => (
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
                  <span className="text-xs font-medium mr-2">{pencil.accuracy}% match</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="paints" className="space-y-4 mt-4">
          <div className="space-y-3">
            <Label className="text-sm">Best Paint Matches</Label>
            {paintMatches.map((paint, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg bg-card border"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full" 
                    style={{ backgroundColor: paint.color }} 
                  />
                  <div>
                    <div className="font-medium">{paint.name}</div>
                    <div className="text-xs text-muted-foreground">{paint.brand} · {paint.medium}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium">{paint.accuracy}% match</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="mix" className="space-y-4 mt-4">
          <div className="space-y-4">
            {mixSuggestions.map((mix, mixIndex) => (
              <div key={mixIndex} className="rounded-lg border p-3 bg-card">
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-sm">Color Mix Suggestion</Label>
                  <span className="text-xs font-medium">{mix.accuracy}% match</span>
                </div>
                
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full" 
                    style={{ backgroundColor: mix.result }} 
                  />
                  <div className="text-sm font-medium">Resulting Color</div>
                </div>
                
                <div className="space-y-2">
                  {mix.components.map((component, index) => (
                    <div key={index} className="flex items-center justify-between bg-background p-2 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ backgroundColor: component.color }} 
                        />
                        <div>
                          <div className="text-sm font-medium">{component.name}</div>
                          <div className="text-xs text-muted-foreground">{component.brand} · {component.code}</div>
                        </div>
                      </div>
                      <span className="text-xs font-medium">{component.ratio}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ColorPickerTab;
