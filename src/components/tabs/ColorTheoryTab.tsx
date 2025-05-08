
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Eye, ZoomIn, ZoomOut, RefreshCw, Droplet } from "lucide-react";
import ColorMixer from "@/components/color-theory/ColorMixer";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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

// Function to convert RGB to HSV
const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s,
    v
  };
};

// Function to convert RGB to HEX
const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
};

// Function to generate color harmonies
const generateColorHarmonies = (baseColor: string) => {
  // Convert hex to RGB
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Convert RGB to HSV
  const hsv = rgbToHsv(r * 255, g * 255, b * 255);
  const h = hsv.h;
  const s = hsv.s;
  const v = hsv.v;
  
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
  
  // Generate monochromatic colors
  const monochromatic = [];
  for (let i = 0.2; i <= 1; i += 0.2) {
    const rgbColor = hsvToRgb(h, s, i);
    monochromatic.push(rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b));
  }
  
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
    ],
    monochromatic
  };
};

const ColorTheoryTab = () => {
  const [selectedColor, setSelectedColor] = useState("#EC407A");
  const [colorHarmonies, setColorHarmonies] = useState<any>({});
  const [isColorMixerOpen, setIsColorMixerOpen] = useState(false);
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [value, setValue] = useState(1);
  const [showValueScale, setShowValueScale] = useState(false);
  const [showSaturationScale, setShowSaturationScale] = useState(false);
  
  const colorWheelRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Draw color wheel on component mount and when dimensions change
  useEffect(() => {
    drawColorWheel();
    
    const handleResize = () => {
      drawColorWheel();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update color harmonies when selected color changes
  useEffect(() => {
    const newHarmonies = generateColorHarmonies(selectedColor);
    setColorHarmonies(newHarmonies);
    
    // Update HSV values when color changes
    const hex = selectedColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const hsv = rgbToHsv(r, g, b);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setValue(hsv.v);
  }, [selectedColor]);
  
  const drawColorWheel = () => {
    if (!colorWheelRef.current) return;
    
    const canvas = colorWheelRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get the actual rendered size of the canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
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
    
    // Draw indicator for current color
    if (hue !== undefined && saturation !== undefined) {
      const satRadius = saturation * radius;
      const angleRad = hue * Math.PI / 180;
      
      const x = centerX + satRadius * Math.cos(angleRad);
      const y = centerY + satRadius * Math.sin(angleRad);
      
      // Draw outer circle
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw inner circle with selected color
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = selectedColor;
      ctx.fill();
    }
  };
  
  const handleColorWheelClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!colorWheelRef.current) return;
    
    pickColorFromWheel(event);
  };
  
  const handleColorWheelMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPickingColor) {
      isDraggingRef.current = true;
      pickColorFromWheel(event);
    }
  };
  
  const handleColorWheelMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingColor || !isDraggingRef.current) return;
    
    pickColorFromWheel(event);
  };
  
  const handleColorWheelMouseUp = () => {
    isDraggingRef.current = false;
  };
  
  const handleColorWheelTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (isPickingColor) {
      isDraggingRef.current = true;
      const touch = event.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      pickColorFromWheel(mouseEvent);
    }
  };
  
  const handleColorWheelTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPickingColor || !isDraggingRef.current) return;
    
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    pickColorFromWheel(mouseEvent);
  };
  
  const handleColorWheelTouchEnd = () => {
    isDraggingRef.current = false;
  };
  
  const pickColorFromWheel = (event: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    if (!colorWheelRef.current) return;
    
    const canvas = colorWheelRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Calculate distance from center
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate angle (hue)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    // Calculate saturation (distance from center)
    const maxRadius = Math.min(centerX, centerY) - 5;
    let saturation = Math.min(distance / maxRadius, 1);
    
    // If in the white center circle, set saturation to 0
    if (distance < maxRadius / 8) {
      saturation = 0;
    }
    
    // Update the hue and saturation
    setHue(angle);
    setSaturation(saturation);
    
    // Convert HSV to RGB to HEX
    const rgb = hsvToRgb(angle, saturation, value);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    setSelectedColor(hex);
    drawColorWheel();
  };
  
  // Handle value (brightness) change
  const handleValueChange = (newValue: number[]) => {
    setValue(newValue[0]);
    
    // Update color
    const rgb = hsvToRgb(hue, saturation, newValue[0]);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setSelectedColor(hex);
    
    drawColorWheel();
  };
  
  const toggleColorPicking = () => {
    setIsPickingColor(!isPickingColor);
    if (!isPickingColor) {
      toast.info('Click and drag on the color wheel to select a color');
    }
  };
  
  const handleSaveColor = (color: string, name: string) => {
    // This would save to a user's palette in a real application
    toast.success(`Color ${name} (${color}) saved to your palette`);
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Color Theory Lab</h2>
        <p className="text-muted-foreground">Learn and apply color theory to your artwork</p>
      </div>
      
      {/* Color Wheel */}
      <Card className="mb-6 overflow-hidden relative">
        <CardContent className="p-6">
          <Label className="text-sm text-muted-foreground mb-2 block">Interactive Color Wheel</Label>
          <div className="aspect-square max-w-xs mx-auto mb-4 relative">
            <canvas 
              ref={colorWheelRef}
              className="w-full h-full cursor-crosshair"
              onClick={handleColorWheelClick}
              onMouseDown={handleColorWheelMouseDown}
              onMouseMove={handleColorWheelMouseMove}
              onMouseUp={handleColorWheelMouseUp}
              onMouseLeave={handleColorWheelMouseUp}
              onTouchStart={handleColorWheelTouchStart}
              onTouchMove={handleColorWheelTouchMove}
              onTouchEnd={handleColorWheelTouchEnd}
            />
            
            {/* Color picker icon */}
            <Button 
              size="icon" 
              className={cn(
                "rounded-full absolute bottom-2 right-2 shadow-lg",
                isPickingColor ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
              )}
              onClick={toggleColorPicking}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {/* Show the value scale */}
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={() => setShowValueScale(!showValueScale)}
            >
              {showValueScale ? 'Hide' : 'Show'} Value Scale
            </Button>
            
            {/* Show saturation scale */}
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 left-2"
              onClick={() => setShowSaturationScale(!showSaturationScale)}
            >
              {showSaturationScale ? 'Hide' : 'Show'} Saturation
            </Button>
          </div>
          
          {/* Value (brightness) slider */}
          <div className="space-y-2 mt-6">
            <div className="flex justify-between items-center">
              <Label htmlFor="value-slider">Brightness (Value)</Label>
              <span className="text-sm">{Math.round(value * 100)}%</span>
            </div>
            <Slider
              id="value-slider"
              value={[value]}
              min={0.1}
              max={1}
              step={0.01}
              onValueChange={handleValueChange}
            />
          </div>
          
          {/* Selected color */}
          <div className="flex justify-center items-center mt-4 space-x-4">
            <div 
              className="w-12 h-12 rounded-lg shadow-md" 
              style={{ backgroundColor: selectedColor }}
            />
            <div>
              <div className="font-medium">{selectedColor}</div>
              <div className="text-sm text-muted-foreground">
                H: {Math.round(hue)}° S: {Math.round(saturation * 100)}% V: {Math.round(value * 100)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Value Scale Display */}
      {showValueScale && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <Label className="text-sm mb-2 block">Value Scale for {selectedColor}</Label>
            <div className="flex flex-wrap gap-2">
              {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((v, i) => {
                const rgb = hsvToRgb(hue, saturation, v);
                const color = rgbToHex(rgb.r, rgb.g, rgb.b);
                return (
                  <div key={i} className="text-center">
                    <div
                      className="w-10 h-10 rounded-md shadow-sm"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-xs">{Math.round(v * 100)}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Saturation Scale Display */}
      {showSaturationScale && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <Label className="text-sm mb-2 block">Saturation Scale at Hue {Math.round(hue)}°</Label>
            <div className="flex flex-wrap gap-2">
              {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((s, i) => {
                const rgb = hsvToRgb(hue, s, value);
                const color = rgbToHex(rgb.r, rgb.g, rgb.b);
                return (
                  <div key={i} className="text-center">
                    <div
                      className="w-10 h-10 rounded-md shadow-sm"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-xs">{Math.round(s * 100)}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Color Harmonies */}
      <div className="mb-6">
        <Label className="text-sm text-muted-foreground mb-2 block">Color Harmonies</Label>
        <Tabs defaultValue="complementary" className="mt-2">
          <TabsList className={cn(
            "grid w-full",
            isMobile ? "grid-cols-2" : "grid-cols-4"
          )}>
            <TabsTrigger value="complementary">Complementary</TabsTrigger>
            <TabsTrigger value="analogous">Analogous</TabsTrigger>
            <TabsTrigger value="triadic">Triadic</TabsTrigger>
            <TabsTrigger value="splitComplementary">Split Comp.</TabsTrigger>
          </TabsList>
          
          <TabsContent value="complementary" className="mt-4">
            <div className="space-y-2">
              <Label className="text-sm">Complementary Colors (opposite on the color wheel)</Label>
              <div className="flex space-x-2">
                {colorHarmonies.complementary?.map((color: string, index: number) => (
                  <div key={index} className="flex-1">
                    <div 
                      className="w-full aspect-square rounded-lg shadow-md mb-1" 
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-center">{color}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Complementary colors create high contrast and vibrant designs. Use them to make elements stand out.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="analogous" className="mt-4">
            <div className="space-y-2">
              <Label className="text-sm">Analogous Colors (adjacent on the color wheel)</Label>
              <div className="flex space-x-2">
                {colorHarmonies.analogous?.map((color: string, index: number) => (
                  <div key={index} className="flex-1">
                    <div 
                      className="w-full aspect-square rounded-lg shadow-md mb-1" 
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-center">{color}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Analogous color schemes create harmonious, serene designs. Great for landscapes and natural subjects.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="triadic" className="mt-4">
            <div className="space-y-2">
              <Label className="text-sm">Triadic Colors (evenly spaced on the color wheel)</Label>
              <div className="flex space-x-2">
                {colorHarmonies.triadic?.map((color: string, index: number) => (
                  <div key={index} className="flex-1">
                    <div 
                      className="w-full aspect-square rounded-lg shadow-md mb-1" 
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-center">{color}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Triadic color schemes offer vibrant contrast while maintaining balance. Good for bold, dynamic compositions.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="splitComplementary" className="mt-4">
            <div className="space-y-2">
              <Label className="text-sm">Split Complementary Colors</Label>
              <div className="flex space-x-2">
                {colorHarmonies.splitComplementary?.map((color: string, index: number) => (
                  <div key={index} className="flex-1">
                    <div 
                      className="w-full aspect-square rounded-lg shadow-md mb-1" 
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-center">{color}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Split complementary schemes offer high contrast but with less tension than complementary colors.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Monochromatic Colors */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Label className="text-sm mb-2 block">Monochromatic Colors</Label>
          <div className="flex space-x-2">
            {colorHarmonies.monochromatic?.map((color: string, index: number) => (
              <div key={index} className="flex-1">
                <div 
                  className="w-full aspect-square rounded-lg shadow-md mb-1" 
                  style={{ backgroundColor: color }}
                />
                <p className="text-xs text-center">{Math.round((index + 1) * 20)}%</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Monochromatic schemes use varying tints and shades of a single hue, creating elegant and cohesive designs.
          </p>
        </CardContent>
      </Card>
      
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
              onClick={() => setIsColorMixerOpen(true)}
            >
              <Droplet className="h-4 w-4 mr-2" />
              Try Color Mixer
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Select colors, adjust proportions, and see the resulting mix
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Color Mixer Dialog */}
      <Dialog open={isColorMixerOpen} onOpenChange={setIsColorMixerOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <ColorMixer 
            onClose={() => setIsColorMixerOpen(false)}
            onSaveColor={handleSaveColor}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ColorTheoryTab;
