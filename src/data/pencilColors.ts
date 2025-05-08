
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

// Prismacolor color sets organized by set size
export const prismacolorSets = {
  "24": [
    { id: 901, name: "Indigo Blue", code: "PC901", color: "#000F89", sets: ["24", "36", "72", "150"] },
    { id: 903, name: "True Blue", code: "PC903", color: "#0047AB", sets: ["24", "36", "72", "150"] },
    { id: 904, name: "Light Cerulean Blue", code: "PC904", color: "#007BA7", sets: ["24", "36", "72", "150"] },
    { id: 908, name: "Dark Green", code: "PC908", color: "#013220", sets: ["24", "36", "72", "150"] },
    { id: 909, name: "Grass Green", code: "PC909", color: "#4D8C57", sets: ["24", "36", "72", "150"] },
    { id: 910, name: "True Green", code: "PC910", color: "#00A877", sets: ["24", "36", "72", "150"] },
    { id: 916, name: "Canary Yellow", code: "PC916", color: "#FFEF00", sets: ["24", "36", "72", "150"] },
    { id: 918, name: "Orange", code: "PC918", color: "#FF7F00", sets: ["24", "36", "72", "150"] },
    { id: 922, name: "Poppy Red", code: "PC922", color: "#FF4500", sets: ["24", "36", "72", "150"] },
    { id: 924, name: "Crimson Red", code: "PC924", color: "#C41E3A", sets: ["24", "36", "72", "150"] },
    { id: 929, name: "Pink", code: "PC929", color: "#FFC0CB", sets: ["24", "36", "72", "150"] },
    { id: 932, name: "Violet", code: "PC932", color: "#8A2BE2", sets: ["24", "36", "72", "150"] },
    { id: 933, name: "Violet Blue", code: "PC933", color: "#324AB2", sets: ["24", "36", "72", "150"] },
    { id: 935, name: "Black", code: "PC935", color: "#000000", sets: ["24", "36", "72", "150"] },
    { id: 937, name: "Tuscan Red", code: "PC937", color: "#7C3030", sets: ["24", "36", "72", "150"] },
    { id: 938, name: "White", code: "PC938", color: "#FFFFFF", sets: ["24", "36", "72", "150"] },
    { id: 939, name: "Peach", code: "PC939", color: "#FFE5B4", sets: ["24", "36", "72", "150"] },
    { id: 945, name: "Sienna Brown", code: "PC945", color: "#882D17", sets: ["24", "36", "72", "150"] },
    { id: 946, name: "Dark Brown", code: "PC946", color: "#3B2F2F", sets: ["24", "36", "72", "150"] },
    { id: 995, name: "Mulberry", code: "PC995", color: "#C54B8C", sets: ["24", "36", "72", "150"] },
    { id: 1003, name: "Spanish Orange", code: "PC1003", color: "#E86100", sets: ["24", "36", "72", "150"] },
    { id: 1008, name: "Parma Violet", code: "PC1008", color: "#9A81B5", sets: ["24", "36", "72", "150"] },
    { id: 1034, name: "Goldenrod", code: "PC1034", color: "#DAA520", sets: ["24", "36", "72", "150"] }
  ]
};

// For brevity, this contains a large subset of Prismacolor Premier, Faber-Castell Polychromos, and Caran d'Ache Luminance pencils
export const pencilColors: PencilColor[] = [
  // Prismacolor Premier colors (snippet of the full 150 set)
  { id: 901, brand: "Prismacolor", name: "Indigo Blue", code: "PC901", color: "#000F89", sets: ["24", "36", "72", "150"] },
  { id: 902, brand: "Prismacolor", name: "Ultramarine", code: "PC902", color: "#120A8F", sets: ["36", "72", "150"] },
  { id: 903, brand: "Prismacolor", name: "True Blue", code: "PC903", color: "#0047AB", sets: ["24", "36", "72", "150"] },
  { id: 904, brand: "Prismacolor", name: "Light Cerulean Blue", code: "PC904", color: "#007BA7", sets: ["24", "36", "72", "150"] },
  { id: 905, brand: "Prismacolor", name: "Aquamarine", code: "PC905", color: "#7FFFD4", sets: ["72", "150"] },
  { id: 906, brand: "Prismacolor", name: "Copenhagen Blue", code: "PC906", color: "#0047AB", sets: ["72", "150"] },
  { id: 908, brand: "Prismacolor", name: "Dark Green", code: "PC908", color: "#013220", sets: ["24", "36", "72", "150"] },
  { id: 909, brand: "Prismacolor", name: "Grass Green", code: "PC909", color: "#4D8C57", sets: ["24", "36", "72", "150"] },
  { id: 910, brand: "Prismacolor", name: "True Green", code: "PC910", color: "#00A877", sets: ["24", "36", "72", "150"] },
  { id: 911, brand: "Prismacolor", name: "Olive Green", code: "PC911", color: "#BAB86C", sets: ["36", "72", "150"] },
  { id: 912, brand: "Prismacolor", name: "Apple Green", code: "PC912", color: "#8DB600", sets: ["72", "150"] },
  { id: 913, brand: "Prismacolor", name: "Spring Green", code: "PC913", color: "#00FF7F", sets: ["72", "150"] },
  { id: 914, brand: "Prismacolor", name: "Cream", code: "PC914", color: "#FFFDD0", sets: ["36", "72", "150"] },
  { id: 915, brand: "Prismacolor", name: "Lemon Yellow", code: "PC915", color: "#FFF44F", sets: ["72", "150"] },
  { id: 916, brand: "Prismacolor", name: "Canary Yellow", code: "PC916", color: "#FFEF00", sets: ["24", "36", "72", "150"] },
  { id: 917, brand: "Prismacolor", name: "Sunburst Yellow", code: "PC917", color: "#FFCC33", sets: ["72", "150"] },
  { id: 918, brand: "Prismacolor", name: "Orange", code: "PC918", color: "#FF7F00", sets: ["24", "36", "72", "150"] },
  { id: 921, brand: "Prismacolor", name: "Pale Vermilion", code: "PC921", color: "#D99058", sets: ["36", "72", "150"] },
  { id: 922, brand: "Prismacolor", name: "Poppy Red", code: "PC922", color: "#FF4500", sets: ["24", "36", "72", "150"] },
  { id: 924, brand: "Prismacolor", name: "Crimson Red", code: "PC924", color: "#C41E3A", sets: ["24", "36", "72", "150"] },
  { id: 925, brand: "Prismacolor", name: "Crimson Lake", code: "PC925", color: "#DC143C", sets: ["72", "150"] },
  { id: 926, brand: "Prismacolor", name: "Carmine Red", code: "PC926", color: "#FF0038", sets: ["36", "72", "150"] },
  { id: 927, brand: "Prismacolor", name: "Light Peach", code: "PC927", color: "#FFDAB9", sets: ["36", "72", "150"] },
  { id: 928, brand: "Prismacolor", name: "Blush Pink", code: "PC928", color: "#FFB6C1", sets: ["72", "150"] },
  { id: 929, brand: "Prismacolor", name: "Pink", code: "PC929", color: "#FFC0CB", sets: ["24", "36", "72", "150"] },
  { id: 930, brand: "Prismacolor", name: "Magenta", code: "PC930", color: "#C71585", sets: ["72", "150"] },
  
  // Faber-Castell Polychromos (partial set)
  { id: 1101, brand: "Faber-Castell", name: "White", code: "FC101", color: "#FFFFFF", sets: ["24", "36", "60", "120"] },
  { id: 1102, brand: "Faber-Castell", name: "Cream", code: "FC102", color: "#FFFDD0", sets: ["60", "120"] },
  { id: 1103, brand: "Faber-Castell", name: "Ivory", code: "FC103", color: "#FFFFF0", sets: ["120"] },
  { id: 1104, brand: "Faber-Castell", name: "Light Yellow Glaze", code: "FC104", color: "#FFFFE0", sets: ["120"] },
  { id: 1105, brand: "Faber-Castell", name: "Light Cadmium Yellow", code: "FC105", color: "#FFFF99", sets: ["36", "60", "120"] },
  { id: 1106, brand: "Faber-Castell", name: "Light Chrome Yellow", code: "FC106", color: "#FFFF66", sets: ["120"] },
  { id: 1107, brand: "Faber-Castell", name: "Cadmium Yellow", code: "FC107", color: "#FFFF00", sets: ["24", "36", "60", "120"] },
  { id: 1108, brand: "Faber-Castell", name: "Dark Cadmium Yellow", code: "FC108", color: "#FFD700", sets: ["60", "120"] },
  { id: 1109, brand: "Faber-Castell", name: "Dark Chrome Yellow", code: "FC109", color: "#FFC125", sets: ["120"] },
  { id: 1110, brand: "Faber-Castell", name: "Phthalo Blue", code: "FC110", color: "#000F89", sets: ["24", "36", "60", "120"] },
  { id: 1111, brand: "Faber-Castell", name: "Cadmium Orange", code: "FC111", color: "#FF6103", sets: ["24", "36", "60", "120"] },
  { id: 1112, brand: "Faber-Castell", name: "Leaf Green", code: "FC112", color: "#4F7942", sets: ["36", "60", "120"] },
  { id: 1113, brand: "Faber-Castell", name: "Orange Glaze", code: "FC113", color: "#FF9966", sets: ["120"] },
  { id: 1114, brand: "Faber-Castell", name: "Light Cobalt Turquoise", code: "FC114", color: "#48D1CC", sets: ["120"] },
  { id: 1115, brand: "Faber-Castell", name: "Dark Cadmium Orange", code: "FC115", color: "#FF5500", sets: ["60", "120"] },
  { id: 1116, brand: "Faber-Castell", name: "Apricot", code: "FC116", color: "#FBCEB1", sets: ["120"] },
  { id: 1117, brand: "Faber-Castell", name: "Light Cadmium Red", code: "FC117", color: "#FF3333", sets: ["60", "120"] },
  { id: 1118, brand: "Faber-Castell", name: "Scarlet Red", code: "FC118", color: "#FF2400", sets: ["24", "36", "60", "120"] },
  { id: 1119, brand: "Faber-Castell", name: "Light Magenta", code: "FC119", color: "#FF99CC", sets: ["120"] },
  { id: 1120, brand: "Faber-Castell", name: "Ultramarine", code: "FC120", color: "#120A8F", sets: ["24", "36", "60", "120"] },
  { id: 1121, brand: "Faber-Castell", name: "Pale Geranium Lake", code: "FC121", color: "#E63244", sets: ["60", "120"] },
  
  // Caran d'Ache Luminance (partial set)
  { id: 2001, brand: "Caran d'Ache", name: "White", code: "CA001", color: "#FFFFFF", sets: ["20", "40", "76", "100"] },
  { id: 2002, brand: "Caran d'Ache", name: "Silver Grey", code: "CA002", color: "#C0C0C0", sets: ["40", "76", "100"] },
  { id: 2003, brand: "Caran d'Ache", name: "Slate Grey", code: "CA003", color: "#708090", sets: ["76", "100"] },
  { id: 2004, brand: "Caran d'Ache", name: "Steel Grey", code: "CA004", color: "#71797E", sets: ["100"] },
  { id: 2009, brand: "Caran d'Ache", name: "Black", code: "CA009", color: "#000000", sets: ["20", "40", "76", "100"] },
  { id: 2010, brand: "Caran d'Ache", name: "Ivory Black", code: "CA010", color: "#0A0A0A", sets: ["100"] },
  { id: 2011, brand: "Caran d'Ache", name: "Grey Brown", code: "CA011", color: "#503D33", sets: ["76", "100"] },
  { id: 2014, brand: "Caran d'Ache", name: "Raw Umber", code: "CA014", color: "#826644", sets: ["40", "76", "100"] },
  { id: 2015, brand: "Caran d'Ache", name: "Sepia", code: "CA015", color: "#704214", sets: ["76", "100"] },
  { id: 2030, brand: "Caran d'Ache", name: "Burnt Sienna", code: "CA030", color: "#E97451", sets: ["20", "40", "76", "100"] },
  { id: 2034, brand: "Caran d'Ache", name: "Burnt Ochre", code: "CA034", color: "#BB8B54", sets: ["76", "100"] },
  { id: 2036, brand: "Caran d'Ache", name: "Brown Ochre", code: "CA036", color: "#AA8C69", sets: ["100"] },
  { id: 2037, brand: "Caran d'Ache", name: "Olive Brown", code: "CA037", color: "#6B8E23", sets: ["76", "100"] },
  { id: 2040, brand: "Caran d'Ache", name: "Brownish Beige", code: "CA040", color: "#C19A6B", sets: ["100"] },
  { id: 2043, brand: "Caran d'Ache", name: "Bister", code: "CA043", color: "#3B2F2F", sets: ["100"] },
  { id: 2046, brand: "Caran d'Ache", name: "Olive Yellow", code: "CA046", color: "#BAB86C", sets: ["76", "100"] },
  { id: 2049, brand: "Caran d'Ache", name: "Olive Brown 50%", code: "CA049", color: "#556B2F", sets: ["100"] },
  { id: 2059, brand: "Caran d'Ache", name: "Raw Umber 10%", code: "CA059", color: "#D2B48C", sets: ["100"] },
  { id: 2060, brand: "Caran d'Ache", name: "Light Flesh 10%", code: "CA060", color: "#FFDAB9", sets: ["100"] },
  { id: 2061, brand: "Caran d'Ache", name: "Light Flesh", code: "CA061", color: "#FFE5B4", sets: ["20", "40", "76", "100"] }
];

// Pencil brands array for filters
export const pencilBrands = ["Prismacolor", "Faber-Castell", "Caran d'Ache"];

// Function to find closest pencil matches
export const findClosestPencils = (targetColor: string): PencilColorWithAccuracy[] => {
  return pencilColors
    .map(pencil => ({
      ...pencil,
      distance: colorDistance(targetColor, pencil.color),
      accuracy: Math.max(0, Math.min(100, 100 - (colorDistance(targetColor, pencil.color) / 4)))
    }))
    .sort((a, b) => a.distance! - b.distance!)
    .slice(0, 8);
};
