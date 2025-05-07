
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { drawCanvas, drawGrid } from "@/utils/canvasUtils";

interface GridCanvasProps {
  canvasSize: string;
  orientation: string;
  gridSize: number;
  lineWidth: number;
  lineOpacity: number;
  showDiagonals: boolean;
  lineColor: string;
  image: string | null;
  onUploadImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const GridCanvas = ({
  canvasSize,
  orientation,
  gridSize,
  lineWidth,
  lineOpacity,
  showDiagonals,
  lineColor,
  image,
  onUploadImage,
}: GridCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        setCanvasContext(ctx);
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
      drawCanvas(
        canvasContext, 
        canvasRef.current.width, 
        canvasRef.current.height, 
        image,
        () => drawGridLines()
      );
    }
  }, [gridSize, lineWidth, lineOpacity, showDiagonals, lineColor, image]);

  const updateCanvasSize = () => {
    if (!canvasRef.current) return;
    
    // Set sizes in pixels (approximate A4, A3, A2 at 72 PPI)
    let width = 0;
    let height = 0;
    
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
    if (canvasContext) {
      drawCanvas(
        canvasContext,
        width,
        height,
        image,
        () => drawGridLines()
      );
    }
  };

  const drawGridLines = () => {
    if (!canvasContext || !canvasRef.current) return;
    
    const { width, height } = canvasRef.current;
    drawGrid(
      canvasContext,
      width,
      height,
      gridSize,
      lineWidth,
      lineOpacity,
      lineColor,
      showDiagonals
    );
  };

  return (
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
          onChange={onUploadImage}
        />
      </div>
    </div>
  );
};

export default GridCanvas;
