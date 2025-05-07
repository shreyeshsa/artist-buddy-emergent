
import { colorDistance } from "@/utils/colorUtils";

export type PencilColor = {
  id: number;
  brand: string;
  name: string;
  code: string;
  color: string;
  sets: string[];
};

export type PencilColorWithAccuracy = PencilColor & {
  distance?: number;
  accuracy?: number;
};

// Mock pencil data
export const pencilBrands = ["Prismacolor", "Faber-Castell", "Caran d'Ache"];

export const pencilColors: PencilColor[] = [
  { id: 1, brand: "Prismacolor", name: "Crimson Red", code: "PC924", color: "#C41E3A", sets: ["24", "36", "72", "150"] },
  { id: 2, brand: "Prismacolor", name: "Poppy Red", code: "PC922", color: "#FF4500", sets: ["36", "72", "150"] },
  { id: 3, brand: "Prismacolor", name: "Blush Pink", code: "PC928", color: "#FFB6C1", sets: ["72", "150"] },
  { id: 4, brand: "Prismacolor", name: "Process Red", code: "PC994", color: "#ED2939", sets: ["24", "36", "72", "150"] },
  { id: 5, brand: "Prismacolor", name: "Magenta", code: "PC930", color: "#C71585", sets: ["36", "72", "150"] },
  { id: 6, brand: "Prismacolor", name: "Mulberry", code: "PC995", color: "#C54B8C", sets: ["72", "150"] },
  { id: 7, brand: "Prismacolor", name: "Violet", code: "PC932", color: "#8A2BE2", sets: ["24", "36", "72", "150"] },
  { id: 8, brand: "Prismacolor", name: "Lilac", code: "PC956", color: "#C8A2C8", sets: ["36", "72", "150"] },
  { id: 9, brand: "Prismacolor", name: "Blue Violet", code: "PC933", color: "#4169E1", sets: ["24", "36", "72", "150"] },
  { id: 10, brand: "Faber-Castell", name: "Dark Red", code: "FC118", color: "#8B0000", sets: ["24", "36", "60", "120"] },
  { id: 11, brand: "Faber-Castell", name: "Pompeian Red", code: "FC191", color: "#A52A2A", sets: ["36", "60", "120"] },
  { id: 12, brand: "Faber-Castell", name: "Middle Purple Pink", code: "FC125", color: "#DB7093", sets: ["60", "120"] },
  { id: 13, brand: "Caran d'Ache", name: "Purple", code: "CA120", color: "#800080", sets: ["40", "80"] },
  { id: 14, brand: "Caran d'Ache", name: "Ruby Red", code: "CA085", color: "#E0115F", sets: ["40", "80"] },
  { id: 15, brand: "Caran d'Ache", name: "Light Purple", code: "CA131", color: "#D8BFD8", sets: ["80"] },
];

// Function to find closest pencil matches
export const findClosestPencils = (targetColor: string): PencilColorWithAccuracy[] => {
  return pencilColors
    .map(pencil => ({
      ...pencil,
      distance: colorDistance(targetColor, pencil.color),
      accuracy: Math.max(0, Math.min(100, 100 - (colorDistance(targetColor, pencil.color) / 4)))
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 8);
};
