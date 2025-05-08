import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Eye, ZoomIn, ZoomOut, Crop, MoveHorizontal, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { findClosestPencils, pencilColors } from "@/data/pencilColors";
import { rgbToHexColor } from "@/utils/colorUtils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Function to convert RGB to HEX with proper formatting
const rgbToHexColor = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
};

const ColorPickerTab = () => {
  const [selectedColor, setSelectedColor] = useState("#EC407A");
  const [rgbValue, setRgbValue] = useState("236, 64, 122");
  const [image, setImage] = useState<string | null>(null);
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showColorPreview, setShowColorPreview] = useState(false);
  const [colorPreview, setColorPreview] = useState({ color: "#FFFFFF", x: 0, y: 0 });
  const [colorMatches, setColorMatches] = useState<any>({});
  const [isCropping, setIsCropping] = useState(false);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [cropStartPoint, setCropStartPoint] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Calculate RGB from HEX when selectedColor changes
  useEffect(() => {
    const hex = selectedColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    setRgbValue(`${r}, ${g}, ${b}`);
    
    // Find matching pencils
    const pencilMatches = findClosestPencils(selectedColor);
    
    // Mock paint matches (in a real app, we'd have a database of paints)
    const paintMatches = [
      { brand: "Winsor & Newton", name: "Cadmium Red", medium: "Watercolor", color: "#E30022", accuracy: 97 },
      { brand: "Liquitex", name: "Light Portrait Pink", medium: "Acrylic", color: "#FFD3DB", accuracy: 94 },
      { brand: "Gamblin", name: "Cadmium Red Light", medium: "Oil", color: "#EC5A45", accuracy: 91 },
      { brand: "Golden", name: "Quinacridone Red", medium: "Acrylic", color: "#E8304A", accuracy: 90 },
    ].filter(paint => {
      const similarity = 100 - (colorDistance(selectedColor, paint.color) / 4);
      return similarity > 75;
    });
    
    // Generate mix suggestions
    const mixSuggestions = generateMixSuggestions(selectedColor);
    
    setColorMatches({
      pencils: pencilMatches,
      paints: paintMatches,
      mixes: mixSuggestions
    });
  }, [selectedColor]);
  
  // Generate mix suggestions
  const generateMixSuggestions = (targetColor: string) => {
    // Convert target color to RGB
    const hex = targetColor.replace('#', '');
    const targetR = parseInt(hex.substring(0, 2), 16);
    const targetG = parseInt(hex.substring(2, 4), 16);
    const targetB = parseInt(hex.substring(4, 6), 16);
    
    // Find pencil combinations that might create this color
    const suggestions = [];
    const baseColors = pencilColors.filter(p => p.id <= 20); // Use a subset of colors as base
    
    for (let i = 0; i < baseColors.length; i++) {
      for (let j = i + 1; j < pencilColors.length; j++) {
        const color1 = baseColors[i];
        const color2 = pencilColors[j];
        
        const c1Hex = color1.color.replace('#', '');
        const c2Hex = color2.color.replace('#', '');
        
        const c1r = parseInt(c1Hex.substring(0, 2), 16);
        const c1g = parseInt(c1Hex.substring(2, 4), 16);
        const c1b = parseInt(c1Hex.substring(4, 6), 16);
        
        const c2r = parseInt(c2Hex.substring(0, 2), 16);
        const c2g = parseInt(c2Hex.substring(2, 4), 16);
        const c2b = parseInt(c2Hex.substring(4, 6), 16);
        
        // Try different ratios
        for (let ratio = 0.3; ratio <= 0.7; ratio += 0.2) {
          const mixedR = Math.round(c1r * ratio + c2r * (1 - ratio));
          const mixedG = Math.round(c1g * ratio + c2g * (1 - ratio));
          const mixedB = Math.round(c1b * ratio + c2b * (1 - ratio));
          
          const mixedHex = rgbToHexColor(mixedR, mixedG, mixedB);
          const distance = colorDistance(targetColor, mixedHex);
          
          if (distance < 60) {
            suggestions.push({
              components: [
                { ...color1, ratio: Math.round(ratio * 100) },
                { ...color2, ratio: Math.round((1 - ratio) * 100) }
              ],
              result: mixedHex,
              accuracy: Math.max(0, Math.min(100, 100 - (distance / 4)))
            });
          }
        }
      }
    }
    
    return suggestions
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 3);
  };
  
  // Calculate color distance
  const colorDistance = (color1: string, color2: string) => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);
    
    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(3, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);
    
    return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
  };
  
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
        setCropBox({ x: 0, y: 0, width: 0, height: 0 });
        toast.success('Image uploaded successfully');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to load image');
    };
    reader.readAsDataURL(file);
  };
  
  const startColorPicking = () => {
    setIsPickingColor(true);
    setIsCropping(false);
    toast.info('Click on the image to pick a color');
  };
  
  const startCropping = () => {
    setIsCropping(true);
    setIsPickingColor(false);
    toast.info('Draw a box to crop the image');
  };
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    if (isPickingColor) {
      pickColorFromCanvas(event);
    }
  };
  
  const pickColorFromCanvas = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingColor || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoomLevel;
    const y = (event.clientY - rect.top) / zoomLevel;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    try {
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHexColor(pixelData[0], pixelData[1], pixelData[2]);
      
      setSelectedColor(hex);
      setIsPickingColor(false);
      setShowColorPreview(false);
      toast.success('Color picked successfully');
    } catch (e) {
      console.error('Error picking color:', e);
      toast.error('Failed to pick color. Try clicking inside the image.');
    }
  };
  
  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCropping) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / zoomLevel;
      const y = (event.clientY - rect.top) / zoomLevel;
      
      setCropBox({ x, y, width: 0, height: 0 });
      setCropStartPoint({ x, y });
      setIsDraggingCrop(true);
    }
  };
  
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoomLevel;
    const y = (event.clientY - rect.top) / zoomLevel;
    
    if (isPickingColor) {
      // Update color preview
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      try {
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const hex = rgbToHexColor(pixelData[0], pixelData[1], pixelData[2]);
        setColorPreview({ color: hex, x: event.clientX, y: event.clientY });
        setShowColorPreview(true);
      } catch (e) {
        // Ignore errors when moving outside the canvas
      }
    } else if (isCropping && isDraggingCrop) {
      // Update crop box
      const width = x - cropStartPoint.x;
      const height = y - cropStartPoint.y;
      
      setCropBox({
        x: width >= 0 ? cropStartPoint.x : x,
        y: height >= 0 ? cropStartPoint.y : y,
        width: Math.abs(width),
        height: Math.abs(height)
      });
    }
  };
  
  const handleCanvasMouseUp = () => {
    if (isCropping && isDraggingCrop) {
      setIsDraggingCrop(false);
      
      if (cropBox.width < 10 || cropBox.height < 10) {
        toast.error('Selected area is too small. Please try again.');
        return;
      }
      
      // Keep cropping mode active for now
      toast.info('Click Apply Crop to confirm, or select a new area');
    }
  };
  
  const handleCanvasMouseLeave = () => {
    if (isPickingColor) {
      setShowColorPreview(false);
    }
    if (isCropping && isDraggingCrop) {
      setIsDraggingCrop(false);
    }
  };
  
  const applyCrop = () => {
    if (!canvasRef.current || cropBox.width === 0 || cropBox.height === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create a temporary canvas to hold the cropped region
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    // Set the temp canvas size to the crop box size
    tempCanvas.width = cropBox.width;
    tempCanvas.height = cropBox.height;
    
    // Draw the cropped portion to the temp canvas
    tempCtx.drawImage(
      canvas, 
      cropBox.x, cropBox.y, cropBox.width, cropBox.height,
      0, 0, cropBox.width, cropBox.height
    );
    
    // Get the cropped image as a data URL
    const croppedImageDataUrl = tempCanvas.toDataURL();
    
    // Load the cropped image
    const img = new Image();
    img.onload = () => {
      // Resize the main canvas to the cropped image size
      canvas.width = cropBox.width;
      canvas.height = cropBox.height;
      
      // Draw the cropped image to the main canvas
      ctx.drawImage(img, 0, 0);
      
      setIsCropping(false);
      setCropBox({ x: 0, y: 0, width: 0, height: 0 });
      toast.success('Image cropped successfully');
    };
    img.src = croppedImageDataUrl;
  };
  
  const cancelCrop = () => {
    setIsCropping(false);
    setCropBox({ x: 0, y: 0, width: 0, height: 0 });
  };
  
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 4));
  };
  
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };
  
  const resetZoom = () => {
    setZoomLevel(1);
  };
  
  // Draw the image on the canvas when it changes
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0);
    };
    img.src = image;
  }, [image]);
  
  // Redraw the canvas when the crop box changes
  useEffect(() => {
    if (!image || !canvasRef.current || !isCropping) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      if (cropBox.width > 0 && cropBox.height > 0) {
        // Draw crop overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Clear the crop area
        ctx.clearRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
        
        // Draw border around crop area
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
      }
    };
    img.src = image;
  }, [image, cropBox, isCropping]);

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Color Picker</h2>
        <p className="text-muted-foreground">Extract colors and find matching art supplies</p>
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="aspect-[3/2] bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-auto">
          {image ? (
            <div className="relative">
              <canvas 
                ref={canvasRef} 
                onClick={handleCanvasClick}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseLeave}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousedown', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  handleCanvasMouseDown(mouseEvent as any);
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  handleCanvasMouseMove(mouseEvent as any);
                }}
                onTouchEnd={() => handleCanvasMouseUp()}
                className={cn(
                  "max-h-[500px]",
                  isPickingColor ? "cursor-crosshair" : 
                  isCropping ? "cursor-crosshair" : "cursor-default"
                )}
                style={{ 
                  transform: `scale(${zoomLevel})`, 
                  transformOrigin: 'top left',
                  transition: 'transform 0.2s ease-out'
                }}
              />
              
              {/* Color preview bubble */}
              {showColorPreview && (
                <div
                  className="absolute rounded-full border-2 border-white shadow-lg w-12 h-12 pointer-events-none z-10"
                  style={{
                    backgroundColor: colorPreview.color,
                    left: `calc(${colorPreview.x}px + 20px)`,
                    top: `calc(${colorPreview.y}px - 30px)`,
                  }}
                />
              )}
            </div>
          ) : (
            <div className="text-center px-4">
              <p className="text-muted-foreground mb-4">Upload an image to pick colors</p>
              <Button 
                variant="outline"
                className="mr-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <input 
                ref={fileInputRef}
                id="color-image-input" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>
          )}
          
          {/* Floating action buttons */}
          {image && (
            <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
              <Button 
                size="icon" 
                className="rounded-full shadow-lg bg-background"
                onClick={zoomIn}
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                className="rounded-full shadow-lg bg-background"
                onClick={zoomOut}
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                className="rounded-full shadow-lg bg-background"
                onClick={resetZoom}
                title="Reset zoom"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                className={cn(
                  "rounded-full shadow-lg",
                  isCropping ? "bg-green-500 hover:bg-green-600" : "bg-background"
                )}
                onClick={startCropping}
                title="Crop image"
              >
                <Crop className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                className={cn(
                  "rounded-full shadow-lg",
                  isPickingColor ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
                )}
                onClick={startColorPicking}
                title="Pick color"
              >
                <Eye className="h-5 w-5" />
              </Button>
            </div>
          )}
          
          {/* Crop controls */}
          {isCropping && cropBox.width > 0 && cropBox.height > 0 && (
            <div className="absolute top-4 left-4 flex space-x-2">
              <Button 
                size="sm"
                className="bg-green-500 hover:bg-green-600"
                onClick={applyCrop}
              >
                Apply Crop
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={cancelCrop}
              >
                Cancel
              </Button>
            </div>
          )}
          
          {/* Zoom indicator */}
          {image && (
            <div className="absolute top-2 right-2 bg-background rounded-md px-2 py-1 text-xs font-medium">
              {Math.round(zoomLevel * 100)}%
            </div>
          )}
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
            {colorMatches.pencils?.map((pencil: any, index: number) => (
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
                  <span className="text-xs font-medium mr-2">{Math.round(pencil.accuracy)}% match</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="paints" className="space-y-4 mt-4">
          <div className="space-y-3">
            <Label className="text-sm">Best Paint Matches</Label>
            {colorMatches.paints?.map((paint: any, index: number) => (
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
            {colorMatches.mixes?.map((mix: any, mixIndex: number) => (
              <div key={mixIndex} className="rounded-lg border p-3 bg-card">
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-sm">Color Mix Suggestion</Label>
                  <span className="text-xs font-medium">{Math.round(mix.accuracy)}% match</span>
                </div>
                
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full" 
                    style={{ backgroundColor: mix.result }} 
                  />
                  <div className="text-sm font-medium">Resulting Color</div>
                </div>
                
                <div className="space-y-2">
                  {mix.components.map((component: any, index: number) => (
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
