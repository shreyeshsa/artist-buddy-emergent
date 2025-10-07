import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ColorMixer from "@/components/color-theory/ColorMixer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import InteractiveColorWheel from "@/components/color-theory/InteractiveColorWheel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { rgbToHexColor, hexToRgb, hsvToHex } from "@/utils/colorUtils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useEffect, useRef } from "react";

const HSVSlider = ({ onColorSelect }: { onColorSelect: (color: string) => void }) => {
  const [hue, setHue] = useState(180);
  const [saturation, setSaturation] = useState(100);
  const [value, setValue] = useState(100);
  const [currentColor, setCurrentColor] = useState('#00FFFF');
  const svPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const color = hsvToHex(hue, saturation, value);
    setCurrentColor(color);
    onColorSelect(color);
  }, [hue, saturation, value, onColorSelect]);

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

  const hsvToHexLocal = (h: number, s: number, v: number) => {
    const rgb = hsvToRgb(h/360, s, v);
    return rgbToHexColor(rgb.r, rgb.g, rgb.b);
  };

  const handleSVPanelInteraction = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    const panel = svPanelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
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

  return (
    <div className="space-y-6">
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
        </div>
      </div>

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
        />
      </div>

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
        />
      </div>
    </div>
  );
};

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
        </CardContent>
      </Card>
    </div>
  );
};

const LibraryTab = () => {
  const [selectedColor, setSelectedColor] = useState("#EC407A");
  const [savedColors, setSavedColors] = useState<{name: string, color: string}[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleSaveColor = (color: string, name: string) => {
    setSavedColors(prev => [...prev, { color, name }]);
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Library</h2>
        <p className="text-muted-foreground mb-4">Educational resources and utility tools</p>

        <Tabs defaultValue="concepts" className="space-y-4">
          <ScrollArea className="w-full">
            <TabsList className="w-full flex overflow-x-auto justify-start">
              <TabsTrigger value="concepts">Color Theory</TabsTrigger>
              <TabsTrigger value="wheel">Color Wheel</TabsTrigger>
              <TabsTrigger value="hsv">HSV Tool</TabsTrigger>
              <TabsTrigger value="mixer">Color Mixer</TabsTrigger>
            </TabsList>
          </ScrollArea>

          <TabsContent value="concepts" className="space-y-4">
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

          <TabsContent value="wheel" className="space-y-4">
            <InteractiveColorWheel onColorSelect={setSelectedColor} />
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

          <TabsContent value="mixer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Color Mixer</CardTitle>
                <CardDescription>
                  Mix colors and save your favorite combinations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ColorMixer onClose={() => {}} onSaveColor={handleSaveColor} />
              </CardContent>
            </Card>

            {savedColors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Saved Color Mixes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {savedColors.map((color, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center p-2 border rounded-md"
                      >
                        <div
                          className="w-12 h-12 rounded-md mb-1"
                          style={{ backgroundColor: color.color }}
                        />
                        <span className="text-sm font-medium">{color.name}</span>
                        <span className="text-xs text-muted-foreground">{color.color}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LibraryTab;
