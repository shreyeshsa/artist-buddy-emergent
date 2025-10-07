
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Droplet } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { extractDominantColors } from "@/utils/colorUtils";
import { PencilColorWithAccuracy, findClosestPencils } from "@/data/pencilColors";

interface ImageColorExtractorProps {
  onExtractPalette: (palette: string[], matches: PencilColorWithAccuracy[]) => void;
}

const ImageColorExtractor = ({ onExtractPalette }: ImageColorExtractorProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({x: 0, y: 0});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
  
  // Redraw canvas with selection rectangle
  useEffect(() => {
    if (!image || !canvasRef.current || !selectionRect) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw selection rectangle
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
      
      // Draw selection overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
    };
    img.src = image;
  }, [image, selectionRect]);
  
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
        setSelectionRect(null);
        toast.success('Image uploaded successfully');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to load image');
    };
    reader.readAsDataURL(file);
  };
  
  const startSelection = () => {
    setIsSelectionMode(true);
    setSelectionRect(null);
    toast.info('Click and drag to select an area of the image');
  };
  
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelectionMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({x, y});
    setSelectionRect({x, y, width: 0, height: 0});
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelectionMode || !isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setSelectionRect({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      width: Math.abs(x - dragStart.x),
      height: Math.abs(y - dragStart.y)
    });
  };
  
  const handleMouseUp = () => {
    if (!isSelectionMode || !isDragging || !selectionRect) return;
    
    setIsDragging(false);
    setIsSelectionMode(false);
    
    extractColorsFromSelection();
  };
  
  const extractColorsFromSelection = () => {
    if (!canvasRef.current || !selectionRect) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get image data from selection
    const imageData = ctx.getImageData(
      selectionRect.x, 
      selectionRect.y, 
      selectionRect.width, 
      selectionRect.height
    );
    
    // Extract dominant colors
    const dominantColors = extractDominantColors(imageData);
    
    // Find pencil matches for each color
    const matches = dominantColors.flatMap(color => {
      return findClosestPencils(color).slice(0, 2);
    });
    
    // Remove duplicates
    const uniqueMatches = matches.filter((pencil, index, self) => 
      index === self.findIndex(p => p.id === pencil.id)
    ).slice(0, 12);
    
    onExtractPalette(dominantColors, uniqueMatches);
    
    toast.success(`Extracted ${dominantColors.length} colors from the selection`);
  };
  
  return (
    <div className="rounded-lg border bg-card mb-6 overflow-hidden">
      <div className="aspect-[3/2] bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
        {image ? (
          <canvas 
            ref={canvasRef} 
            className={cn(
              "max-w-full max-h-full",
              isSelectionMode ? "cursor-crosshair" : "cursor-default"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        ) : (
          <div className="text-center px-4">
            <p className="text-muted-foreground mb-4">Upload an image to extract color palettes</p>
            <Button 
              variant="outline"
              className="mr-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Droplet className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <input 
              ref={fileInputRef}
              id="reference-image-input" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
            />
          </div>
        )}
        
        {/* Floating action button for selection */}
        {image && (
          <Button 
            size="icon" 
            className={cn(
              "absolute bottom-4 right-4 rounded-full shadow-lg",
              isSelectionMode ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
            )}
            onClick={startSelection}
          >
            <Droplet className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageColorExtractor;
