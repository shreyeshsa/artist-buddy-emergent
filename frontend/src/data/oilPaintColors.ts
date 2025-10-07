import { colorDistance } from "@/utils/colorUtils";

export type OilPaintColor = {
  id: number;
  brand: string;
  name: string;
  code: string;
  color: string;
  isPrimary?: boolean;
};

export type OilPaintMix = {
  colors: { name: string; color: string; ratio: number }[];
  accuracy: number;
  totalParts: number;
};

// Basic oil paint colors - 12 color palette
export const oilPaintColors: OilPaintColor[] = [
  // Primary colors
  { id: 1, brand: "Oil Paint", name: "Cadmium Red", code: "OP001", color: "#E30022", isPrimary: true },
  { id: 2, brand: "Oil Paint", name: "Cadmium Yellow", code: "OP002", color: "#FFF600", isPrimary: true },
  { id: 3, brand: "Oil Paint", name: "Ultramarine Blue", code: "OP003", color: "#120A8F", isPrimary: true },
  
  // Secondary and tertiary colors
  { id: 4, brand: "Oil Paint", name: "Titanium White", code: "OP004", color: "#FFFFFF" },
  { id: 5, brand: "Oil Paint", name: "Ivory Black", code: "OP005", color: "#0A0A0A" },
  { id: 6, brand: "Oil Paint", name: "Burnt Sienna", code: "OP006", color: "#E97451" },
  { id: 7, brand: "Oil Paint", name: "Burnt Umber", code: "OP007", color: "#8A3324" },
  { id: 8, brand: "Oil Paint", name: "Yellow Ochre", code: "OP008", color: "#CB9D06" },
  { id: 9, brand: "Oil Paint", name: "Viridian Green", code: "OP009", color: "#40826D" },
  { id: 10, brand: "Oil Paint", name: "Alizarin Crimson", code: "OP010", color: "#E32636" },
  { id: 11, brand: "Oil Paint", name: "Cerulean Blue", code: "OP011", color: "#007BA7" },
  { id: 12, brand: "Oil Paint", name: "Phthalo Green", code: "OP012", color: "#123524" },
];

// Function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Function to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

// Function to mix two colors
function mixColors(color1: string, color2: string, ratio1: number, ratio2: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const total = ratio1 + ratio2;
  const weight1 = ratio1 / total;
  const weight2 = ratio2 / total;
  
  const r = rgb1.r * weight1 + rgb2.r * weight2;
  const g = rgb1.g * weight1 + rgb2.g * weight2;
  const b = rgb1.b * weight1 + rgb2.b * weight2;
  
  return rgbToHex(r, g, b);
}

// Function to find best oil paint mixes for a target color
export function findOilPaintMixes(targetColor: string): OilPaintMix[] {
  const mixes: OilPaintMix[] = [];
  
  // Single color matches
  oilPaintColors.forEach(paint => {
    const distance = colorDistance(targetColor, paint.color);
    const accuracy = Math.max(0, Math.min(100, 100 - (distance / 4)));
    
    if (accuracy > 50) {
      mixes.push({
        colors: [{ name: paint.name, color: paint.color, ratio: 1 }],
        accuracy,
        totalParts: 1,
      });
    }
  });
  
  // Two color mixes
  for (let i = 0; i < oilPaintColors.length; i++) {
    for (let j = i + 1; j < oilPaintColors.length; j++) {
      const paint1 = oilPaintColors[i];
      const paint2 = oilPaintColors[j];
      
      // Try different ratios
      const ratios = [
        [3, 1], [2, 1], [1, 1], [1, 2], [1, 3],
        [4, 1], [3, 2], [2, 3], [1, 4]
      ];
      
      ratios.forEach(([ratio1, ratio2]) => {
        const mixedColor = mixColors(paint1.color, paint2.color, ratio1, ratio2);
        const distance = colorDistance(targetColor, mixedColor);
        const accuracy = Math.max(0, Math.min(100, 100 - (distance / 4)));
        
        if (accuracy > 60) {
          mixes.push({
            colors: [
              { name: paint1.name, color: paint1.color, ratio: ratio1 },
              { name: paint2.name, color: paint2.color, ratio: ratio2 }
            ],
            accuracy,
            totalParts: ratio1 + ratio2,
          });
        }
      });
    }
  }
  
  // Three color mixes (limited combinations for performance)
  const primaryPaints = oilPaintColors.filter(p => p.isPrimary || p.name.includes("White") || p.name.includes("Black"));
  
  for (let i = 0; i < primaryPaints.length; i++) {
    for (let j = i + 1; j < primaryPaints.length; j++) {
      for (let k = j + 1; k < primaryPaints.length; k++) {
        const paint1 = primaryPaints[i];
        const paint2 = primaryPaints[j];
        const paint3 = primaryPaints[k];
        
        // Try a few balanced ratios
        const ratios = [
          [2, 1, 1], [1, 2, 1], [1, 1, 2], [1, 1, 1]
        ];
        
        ratios.forEach(([ratio1, ratio2, ratio3]) => {
          // Mix first two colors, then mix result with third
          const tempMix = mixColors(paint1.color, paint2.color, ratio1, ratio2);
          const finalMix = mixColors(tempMix, paint3.color, ratio1 + ratio2, ratio3);
          
          const distance = colorDistance(targetColor, finalMix);
          const accuracy = Math.max(0, Math.min(100, 100 - (distance / 4)));
          
          if (accuracy > 65) {
            mixes.push({
              colors: [
                { name: paint1.name, color: paint1.color, ratio: ratio1 },
                { name: paint2.name, color: paint2.color, ratio: ratio2 },
                { name: paint3.name, color: paint3.color, ratio: ratio3 }
              ],
              accuracy,
              totalParts: ratio1 + ratio2 + ratio3,
            });
          }
        });
      }
    }
  }
  
  // Sort by accuracy and return top matches
  return mixes
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 10);
}
