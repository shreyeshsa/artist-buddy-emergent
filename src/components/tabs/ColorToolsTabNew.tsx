import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { findClosestPencils, pencilColors, pencilBrands, PencilColorWithAccuracy } from "@/data/pencilColors";
import { findOilPaintMixes, oilPaintColors, OilPaintMix } from "@/data/oilPaintColors";
import { rgbToHexColor } from "@/utils/colorUtils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Pipette, Plus, Download, Save, Trash2, Search, Upload } from "lucide-react";
import { usePersistedState } from "@/hooks/usePersistedState";

interface ColorPalette {
  id: string;
  name: string;
  colors: Array<{
    hex: string;
    pencilMatches?: PencilColorWithAccuracy[];
    oilPaintMixes?: OilPaintMix[];
    notes?: string;
  }>;
  referenceImage?: string;
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

  // Palette management
  const [palettes, setPalettes] = usePersistedState<ColorPalette[]>("color_palettes_v2", []);
  const [newPaletteName, setNewPaletteName] = useState("");
  const [showNewPaletteInput, setShowNewPaletteInput] = useState(false);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);

  // Color reference browsing
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedSet, setSelectedSet] = useState<string>("all");
  
  // Active tab for color matches
  const [colorMatchTab, setColorMatchTab] = useState<"pencil" | "oil">("pencil");
  const [pencilSubTab, setPencilSubTab] = useState<"prismacolor" | "polychromos" | "carandache">("prismacolor");

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

  // Get matches for selected color
  const allPencilMatches = findClosestPencils(selectedColor);
  const pencilMatches = allPencilMatches.filter(p => {
    if (pencilSubTab === "prismacolor") return p.brand === "Prismacolor";
    if (pencilSubTab === "polychromos") return p.brand === "Faber-Castell";
    if (pencilSubTab === "carandache") return p.brand === "Caran d'Ache";
    return true;
  });
  
  const oilPaintMixes = findOilPaintMixes(selectedColor);

  // Palette functions
  const createPalette = () => {
    if (!newPaletteName.trim()) {
      toast.error("Please enter a palette name");
      return;
    }

    const newPalette: ColorPalette = {
      id: Date.now().toString(),
      name: newPaletteName,
      colors: [],
      referenceImage: image || undefined,
      createdAt: new Date()
    };

    setPalettes([...palettes, newPalette]);
    setSelectedPaletteId(newPalette.id);
    setNewPaletteName("");
    setShowNewPaletteInput(false);
    toast.success("Palette created");
  };

  const addColorToPalette = (paletteId: string) => {
    setPalettes(palettes.map(p => {
      if (p.id === paletteId) {
        if (p.colors.some(c => c.hex === selectedColor)) {
          toast.info("Color already in palette");
          return p;
        }
        toast.success("Color added to palette with match details");
        return {
          ...p,
          colors: [...p.colors, {
            hex: selectedColor,
            pencilMatches: allPencilMatches.slice(0, 3),
            oilPaintMixes: oilPaintMixes.slice(0, 3),
          }]
        };
      }
      return p;
    }));
  };

  const addManualColorToPalette = (paletteId: string, colorHex: string, colorName?: string) => {
    setPalettes(palettes.map(p => {
      if (p.id === paletteId) {
        if (p.colors.some(c => c.hex === colorHex)) {
          toast.info("Color already in palette");
          return p;
        }
        toast.success("Color added to palette");
        return {
          ...p,
          colors: [...p.colors, {
            hex: colorHex,
            notes: colorName,
          }]
        };
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
    if (selectedPaletteId === paletteId) {
      setSelectedPaletteId(null);
    }
    toast.success("Palette deleted");
  };

  const downloadPalette = (palette: ColorPalette) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const swatchSize = 100;
    const textHeight = 200;
    canvas.width = Math.max(palette.colors.length * swatchSize, 800);
    canvas.height = swatchSize + textHeight;

    // Draw background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw color swatches
    palette.colors.forEach((colorData, index) => {
      ctx.fillStyle = colorData.hex;
      ctx.fillRect(index * swatchSize, 0, swatchSize, swatchSize);
      
      // Draw hex code
      ctx.fillStyle = "#000000";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(colorData.hex, index * swatchSize + swatchSize / 2, swatchSize + 20);
    });

    // Draw palette details
    ctx.fillStyle = "#000000";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    let yPos = swatchSize + 50;
    
    ctx.fillText(`Palette: ${palette.name}`, 10, yPos);
    yPos += 25;
    ctx.font = "12px Arial";
    ctx.fillText(`Created: ${new Date(palette.createdAt).toLocaleDateString()}`, 10, yPos);
    yPos += 20;
    ctx.fillText(`${palette.colors.length} colors`, 10, yPos);

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

  // Filter colors for browse reference
  const filteredColors = pencilColors.filter(color => {
    const matchesBrand = selectedBrand === "all" || color.brand === selectedBrand;
    const matchesSet = selectedSet === "all" || color.sets.includes(selectedSet);
    const matchesSearch = searchTerm === "" || 
      color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesBrand && matchesSet && matchesSearch;
  });

  // Get available sets for selected brand
  const availableSets = selectedBrand === "all" 
    ? ["all", "24", "36", "60", "72", "120", "150"]
    : Array.from(new Set(
        pencilColors
          .filter(c => c.brand === selectedBrand)
          .flatMap(c => c.sets)
      )).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Color Tools</h2>
        <p className="text-muted-foreground">Create palettes, pick colors, and find perfect matches</p>
      </div>

      <Tabs defaultValue="picker" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="picker">Color Picker</TabsTrigger>
          <TabsTrigger value="browse">Browse Colors</TabsTrigger>
          <TabsTrigger value="palettes">My Palettes</TabsTrigger>
        </TabsList>

        {/* Color Picker Tab */}
        <TabsContent value="picker" className="space-y-6">
          {/* Step 1: Create/Select Palette */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Step 1: Select Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {palettes.length === 0 ? (
                  <div className="flex-1">
                    <Input
                      placeholder="Enter palette name"
                      value={newPaletteName}
                      onChange={(e) => setNewPaletteName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') createPalette();
                      }}
                    />
                  </div>
                ) : (
                  <Select value={selectedPaletteId || ""} onValueChange={setSelectedPaletteId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a palette" />
                    </SelectTrigger>
                    <SelectContent>
                      {palettes.map(palette => (
                        <SelectItem key={palette.id} value={palette.id}>
                          {palette.name} ({palette.colors.length} colors)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button onClick={() => setShowNewPaletteInput(!showNewPaletteInput)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
                {palettes.length === 0 && (
                  <Button onClick={createPalette} disabled={!newPaletteName.trim()}>
                    Create
                  </Button>
                )}
              </div>
              
              {showNewPaletteInput && palettes.length > 0 && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="New palette name"
                    value={newPaletteName}
                    onChange={(e) => setNewPaletteName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') createPalette();
                    }}
                  />
                  <Button onClick={createPalette} disabled={!newPaletteName.trim()}>
                    Create
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Upload Image & Pick Color */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Step 2: Upload Image & Pick Color</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!image ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center bg-muted/10">
                  <div className="mx-auto flex flex-col items-center justify-center gap-1">
                    <div className="rounded-full bg-background p-2 shadow-sm">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mt-2">Upload Reference Image</h3>
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

              <div className="flex items-center gap-4">
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

          {/* Step 3: View Matches */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Step 3: View Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={colorMatchTab} onValueChange={(v) => setColorMatchTab(v as "pencil" | "oil")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="pencil">Colour Pencil</TabsTrigger>
                  <TabsTrigger value="oil">Oil Paint</TabsTrigger>
                </TabsList>

                {/* Colour Pencil Tab */}
                <TabsContent value="pencil">
                  <Tabs value={pencilSubTab} onValueChange={(v) => setPencilSubTab(v as any)}>
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="prismacolor">Prismacolor</TabsTrigger>
                      <TabsTrigger value="polychromos">Faber-Castell</TabsTrigger>
                      <TabsTrigger value="carandache">Caran d'Ache</TabsTrigger>
                    </TabsList>

                    <TabsContent value={pencilSubTab} className="space-y-2 max-h-96 overflow-y-auto">
                      {pencilMatches.map((pencil, index) => (
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
                          <span className="text-xs font-medium ml-2">{Math.round(pencil.accuracy!)}%</span>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                {/* Oil Paint Tab */}
                <TabsContent value="oil" className="space-y-2 max-h-96 overflow-y-auto">
                  {oilPaintMixes.map((mix, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-card border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">
                          {mix.colors.length === 1 ? "Pure Color" : `${mix.colors.length}-Color Mix`}
                        </div>
                        <span className="text-xs font-medium">{Math.round(mix.accuracy)}% match</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        {mix.colors.map((colorData, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded border"
                              style={{ backgroundColor: colorData.color }}
                            />
                            <span className="flex-1">{colorData.name}</span>
                            <span className="text-muted-foreground">
                              {colorData.ratio} {colorData.ratio === 1 ? "part" : "parts"}
                            </span>
                          </div>
                        ))}
                      </div>
                      {mix.colors.length > 1 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Total: {mix.totalParts} parts
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              {/* Add to Palette Button */}
              {selectedPaletteId && (
                <div className="mt-4">
                  <Button
                    onClick={() => addColorToPalette(selectedPaletteId)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Color to Palette (with match details)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Browse Colors Tab */}
        <TabsContent value="browse" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Browse Color References</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedBrand} onValueChange={(v) => { setSelectedBrand(v); setSelectedSet("all"); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {pencilBrands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSet} onValueChange={setSelectedSet}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sets</SelectItem>
                    {availableSets.filter(s => s !== "all").map(set => (
                      <SelectItem key={set} value={set}>{set} Set</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Grid */}
              <div className="border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredColors.map(color => (
                    <div
                      key={color.id}
                      className="border rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedColor(color.color);
                        toast.success(`Selected ${color.name}`);
                      }}
                    >
                      <div
                        className="w-full h-20 rounded-md border-2 mb-2"
                        style={{ backgroundColor: color.color }}
                      />
                      <div className="text-xs font-medium truncate" title={color.name}>
                        {color.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{color.code}</div>
                      {selectedPaletteId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            addManualColorToPalette(selectedPaletteId, color.color, color.name);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {filteredColors.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No colors found matching your criteria
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Palettes Tab */}
        <TabsContent value="palettes" className="space-y-6">
          {palettes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">No palettes yet. Create one to start saving colors.</p>
                <Button onClick={() => setShowNewPaletteInput(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Palette
                </Button>
              </CardContent>
            </Card>
          ) : (
            palettes.map(palette => (
              <Card key={palette.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{palette.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {palette.colors.length} colors · Created {new Date(palette.createdAt).toLocaleDateString()}
                    </p>
                  </div>
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
                </CardHeader>
                <CardContent>
                  {palette.colors.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No colors yet. Use the Color Picker to add colors.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {palette.colors.map((colorData, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-16 h-16 rounded border-2 flex-shrink-0"
                              style={{ backgroundColor: colorData.hex }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-mono text-sm font-medium">{colorData.hex}</div>
                              {colorData.notes && (
                                <div className="text-sm text-muted-foreground mt-1">{colorData.notes}</div>
                              )}
                              
                              {/* Show pencil matches if available */}
                              {colorData.pencilMatches && colorData.pencilMatches.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium mb-1">Pencil Matches:</div>
                                  <div className="space-y-1">
                                    {colorData.pencilMatches.map((match, idx) => (
                                      <div key={idx} className="text-xs text-muted-foreground">
                                        • {match.name} ({match.code}) - {Math.round(match.accuracy!)}%
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Show oil paint mixes if available */}
                              {colorData.oilPaintMixes && colorData.oilPaintMixes.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium mb-1">Oil Paint Mix:</div>
                                  <div className="text-xs text-muted-foreground">
                                    {colorData.oilPaintMixes[0].colors.map((c, idx) => (
                                      <span key={idx}>
                                        {c.name} ({c.ratio} {c.ratio === 1 ? "part" : "parts"})
                                        {idx < colorData.oilPaintMixes![0].colors.length - 1 ? " + " : ""}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeColorFromPalette(palette.id, index)}
                              className="flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ColorToolsTab;
