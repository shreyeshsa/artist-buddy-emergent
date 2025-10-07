/**
 * Utility functions for color operations
 */

// Function to convert RGB to HEX
export const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
};

// Alias the rgbToHex function for consistent naming
export const rgbToHexColor = rgbToHex;

const rgbToLab = (r: number, g: number, b: number) => {
  let x = r / 255;
  let y = g / 255;
  let z = b / 255;

  x = x > 0.04045 ? Math.pow((x + 0.055) / 1.055, 2.4) : x / 12.92;
  y = y > 0.04045 ? Math.pow((y + 0.055) / 1.055, 2.4) : y / 12.92;
  z = z > 0.04045 ? Math.pow((z + 0.055) / 1.055, 2.4) : z / 12.92;

  x = x * 100;
  y = y * 100;
  z = z * 100;

  x = x * 0.4124 + y * 0.3576 + z * 0.1805;
  y = x * 0.2126 + y * 0.7152 + z * 0.0722;
  z = x * 0.0193 + y * 0.1192 + z * 0.9505;

  x = x / 95.047;
  y = y / 100.0;
  z = z / 108.883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return {
    l: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z)
  };
};

export const colorDistanceCIE94 = (color1: string, color2: string) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const lab1 = rgbToLab(rgb1.r, rgb1.g, rgb1.b);
  const lab2 = rgbToLab(rgb2.r, rgb2.g, rgb2.b);

  const kL = 1;
  const kC = 1;
  const kH = 1;
  const k1 = 0.045;
  const k2 = 0.015;

  const deltaL = lab1.l - lab2.l;
  const c1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
  const c2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
  const deltaC = c1 - c2;
  const deltaA = lab1.a - lab2.a;
  const deltaB = lab1.b - lab2.b;
  const deltaH = Math.sqrt(deltaA * deltaA + deltaB * deltaB - deltaC * deltaC);

  const sL = 1;
  const sC = 1 + k1 * c1;
  const sH = 1 + k2 * c1;

  const term1 = deltaL / (kL * sL);
  const term2 = deltaC / (kC * sC);
  const term3 = deltaH / (kH * sH);

  return Math.sqrt(term1 * term1 + term2 * term2 + term3 * term3);
};

export const colorDistance = colorDistanceCIE94;

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

// Convert HSV to RGB
export const hsvToRgb = (h: number, s: number, v: number) => {
  h = h % 1;
  s = Math.max(0, Math.min(1, s));
  v = Math.max(0, Math.min(1, v));
  
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  
  let r, g, b;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = v; g = t; b = p;
  }
  
  return { 
    r: Math.round(r * 255), 
    g: Math.round(g * 255), 
    b: Math.round(b * 255) 
  };
};

// Convert HSV to Hex - add this new function
export const hsvToHex = (h: number, s: number, v: number) => {
  // Normalize inputs if passed as 0-360, 0-100, 0-100
  const normalizedH = h > 1 ? h / 360 : h;
  const normalizedS = s > 1 ? s / 100 : s;
  const normalizedV = v > 1 ? v / 100 : v;
  
  const rgb = hsvToRgb(normalizedH, normalizedS, normalizedV);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

// Calculate color blend modes
export const mixColorsWeighted = (colors: Array<{color: string, ratio: number}>) => {
  if (colors.length === 0) return '#FFFFFF';
  if (colors.length === 1) return colors[0].color;

  const totalRatio = colors.reduce((sum, c) => sum + c.ratio, 0);

  let rSum = 0, gSum = 0, bSum = 0;

  for (const {color, ratio} of colors) {
    const rgb = hexToRgb(color);
    const weight = ratio / totalRatio;
    rSum += rgb.r * rgb.r * weight;
    gSum += rgb.g * rgb.g * weight;
    bSum += rgb.b * rgb.b * weight;
  }

  const r = Math.round(Math.sqrt(rSum));
  const g = Math.round(Math.sqrt(gSum));
  const b = Math.round(Math.sqrt(bSum));

  return rgbToHex(r, g, b);
};

export const blendColors = (color1: string, color2: string, mode: string) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  let r, g, b;

  switch (mode) {
    case 'additive':
      r = Math.min(rgb1.r + rgb2.r, 255);
      g = Math.min(rgb1.g + rgb2.g, 255);
      b = Math.min(rgb1.b + rgb2.b, 255);
      break;
    case 'average':
      r = Math.round((rgb1.r + rgb2.r) / 2);
      g = Math.round((rgb1.g + rgb2.g) / 2);
      b = Math.round((rgb1.b + rgb2.b) / 2);
      break;
    case 'subtractive':
      r = Math.round(Math.sqrt((rgb1.r * rgb1.r + rgb2.r * rgb2.r) / 2));
      g = Math.round(Math.sqrt((rgb1.g * rgb1.g + rgb2.g * rgb2.g) / 2));
      b = Math.round(Math.sqrt((rgb1.b * rgb1.b + rgb2.b * rgb2.b) / 2));
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
