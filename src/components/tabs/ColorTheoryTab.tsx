
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Color wheel component
const ColorWheel = ({ 
  selectedColor, 
  onColorSelect, 
  harmonies 
}: { 
  selectedColor: string; 
  onColorSelect: (color: string) => void;
  harmonies: Record<string, string[]>;
}) => {
  // Sample colors for the color wheel (simplified)
  const wheelColors = [
    '#FF0000', '#FF3300', '#FF6600', '#FF9900', '#FFCC00', '#FFFF00', 
    '#CCFF00', '#99FF00', '#66FF00', '#33FF00', '#00FF00', '#00FF33', 
    '#00FF66', '#00FF99', '#00FFCC', '#00FFFF', '#00CCFF', '#0099FF', 
    '#0066FF', '#0033FF', '#0000FF', '#3300FF', '#6600FF', '#9900FF', 
    '#CC00FF', '#FF00FF', '#FF00CC', '#FF0099', '#FF0066', '#FF0033'
  ];
  
  // Function to calculate harmonies
  const colorHarmonyPositions: Record<string, { x: number, y: number, color: string }[]> = {};
  
  // Convert harmonies to positions
  Object.entries(harmonies).forEach(([harmonyType, colors]) => {
    colorHarmonyPositions[harmonyType] = colors.map((color, index) => {
      // Calculate position in the wheel
      const wheelIndex = wheelColors.findIndex(c => c.toLowerCase() === color.toLowerCase());
      const angle = (wheelIndex / wheelColors.length) * 2 * Math.PI;
      
      // Position on circle
      const radius = 100;
      const x = radius * Math.cos(angle) + radius;
      const y = radius * Math.sin(angle) + radius;
      
      return { x, y, color };
    });
  });

  return (
    <div className="relative mx-auto my-4">
      <div className="relative w-[250px] h-[250px] mx-auto">
        {/* Color wheel background */}
        <div 
          className="absolute inset-0 rounded-full overflow-hidden border"
          style={{
            background: `conic-gradient(
              #FF0000, #FF8000, #FFFF00, #80FF00, 
              #00FF00, #00FF80, #00FFFF, #0080FF, 
              #0000FF, #8000FF, #FF00FF, #FF0080, #FF0000
            )`
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate angle based on click position
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const angle = Math.atan2(y - centerY, x - centerX);
            
            // Convert angle to index in color wheel
            let index = Math.floor((angle / (2 * Math.PI) + 0.5) * wheelColors.length);
            if (index < 0) index += wheelColors.length;
            if (index >= wheelColors.length) index = 0;
            
            // Get color at that angle
            const color = wheelColors[index];
            onColorSelect(color);
          }}
        />
        
        {/* Selected color indicator */}
        <div
          className="absolute w-6 h-6 rounded-full border-2 border-white shadow-md"
          style={{
            backgroundColor: selectedColor,
            transform: "translate(-50%, -50%)",
            left: "50%",
            top: "50%"
          }}
        />
        
        {/* Harmony dots */}
        {harmonies.complementary && (
          <>
            <div
              className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md"
              style={{
                backgroundColor: harmonies.complementary[0],
                transform: "translate(-50%, -50%)",
                left: `${colorHarmonyPositions.complementary[0].x}px`,
                top: `${colorHarmonyPositions.complementary[0].y}px`
              }}
            />
          </>
        )}
        
        {harmonies.triad && harmonies.triad.map((color, index) => (
          <div
            key={`triad-${index}`}
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md"
            style={{
              backgroundColor: color,
              transform: "translate(-50%, -50%)",
              left: `${colorHarmonyPositions.triad[index].x}px`,
              top: `${colorHarmonyPositions.triad[index].y}px`
            }}
          />
        ))}
        
        {harmonies.tetrad && harmonies.tetrad.map((color, index) => (
          <div
            key={`tetrad-${index}`}
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md"
            style={{
              backgroundColor: color,
              transform: "translate(-50%, -50%)",
              left: `${colorHarmonyPositions.tetrad[index].x}px`,
              top: `${colorHarmonyPositions.tetrad[index].y}px`
            }}
          />
        ))}
        
        {harmonies.analogous && harmonies.analogous.map((color, index) => (
          <div
            key={`analogous-${index}`}
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md"
            style={{
              backgroundColor: color,
              transform: "translate(-50%, -50%)",
              left: `${colorHarmonyPositions.analogous[index].x}px`,
              top: `${colorHarmonyPositions.analogous[index].y}px`
            }}
          />
        ))}
        
        {harmonies.split && harmonies.split.map((color, index) => (
          <div
            key={`split-${index}`}
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md"
            style={{
              backgroundColor: color,
              transform: "translate(-50%, -50%)",
              left: `${colorHarmonyPositions.split[index].x}px`,
              top: `${colorHarmonyPositions.split[index].y}px`
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Saturation/Value Component
const SaturationValue = ({ 
  baseHue, 
  onColorSelect 
}: { 
  baseHue: number; 
  onColorSelect: (color: string) => void 
}) => {
  const [saturation, setSaturation] = useState(100);
  const [value, setValue] = useState(100);
  
  // Convert HSV to RGB
  const hsvToRgb = (h: number, s: number, v: number) => {
    s = s / 100;
    v = v / 100;
    
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    let r, g, b;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
      default: r = v; g = t; b = p;
    }
    
    return { 
      r: Math.round(r * 255), 
      g: Math.round(g * 255), 
      b: Math.round(b * 255) 
    };
  };
  
  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
  };
  
  // Calculate current color based on hue, saturation, and value
  const currentColor = rgbToHex(
    ...Object.values(hsvToRgb(baseHue / 360, saturation, value)) as [number, number, number]
  );
  
  // Update color when saturation or value changes
  useEffect(() => {
    onColorSelect(currentColor);
  }, [saturation, value, baseHue]);

  return (
    <div className="space-y-6 mt-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Saturation</Label>
          <span className="text-sm">{saturation}%</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[saturation]}
          onValueChange={(values) => setSaturation(values[0])}
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          style={{
            background: `linear-gradient(to right, 
              ${rgbToHex(...Object.values(hsvToRgb(baseHue / 360, 0, value)) as [number, number, number])}, 
              ${rgbToHex(...Object.values(hsvToRgb(baseHue / 360, 100, value)) as [number, number, number])}
            )`
          }}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Value (Brightness)</Label>
          <span className="text-sm">{value}%</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[value]}
          onValueChange={(values) => setValue(values[0])}
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          style={{
            background: `linear-gradient(to right, 
              ${rgbToHex(...Object.values(hsvToRgb(baseHue / 360, saturation, 0)) as [number, number, number])}, 
              ${rgbToHex(...Object.values(hsvToRgb(baseHue / 360, saturation, 100)) as [number, number, number])}
            )`
          }}
        />
      </div>
      
      <div className="w-full h-12 rounded-md" style={{ backgroundColor: currentColor }}></div>
    </div>
  );
};

const ColorTheoryTab = () => {
  const [selectedColor, setSelectedColor] = useState("#EC407A");
  const [harmonies, setHarmonies] = useState<Record<string, string[]>>({});
  const [baseHue, setBaseHue] = useState(0);
  
  // Parse hex color to get hue
  useEffect(() => {
    // Convert hex to rgb
    const hex = selectedColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Calculate hue
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    
    if (max === min) {
      h = 0; // achromatic
    } else {
      const d = max - min;
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    setBaseHue(Math.round(h * 360));
    calculateHarmonies(h * 360);
  }, [selectedColor]);
  
  const calculateHarmonies = (hue: number) => {
    // Function to convert hue to RGB (with full saturation and value)
    const hueToRgb = (h: number) => {
      h = h % 360;
      if (h < 0) h += 360;
      
      const hue = h / 60;
      const i = Math.floor(hue);
      const f = hue - i;
      
      const v = 1;
      const p = 0;
      const q = 1 * (1 - f);
      const t = 1 * f;
      
      let r, g, b;
      switch (i) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
        default: r = v; g = t; b = p;
      }
      
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      };
    };
    
    const rgbToHex = (r: number, g: number, b: number) => {
      return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
    };
    
    // Calculate color harmonies
    const newHarmonies: Record<string, string[]> = {
      // Complementary: opposite on the color wheel
      complementary: [rgbToHex(...Object.values(hueToRgb(hue + 180)) as [number, number, number])],
      
      // Triad: three equidistant colors on the wheel (120° apart)
      triad: [
        rgbToHex(...Object.values(hueToRgb(hue + 120)) as [number, number, number]),
        rgbToHex(...Object.values(hueToRgb(hue + 240)) as [number, number, number])
      ],
      
      // Tetrad: four equidistant colors on the wheel (90° apart)
      tetrad: [
        rgbToHex(...Object.values(hueToRgb(hue + 90)) as [number, number, number]),
        rgbToHex(...Object.values(hueToRgb(hue + 180)) as [number, number, number]),
        rgbToHex(...Object.values(hueToRgb(hue + 270)) as [number, number, number])
      ],
      
      // Analogous: colors adjacent on the wheel
      analogous: [
        rgbToHex(...Object.values(hueToRgb(hue - 30)) as [number, number, number]),
        rgbToHex(...Object.values(hueToRgb(hue + 30)) as [number, number, number])
      ],
      
      // Split-complementary: base color plus two colors adjacent to its complement
      split: [
        rgbToHex(...Object.values(hueToRgb(hue + 150)) as [number, number, number]),
        rgbToHex(...Object.values(hueToRgb(hue + 210)) as [number, number, number])
      ]
    };
    
    setHarmonies(newHarmonies);
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(e.target.value);
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Color Theory</h2>
        <p className="text-muted-foreground mb-4">Learn about color relationships and harmonies</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Color Wheel</CardTitle>
            </CardHeader>
            <CardContent>
              <ColorWheel 
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
                harmonies={harmonies}
              />
              
              <div className="flex items-center space-x-2 mt-4">
                <div 
                  className="w-10 h-10 rounded-full border" 
                  style={{ backgroundColor: selectedColor }} 
                />
                <Input
                  type="color"
                  value={selectedColor}
                  onChange={handleColorInputChange}
                  className="w-16 h-10 p-0 border cursor-pointer bg-transparent"
                />
                <Input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => {
                    if (e.target.value.startsWith('#') && e.target.value.length <= 7) {
                      setSelectedColor(e.target.value);
                    }
                  }}
                  className="flex-1"
                />
              </div>
              
              <SaturationValue baseHue={baseHue} onColorSelect={setSelectedColor} />
            </CardContent>
          </Card>
          
          <div>
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Color Harmonies</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="complementary">
                  <ScrollArea className="w-full">
                    <TabsList className="w-full flex overflow-x-auto justify-start">
                      <TabsTrigger value="complementary">Complementary</TabsTrigger>
                      <TabsTrigger value="analogous">Analogous</TabsTrigger>
                      <TabsTrigger value="triadic">Triadic</TabsTrigger>
                      <TabsTrigger value="tetradic">Tetradic</TabsTrigger>
                      <TabsTrigger value="split">Split Complementary</TabsTrigger>
                    </TabsList>
                  </ScrollArea>
                  
                  <TabsContent value="complementary" className="mt-4">
                    <div>
                      <h4 className="font-medium mb-2">Complementary Colors</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Complementary colors are opposite each other on the color wheel.
                        They create a high contrast and vibrant look when used together.
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: selectedColor }}></div>
                          <p className="text-xs text-center">{selectedColor}</p>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: harmonies.complementary?.[0] }}></div>
                          <p className="text-xs text-center">{harmonies.complementary?.[0]}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analogous" className="mt-4">
                    <div>
                      <h4 className="font-medium mb-2">Analogous Colors</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Analogous colors are next to each other on the color wheel.
                        They create a harmonious and serene look.
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: harmonies.analogous?.[0] }}></div>
                          <p className="text-xs text-center">{harmonies.analogous?.[0]}</p>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: selectedColor }}></div>
                          <p className="text-xs text-center">{selectedColor}</p>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: harmonies.analogous?.[1] }}></div>
                          <p className="text-xs text-center">{harmonies.analogous?.[1]}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="triadic" className="mt-4">
                    <div>
                      <h4 className="font-medium mb-2">Triadic Colors</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Triadic colors are evenly spaced around the color wheel.
                        They create a vibrant and balanced color scheme.
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: selectedColor }}></div>
                          <p className="text-xs text-center">{selectedColor}</p>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: harmonies.triad?.[0] }}></div>
                          <p className="text-xs text-center">{harmonies.triad?.[0]}</p>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: harmonies.triad?.[1] }}></div>
                          <p className="text-xs text-center">{harmonies.triad?.[1]}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tetradic" className="mt-4">
                    <div>
                      <h4 className="font-medium mb-2">Tetradic Colors</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tetradic colors form a rectangle on the color wheel.
                        They offer a rich and varied color palette.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex-1 min-w-[100px] space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: selectedColor }}></div>
                          <p className="text-xs text-center">{selectedColor}</p>
                        </div>
                        <div className="flex-1 min-w-[100px] space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: harmonies.tetrad?.[0] }}></div>
                          <p className="text-xs text-center">{harmonies.tetrad?.[0]}</p>
                        </div>
                        <div className="flex-1 min-w-[100px] space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: harmonies.tetrad?.[1] }}></div>
                          <p className="text-xs text-center">{harmonies.tetrad?.[1]}</p>
                        </div>
                        <div className="flex-1 min-w-[100px] space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: harmonies.tetrad?.[2] }}></div>
                          <p className="text-xs text-center">{harmonies.tetrad?.[2]}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="split" className="mt-4">
                    <div>
                      <h4 className="font-medium mb-2">Split Complementary</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Split complementary uses a color and the two colors adjacent to its complement.
                        It provides high contrast with less tension than complementary colors.
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: selectedColor }}></div>
                          <p className="text-xs text-center">{selectedColor}</p>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: harmonies.split?.[0] }}></div>
                          <p className="text-xs text-center">{harmonies.split?.[0]}</p>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="h-12 rounded-md" style={{ backgroundColor: harmonies.split?.[1] }}></div>
                          <p className="text-xs text-center">{harmonies.split?.[1]}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Color Theory Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">Explore these topics to improve your color skills:</p>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>Primary, Secondary, and Tertiary Colors</li>
                  <li>Color Temperature (Warm vs Cool)</li>
                  <li>Color Psychology and Meaning</li>
                  <li>Color Contrast and Accessibility</li>
                  <li>Color Mixing Principles</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorTheoryTab;
