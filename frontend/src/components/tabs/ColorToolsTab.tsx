import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { findClosestPencils, pencilColors } from "@/data/pencilColors";
import { rgbToHexColor } from "@/utils/colorUtils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Pipette, Plus, Download, Save, Trash2 } from "lucide-react";
import { usePersistedState } from "@/hooks/usePersistedState";

interface PencilMatch {
  name: string;
  code: string;
  brand: string;
  color: string;
  accuracy?: number;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  createdAt: Date;
}

const ColorToolsTab = () => {
  const [selectedColor, setSelectedColor] = useState("#EC407A");
  const [image, setImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPicking, setIsPicking] = useState(false);
  const [colorPreview, setColorPreview] = useState<{x: number, y: number, color: string} | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedMedium, setSelectedMedium] = useState("prismacolor");

  const [palettes, setPalettes] = usePersistedState<ColorPalette[]>("color_palettes", []);
  const [newPaletteName, setNewPaletteName] = useState("");
  const [showNewPaletteInput, setShowNewPaletteInput] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = image;
  }, [image]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPicking) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && !isPicking) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    if (isPicking && canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      const x = Math.floor((e.clientX - rect.left - pan.x) / zoom);
      const y = Math.floor((e.clientY - rect.top - pan.y) / zoom);

      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const pixelData = ctx.getImageData(x, y, 1, 1).data;
          const color = rgbToHexColor(pixelData[0], pixelData[1], pixelData[2]);
          setColorPreview({ x: e.clientX, y: e.clientY, color });
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handlePickColor = () => {
    if (!isPicking) {
      setIsPicking(true);
      toast.info('Click on the image to pick a color');
    } else {
      if (colorPreview) {
        setSelectedColor(colorPreview.color);
        toast.success(`Color selected: ${colorPreview.color}`);
      }
      setIsPicking(false);
      setColorPreview(null);
    }
  };

  const handleCanvasClick = () => {
    if (isPicking && colorPreview) {
      setSelectedColor(colorPreview.color);
      toast.success(`Color selected: ${colorPreview.color}`);
      setIsPicking(false);
      setColorPreview(null);
    }
  };

  const matches = findClosestPencils(selectedColor);

  const createPalette = () => {
    if (!newPaletteName.trim()) {
      toast.error("Please enter a palette name");
      return;
    }

    const newPalette: ColorPalette = {
      id: Date.now().toString(),
      name: newPaletteName,
      colors: [],
      createdAt: new Date()
    };

    setPalettes([...palettes, newPalette]);
    setNewPaletteName("");
    setShowNewPaletteInput(false);
    toast.success("Palette created");
  };

  const addColorToPalette = (paletteId: string, color: string) => {
    setPalettes(palettes.map(p => {
      if (p.id === paletteId) {
        if (p.colors.includes(color)) {
          toast.info("Color already in palette");
          return p;
        }
        toast.success("Color added to palette");
        return { ...p, colors: [...p.colors, color] };
      }
      return p;
    }));
  };

  const removeColorFromPalette = (paletteId: string, colorIndex: number) => {
    setPalettes(palettes.map(p => {
      if (p.id === paletteId) {
        const newColors = [...p.colors];
        newColors.splice(colorIndex, 1);
        return { ...p, colors: newColors };
      }
      return p;
    }));
    toast.success("Color removed");
  };

  const deletePalette = (paletteId: string) => {
    setPalettes(palettes.filter(p => p.id !== paletteId));
    toast.success("Palette deleted");
  };

  const downloadPalette = (palette: ColorPalette) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const swatchSize = 100;
    canvas.width = palette.colors.length * swatchSize;
    canvas.height = swatchSize;

    palette.colors.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.fillRect(index * swatchSize, 0, swatchSize, swatchSize);
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${palette.name}.png`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Palette downloaded");
    });
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Color Tools</h2>
        <p className="text-muted-foreground">Pick colors, find matches, and save to palettes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Color Picker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!image ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center bg-muted/10">
                <div className="mx-auto flex flex-col items-center justify-center gap-1">
                  <div className="rounded-full bg-background p-2 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8 text-muted-foreground"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mt-2">Upload an image</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload an image to pick colors from
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:opacity-90"
                  >
                    Select Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div
                  ref={containerRef}
                  className="relative border rounded-lg overflow-hidden bg-muted/10 cursor-grab active:cursor-grabbing"
                  style={{ height: '400px' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                  onClick={handleCanvasClick}
                >
                  <div
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: '0 0',
                      position: 'relative'
                    }}
                  >
                    <canvas ref={canvasRef} className="max-w-none" />
                  </div>

                  {colorPreview && isPicking && (
                    <div
                      className="absolute pointer-events-none bg-white shadow-lg rounded-lg p-2 z-10 flex items-center gap-2"
                      style={{
                        left: `${colorPreview.x + 10}px`,
                        top: `${colorPreview.y + 10}px`,
                        transform: 'translate(-50%, -100%)'
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full border"
                        style={{ backgroundColor: colorPreview.color }}
                      />
                      <span className="text-xs font-mono">{colorPreview.color}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                    >
                      -
                    </Button>
                    <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                    >
                      +
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                    >
                      Reset
                    </Button>
                  </div>
                  <Button
                    onClick={handlePickColor}
                    className={isPicking ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    <Pipette className="w-4 h-4 mr-2" />
                    {isPicking ? "Click to Pick" : "Pick Color"}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 my-4">
              <div className="w-12 h-12 rounded-md border shadow-sm" style={{ backgroundColor: selectedColor }} />
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground block mb-1">Selected Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => {
                      if (e.target.value.startsWith('#')) {
                        setSelectedColor(e.target.value);
                      }
                    }}
                    className="flex-1"
                  />
                  <Input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-12 h-9 p-1 border cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Color Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Medium</Label>
                <Select value={selectedMedium} onValueChange={setSelectedMedium}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prismacolor">Prismacolor Pencils</SelectItem>
                    <SelectItem value="polychromos">Faber-Castell Polychromos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Best Matches</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {matches.map((pencil, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-card border"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div
                          className="w-8 h-8 rounded-full border-2"
                          style={{ backgroundColor: pencil.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{pencil.name}</div>
                          <div className="text-xs text-muted-foreground">{pencil.brand} · {pencil.code}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{Math.round(pencil.accuracy!)}%</span>
                        {palettes.length > 0 && (
                          <Select onValueChange={(paletteId) => addColorToPalette(paletteId, pencil.color)}>
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue placeholder="Add" />
                            </SelectTrigger>
                            <SelectContent>
                              {palettes.map(palette => (
                                <SelectItem key={palette.id} value={palette.id}>
                                  {palette.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Palettes</CardTitle>
          <Button
            onClick={() => setShowNewPaletteInput(!showNewPaletteInput)}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Palette
          </Button>
        </CardHeader>
        <CardContent>
          {showNewPaletteInput && (
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Palette name"
                value={newPaletteName}
                onChange={(e) => setNewPaletteName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createPalette();
                }}
              />
              <Button onClick={createPalette}>Create</Button>
            </div>
          )}

          {palettes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No palettes yet. Create one to start saving colors.
            </div>
          ) : (
            <div className="space-y-4">
              {palettes.map(palette => (
                <div key={palette.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{palette.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadPalette(palette)}
                        title="Download Palette"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePalette(palette.id)}
                        title="Delete Palette"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {palette.colors.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No colors yet. Add colors from the matches above.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="relative group"
                        >
                          <div
                            className="w-12 h-12 rounded border-2"
                            style={{ backgroundColor: color }}
                          />
                          <button
                            onClick={() => removeColorFromPalette(palette.id, index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorToolsTab;
