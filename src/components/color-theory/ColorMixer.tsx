
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { rgbToHex } from "@/utils/colorUtils";

interface ColorMixerProps {
  onClose: () => void;
}

interface PaintColor {
  id: number;
  name: string;
  color: string;
  ratio: number;
}

// Mock colors for different mediums
const prismaColors = [
  { id: 1, name: "Crimson Red", color: "#C41E3A" },
  { id: 2, name: "Magenta", color: "#C71585" },
  { id: 3, name: "Violet", color: "#8A2BE2" },
  { id: 4, name: "Blue", color: "#0000FF" },
  { id: 5, name: "Green", color: "#008000" },
  { id: 6, name: "Yellow", color: "#FFFF00" },
  { id: 7, name: "Orange", color: "#FFA500" },
  { id: 8, name: "Brown", color: "#A52A2A" },
  { id: 9, name: "Black", color: "#000000" },
  { id: 10, name: "White", color: "#FFFFFF" },
];

const oilColors = [
  { id: 1, name: "Cadmium Red", color: "#E30022" },
  { id: 2, name: "Alizarin Crimson", color: "#E32636" },
  { id: 3, name: "Ultramarine Blue", color: "#0437F2" },
  { id: 4, name: "Phthalo Blue", color: "#000F89" },
  { id: 5, name: "Cadmium Yellow", color: "#FFF600" },
  { id: 6, name: "Yellow Ochre", color: "#CB9D06" },
  { id: 7, name: "Viridian Green", color: "#009874" },
  { id: 8, name: "Sap Green", color: "#507D2A" },
  { id: 9, name: "Burnt Umber", color: "#8A3324" },
  { id: 10, name: "Titanium White", color: "#FFFFFF" },
];

const waterColors = [
  { id: 1, name: "Permanent Rose", color: "#FF66CC" },
  { id: 2, name: "Cerulean Blue", color: "#2A52BE" },
  { id: 3, name: "Lemon Yellow", color: "#FFF44F" },
  { id: 4, name: "Viridian", color: "#40826D" },
  { id: 5, name: "Burnt Sienna", color: "#E97451" },
  { id: 6, name: "Ultramarine", color: "#120A8F" },
  { id: 7, name: "Cadmium Red", color: "#E30022" },
  { id: 8, name: "Yellow Ochre", color: "#CB9D06" },
  { id: 9, name: "Payne's Gray", color: "#536878" },
  { id: 10, name: "Chinese White", color: "#FFFFFF" },
];

// Simple color mixing function (very simplified, not physically accurate)
const mixColors = (colors: { color: string; ratio: number }[]) => {
  if (colors.length === 0) return "#FFFFFF";
  
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalRatio = 0;
  
  colors.forEach(({ color, ratio }) => {
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    
    totalR += r * ratio;
    totalG += g * ratio;
    totalB += b * ratio;
    totalRatio += ratio;
  });
  
  if (totalRatio === 0) return "#FFFFFF";
  
  const r = Math.round(totalR / totalRatio);
  const g = Math.round(totalG / totalRatio);
  const b = Math.round(totalB / totalRatio);
  
  return rgbToHex(r, g, b);
};

const ColorMixer = ({ onClose }: ColorMixerProps) => {
  const [selectedMedium, setSelectedMedium] = useState("prismacolor");
  const [selectedColors, setSelectedColors] = useState<PaintColor[]>([]);
  const [mixedColor, setMixedColor] = useState("#FFFFFF");
  
  const availableColors = 
    selectedMedium === "prismacolor" ? prismaColors :
    selectedMedium === "oil" ? oilColors : waterColors;
  
  const addColorToMix = (color: typeof prismaColors[0]) => {
    const newColor = { ...color, ratio: 50 };
    setSelectedColors([...selectedColors, newColor]);
    updateMixedColor([...selectedColors, newColor]);
  };
  
  const removeColorFromMix = (id: number) => {
    const newColors = selectedColors.filter(c => c.id !== id);
    setSelectedColors(newColors);
    updateMixedColor(newColors);
  };
  
  const updateColorRatio = (id: number, ratio: number) => {
    const newColors = selectedColors.map(c => 
      c.id === id ? { ...c, ratio } : c
    );
    setSelectedColors(newColors);
    updateMixedColor(newColors);
  };
  
  const updateMixedColor = (colors: PaintColor[]) => {
    setMixedColor(mixColors(colors));
  };
  
  const saveColorMix = () => {
    // In a real app, this would save to user's palette
    onClose();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Color Mixer</h3>
        <p className="text-muted-foreground mb-4">Mix colors and see the results</p>
      </div>
      
      {/* Medium Selection Tabs */}
      <Tabs defaultValue="prismacolor" onValueChange={setSelectedMedium} value={selectedMedium}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prismacolor">Prismacolor</TabsTrigger>
          <TabsTrigger value="oil">Oil Paint</TabsTrigger>
          <TabsTrigger value="watercolor">Watercolor</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedMedium} className="mt-4">
          <div className="grid grid-cols-5 gap-2">
            {availableColors.map(color => (
              <Button 
                key={color.id} 
                variant="outline" 
                className="p-1 h-auto flex flex-col items-center"
                onClick={() => addColorToMix(color)}
                disabled={selectedColors.some(c => c.id === color.id)}
              >
                <div 
                  className="w-10 h-10 rounded-full mb-1" 
                  style={{ backgroundColor: color.color }} 
                />
                <span className="text-xs text-center line-clamp-1">{color.name}</span>
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Mixing Area */}
      <div className="space-y-4">
        <Label className="text-sm">Current Mix</Label>
        
        {selectedColors.length === 0 ? (
          <div className="text-center p-4 border rounded-md bg-muted/20">
            <p className="text-muted-foreground">Add colors to start mixing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedColors.map(color => (
              <div key={color.id} className="border rounded-md p-3 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full mr-2" 
                      style={{ backgroundColor: color.color }} 
                    />
                    <span>{color.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeColorFromMix(color.id)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm w-6">{color.ratio}%</span>
                  <Slider
                    value={[color.ratio]}
                    min={10}
                    max={100}
                    step={5}
                    onValueChange={(values) => updateColorRatio(color.id, values[0])}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Result */}
      <div className="space-y-4 pt-2">
        <Label className="text-sm">Mixed Result</Label>
        <div className="flex justify-between items-center p-4 border rounded-md">
          <div className="flex items-center space-x-3">
            <div 
              className="w-16 h-16 rounded-md shadow-inner" 
              style={{ backgroundColor: mixedColor }} 
            />
            <div>
              <div className="font-medium">{mixedColor}</div>
              <div className="text-xs text-muted-foreground">
                Mixed from {selectedColors.length} color{selectedColors.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={saveColorMix}
            disabled={selectedColors.length === 0}
          >
            Save Color
          </Button>
        </div>
      </div>
      
      {/* Close Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={onClose}
        >
          Close Mixer
        </Button>
      </div>
    </div>
  );
};

export default ColorMixer;
