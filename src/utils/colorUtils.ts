
// Function to convert RGB to HEX
export const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
};

// Function to calculate color distance (simple Euclidean distance in RGB space)
export const colorDistance = (color1: string, color2: string) => {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
};

// Simple color quantization to extract dominant colors
export const extractDominantColors = (imageData: ImageData, maxColors: number = 8) => {
  const pixels = imageData.data;
  const colors: {[key: string]: number} = {};
  
  // Sample pixels (every 10th pixel to improve performance)
  for (let i = 0; i < pixels.length; i += 40) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    const hex = rgbToHex(r, g, b);
    colors[hex] = (colors[hex] || 0) + 1;
  }
  
  // Sort colors by frequency and take the top maxColors
  return Object.entries(colors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors)
    .map(([color]) => color);
};

// Function to convert RGB to HEX with proper formatting (aliased for consistent naming)
export const rgbToHexColor = rgbToHex;
