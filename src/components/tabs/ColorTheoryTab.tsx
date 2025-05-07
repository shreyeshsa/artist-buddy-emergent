
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Function to convert HSV to RGB
const hsvToRgb = (h: number, s: number, v: number) => {
  h = h / 360;
  let r: number, g: number, b: number;
  
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = 0; g = 0; b = 0;
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

// Function to convert RGB to HEX
const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
};

// Function to generate color harmonies
const generateColorHarmonies = (baseColor: string) => {
  // Convert hex to HSV
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  
  let h = 0;
  
  if (d === 0) h = 0;
  else if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else if (max === b) h = (r - g) / d + 4;
  
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  const s = max === 0 ? 0 : d / max;
  const v = max;
  
  // Generate color harmonies
  const complementaryH = (h + 180) % 360;
  const analogous1H = (h + 30) % 360;
  const analogous2H = (h - 30 + 360) % 360;
  const triadicH1 = (h + 120) % 360;
  const triadicH2 = (h + 240) % 360;
  const splitComplementary1H = (h + 150) % 360;
  const splitComplementary2H = (h + 210) % 360;
  
  // Convert back to RGB and then HEX
  const complementaryRgb = hsvToRgb(complementaryH, s, v);
  const analogous1Rgb = hsvToRgb(analogous1H, s, v);
  const analogous2Rgb = hsvToRgb(analogous2H, s, v);
  const triadicH1Rgb = hsvToRgb(triadicH1, s, v);
  const triadicH2Rgb = hsvToRgb(triadicH2, s, v);
  const splitComplementary1Rgb = hsvToRgb(splitComplementary1H, s, v);
  const splitComplementary2Rgb = hsvToRgb(splitComplementary2H, s, v);
  
  return {
    complementary: [
      baseColor,
      rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b)
    ],
    analogous: [
      rgbToHex(analogous2Rgb.r, analogous2Rgb.g, analogous2Rgb.b),
      baseColor,
      rgbToHex(analogous1Rgb.r, analogous1Rgb.g, analogous1Rgb.b)
    ],
    triadic: [
      baseColor,
      rgbToHex(triadicH1Rgb.r, triadicH1Rgb.g, triadicH1Rgb.b),
      rgbToHex(triadicH2Rgb.r, triadicH2Rgb.g, triadicH2Rgb.b)
    ],
    splitComplementary: [
      baseColor,
      rgbToHex(splitComplementary1Rgb.r, splitComplementary1Rgb.g, splitComplementary1Rgb.b),
      rgbToHex(splitComplementary2Rgb.r, splitComplementary2Rgb.g, splitComplementary2Rgb.b)
    ]
  };
};

const ColorTheoryTab = () => {
  const [selectedColor, setSelectedColor] = useState("#EC407A");
  const [colorHarmonies, setColorHarmonies] = useState({
    complementary: ["#EC407A", "#40EC9C"],
    analogous: ["#EC407A", "#EC6040", "#EC9C40"],
    triadic: ["#EC407A", "#40EC7A", "#7A40EC"],
    splitComplementary: ["#EC407A", "#40BCEC", "#40EC5C"]
  });
  const colorWheelRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  
  // Draw color wheel on component mount
  useEffect(() => {
    drawColorWheel();
  }, []);
  
  // Update color harmonies when selected color changes
  useEffect(() => {
    const newHarmonies = generateColorHarmonies(selectedColor);
    setColorHarmonies(newHarmonies);
  }, [selectedColor]);
  
  const drawColorWheel = () => {
    if (!colorWheelRef.current) return;
    
    const canvas = colorWheelRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 5;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw color wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;
      
      for (let sat = 0; sat < 100; sat++) {
        const satRadius = radius * (sat / 100);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, satRadius, startAngle, endAngle);
        ctx.lineWidth = radius / 100;
        
        const rgb = hsvToRgb(angle, sat / 100, 1);
        ctx.strokeStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.stroke();
      }
    }
    
    // Draw white center
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius / 8, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.stroke();
  };
  
  const handleColorWheelClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!colorWheelRef.current) return;
    
    pickColorFromWheel(event);
  };
  
  const handleColorWheelMouseDown = () => {
    isDraggingRef.current = true;
  };
  
  const handleColorWheelMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    
    pickColorFromWheel(event);
  };
  
  const handleColorWheelMouseUp = () => {
    isDraggingRef.current = false;
  };
  
  const pickColorFromWheel = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!colorWheelRef.current) return;
    
    const canvas = colorWheelRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Calculate distance from center
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate angle (hue)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    
    // Calculate saturation (distance from center)
    const maxRadius = Math.min(centerX, centerY) - 5;
    let saturation = Math.min(distance / maxRadius, 1);
    
    // If in the white center circle, set saturation to 0
    if (distance < maxRadius / 8) {
      saturation = 0;
    }
    
    // Convert HSV to RGB to HEX
    const rgb = hsvToRgb(angle, saturation, 1);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    setSelectedColor(hex);
    toast.success('Color selected: ' + hex);
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Color Theory Lab</h2>
        <p className="text-muted-foreground">Learn and apply color theory to your artwork</p>
      </div>
      
      {/* Color Wheel */}
      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-6">
          <Label className="text-sm text-muted-foreground mb-2 block">Interactive Color Wheel</Label>
          <div className="aspect-square max-w-xs mx-auto mb-4 relative">
            <canvas 
              ref={colorWheelRef}
              width={300}
              height={300}
              className="w-full h-full cursor-crosshair"
              onClick={handleColorWheelClick}
              onMouseDown={handleColorWheelMouseDown}
              onMouseMove={handleColorWheelMouseMove}
              onMouseUp={handleColorWheelMouseUp}
              onMouseLeave={handleColorWheelMouseUp}
            />
          </div>
          
          <div className="flex justify-center items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-lg shadow-md" 
              style={{ backgroundColor: selectedColor }}
            />
            <div>
              <div className="font-medium">{selectedColor}</div>
              <div className="text-sm text-muted-foreground">Click on the wheel to select a color</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Color Harmonies */}
      <div className="mb-6">
        <Label className="text-sm text-muted-foreground mb-2 block">Color Harmonies</Label>
        <Tabs defaultValue="complementary">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="complementary">Comp.</TabsTrigger>
            <TabsTrigger value="analogous">Analog.</TabsTrigger>
            <TabsTrigger value="triadic">Triadic</TabsTrigger>
            <TabsTrigger value="splitComplementary">Split</TabsTrigger>
          </TabsList>
          
          {Object.entries(colorHarmonies).map(([harmony, colors]) => (
            <TabsContent key={harmony} value={harmony} className="mt-4">
              <div className="flex space-x-2">
                {colors.map((color, index) => (
                  <div key={index} className="flex-1">
                    <div 
                      className="w-full aspect-[1/1.2] rounded-lg shadow-md mb-1" 
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-center">{color}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Educational Content */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-3">Color Theory Tips</h3>
          
          <div className="space-y-4">
            <div className="bg-accent/50 p-3 rounded-md">
              <h4 className="font-medium mb-1">Warm vs Cool Colors</h4>
              <p className="text-sm text-muted-foreground">Warm colors (reds, oranges, yellows) advance, while cool colors (blues, greens, purples) recede. Use this to create depth in your art.</p>
            </div>
            
            <div className="bg-accent/50 p-3 rounded-md">
              <h4 className="font-medium mb-1">Mixing Neutrals</h4>
              <p className="text-sm text-muted-foreground">Create rich neutral tones by mixing complementary colors rather than using black or gray directly.</p>
            </div>
            
            <div className="bg-accent/50 p-3 rounded-md">
              <h4 className="font-medium mb-1">Skin Tone Basics</h4>
              <p className="text-sm text-muted-foreground">Skin tones are never flat colors. They consist of reds, yellows, and blues in different proportions depending on the undertone.</p>
            </div>
            
            <div className="bg-accent/50 p-3 rounded-md">
              <h4 className="font-medium mb-1">Shadows and Highlights</h4>
              <p className="text-sm text-muted-foreground">Shadows often contain cool colors like blues and purples, while highlights can have warm yellows and oranges.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Color Mixing Tool */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-3">Color Mixing Simulator</h3>
          <p className="text-sm text-muted-foreground mb-4">Create custom colors by mixing different mediums</p>
          
          <div className="space-y-4">
            <Button 
              className="w-full bg-gradient-to-r from-artify-pink to-artify-purple hover:opacity-90"
              onClick={() => toast.info("Color Mixer will open in a separate panel")}
            >
              Try Color Mixer
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Select colors, adjust proportions, and see the resulting mix
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorTheoryTab;
