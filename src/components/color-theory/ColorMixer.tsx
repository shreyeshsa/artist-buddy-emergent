
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { InputGroup } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { rgbToHex } from "@/utils/colorUtils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColorMixerProps {
  onClose: () => void;
  onSaveColor?: (color: string, name: string) => void;
}

interface PaintColor {
  id: number;
  name: string;
  code: string;
  color: string;
  ratio: number;
}

// Organize Prismacolor pencils by sets
const prismacolorSets = {
  "24": [
    { id: 901, name: "Indigo Blue", code: "PC901", color: "#000F89" },
    { id: 903, name: "True Blue", code: "PC903", color: "#0047AB" },
    { id: 904, name: "Light Cerulean Blue", code: "PC904", color: "#007BA7" },
    { id: 908, name: "Dark Green", code: "PC908", color: "#013220" },
    { id: 909, name: "Grass Green", code: "PC909", color: "#4D8C57" },
    { id: 910, name: "True Green", code: "PC910", color: "#00A877" },
    { id: 916, name: "Canary Yellow", code: "PC916", color: "#FFEF00" },
    { id: 918, name: "Orange", code: "PC918", color: "#FF7F00" },
    { id: 922, name: "Poppy Red", code: "PC922", color: "#FF4500" },
    { id: 924, name: "Crimson Red", code: "PC924", color: "#C41E3A" },
    { id: 929, name: "Pink", code: "PC929", color: "#FFC0CB" },
    { id: 932, name: "Violet", code: "PC932", color: "#8A2BE2" },
    { id: 933, name: "Violet Blue", code: "PC933", color: "#324AB2" },
    { id: 935, name: "Black", code: "PC935", color: "#000000" },
    { id: 937, name: "Tuscan Red", code: "PC937", color: "#7C3030" },
    { id: 938, name: "White", code: "PC938", color: "#FFFFFF" },
    { id: 939, name: "Peach", code: "PC939", color: "#FFE5B4" },
    { id: 945, name: "Sienna Brown", code: "PC945", color: "#882D17" },
    { id: 946, name: "Dark Brown", code: "PC946", color: "#3B2F2F" },
    { id: 995, name: "Mulberry", code: "PC995", color: "#C54B8C" },
    { id: 1003, name: "Spanish Orange", code: "PC1003", color: "#E86100" },
    { id: 1008, name: "Parma Violet", code: "PC1008", color: "#9A81B5" },
    { id: 1034, name: "Goldenrod", code: "PC1034", color: "#DAA520" }
  ],
  "36": [
    { id: 901, name: "Indigo Blue", code: "PC901", color: "#000F89" },
    { id: 902, name: "Ultramarine", code: "PC902", color: "#120A8F" },
    { id: 903, name: "True Blue", code: "PC903", color: "#0047AB" },
    { id: 904, name: "Light Cerulean Blue", code: "PC904", color: "#007BA7" },
    { id: 908, name: "Dark Green", code: "PC908", color: "#013220" },
    { id: 909, name: "Grass Green", code: "PC909", color: "#4D8C57" },
    { id: 910, name: "True Green", code: "PC910", color: "#00A877" },
    { id: 911, name: "Olive Green", code: "PC911", color: "#BAB86C" },
    { id: 914, name: "Cream", code: "PC914", color: "#FFFDD0" },
    { id: 915, name: "Lemon Yellow", code: "PC915", color: "#FFF44F" },
    { id: 916, name: "Canary Yellow", code: "PC916", color: "#FFEF00" },
    { id: 918, name: "Orange", code: "PC918", color: "#FF7F00" },
    { id: 921, name: "Pale Vermilion", code: "PC921", color: "#D99058" },
    { id: 922, name: "Poppy Red", code: "PC922", color: "#FF4500" },
    { id: 924, name: "Crimson Red", code: "PC924", color: "#C41E3A" },
    { id: 926, name: "Carmine Red", code: "PC926", color: "#FF0038" },
    { id: 927, name: "Light Peach", code: "PC927", color: "#FFDAB9" },
    { id: 929, name: "Pink", code: "PC929", color: "#FFC0CB" },
    { id: 932, name: "Violet", code: "PC932", color: "#8A2BE2" },
    { id: 933, name: "Violet Blue", code: "PC933", color: "#324AB2" },
    { id: 935, name: "Black", code: "PC935", color: "#000000" },
    { id: 937, name: "Tuscan Red", code: "PC937", color: "#7C3030" },
    { id: 938, name: "White", code: "PC938", color: "#FFFFFF" },
    { id: 939, name: "Peach", code: "PC939", color: "#FFE5B4" },
    { id: 941, name: "Light Umber", code: "PC941", color: "#AA8C69" },
    { id: 942, name: "Yellow Ochre", code: "PC942", color: "#CB9D06" },
    { id: 945, name: "Sienna Brown", code: "PC945", color: "#882D17" },
    { id: 946, name: "Dark Brown", code: "PC946", color: "#3B2F2F" },
    { id: 949, name: "Metallic Silver", code: "PC949", color: "#C0C0C0" },
    { id: 950, name: "Metallic Gold", code: "PC950", color: "#D4AF37" },
    { id: 989, name: "Chartreuse", code: "PC989", color: "#DFFF00" },
    { id: 992, name: "Light Aqua", code: "PC992", color: "#93E9BE" },
    { id: 994, name: "Process Red", code: "PC994", color: "#FF0000" },
    { id: 995, name: "Mulberry", code: "PC995", color: "#C54B8C" },
    { id: 1002, name: "Yellowed Orange", code: "PC1002", color: "#FFAE42" },
    { id: 1003, name: "Spanish Orange", code: "PC1003", color: "#E86100" }
  ],
  "72": [
    // First 36 colors from 72-color set
    { id: 901, name: "Indigo Blue", code: "PC901", color: "#000F89" },
    { id: 902, name: "Ultramarine", code: "PC902", color: "#120A8F" },
    { id: 903, name: "True Blue", code: "PC903", color: "#0047AB" },
    { id: 904, name: "Light Cerulean Blue", code: "PC904", color: "#007BA7" },
    { id: 905, name: "Aquamarine", code: "PC905", color: "#7FFFD4" },
    { id: 906, name: "Copenhagen Blue", code: "PC906", color: "#0047AB" },
    { id: 908, name: "Dark Green", code: "PC908", color: "#013220" },
    { id: 909, name: "Grass Green", code: "PC909", color: "#4D8C57" },
    { id: 910, name: "True Green", code: "PC910", color: "#00A877" },
    { id: 911, name: "Olive Green", code: "PC911", color: "#BAB86C" },
    { id: 912, name: "Apple Green", code: "PC912", color: "#8DB600" },
    { id: 913, name: "Spring Green", code: "PC913", color: "#00FF7F" },
    { id: 914, name: "Cream", code: "PC914", color: "#FFFDD0" },
    { id: 915, name: "Lemon Yellow", code: "PC915", color: "#FFF44F" },
    { id: 916, name: "Canary Yellow", code: "PC916", color: "#FFEF00" },
    { id: 917, name: "Sunburst Yellow", code: "PC917", color: "#FFCC33" },
    { id: 918, name: "Orange", code: "PC918", color: "#FF7F00" },
    { id: 921, name: "Pale Vermilion", code: "PC921", color: "#D99058" },
    { id: 922, name: "Poppy Red", code: "PC922", color: "#FF4500" },
    { id: 924, name: "Crimson Red", code: "PC924", color: "#C41E3A" },
    { id: 925, name: "Crimson Lake", code: "PC925", color: "#DC143C" },
    { id: 926, name: "Carmine Red", code: "PC926", color: "#FF0038" },
    { id: 927, name: "Light Peach", code: "PC927", color: "#FFDAB9" },
    { id: 928, name: "Blush Pink", code: "PC928", color: "#FFB6C1" },
    { id: 929, name: "Pink", code: "PC929", color: "#FFC0CB" },
    { id: 930, name: "Magenta", code: "PC930", color: "#C71585" },
    { id: 931, name: "Dark Purple", code: "PC931", color: "#301934" },
    { id: 932, name: "Violet", code: "PC932", color: "#8A2BE2" },
    { id: 933, name: "Violet Blue", code: "PC933", color: "#324AB2" },
    { id: 935, name: "Black", code: "PC935", color: "#000000" },
    { id: 937, name: "Tuscan Red", code: "PC937", color: "#7C3030" },
    { id: 938, name: "White", code: "PC938", color: "#FFFFFF" },
    { id: 939, name: "Peach", code: "PC939", color: "#FFE5B4" },
    { id: 940, name: "Sand", code: "PC940", color: "#C2B280" },
    { id: 941, name: "Light Umber", code: "PC941", color: "#AA8C69" },
    { id: 942, name: "Yellow Ochre", code: "PC942", color: "#CB9D06" },
    
    // Next 36 colors from 72-color set
    { id: 943, name: "Burnt Ochre", code: "PC943", color: "#BB8B54" },
    { id: 944, name: "Terra Cotta", code: "PC944", color: "#E2725B" },
    { id: 945, name: "Sienna Brown", code: "PC945", color: "#882D17" },
    { id: 946, name: "Dark Brown", code: "PC946", color: "#3B2F2F" },
    { id: 947, name: "Dark Umber", code: "PC947", color: "#352315" },
    { id: 948, name: "Sepia", code: "PC948", color: "#704214" },
    { id: 956, name: "Lilac", code: "PC956", color: "#C8A2C8" },
    { id: 989, name: "Chartreuse", code: "PC989", color: "#DFFF00" },
    { id: 992, name: "Light Aqua", code: "PC992", color: "#93E9BE" },
    { id: 994, name: "Process Red", code: "PC994", color: "#FF0000" },
    { id: 995, name: "Mulberry", code: "PC995", color: "#C54B8C" },
    { id: 997, name: "Beige", code: "PC997", color: "#F5F5DC" },
    { id: 1002, name: "Yellowed Orange", code: "PC1002", color: "#FFAE42" },
    { id: 1003, name: "Spanish Orange", code: "PC1003", color: "#E86100" },
    { id: 1004, name: "Yellow Chartreuse", code: "PC1004", color: "#9ACD32" },
    { id: 1005, name: "Lime Peel", code: "PC1005", color: "#BFFF00" },
    { id: 1006, name: "Parrot Green", code: "PC1006", color: "#40FF00" },
    { id: 1007, name: "Imperial Violet", code: "PC1007", color: "#9370DB" },
    { id: 1008, name: "Parma Violet", code: "PC1008", color: "#9A81B5" },
    { id: 1021, name: "Jade Green", code: "PC1021", color: "#00A86B" },
    { id: 1023, name: "Cloud Blue", code: "PC1023", color: "#ADD8E6" },
    { id: 1027, name: "Peacock Blue", code: "PC1027", color: "#006B76" },
    { id: 1034, name: "Goldenrod", code: "PC1034", color: "#DAA520" },
    { id: 1051, name: "Warm Grey 20%", code: "PC1051", color: "#D3D3D3" },
    { id: 1054, name: "Warm Grey 50%", code: "PC1054", color: "#808080" },
    { id: 1056, name: "Warm Grey 70%", code: "PC1056", color: "#585858" },
    { id: 1060, name: "Cool Grey 20%", code: "PC1060", color: "#D3D3D3" },
    { id: 1063, name: "Cool Grey 50%", code: "PC1063", color: "#808080" },
    { id: 1065, name: "Cool Grey 70%", code: "PC1065", color: "#585858" },
    { id: 1069, name: "French Grey 20%", code: "PC1069", color: "#D3D3D3" },
    { id: 1072, name: "French Grey 50%", code: "PC1072", color: "#808080" },
    { id: 1074, name: "French Grey 70%", code: "PC1074", color: "#585858" },
    { id: 1083, name: "Putty Beige", code: "PC1083", color: "#E2DDB5" },
    { id: 1084, name: "Ginger Root", code: "PC1084", color: "#C36A2D" },
    { id: 949, name: "Metallic Silver", code: "PC949", color: "#C0C0C0" },
    { id: 950, name: "Metallic Gold", code: "PC950", color: "#D4AF37" },
  ]
};

// Most common oil paint colors
const oilColors = [
  { id: 1, name: "Titanium White", code: "W&N 644", color: "#FFFFFF" },
  { id: 2, name: "Ivory Black", code: "W&N 331", color: "#000000" },
  { id: 3, name: "Alizarin Crimson", code: "W&N 004", color: "#E32636" },
  { id: 4, name: "Cadmium Red", code: "W&N 094", color: "#E30022" },
  { id: 5, name: "Cadmium Yellow", code: "W&N 108", color: "#FFF600" },
  { id: 6, name: "Cadmium Yellow Pale", code: "W&N 118", color: "#FFF999" },
  { id: 7, name: "Yellow Ochre", code: "W&N 744", color: "#CB9D06" },
  { id: 8, name: "Raw Sienna", code: "W&N 552", color: "#D27D46" },
  { id: 9, name: "Burnt Sienna", code: "W&N 074", color: "#E97451" },
  { id: 10, name: "Burnt Umber", code: "W&N 076", color: "#8A3324" },
  { id: 11, name: "Raw Umber", code: "W&N 554", color: "#826644" },
  { id: 12, name: "Ultramarine Blue", code: "W&N 667", color: "#120A8F" },
  { id: 13, name: "Cobalt Blue", code: "W&N 178", color: "#0047AB" },
  { id: 14, name: "Cerulean Blue", code: "W&N 137", color: "#2A52BE" },
  { id: 15, name: "Phthalo Blue", code: "W&N 514", color: "#000F89" },
  { id: 16, name: "Viridian", code: "W&N 692", color: "#40826D" },
  { id: 17, name: "Sap Green", code: "W&N 599", color: "#507D2A" },
  { id: 18, name: "Permanent Green", code: "W&N 482", color: "#04A04A" },
  { id: 19, name: "Cadmium Orange", code: "W&N 090", color: "#FF6103" },
  { id: 20, name: "Naples Yellow", code: "W&N 422", color: "#FADA5E" },
  { id: 21, name: "Dioxazine Purple", code: "W&N 192", color: "#6C4675" },
  { id: 22, name: "Payne's Gray", code: "W&N 465", color: "#536878" },
  { id: 23, name: "Flesh Tint", code: "W&N 257", color: "#FFE5B4" },
  { id: 24, name: "Zinc White", code: "W&N 748", color: "#FEFEFE" }
];

// Most common watercolor colors
const waterColors = [
  { id: 1, name: "Chinese White", code: "W&N 150", color: "#FFFFFF" },
  { id: 2, name: "Lamp Black", code: "W&N 337", color: "#000000" },
  { id: 3, name: "Permanent Rose", code: "W&N 502", color: "#FF66CC" },
  { id: 4, name: "Alizarin Crimson", code: "W&N 004", color: "#E32636" },
  { id: 5, name: "Cadmium Red", code: "W&N 094", color: "#E30022" },
  { id: 6, name: "Cadmium Yellow", code: "W&N 108", color: "#FFF600" },
  { id: 7, name: "Lemon Yellow", code: "W&N 347", color: "#FFF44F" },
  { id: 8, name: "Yellow Ochre", code: "W&N 744", color: "#CB9D06" },
  { id: 9, name: "Raw Sienna", code: "W&N 552", color: "#D27D46" },
  { id: 10, name: "Burnt Sienna", code: "W&N 074", color: "#E97451" },
  { id: 11, name: "Cobalt Blue", code: "W&N 178", color: "#0047AB" },
  { id: 12, name: "Ultramarine", code: "W&N 667", color: "#120A8F" },
  { id: 13, name: "Cerulean Blue", code: "W&N 137", color: "#2A52BE" },
  { id: 14, name: "Phthalo Blue", code: "W&N 514", color: "#000F89" },
  { id: 15, name: "Viridian", code: "W&N 692", color: "#40826D" },
  { id: 16, name: "Sap Green", code: "W&N 599", color: "#507D2A" },
  { id: 17, name: "Hooker's Green", code: "W&N 312", color: "#004524" },
  { id: 18, name: "Payne's Gray", code: "W&N 465", color: "#536878" },
  { id: 19, name: "Neutral Tint", code: "W&N 430", color: "#292937" },
  { id: 20, name: "Sepia", code: "W&N 609", color: "#704214" },
  { id: 21, name: "Burnt Umber", code: "W&N 076", color: "#8A3324" },
  { id: 22, name: "Raw Umber", code: "W&N 554", color: "#826644" },
  { id: 23, name: "Quinacridone Gold", code: "W&N 547", color: "#A67B5B" },
  { id: 24, name: "Opera Rose", code: "W&N 448", color: "#FF00A8" }
];

// Simple color mixing function (simplified, not physically accurate)
const mixColors = (colors: { color: string; ratio: number }[]) => {
  if (colors.length === 0) return "#FFFFFF";
  
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalRatio = 0;
  
  colors.forEach(({ color, ratio }) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
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

const ColorMixer = ({ onClose, onSaveColor }: ColorMixerProps) => {
  const [selectedMedium, setSelectedMedium] = useState("prismacolor-24");
  const [selectedColors, setSelectedColors] = useState<PaintColor[]>([]);
  const [mixedColor, setMixedColor] = useState("#FFFFFF");
  const [mixedColorName, setMixedColorName] = useState("Custom Mix");
  const [activeSet, setActiveSet] = useState("24");
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Determine available colors based on medium
  const getAvailableColors = () => {
    if (selectedMedium.startsWith('prismacolor')) {
      const setSize = selectedMedium.split('-')[1];
      return prismacolorSets[setSize as keyof typeof prismacolorSets];
    } else if (selectedMedium === 'oil') {
      return oilColors;
    } else {
      return waterColors;
    }
  };
  
  const availableColors = getAvailableColors();
  
  const addColorToMix = (color: any) => {
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
    if (onSaveColor) {
      onSaveColor(mixedColor, mixedColorName || "Custom Mix");
    }
    onClose();
  };

  // Handle color set changes
  const handleSetChange = (set: string) => {
    setActiveSet(set);
    setSelectedMedium(`prismacolor-${set}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Color Mixer</h3>
        <p className="text-muted-foreground mb-4">Mix colors and see the results</p>
      </div>
      
      {/* Medium Selection Tabs */}
      <Tabs defaultValue="prismacolor" onValueChange={(value) => {
        if (value === 'prismacolor') {
          setSelectedMedium(`prismacolor-${activeSet}`);
        } else {
          setSelectedMedium(value);
        }
      }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prismacolor">Prismacolor</TabsTrigger>
          <TabsTrigger value="oil">Oil Paint</TabsTrigger>
          <TabsTrigger value="watercolor">Watercolor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prismacolor" className="mt-4">
          {/* Prismacolor Set Selection */}
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            <Button 
              variant={activeSet === "24" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSetChange("24")}
            >
              24 Set
            </Button>
            <Button 
              variant={activeSet === "36" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSetChange("36")}
            >
              36 Set
            </Button>
            <Button 
              variant={activeSet === "72" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSetChange("72")}
            >
              72 Set
            </Button>
          </div>
          
          <ScrollArea className="h-[280px] border rounded-md p-2">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-1">
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
                  <span className="text-xs text-center line-clamp-1">{color.code}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="oil" className="mt-4">
          <ScrollArea className="h-[280px] border rounded-md p-2">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-1">
              {oilColors.map(color => (
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
                  <span className="text-xs text-center line-clamp-1">{color.code}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="watercolor" className="mt-4">
          <ScrollArea className="h-[280px] border rounded-md p-2">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-1">
              {waterColors.map(color => (
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
                  <span className="text-xs text-center line-clamp-1">{color.code}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
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
          <ScrollArea className="h-[180px] border rounded-md">
            <div className="p-2 space-y-3">
              {selectedColors.map(color => (
                <div key={color.id} className="border rounded-md p-3 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded-full" 
                        style={{ backgroundColor: color.color }} 
                      />
                      <span className="text-sm line-clamp-1">{color.code}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeColorFromMix(color.id)}
                      className="h-8 px-2 py-0"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs w-7">{color.ratio}%</span>
                    <Slider
                      value={[color.ratio]}
                      min={10}
                      max={100}
                      step={5}
                      onValueChange={(values) => updateColorRatio(color.id, values[0])}
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      
      {/* Result */}
      <div className="space-y-2 pt-2">
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
        </div>
        
        {onSaveColor && (
          <div className="pt-2">
            <Label htmlFor="mix-name">Name your mix</Label>
            <div className="flex mt-1">
              <Input 
                id="mix-name"
                value={mixedColorName}
                onChange={(e) => setMixedColorName(e.target.value)}
                className="flex-1 mr-2"
                placeholder="Custom Mix"
              />
              <Button
                onClick={saveColorMix}
                disabled={selectedColors.length === 0}
              >
                Save
              </Button>
            </div>
          </div>
        )}
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
