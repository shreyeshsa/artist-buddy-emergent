
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { rgbToHexColor } from "@/utils/colorUtils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Color wheel component with interactive mixing
const ColorWheel = ({
  selectedColor,
  onColorSelect,
  mixingMode,
}: {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  mixingMode: 'additive' | 'subtractive';
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<{x: number, y: number, color: string}[]>([]);
  const [mixedColor, setMixedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Draw color wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw color wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 0.5) * Math.PI / 180;
      const endAngle = (angle + 0.5) * Math.PI / 180;
      
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, '#FFFFFF');
      
      // Convert angle to HSL
      const hue = angle;
      const color = `hsl(${hue}, 100%, 50%)`;
      gradient.addColorStop(1, color);
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Draw labels for primary and secondary colors
    const labels = [
      { angle: 0, text: "Red", color: "#FFE6E6" },
      { angle: 60, text: "Yellow", color: "#333333" },
      { angle: 120, text: "Green", color: "#E6FFE6" },
      { angle: 180, text: "Cyan", color: "#333333" },
      { angle: 240, text: "Blue", color: "#E6E6FF" },
      { angle: 300, text: "Magenta", color: "#FFE6FF" },
    ];
    
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    
    labels.forEach(label => {
      const angleRad = label.angle * Math.PI / 180;
      const x = centerX + (radius + 20) * Math.cos(angleRad);
      const y = centerY + (radius + 20) * Math.sin(angleRad);
      
      ctx.fillStyle = label.color;
      ctx.fillText(label.text, x, y);
    });
    
    // Draw selected points
    selectedPoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = point.color;
      ctx.fill();
      
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText((index + 1).toString(), point.x, point.y + 5);
    });
    
    // Draw complementary color indicator
    if (complementaryColor) {
      // Find the point on the wheel that represents the complementary color
      const hue = hexToHSL(complementaryColor).h;
      const angleRad = hue * Math.PI / 180;
      const compX = centerX + radius * Math.cos(angleRad);
      const compY = centerY + radius * Math.sin(angleRad);
      
      ctx.beginPath();
      ctx.arc(compX, compY, 8, 0, Math.PI * 2);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = complementaryColor;
      ctx.fill();
      
      // Draw a line connecting the selected color and its complement
      if (selectedPoints.length > 0) {
        ctx.beginPath();
        ctx.moveTo(selectedPoints[0].x, selectedPoints[0].y);
        ctx.lineTo(compX, compY);
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [selectedPoints, complementaryColor]);
  
  // Function to handle color selection
  const handleColorSelection = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get color at clicked position
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const color = rgbToHexColor(pixelData[0], pixelData[1], pixelData[2]);
    
    // Add to selected points (max 2 for mixing)
    if (selectedPoints.length < 2) {
      setSelectedPoints([...selectedPoints, { x, y, color }]);
      onColorSelect(color);
      
      // Update complementary color
      const hsl = hexToHSL(color);
      const complementHue = (hsl.h + 180) % 360;
      setComplementaryColor(`hsl(${complementHue}, ${hsl.s}%, ${hsl.l}%)`);
      
      // If we have 2 colors, mix them
      if (selectedPoints.length === 1) {
        const mixedColor = mixColors(selectedPoints[0].color, color, mixingMode);
        setMixedColor(mixedColor);
      }
    } else {
      // Reset and start with new color
      setSelectedPoints([{ x, y, color }]);
      onColorSelect(color);
      
      // Update complementary color
      const hsl = hexToHSL(color);
      const complementHue = (hsl.h + 180) % 360;
      setComplementaryColor(`hsl(${complementHue}, ${hsl.s}%, ${hsl.l}%)`);
      
      setMixedColor(null);
    }
  };
  
  // Convert hex to HSL
  const hexToHSL = (hex: string) => {
    // Convert hex to RGB
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h *= 60;
    }
    
    return { h, s: s * 100, l: l * 100 };
  };
  
  // Mix two colors
  const mixColors = (color1: string, color2: string, mode: 'additive' | 'subtractive') => {
    // Convert hex to RGB
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    let r, g, b;
    
    if (mode === 'additive') {
      // Additive mixing (light)
      r = Math.min(255, Math.round((r1 + r2) / 2));
      g = Math.min(255, Math.round((g1 + g2) / 2));
      b = Math.min(255, Math.round((b1 + b2) / 2));
    } else {
      // Subtractive mixing (pigment - more realistic)
      const cyanRed1 = 1 - r1/255;
      const magentaGreen1 = 1 - g1/255;
      const yellowBlue1 = 1 - b1/255;
      
      const cyanRed2 = 1 - r2/255;
      const magentaGreen2 = 1 - g2/255;
      const yellowBlue2 = 1 - b2/255;
      
      const cyanRed = (cyanRed1 + cyanRed2) * 0.7; // Adjust factor for more natural mixing
      const magentaGreen = (magentaGreen1 + magentaGreen2) * 0.7;
      const yellowBlue = (yellowBlue1 + yellowBlue2) * 0.7;
      
      r = Math.round((1 - cyanRed) * 255);
      g = Math.round((1 - magentaGreen) * 255);
      b = Math.round((1 - yellowBlue) * 255);
    }
    
    return rgbToHexColor(r, g, b);
  };
  
  // Get color name from hex
  const getColorName = (hex: string) => {
    const hsl = hexToHSL(hex);
    const h = hsl.h;
    const s = hsl.s;
    const l = hsl.l;
    
    // Define hue ranges
    let name = '';
    
    if (s < 10) {
      // Grayscale
      if (l < 20) return 'Black';
      if (l < 50) return 'Gray';
      if (l < 90) return 'Light Gray';
      return 'White';
    }
    
    // Determine hue name
    if (h >= 345 || h < 15) name = 'Red';
    else if (h < 45) name = 'Orange';
    else if (h < 75) name = 'Yellow';
    else if (h < 105) name = 'Yellow-Green';
    else if (h < 135) name = 'Green';
    else if (h < 165) name = 'Blue-Green';
    else if (h < 195) name = 'Cyan';
    else if (h < 225) name = 'Light Blue';
    else if (h < 255) name = 'Blue';
    else if (h < 285) name = 'Indigo';
    else if (h < 315) name = 'Purple';
    else name = 'Magenta';
    
    // Determine modifiers
    let modifier = '';
    if (s < 40) modifier = 'Grayish ';
    else if (s < 70) modifier = 'Muted ';
    
    // Determine brightness
    let brightness = '';
    if (l < 25) brightness = 'Dark ';
    else if (l > 75) brightness = 'Light ';
    
    return `${brightness}${modifier}${name}`;
  };
  
  const wheelSize = isMobile ? 280 : 350;
  
  return (
    <div className="space-y-4">
      <div className="relative mx-auto" style={{ width: wheelSize, height: wheelSize, touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={wheelSize}
          height={wheelSize}
          className="cursor-crosshair"
          onClick={handleColorSelection}
        />
      </div>
      
      {selectedPoints.length > 0 && (
        <div className="flex flex-wrap gap-4 items-center justify-center">
          {selectedPoints.map((point, index) => (
            <div key={index} className="text-center">
              <div 
                className="w-12 h-12 mx-auto rounded-md border" 
                style={{ backgroundColor: point.color }} 
              />
              <div className="text-xs mt-1">{point.color}</div>
              <div className="text-xs text-muted-foreground">
                {getColorName(point.color)}
              </div>
            </div>
          ))}
          
          {mixedColor && (
            <div className="text-center">
              <div className="flex items-center justify-center">
                <span className="mx-2">+</span>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted">
                  <span>=</span>
                </div>
                <span className="mx-2"></span>
              </div>
            </div>
          )}
          
          {mixedColor && (
            <div className="text-center">
              <div 
                className="w-12 h-12 mx-auto rounded-md border shadow-md" 
                style={{ backgroundColor: mixedColor }} 
              />
              <div className="text-xs mt-1">{mixedColor}</div>
              <div className="text-xs text-muted-foreground">
                {getColorName(mixedColor)}
              </div>
            </div>
          )}
        </div>
      )}
      
      {complementaryColor && (
        <div className="mt-4 p-3 bg-muted/20 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Complementary Color</h4>
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-md border" 
              style={{ backgroundColor: complementaryColor }} 
            />
            <div>
              <div className="text-xs">{complementaryColor}</div>
              <div className="text-xs text-muted-foreground">
                {getColorName(complementaryColor)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// HSV Slider component
const HSVSlider = ({ onColorSelect }: { onColorSelect: (color: string) => void }) => {
  const [hue, setHue] = useState(180);
  const [saturation, setSaturation] = useState(100);
  const [value, setValue] = useState(100);
  const [currentColor, setCurrentColor] = useState('#00FFFF');
  const svPanelRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Update color when HSV changes
  useEffect(() => {
    const color = hsvToHex(hue, saturation, value);
    setCurrentColor(color);
    onColorSelect(color);
  }, [hue, saturation, value, onColorSelect]);
  
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
  
  // Convert HSV to Hex
  const hsvToHex = (h: number, s: number, v: number) => {
    const rgb = hsvToRgb(h/360, s, v);
    return rgbToHexColor(rgb.r, rgb.g, rgb.b);
  };
  
  // Convert RGB to HSV
  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    
    if (max === min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    
    return {
      h: h * 360,
      s: s * 100,
      v: v * 100
    };
  };
  
  // Handle saturation-value panel click/touch
  const handleSVPanelInteraction = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    const panel = svPanelRef.current;
    if (!panel) return;
    
    const rect = panel.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    
    const newSaturation = Math.round(x * 100);
    const newValue = Math.round((1 - y) * 100);
    
    setSaturation(newSaturation);
    setValue(newValue);
  };
  
  // Get emotional tag based on HSV
  const getEmotionalTag = (h: number, s: number, v: number) => {
    // Hue-based emotions
    const hueEmotions = [
      { hue: 0, emotion: 'Passionate', attribute: 'Energetic' },    // Red
      { hue: 30, emotion: 'Playful', attribute: 'Warm' },            // Orange
      { hue: 60, emotion: 'Cheerful', attribute: 'Optimistic' },     // Yellow
      { hue: 120, emotion: 'Natural', attribute: 'Fresh' },          // Green
      { hue: 180, emotion: 'Serene', attribute: 'Calming' },         // Cyan
      { hue: 240, emotion: 'Trustworthy', attribute: 'Peaceful' },   // Blue
      { hue: 270, emotion: 'Mysterious', attribute: 'Creative' },    // Purple
      { hue: 300, emotion: 'Romantic', attribute: 'Playful' },       // Pink
      { hue: 330, emotion: 'Energetic', attribute: 'Bold' },         // Magenta
    ];
    
    // Find closest hue emotion
    let closestEmotion = hueEmotions[0];
    let minDistance = 360;
    
    hueEmotions.forEach(emotion => {
      const distance = Math.min(
        Math.abs(h - emotion.hue),
        Math.abs(h - emotion.hue + 360),
        Math.abs(h - emotion.hue - 360)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestEmotion = emotion;
      }
    });
    
    // Modify based on saturation and value
    let intensifier = '';
    if (s < 30) intensifier = 'Subtle & Muted';
    else if (s > 80) intensifier = 'Vibrant & Bold';
    
    let brightness = '';
    if (v < 30) brightness = 'Dark & Mysterious';
    else if (v > 80) brightness = 'Bright & Clear';
    else brightness = 'Balanced';
    
    return {
      emotion: closestEmotion.emotion,
      attribute: closestEmotion.attribute,
      intensifier,
      brightness
    };
  };
  
  const emotionalTag = getEmotionalTag(hue, saturation, value);
  
  return (
    <div className="space-y-6">
      {/* Color preview */}
      <div className="flex items-start space-x-4">
        <div 
          className="w-20 h-20 rounded-lg shadow-md border"
          style={{ backgroundColor: currentColor }}
        />
        <div className="flex-1">
          <h3 className="font-medium text-lg">{currentColor}</h3>
          <div className="text-sm text-muted-foreground mt-1">
            HSV: {hue}°, {saturation}%, {value}%
          </div>
          <div className="text-sm text-muted-foreground">
            RGB: {hsvToRgb(hue/360, saturation, value).r}, 
            {hsvToRgb(hue/360, saturation, value).g}, 
            {hsvToRgb(hue/360, saturation, value).b}
          </div>
          <div className="mt-2 text-sm">
            <span className="font-medium">{emotionalTag.emotion} & {emotionalTag.attribute}</span>
            <br />
            <span className="text-xs text-muted-foreground">
              {emotionalTag.brightness}, {emotionalTag.intensifier}
            </span>
          </div>
        </div>
      </div>
      
      {/* SV Panel */}
      <div 
        ref={svPanelRef}
        className="relative h-40 rounded-lg cursor-crosshair"
        style={{
          backgroundColor: `hsl(${hue}, 100%, 50%)`,
          background: `
            linear-gradient(to top, #000, transparent),
            linear-gradient(to right, #fff, transparent),
            hsl(${hue}, 100%, 50%)
          `,
          touchAction: 'none'
        }}
        onClick={handleSVPanelInteraction}
        onMouseDown={(e) => {
          const handler = (e: MouseEvent) => {
            handleSVPanelInteraction(e as any);
          };
          document.addEventListener('mousemove', handler);
          document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', handler);
          }, { once: true });
        }}
        onTouchStart={(e) => {
          const handler = (e: TouchEvent) => {
            handleSVPanelInteraction(e as any);
            e.preventDefault();
          };
          document.addEventListener('touchmove', handler, { passive: false });
          document.addEventListener('touchend', () => {
            document.removeEventListener('touchmove', handler);
          }, { once: true });
        }}
      >
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{
            left: `${saturation}%`,
            top: `${100 - value}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
      
      {/* Hue Slider */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Hue</Label>
          <span className="text-sm">{hue}°</span>
        </div>
        <Slider
          min={0}
          max={359}
          step={1}
          value={[hue]}
          onValueChange={(values) => setHue(values[0])}
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          style={{
            background: `linear-gradient(to right, 
              #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000
            )`
          }}
        />
      </div>

      {/* Saturation Slider */}
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
              ${hsvToHex(hue, 0, value)}, 
              ${hsvToHex(hue, 100, value)}
            )`
          }}
        />
      </div>
      
      {/* Value Slider */}
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
              ${hsvToHex(hue, saturation, 0)}, 
              ${hsvToHex(hue, saturation, 100)}
            )`
          }}
        />
      </div>
    </div>
  );
};

// Tints, Shades, Tones component
const TintShadeTool = ({ baseColor, onColorSelect }: { baseColor: string, onColorSelect: (color: string) => void }) => {
  const [tintAmount, setTintAmount] = useState(0);
  const [shadeAmount, setShadeAmount] = useState(0);
  const [toneAmount, setToneAmount] = useState(0);
  const [resultColor, setResultColor] = useState(baseColor);
  
  // Calculate tints, shades, and tones
  const applyTintShadeAndTone = (baseColor: string, tint: number, shade: number, tone: number) => {
    // Convert hex to RGB
    const r = parseInt(baseColor.substring(1, 3), 16);
    const g = parseInt(baseColor.substring(3, 5), 16);
    const b = parseInt(baseColor.substring(5, 7), 16);
    
    // Apply tint (add white)
    let rTint = Math.round(r + (255 - r) * (tint / 100));
    let gTint = Math.round(g + (255 - g) * (tint / 100));
    let bTint = Math.round(b + (255 - b) * (tint / 100));
    
    // Apply shade (add black)
    rTint = Math.round(rTint * (1 - shade / 100));
    gTint = Math.round(gTint * (1 - shade / 100));
    bTint = Math.round(bTint * (1 - shade / 100));
    
    // Apply tone (add gray)
    const gray = 128;
    rTint = Math.round(rTint + (gray - rTint) * (tone / 100));
    gTint = Math.round(gTint + (gray - gTint) * (tone / 100));
    bTint = Math.round(bTint + (gray - bTint) * (tone / 100));
    
    return rgbToHexColor(rTint, gTint, bTint);
  };
  
  // Update result color when inputs change
  useEffect(() => {
    const newColor = applyTintShadeAndTone(baseColor, tintAmount, shadeAmount, toneAmount);
    setResultColor(newColor);
    onColorSelect(newColor);
  }, [baseColor, tintAmount, shadeAmount, toneAmount]);
  
  // Generate palette strips
  const generateTintStrip = () => {
    const steps = 10;
    return Array.from({ length: steps }, (_, i) => {
      const amount = i * (100 / (steps - 1));
      return applyTintShadeAndTone(baseColor, amount, 0, 0);
    });
  };
  
  const generateShadeStrip = () => {
    const steps = 10;
    return Array.from({ length: steps }, (_, i) => {
      const amount = i * (100 / (steps - 1));
      return applyTintShadeAndTone(baseColor, 0, amount, 0);
    });
  };
  
  const generateToneStrip = () => {
    const steps = 10;
    return Array.from({ length: steps }, (_, i) => {
      const amount = i * (100 / (steps - 1));
      return applyTintShadeAndTone(baseColor, 0, 0, amount);
    });
  };
  
  const tints = generateTintStrip();
  const shades = generateShadeStrip();
  const tones = generateToneStrip();
  
  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="space-y-2">
          <div 
            className="w-16 h-16 rounded-lg border shadow-sm"
            style={{ backgroundColor: baseColor }}
          />
          <div className="text-center text-xs">Original</div>
        </div>
        <div className="flex-1">
          <div className="text-lg font-medium mb-2">Result</div>
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-lg border shadow-md"
              style={{ backgroundColor: resultColor }}
            />
            <div>
              <div className="text-sm font-mono">{resultColor}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Tint: {tintAmount}% | Shade: {shadeAmount}% | Tone: {toneAmount}%
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Tint slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>
              Tint (+White)
              <span className="ml-1 text-xs text-muted-foreground">
                {tintAmount}%
              </span>
            </Label>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Slider
                min={0}
                max={100}
                step={1}
                value={[tintAmount]}
                onValueChange={(values) => setTintAmount(values[0])}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setTintAmount(0)}
            >
              ×
            </Button>
          </div>
          <div className="h-6 flex rounded-md overflow-hidden">
            {tints.map((color, i) => (
              <div
                key={i}
                className="flex-1 h-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        
        {/* Shade slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>
              Shade (+Black)
              <span className="ml-1 text-xs text-muted-foreground">
                {shadeAmount}%
              </span>
            </Label>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Slider
                min={0}
                max={100}
                step={1}
                value={[shadeAmount]}
                onValueChange={(values) => setShadeAmount(values[0])}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setShadeAmount(0)}
            >
              ×
            </Button>
          </div>
          <div className="h-6 flex rounded-md overflow-hidden">
            {shades.map((color, i) => (
              <div
                key={i}
                className="flex-1 h-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        
        {/* Tone slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>
              Tone (+Gray)
              <span className="ml-1 text-xs text-muted-foreground">
                {toneAmount}%
              </span>
            </Label>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Slider
                min={0}
                max={100}
                step={1}
                value={[toneAmount]}
                onValueChange={(values) => setToneAmount(values[0])}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setToneAmount(0)}
            >
              ×
            </Button>
          </div>
          <div className="h-6 flex rounded-md overflow-hidden">
            {tones.map((color, i) => (
              <div
                key={i}
                className="flex-1 h-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
      
      <Card className="bg-muted/20">
        <CardContent className="pt-4">
          <h3 className="text-sm font-medium mb-2">Use Cases</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Tints: Use for highlights and lighter values in your artwork</p>
            <p>• Shades: Create shadows and darker areas for depth</p>
            <p>• Tones: Add subtlety and reduce intensity for realistic colors</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Harmony Explorer component
const HarmonyExplorer = ({ baseColor, onColorSelect }: { baseColor: string; onColorSelect: (color: string) => void }) => {
  const [harmonyType, setHarmonyType] = useState('complementary');
  const [harmonyColors, setHarmonyColors] = useState<string[]>([]);
  
  // Calculate harmonies when base color changes
  useEffect(() => {
    updateHarmonyColors(harmonyType);
  }, [baseColor, harmonyType]);
  
  // Convert hex to HSV
  const hexToHSV = (hex: string) => {
    // Convert hex to RGB
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    
    if (max !== min) {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    
    return {
      h: h * 360,
      s: s * 100,
      v: v * 100
    };
  };
  
  // Convert HSV to hex
  const hsvToHex = (h: number, s: number, v: number) => {
    h = h % 360;
    s = s / 100;
    v = v / 100;
    
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    
    let r, g, b;
    if (h < 60) {
      [r, g, b] = [c, x, 0];
    } else if (h < 120) {
      [r, g, b] = [x, c, 0];
    } else if (h < 180) {
      [r, g, b] = [0, c, x];
    } else if (h < 240) {
      [r, g, b] = [0, x, c];
    } else if (h < 300) {
      [r, g, b] = [x, 0, c];
    } else {
      [r, g, b] = [c, 0, x];
    }
    
    const toHex = (val: number) => {
      const hex = Math.round((val + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };
  
  // Update harmony colors
  const updateHarmonyColors = (type: string) => {
    const hsv = hexToHSV(baseColor);
    const h = hsv.h;
    const s = hsv.s;
    const v = hsv.v;
    
    let colors: string[] = [];
    
    switch (type) {
      case 'complementary':
        // Base color + opposite (180°)
        colors = [
          hsvToHex((h + 180) % 360, s, v)
        ];
        break;
      case 'analogous':
        // Base color + adjacent colors (±30°)
        colors = [
          hsvToHex((h + 30) % 360, s, v),
          hsvToHex((h - 30 + 360) % 360, s, v)
        ];
        break;
      case 'triadic':
        // Three colors evenly spaced (120°)
        colors = [
          hsvToHex((h + 120) % 360, s, v),
          hsvToHex((h + 240) % 360, s, v)
        ];
        break;
      case 'tetradic':
        // Four colors forming a rectangle (90°)
        colors = [
          hsvToHex((h + 90) % 360, s, v),
          hsvToHex((h + 180) % 360, s, v),
          hsvToHex((h + 270) % 360, s, v)
        ];
        break;
      case 'split':
        // Base color + two colors adjacent to complement
        colors = [
          hsvToHex((h + 150) % 360, s, v),
          hsvToHex((h + 210) % 360, s, v)
        ];
        break;
      case 'monochromatic':
        // Same hue, varying saturation and value
        colors = [
          hsvToHex(h, Math.max(0, s - 30), v),
          hsvToHex(h, Math.min(100, s + 30), v),
          hsvToHex(h, s, Math.max(0, v - 30)),
          hsvToHex(h, s, Math.min(100, v + 30))
        ];
        break;
    }
    
    setHarmonyColors(colors);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Color Harmony Types</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {['complementary', 'analogous', 'triadic', 'tetradic', 'split', 'monochromatic'].map((type) => (
            <Button
              key={type}
              variant={harmonyType === type ? "default" : "outline"}
              className={harmonyType === type ? "bg-gradient-to-r from-artify-pink to-artify-purple" : ""}
              onClick={() => setHarmonyType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-muted/10 border">
        {/* Base color */}
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-lg border shadow-sm" 
            style={{ backgroundColor: baseColor }}
          />
          <div className="text-xs mt-1">Base</div>
          <div className="text-xs font-mono">{baseColor}</div>
        </div>
        
        {/* Harmony colors */}
        {harmonyColors.map((color, i) => (
          <div key={i} className="text-center">
            <div 
              className="w-16 h-16 rounded-lg border shadow-sm cursor-pointer transition-transform hover:scale-105" 
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
            />
            <div className="text-xs mt-1">{`Color ${i + 1}`}</div>
            <div className="text-xs font-mono">{color}</div>
          </div>
        ))}
      </div>
      
      <Card className="bg-muted/20">
        <CardContent className="pt-4">
          <h3 className="text-sm font-medium mb-2">About {harmonyType.charAt(0).toUpperCase() + harmonyType.slice(1)} Harmony</h3>
          <div className="text-xs text-muted-foreground">
            {harmonyType === 'complementary' && (
              <p>Colors opposite each other on the color wheel. Creates high contrast and vibrant looks.</p>
            )}
            {harmonyType === 'analogous' && (
              <p>Colors next to each other on the color wheel. Creates a harmonious, unified look without contrast.</p>
            )}
            {harmonyType === 'triadic' && (
              <p>Three colors evenly spaced on the color wheel. Vibrant even with unsaturated colors.</p>
            )}
            {harmonyType === 'tetradic' && (
              <p>Four colors arranged in complementary pairs. Very rich but can be overwhelming if not balanced.</p>
            )}
            {harmonyType === 'split' && (
              <p>Uses a base color plus two colors adjacent to its complement. Less tension than complementary.</p>
            )}
            {harmonyType === 'monochromatic' && (
              <p>Different tones, tints, and shades of a single color. Elegant and cohesive look.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          className="bg-gradient-to-r from-artify-pink to-artify-purple"
          onClick={() => {
            // Export as a palette
            const colors = [baseColor, ...harmonyColors];
            navigator.clipboard.writeText(colors.join(', '));
            toast.success('Palette copied to clipboard');
          }}
        >
          Export Palette
        </Button>
      </div>
    </div>
  );
};

// Concept cards component
const ConceptCards = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Primary, Secondary, Tertiary Colors</CardTitle>
          <CardDescription>The foundation of color theory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>• <strong>Primary colors:</strong> Red, yellow, and blue - Cannot be created by mixing other colors</p>
          <p>• <strong>Secondary colors:</strong> Orange, green, and violet - Created by mixing two primary colors</p>
          <p>• <strong>Tertiary colors:</strong> Red-orange, yellow-orange, etc. - Created by mixing a primary with a secondary color</p>
          <div className="grid grid-cols-6 gap-1 mt-2">
            {[
              '#FF0000', '#FFCC00', '#FFFF00', '#66CC00', '#0000FF', '#9900CC',
              '#FF6600', '#99CC00', '#00FFFF', '#0066FF', '#CC00FF', '#FF0066'
            ].map((color, i) => (
              <div key={i} className="aspect-square rounded-full" style={{ backgroundColor: color }} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Example: Netflix uses red (primary) as their brand color for its intensity and memorability.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Color Harmonies</CardTitle>
          <CardDescription>How colors work together in schemes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>• <strong>Complementary:</strong> Opposite colors on the wheel create maximum contrast</p>
          <p>• <strong>Analogous:</strong> Adjacent colors create harmony and are pleasing to the eye</p>
          <p>• <strong>Triadic:</strong> Three evenly spaced colors create balance and vibrancy</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="flex justify-center items-center bg-muted/20 p-2 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-500 mr-1" />
              <div className="w-6 h-6 rounded-full bg-orange-500" />
            </div>
            <div className="flex justify-center items-center bg-muted/20 p-2 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-500 mr-1" />
              <div className="w-6 h-6 rounded-full bg-purple-500 mr-1" />
              <div className="w-6 h-6 rounded-full bg-blue-300" />
            </div>
            <div className="flex justify-center items-center bg-muted/20 p-2 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-green-500 mr-1" />
              <div className="w-6 h-6 rounded-full bg-purple-500 mr-1" />
              <div className="w-6 h-6 rounded-full bg-orange-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Example: Many movie posters use blue and orange (complementary) for dramatic impact.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">HSV Color Model</CardTitle>
          <CardDescription>Hue, Saturation, Value system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>• <strong>Hue:</strong> The basic color family (0-360°) around the color wheel</p>
          <p>• <strong>Saturation:</strong> The intensity or purity of the color (0-100%)</p>
          <p>• <strong>Value:</strong> The brightness or darkness of the color (0-100%)</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="space-y-1">
              <div className="h-4 rounded bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500"></div>
              <p className="text-xs text-center">Hue</p>
            </div>
            <div className="space-y-1">
              <div className="h-4 rounded bg-gradient-to-r from-gray-400 to-red-500"></div>
              <p className="text-xs text-center">Saturation</p>
            </div>
            <div className="space-y-1">
              <div className="h-4 rounded bg-gradient-to-r from-black to-red-500"></div>
              <p className="text-xs text-center">Value</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Example: Photographers adjust HSV to create mood in landscape photography.</p>
        </CardContent>
      </Card>
    </div>
  );
};

const ColorTheoryTab = () => {
  const [selectedColor, setSelectedColor] = useState("#EC407A");
  const [mixingMode, setMixingMode] = useState<'additive' | 'subtractive'>('subtractive');
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Color Theory</h2>
        <p className="text-muted-foreground mb-4">Learn and experiment with color concepts and relationships</p>
        
        <Tabs defaultValue="wheel" className="space-y-4">
          <ScrollArea className="w-full">
            <TabsList className="w-full flex overflow-x-auto justify-start">
              <TabsTrigger value="wheel">Color Wheel</TabsTrigger>
              <TabsTrigger value="hsv">HSV Tool</TabsTrigger>
              <TabsTrigger value="tints">Tints & Shades</TabsTrigger>
              <TabsTrigger value="harmony">Harmony Explorer</TabsTrigger>
              <TabsTrigger value="learn">Concepts</TabsTrigger>
            </TabsList>
          </ScrollArea>
          
          <TabsContent value="wheel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Color Wheel</CardTitle>
                <CardDescription>
                  Click to select colors. Select two colors to see them mix.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-end mb-2">
                    <Label className="mr-2">Mixing Mode:</Label>
                    <div className="flex border rounded-md overflow-hidden">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={mixingMode === 'additive' ? "bg-muted" : ""}
                        onClick={() => setMixingMode('additive')}
                      >
                        Additive (RGB)
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={mixingMode === 'subtractive' ? "bg-muted" : ""}
                        onClick={() => setMixingMode('subtractive')}
                      >
                        Subtractive (Pigment)
                      </Button>
                    </div>
                  </div>
                  <ColorWheel
                    selectedColor={selectedColor}
                    onColorSelect={setSelectedColor}
                    mixingMode={mixingMode}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hsv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>HSV Color Tool</CardTitle>
                <CardDescription>
                  Explore hue, saturation, and value to understand color properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HSVSlider onColorSelect={setSelectedColor} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tints, Shades & Tones Mixer</CardTitle>
                <CardDescription>
                  Create variations by adding white, black, or gray to your base color
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TintShadeTool baseColor={selectedColor} onColorSelect={setSelectedColor} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="harmony" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Harmony Explorer</CardTitle>
                <CardDescription>
                  Discover color harmonies from your base color
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HarmonyExplorer baseColor={selectedColor} onColorSelect={setSelectedColor} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="learn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Color Theory Concepts</CardTitle>
                <CardDescription>
                  Learn the foundational concepts of color theory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConceptCards />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ColorTheoryTab;
