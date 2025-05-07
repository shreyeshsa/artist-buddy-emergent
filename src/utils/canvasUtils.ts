
/**
 * Utility functions for canvas operations in the Grid Creator
 */

// Draws a grid on the canvas with specified settings
export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  lineWidth: number,
  lineOpacity: number,
  lineColor: string,
  showDiagonals: boolean
) => {
  // Set line style
  ctx.strokeStyle = lineColor;
  ctx.globalAlpha = lineOpacity / 100;
  ctx.lineWidth = lineWidth;
  
  // Draw vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Draw horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
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
  
  // Reset opacity
  ctx.globalAlpha = 1;
};

// Calculate canvas dimensions based on size and orientation
export const getCanvasDimensions = (canvasSize: string, orientation: string) => {
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
