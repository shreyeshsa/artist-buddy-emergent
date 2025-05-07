
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Droplet, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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

const ColorPickerTab = () => {
  const [selectedColor, setSelectedColor] = useState("#EC407A");
  const [rgbValue, setRgbValue] = useState("236, 64, 122");

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Color Picker</h2>
        <p className="text-muted-foreground">Extract colors and find matching art supplies</p>
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="aspect-[3/2] bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
          {/* This would be replaced with actual image color picker implementation */}
          <div className="text-center px-4">
            <p className="text-muted-foreground mb-4">Upload an image to pick colors</p>
            <Button 
              variant="outline"
              className="mr-2"
              onClick={() => document.getElementById('color-image-input')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <input 
              id="color-image-input" 
              type="file" 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          {/* Floating action button for quick actions */}
          <Button 
            size="icon" 
            className="absolute bottom-4 right-4 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <Droplet className="h-5 w-5" />
          </Button>
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
