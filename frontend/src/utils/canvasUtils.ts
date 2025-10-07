
/**
 * Utility functions for canvas operations in the Grid Creator
 */

// Standard DPI for print quality
const STANDARD_DPI = 96; // Standard screen DPI
export const CM_TO_PIXELS = STANDARD_DPI / 2.54; // Pixels per cm at standard DPI
export const INCH_TO_PIXELS = STANDARD_DPI; // Pixels per inch at standard DPI

// Draws a grid on the canvas with specified settings
export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  lineWidth: number,
  lineOpacity: number,
  lineColor: string,
  showDiagonals: boolean,
  showGridNumbers: boolean
) => {
  // Set line style
  ctx.strokeStyle = lineColor;
  ctx.globalAlpha = lineOpacity / 100;
  ctx.lineWidth = lineWidth;
  
  // Count grid cells
  const numCols = Math.ceil(width / gridSize);
  const numRows = Math.ceil(height / gridSize);
  
  // Draw vertical lines
  for (let i = 0; i <= numCols; i++) {
    const x = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Draw horizontal lines
  for (let i = 0; i <= numRows; i++) {
    const y = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Draw diagonals if enabled
  if (showDiagonals) {
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + gridSize, y + gridSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + gridSize, y);
        ctx.lineTo(x, y + gridSize);
        ctx.stroke();
      }
    }
  }
  
  // Draw grid numbers if enabled
  if (showGridNumbers) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = lineColor;
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    
    // Draw column numbers (top)
    for (let i = 1; i <= numCols; i++) {
      const x = i * gridSize - gridSize / 2;
      ctx.fillText(i.toString(), x, 10);
    }
    
    // Draw row numbers (left side)
    ctx.textAlign = "right";
    for (let i = 1; i <= numRows; i++) {
      const y = i * gridSize - gridSize / 2;
      ctx.fillText(i.toString(), 10, y + 3);
    }
  }
  
  // Reset opacity
  ctx.globalAlpha = 1;
};

// Calculate canvas dimensions based on size and orientation with accurate physical measurements
export const getCanvasDimensions = (
  canvasSize: string, 
  orientation: string,
  customWidth?: number,
  customHeight?: number,
  customUnit?: "cm" | "inches"
) => {
  let width = 0;
  let height = 0;
  
  if (canvasSize === "custom" && customWidth && customHeight) {
    // Convert cm or inches to pixels
    const conversionFactor = customUnit === "cm" ? CM_TO_PIXELS : INCH_TO_PIXELS;
    width = Math.round(customWidth * conversionFactor);
    height = Math.round(customHeight * conversionFactor);
  } else {
    // Set sizes in pixels for standard paper sizes
    const paperSizes = {
      'a4': {
        width: Math.round(21 * CM_TO_PIXELS),  // A4 width in pixels (21cm)
        height: Math.round(29.7 * CM_TO_PIXELS) // A4 height in pixels (29.7cm)
      },
      'a3': {
        width: Math.round(29.7 * CM_TO_PIXELS),  // A3 width in pixels (29.7cm)
        height: Math.round(42 * CM_TO_PIXELS)    // A3 height in pixels (42cm)
      },
      'a2': {
        width: Math.round(42 * CM_TO_PIXELS),    // A2 width in pixels (42cm)
        height: Math.round(59.4 * CM_TO_PIXELS)  // A2 height in pixels (59.4cm)
      }
    };
    
    const defaultSize = paperSizes['a4']; // Default to A4 if size not found
    const selectedSize = paperSizes[canvasSize as keyof typeof paperSizes] || defaultSize;
    
    width = selectedSize.width;
    height = selectedSize.height;
  }
  
  // Swap dimensions for landscape
  if (orientation === 'landscape') {
    [width, height] = [height, width];
  }
  
  return { width, height };
};

// Draw the canvas with background and optional image
export const drawCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  image: string | null,
  drawGridFunc: () => void
) => {
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw background (white)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Draw image if available
  if (image) {
    const img = new Image();
    img.onload = () => {
      // Calculate aspect ratio to fit the image within the canvas
      const scale = Math.min(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      drawGridFunc();
    };
    img.src = image;
  } else {
    drawGridFunc();
  }
};

// Export canvas to image
export const exportCanvasToImage = (canvas: HTMLCanvasElement, format: string = 'png'): string => {
  return canvas.toDataURL(`image/${format}`);
};
