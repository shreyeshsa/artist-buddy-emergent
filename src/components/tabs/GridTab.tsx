
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Plus } from "lucide-react";
import { toast } from "sonner";

const GridTab = () => {
  // State for canvas settings
  const [canvasSize, setCanvasSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [gridSize, setGridSize] = useState(20);
  const [lineWidth, setLineWidth] = useState(1);
  const [lineOpacity, setLineOpacity] = useState(50);
  const [showDiagonals, setShowDiagonals] = useState(false);
  const [lineColor, setLineColor] = useState("#333333");
  
  // Image handling
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        setCanvasContext(ctx);
        // Set initial canvas size
        updateCanvasSize();
      }
    }
  }, []);

  // Update canvas dimensions when size or orientation changes
  useEffect(() => {
    updateCanvasSize();
  }, [canvasSize, orientation]);

  // Draw grid when settings change
  useEffect(() => {
    if (canvasContext && canvasRef.current) {
      drawCanvas();
    }
  }, [gridSize, lineWidth, lineOpacity, showDiagonals, lineColor, image]);

  const updateCanvasSize = () => {
    if (!canvasRef.current) return;
    
    let width = 0;
    let height = 0;
    
    // Set sizes in pixels (approximate A4, A3, A2 at 72 PPI)
    switch (canvasSize) {
      case 'a4':
        width = 595;
        height = 842;
        break;
      case 'a3':
        width = 842;
        height = 1191;
        break;
      case 'a2':
        width = 1191;
        height = 1684;
        break;
      default:
        width = 595;
        height = 842;
    }
    
    // Swap dimensions for landscape
    if (orientation === 'landscape') {
      [width, height] = [height, width];
    }
    
    // Set canvas dimensions
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    
    // Redraw canvas
    drawCanvas();
  };

  const drawCanvas = () => {
    if (!canvasContext || !canvasRef.current) return;
    
    const { width, height } = canvasRef.current;
    
    // Clear canvas
    canvasContext.clearRect(0, 0, width, height);
    
    // Draw background (white)
    canvasContext.fillStyle = '#ffffff';
    canvasContext.fillRect(0, 0, width, height);
    
    // Draw image if available
    if (image) {
      const img = new Image();
      img.onload = () => {
        // Calculate aspect ratio to fit the image within the canvas
        const scale = Math.min(width / img.width, height / img.height);
        const x = (width - img.width * scale) / 2;
        const y = (height - img.height * scale) / 2;
        
        canvasContext.drawImage(img, x, y, img.width * scale, img.height * scale);
        drawGrid();
      };
      img.src = image;
    } else {
      drawGrid();
    }
  };

  const drawGrid = () => {
    if (!canvasContext || !canvasRef.current) return;
    
    const { width, height } = canvasRef.current;
    
    // Set line style
    canvasContext.strokeStyle = lineColor;
    canvasContext.globalAlpha = lineOpacity / 100;
    canvasContext.lineWidth = lineWidth;
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      canvasContext.beginPath();
      canvasContext.moveTo(x, 0);
      canvasContext.lineTo(x, height);
      canvasContext.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      canvasContext.beginPath();
      canvasContext.moveTo(0, y);
      canvasContext.lineTo(width, y);
      canvasContext.stroke();
    }
    
    // Draw diagonals if enabled
    if (showDiagonals) {
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          canvasContext.beginPath();
          canvasContext.moveTo(x, y);
          canvasContext.lineTo(x + gridSize, y + gridSize);
          canvasContext.stroke();
          
          canvasContext.beginPath();
          canvasContext.moveTo(x + gridSize, y);
          canvasContext.lineTo(x, y + gridSize);
          canvasContext.stroke();
        }
      }
    }
    
    // Reset opacity
    canvasContext.globalAlpha = 1;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
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

  const exportCanvas = () => {
    if (!canvasRef.current) return;
    
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.download = `grid-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Canvas exported successfully');
    } catch (err) {
      toast.error('Failed to export canvas');
      console.error('Export error:', err);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Grid Creator</h2>
        <p className="text-muted-foreground">Set up your canvas, import images, and apply custom grids</p>
      </div>

      {/* Canvas and workspace area */}
      <div className="rounded-lg border bg-card mb-6 overflow-hidden">
        <div className="aspect-[3/4] bg-white dark:bg-slate-800 relative flex items-center justify-center p-2">
          <canvas 
            ref={canvasRef} 
            className="max-w-full max-h-full object-contain border border-muted"
          />
          
          {/* Floating action button for canvas actions */}
          <Button 
            size="icon" 
            className="absolute bottom-4 right-4 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="h-5 w-5" />
          </Button>
          <input 
            ref={fileInputRef}
            id="file-input" 
            type="file" 
            accept="image/*" 
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      <Tabs defaultValue="canvas" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        
        {/* Canvas Settings */}
        <TabsContent value="canvas" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="canvas-size">Canvas Size</Label>
              <Select value={canvasSize} onValueChange={setCanvasSize}>
                <SelectTrigger id="canvas-size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a2">A2</SelectItem>
                  <SelectItem value="a3">A3</SelectItem>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Select value={orientation} onValueChange={setOrientation}>
                <SelectTrigger id="orientation">
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Image
            </Button>
          </div>
        </TabsContent>
        
        {/* Grid Settings */}
        <TabsContent value="grid" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="grid-size">Grid Size: {gridSize}px</Label>
              </div>
              <Slider 
                id="grid-size"
                min={5} 
                max={100} 
                step={1} 
                value={[gridSize]} 
                onValueChange={(values) => setGridSize(values[0])} 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="line-width">Line Width: {lineWidth}px</Label>
              </div>
              <Slider 
                id="line-width"
                min={0.5} 
                max={5} 
                step={0.5} 
                value={[lineWidth]} 
                onValueChange={(values) => setLineWidth(values[0])} 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="line-opacity">Opacity: {lineOpacity}%</Label>
              </div>
              <Slider 
                id="line-opacity"
                min={10} 
                max={100} 
                step={5} 
                value={[lineOpacity]} 
                onValueChange={(values) => setLineOpacity(values[0])} 
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="diagonals" 
                checked={showDiagonals} 
                onCheckedChange={setShowDiagonals} 
              />
              <Label htmlFor="diagonals">Show Diagonals</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="line-color">Line Color</Label>
              <div className="flex items-center space-x-2">
                <input 
                  type="color" 
                  id="line-color" 
                  value={lineColor} 
                  onChange={(e) => setLineColor(e.target.value)}
                  className="w-10 h-10 rounded-md" 
                />
                <span>{lineColor}</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Export Settings */}
        <TabsContent value="export" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Format</Label>
              <Select defaultValue="png">
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="export-quality">Quality</Label>
              <Select defaultValue="high">
                <SelectTrigger id="export-quality">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="custom">Custom DPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="include-grid" defaultChecked />
              <Label htmlFor="include-grid">Include Grid in Export</Label>
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-artify-pink to-artify-purple hover:opacity-90 mt-2"
              onClick={exportCanvas}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Image
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GridTab;
