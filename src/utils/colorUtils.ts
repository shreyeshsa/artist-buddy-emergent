
/**
 * Utility functions for color operations
 */

// Function to convert RGB to HEX
export const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
};

// Alias the rgbToHex function for consistent naming
export const rgbToHexColor = rgbToHex;

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

// Convert hex to RGB
export const hexToRgb = (hex: string) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
};

// Convert RGB to HSL
export const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h *= 60;
  }
  
  return { h, s: s * 100, l: l * 100 };
};

// Convert HSL to RGB
export const hslToRgb = (h: number, s: number, l: number) => {
  h = h % 360;
  s = s / 100;
  l = l / 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r, g, b;
  if (h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
};

// Convert HSL to Hex
export const hslToHex = (h: number, s: number, l: number) => {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

// Convert Hex to HSL
export const hexToHsl = (hex: string) => {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
};

// Calculate color blend modes
export const blendColors = (color1: string, color2: string, mode: string) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  let r, g, b;
  
  switch (mode) {
    case 'additive': // Light mixing (screens)
      r = Math.min(rgb1.r + rgb2.r, 255);
      g = Math.min(rgb1.g + rgb2.g, 255);
      b = Math.min(rgb1.b + rgb2.b, 255);
      break;
    case 'average': // Simple average
      r = Math.round((rgb1.r + rgb2.r) / 2);
      g = Math.round((rgb1.g + rgb2.g) / 2);
      b = Math.round((rgb1.b + rgb2.b) / 2);
      break;
    case 'subtractive': // Pigment mixing (more realistic)
      // Convert to CMY space
      const cmy1 = {
        c: 1 - rgb1.r / 255,
        m: 1 - rgb1.g / 255,
        y: 1 - rgb1.b / 255
      };
      const cmy2 = {
        c: 1 - rgb2.r / 255,
        m: 1 - rgb2.g / 255,
        y: 1 - rgb2.b / 255
      };
      
      // Mix in CMY
      const cmyResult = {
        c: (cmy1.c + cmy2.c) * 0.65, // Adjust multiplier for more realistic mixing
        m: (cmy1.m + cmy2.m) * 0.65,
        y: (cmy1.y + cmy2.y) * 0.65
      };
      
      // Convert back to RGB
      r = Math.round((1 - cmyResult.c) * 255);
      g = Math.round((1 - cmyResult.m) * 255);
      b = Math.round((1 - cmyResult.y) * 255);
      break;
    default:
      r = Math.round((rgb1.r + rgb2.r) / 2);
      g = Math.round((rgb1.g + rgb2.g) / 2);
      b = Math.round((rgb1.b + rgb2.b) / 2);
  }
  
  return rgbToHex(r, g, b);
};

// Get approximate color name from hex value
export const getColorName = (hex: string) => {
  const { h, s, l } = hexToHsl(hex);
  
  // Define basic color names by hue ranges
  const hueNames = [
    { name: "Red", range: [355, 10] },
    { name: "Orange", range: [11, 40] },
    { name: "Yellow", range: [41, 70] },
    { name: "Green", range: [71, 150] },
    { name: "Cyan", range: [151, 190] },
    { name: "Blue", range: [191, 260] },
    { name: "Purple", range: [261, 305] },
    { name: "Magenta", range: [306, 354] }
  ];
  
  // Find the basic color name by hue
  let colorName = "";
  for (const hue of hueNames) {
    if (hue.range[0] <= hue.range[1]) {
      // Normal range
      if (h >= hue.range[0] && h <= hue.range[1]) {
        colorName = hue.name;
        break;
      }
    } else {
      // Range that wraps around (e.g. red)
      if (h >= hue.range[0] || h <= hue.range[1]) {
        colorName = hue.name;
        break;
      }
    }
  }
  
  // If no color name was found, use "Gray"
  if (!colorName) colorName = "Gray";
  
  // Add modifiers based on saturation and lightness
  let prefix = "";
  if (s < 10) {
    return l < 20 ? "Black" : l > 80 ? "White" : "Gray";
  } else if (s < 30) {
    prefix = "Grayish ";
  }
  
  if (l < 25) {
    prefix = "Dark " + prefix;
  } else if (l > 75) {
    prefix = "Light " + prefix;
  }
  
  return prefix + colorName;
};
