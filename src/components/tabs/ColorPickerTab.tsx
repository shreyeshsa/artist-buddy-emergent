
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pipette } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { findClosestPencils, pencilColors } from "@/data/pencilColors";
import { rgbToHexColor } from "@/utils/colorUtils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Color picker component
const ColorPicker = ({ onColorSelect }: { onColorSelect: (color: string) => void }) => {
  const [selectedColor, setSelectedColor] = useState("#EC407A");
  const [image, setImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEyeDropperMode, setIsEyeDropperMode] = useState(false);
  const [colorPreview, setColorPreview] = useState<{x: number, y: number, color: string} | null>(null);
  const [zoom, setZoom] = useState(1);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Handle image upload
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
  
  // Draw image on canvas when uploaded
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0);
    };
    img.src = image;
  }, [image]);
  
  // Handle mouse move for eyedropper
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEyeDropperMode || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse position relative to canvas
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    
    // Get pixel color at that position
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const color = rgbToHexColor(pixelData[0], pixelData[1], pixelData[2]);
      
      // Update color preview
      setColorPreview({ x: e.clientX, y: e.clientY, color });
    }
  };
  
  // Handle mouse click to select color
  const handleMouseClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEyeDropperMode || !canvasRef.current || !colorPreview) return;
    
    setSelectedColor(colorPreview.color);
    onColorSelect(colorPreview.color);
    setIsEyeDropperMode(false);
    setColorPreview(null);
    toast.success(`Color selected: ${colorPreview.color}`);
  };
  
  // Toggle eyedropper mode
  const toggleEyeDropper = () => {
    setIsEyeDropperMode(!isEyeDropperMode);
    if (!isEyeDropperMode) {
      toast.info('Click on the image to select a color');
    } else {
      setColorPreview(null);
    }
  };
  
  // Input file click handler
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="space-y-4">
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
              onClick={handleUploadClick}
              className="bg-gradient-to-r from-artify-pink to-artify-purple hover:opacity-90 text-white"
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
        <div className="relative border rounded-lg overflow-hidden bg-muted/10">
          <div className="overflow-auto max-h-[50vh] relative">
            <div className={`relative ${isEyeDropperMode ? 'cursor-crosshair' : ''}`}>
              <canvas
                ref={canvasRef}
                className="max-w-full"
                onMouseMove={handleMouseMove}
                onClick={handleMouseClick}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              />
              
              {colorPreview && (
                <div
                  className="absolute pointer-events-none bg-white shadow-lg rounded-lg p-2 z-10 flex items-center gap-2"
                  style={{
                    left: `${colorPreview.x + 10}px`,
                    top: `${colorPreview.y + 10}px`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: colorPreview.color }}
                  />
                  <span className="text-xs font-mono">{colorPreview.color}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-3 border-t flex justify-between items-center bg-card">
            <div className="flex items-center gap-2">
              <Button
                variant={isEyeDropperMode ? "default" : "outline"}
                size="sm"
                onClick={toggleEyeDropper}
                className={isEyeDropperMode ? "bg-artify-pink text-white" : ""}
              >
                <Pipette className="h-4 w-4 mr-1" />
                {isEyeDropperMode ? "Selecting..." : "Pick Color"}
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                  className="h-8 w-8"
                >
                  -
                </Button>
                <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                  className="h-8 w-8"
                >
                  +
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUploadClick}
              className="h-8 w-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
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
                  onColorSelect(e.target.value);
                }
              }}
              className="flex-1"
            />
            <Input
              type="color"
              value={selectedColor}
              onChange={(e) => {
                setSelectedColor(e.target.value);
                onColorSelect(e.target.value);
              }}
              className="w-12 h-9 p-1 border cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Pencil matches component
const PencilMatches = ({ color }: { color: string }) => {
  const matches = findClosestPencils(color);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Best Pencil Matches</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {matches.map((pencil, index) => (
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
            <div>
              <span className="text-xs font-medium">{Math.round(pencil.accuracy!)}% match</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ColorPickerTab = () => {
  const [selectedColor, setSelectedColor] = useState("#EC407A");
  
  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Color Picker</h2>
        <p className="text-muted-foreground">Pick colors from images and find matching pencils</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Picker Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pick a Color</CardTitle>
          </CardHeader>
          <CardContent>
            <ColorPicker onColorSelect={setSelectedColor} />
          </CardContent>
        </Card>
        
        {/* Color Matches Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Color Information</CardTitle>
          </CardHeader>
          <CardContent>
            <PencilMatches color={selectedColor} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ColorPickerTab;
