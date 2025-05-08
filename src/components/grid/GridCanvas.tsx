
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface GridCanvasProps {
  canvasSize: string;
  orientation: string;
  gridSize: number;
  lineWidth: number;
  lineOpacity: number;
  showDiagonals: boolean;
  showGridNumbers: boolean;
  lineColor: string;
  image: string | null;
  customWidth: number;
  customHeight: number;
  customUnit: "cm" | "inches";
  onUploadImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const GridCanvas = ({
  canvasSize,
  orientation,
  gridSize,
  lineWidth,
  lineOpacity,
  showDiagonals,
  showGridNumbers,
  lineColor,
  image,
  customWidth,
  customHeight,
  customUnit,
  onUploadImage
}: GridCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  
  // Update canvas dimensions based on size and orientation
  useEffect(() => {
    const dpi = 96; // Standard screen DPI
    let width, height;

    switch (canvasSize) {
      case "a2":
        // A2: 420mm x 594mm (16.5in x 23.4in)
        width = 16.5 * dpi;
        height = 23.4 * dpi;
        break;
      case "a3":
        // A3: 297mm x 420mm (11.7in x 16.5in)
        width = 11.7 * dpi;
        height = 16.5 * dpi;
        break;
      case "a4":
        // A4: 210mm x 297mm (8.3in x 11.7in)
        width = 8.3 * dpi;
        height = 11.7 * dpi;
        break;
      case "custom":
        // Convert to pixels based on unit
        const conversionFactor = customUnit === "cm" ? dpi / 2.54 : dpi;
        width = customWidth * conversionFactor;
        height = customHeight * conversionFactor;
        break;
      default:
        // Default to A4
        width = 8.3 * dpi;
        height = 11.7 * dpi;
    }

    // Swap dimensions for landscape orientation
    if (orientation === "landscape") {
      [width, height] = [height, width];
    }

    setCanvasDimensions({ width, height });
  }, [canvasSize, orientation, customWidth, customHeight, customUnit]);

  // Draw grid on canvas whenever relevant props change
  useEffect(() => {
    drawCanvas();
  }, [canvasDimensions, gridSize, lineWidth, lineOpacity, showDiagonals, showGridNumbers, lineColor, image]);

  // Function to draw the canvas with grid and image
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvasDimensions.width;
    canvas.height = canvasDimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image if available
    if (image) {
      const img = new Image();
      img.onload = () => {
        // Calculate scaling to fit canvas while maintaining aspect ratio
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
        
        if (imgRatio > canvasRatio) {
          // Image is wider than canvas
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          // Image is taller than canvas
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
        }
        
        // Draw image centered on canvas
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        // Draw grid on top of the image
        drawGrid(ctx);
      };
      img.src = image;
    } else {
      // No image, just draw the grid
      drawGrid(ctx);
    }
  };

  // Function to draw the grid
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set line style
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = `rgba(${hexToRgb(lineColor)}, ${lineOpacity / 100})`;

    // Calculate number of cells
    const numCellsX = Math.ceil(canvas.width / gridSize);
    const numCellsY = Math.ceil(canvas.height / gridSize);
    
    // Draw vertical lines
    for (let i = 0; i <= numCellsX; i++) {
      const x = i * gridSize;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let i = 0; i <= numCellsY; i++) {
      const y = i * gridSize;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw diagonals if enabled
    if (showDiagonals) {
      ctx.setLineDash([5, 5]); // Dashed lines for diagonals
      
      // Draw diagonal lines from top-left to bottom-right
      for (let i = -numCellsY; i <= numCellsX; i++) {
        const startX = i * gridSize;
        const startY = 0;
        const endX = startX + canvas.height;
        const endY = canvas.height;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      
      // Draw diagonal lines from top-right to bottom-left
      for (let i = 0; i <= numCellsX + numCellsY; i++) {
        const startX = i * gridSize;
        const startY = 0;
        const endX = startX - canvas.height;
        const endY = canvas.height;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      
      ctx.setLineDash([]); // Reset line style
    }
    
    // Draw grid numbers if enabled
    if (showGridNumbers) {
      const fontSize = Math.max(12, gridSize / 3);
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Draw column numbers (along top)
      for (let i = 1; i < numCellsX; i++) {
        const x = i * gridSize;
        ctx.fillText(i.toString(), x - gridSize / 2, fontSize);
      }
      
      // Draw row numbers (along left side)
      ctx.textAlign = "right";
      for (let i = 1; i < numCellsY; i++) {
        const y = i * gridSize;
        ctx.fillText(i.toString(), fontSize * 1.5, y - gridSize / 2);
      }
    }
  };

  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  };

  // Handle file upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-6 border rounded-lg overflow-hidden bg-white relative">
      <div className="overflow-auto max-h-[70vh]">
        <div className="min-h-[300px] flex items-center justify-center p-4 relative">
          <canvas 
            ref={canvasRef}
            className="max-w-full border shadow-md bg-white"
          />
          
          {!image && (
            <div className="absolute inset-0 flex items-center justify-center bg-transparent">
              <Button 
                variant="outline"
                className="bg-white/80 backdrop-blur-sm"
                onClick={handleUploadClick}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Reference Image
              </Button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={onUploadImage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GridCanvas;
