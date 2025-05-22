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
  gridUnit?: string; // Add gridUnit prop
}

interface ImagePosition {
  x: number;
  y: number;
  clientX?: number;
  clientY?: number;
  initialPinchDistance?: number;
  initialScale?: number;
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
  onUploadImage,
  gridUnit = "cm" // Default to cm if not provided
}: GridCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imagePosition, setImagePosition] = useState<ImagePosition>({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [fitToCanvas, setFitToCanvas] = useState(false);
  
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
    
    // Reset image position when canvas size changes
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);
    setFitToCanvas(false);
  }, [canvasSize, orientation, customWidth, customHeight, customUnit]);

  // Draw grid on canvas whenever relevant props change
  useEffect(() => {
    drawCanvas();
  }, [canvasDimensions, gridSize, lineWidth, lineOpacity, showDiagonals, showGridNumbers, lineColor, image, imagePosition, imageScale, fitToCanvas]);

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
      if (!imgElement) {
        const img = new Image();
        img.onload = () => {
          setImgElement(img);
          drawImageWithPosition(ctx, img);
          drawGrid(ctx);
        };
        img.src = image;
      } else {
        drawImageWithPosition(ctx, imgElement);
        drawGrid(ctx);
      }
    } else {
      // No image, just draw the grid
      drawGrid(ctx);
    }
  };

  // Function to draw image with current position and scale
  const drawImageWithPosition = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    // Calculate scaling to fit canvas while maintaining aspect ratio
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasDimensions.width / canvasDimensions.height;
    
    let drawWidth, drawHeight;
    
    if (fitToCanvas) {
      // Fit image exactly to canvas dimensions
      drawWidth = canvasDimensions.width;
      drawHeight = canvasDimensions.height;
      
      // Draw image with exact canvas dimensions
      ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
      return;
    }
    
    if (imgRatio > canvasRatio) {
      // Image is wider than canvas
      drawWidth = canvasDimensions.width * imageScale;
      drawHeight = (canvasDimensions.width / imgRatio) * imageScale;
    } else {
      // Image is taller than canvas
      drawHeight = canvasDimensions.height * imageScale;
      drawWidth = (canvasDimensions.height * imgRatio) * imageScale;
    }
    
    // Draw image with current position
    ctx.drawImage(
      img,
      imagePosition.x + (canvasDimensions.width - drawWidth) / 2,
      imagePosition.y + (canvasDimensions.height - drawHeight) / 2,
      drawWidth,
      drawHeight
    );
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
      
      // Add grid size info at bottom right when grid numbers are enabled
      const dpi = 96; // Standard screen DPI
      const cmPerInch = 2.54;
      
      // Get paper dimensions in the appropriate unit
      let paperWidth, paperHeight, unitLabel;
      if (customUnit === "cm") {
        paperWidth = customWidth;
        paperHeight = customHeight;
        unitLabel = "cm";
      } else {
        paperWidth = customWidth;
        paperHeight = customHeight;
        unitLabel = "in";
      }
      
      // Get grid size in the appropriate unit - use the gridUnit prop
      let gridSizeDisplay;
      let gridUnitLabel = gridUnit || "cm"; // Use the passed gridUnit prop
      
      if (gridUnitLabel === "cm") {
        gridSizeDisplay = (gridSize / (dpi / cmPerInch)).toFixed(1);
        gridUnitLabel = "cm";
      } else {
        gridSizeDisplay = (gridSize / dpi).toFixed(2);
        gridUnitLabel = "in";
      }
      
      // Format orientation information
      const orientationText = orientation.charAt(0).toUpperCase() + orientation.slice(1);
      
      // Create info text with the correct unit
      const infoText = `Grid: ${gridSizeDisplay}${gridUnitLabel} | Paper: ${paperWidth}×${paperHeight}${unitLabel} (${canvasSize.toUpperCase()} ${orientationText})`;
      
      // Draw semi-transparent background for text
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      const padding = 8;
      const infoFontSize = 12;
      ctx.font = `${infoFontSize}px Arial`;
      const textWidth = ctx.measureText(infoText).width;
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(
        canvas.width - textWidth - padding * 2, 
        canvas.height - infoFontSize - padding * 2,
        textWidth + padding * 2,
        infoFontSize + padding * 2
      );
      
      // Draw text
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fillText(
        infoText,
        canvas.width - padding,
        canvas.height - padding
      );
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

  // Handle mouse/touch events for image positioning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!image || fitToCanvas) return;
    setIsDraggingImage(true);
    
    // Prevent default behaviors
    if ('touches' in e) {
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingImage || fitToCanvas) return;

    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Prevent scrolling while dragging
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
      e.preventDefault(); // Prevent text selection during drag
    }
    
    // Calculate movement based on event movement
    setImagePosition(prev => ({
      x: prev.x + (clientX - (prev.clientX || clientX)),
      y: prev.y + (clientY - (prev.clientY || clientY)),
      clientX,
      clientY,
    }));
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
    setImagePosition(prev => ({
      x: prev.x,
      y: prev.y
    }));
  };

  // Handle pinch-to-zoom for touch devices
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!image || fitToCanvas) return;
    
    if (e.touches.length === 2) {
      // Store the initial distance between two fingers
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      setImagePosition(prev => ({
        ...prev,
        initialPinchDistance: distance,
        initialScale: imageScale
      }));
      
      e.preventDefault(); // Prevent default zoom behavior
    } else {
      handleMouseDown(e);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!image || fitToCanvas) return;
    
    if (e.touches.length === 2 && imagePosition.initialPinchDistance && imagePosition.initialScale) {
      // Calculate new distance between fingers
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // Calculate scale factor based on initial distance and current distance
      const scale = (distance / imagePosition.initialPinchDistance) * imagePosition.initialScale;
      setImageScale(Math.max(0.5, Math.min(3, scale))); // Limit scale between 0.5 and 3
      
      e.preventDefault();
    } else {
      handleMouseMove(e);
    }
  };

  return (
    <div className="mb-6 border rounded-lg overflow-hidden bg-white dark:bg-gray-800 relative">
      <div className="overflow-auto max-h-[70vh]">
        <div className="min-h-[300px] flex items-center justify-center p-4 relative">
          <canvas 
            ref={canvasRef}
            className="max-w-full border shadow-md bg-white cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            style={{ touchAction: 'none' }}
          />
          
          {!image && (
            <div className="absolute inset-0 flex items-center justify-center bg-transparent">
              <div className="p-6 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-center shadow-lg border border-muted">
                <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Upload Reference Image</h3>
                <p className="text-sm text-muted-foreground mb-4">Drop an image here or click to browse</p>
                <Button 
                  variant="default"
                  onClick={handleUploadClick}
                  className="bg-gradient-to-r from-artify-pink to-artify-purple hover:opacity-90 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select Image
                </Button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={onUploadImage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {image && (
        <div className="p-3 border-t flex justify-between items-center bg-white dark:bg-gray-800">
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setImageScale(prev => Math.min(prev + 0.1, 3))}
              disabled={fitToCanvas}
            >
              Zoom In
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setImageScale(prev => Math.max(prev - 0.1, 0.5))}
              disabled={fitToCanvas}
            >
              Zoom Out
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setImagePosition({ x: 0, y: 0 });
                setImageScale(1);
                setFitToCanvas(false);
              }}
              disabled={!imagePosition.x && !imagePosition.y && imageScale === 1 && !fitToCanvas}
            >
              Reset
            </Button>
            <Button
              variant={fitToCanvas ? "default" : "outline"}
              size="sm"
              onClick={() => setFitToCanvas(!fitToCanvas)}
              className={fitToCanvas ? "bg-artify-pink text-white" : ""}
            >
              {fitToCanvas ? "Free Move" : "Fit to Canvas"}
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleUploadClick}
            className="h-8 w-8"
          >
            <Upload className="h-4 w-4" />
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
  );
};

export default GridCanvas;
