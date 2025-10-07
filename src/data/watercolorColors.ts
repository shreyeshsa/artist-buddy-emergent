export type WatercolorColor = {
  id: number;
  brand: string;
  name: string;
  code: string;
  color: string;
  sets: string[];
};

// Watercolor colors database
export const watercolorColors: WatercolorColor[] = [
  // Winsor & Newton Professional Watercolors
  { id: 1, brand: "Winsor & Newton", name: "Cadmium Red", code: "WN094", color: "#E30022", sets: ["12", "24", "36"] },
  { id: 2, brand: "Winsor & Newton", name: "Cadmium Yellow", code: "WN108", color: "#FFF600", sets: ["12", "24", "36"] },
  { id: 3, brand: "Winsor & Newton", name: "French Ultramarine", code: "WN263", color: "#120A8F", sets: ["12", "24", "36"] },
  { id: 4, brand: "Winsor & Newton", name: "Viridian", code: "WN692", color: "#40826D", sets: ["12", "24", "36"] },
  { id: 5, brand: "Winsor & Newton", name: "Burnt Sienna", code: "WN074", color: "#E97451", sets: ["12", "24", "36"] },
  { id: 6, brand: "Winsor & Newton", name: "Burnt Umber", code: "WN076", color: "#8A3324", sets: ["12", "24", "36"] },
  { id: 7, brand: "Winsor & Newton", name: "Yellow Ochre", code: "WN744", color: "#CB9D06", sets: ["12", "24", "36"] },
  { id: 8, brand: "Winsor & Newton", name: "Alizarin Crimson", code: "WN004", color: "#E32636", sets: ["12", "24", "36"] },
  { id: 9, brand: "Winsor & Newton", name: "Prussian Blue", code: "WN538", color: "#003153", sets: ["24", "36"] },
  { id: 10, brand: "Winsor & Newton", name: "Payne's Gray", code: "WN465", color: "#536878", sets: ["24", "36"] },
  { id: 11, brand: "Winsor & Newton", name: "Sap Green", code: "WN599", color: "#507D2A", sets: ["24", "36"] },
  { id: 12, brand: "Winsor & Newton", name: "Cerulean Blue", code: "WN137", color: "#007BA7", sets: ["24", "36"] },
  { id: 13, brand: "Winsor & Newton", name: "Permanent Rose", code: "WN502", color: "#FF66CC", sets: ["12", "24", "36"] },
  { id: 14, brand: "Winsor & Newton", name: "Lemon Yellow", code: "WN347", color: "#FFF44F", sets: ["12", "24", "36"] },
  { id: 15, brand: "Winsor & Newton", name: "Cobalt Blue", code: "WN178", color: "#0047AB", sets: ["12", "24", "36"] },
  { id: 16, brand: "Winsor & Newton", name: "Permanent Alizarin Crimson", code: "WN466", color: "#DC143C", sets: ["24", "36"] },
  { id: 17, brand: "Winsor & Newton", name: "Winsor Green", code: "WN719", color: "#00A86B", sets: ["24", "36"] },
  { id: 18, brand: "Winsor & Newton", name: "Winsor Blue", code: "WN707", color: "#0047AB", sets: ["12", "24", "36"] },
  { id: 19, brand: "Winsor & Newton", name: "Sepia", code: "WN609", color: "#704214", sets: ["24", "36"] },
  { id: 20, brand: "Winsor & Newton", name: "Ivory Black", code: WN331", color: "#0A0A0A", sets: ["12", "24", "36"] },
  { id: 21, brand: "Winsor & Newton", name: "Chinese White", code: "WN150", color: "#FFFFFF", sets: ["24", "36"] },
  { id: 22, brand: "Winsor & Newton", name: "Raw Umber", code: "WN554", color: "#826644", sets: ["24", "36"] },
  { id: 23, brand: "Winsor & Newton", name: "Hooker's Green", code: "WN311", color: "#234F1E", sets: ["24", "36"] },
  { id: 24, brand: "Winsor & Newton", name: "Cadmium Orange", code: "WN089", color: "#FF6103", sets: ["24", "36"] },
  { id: 25, brand: "Winsor & Newton", name: "Vermillion", code: "WN682", color: "#E34234", sets: ["24", "36"] },
  { id: 26, brand: "Winsor & Newton", name: "Terre Verte", code: "WN637", color: "#8F9779", sets: ["36"] },
  { id: 27, brand: "Winsor & Newton", name: "Oxide of Chromium", code: "WN459", color: "#677179", sets: ["36"] },
  { id: 28, brand: "Winsor & Newton", name: "Indigo", code: "WN321", color: "#000F89", sets: ["36"] },
  { id: 29, brand: "Winsor & Newton", name: "Naples Yellow", code: "WN422", color: "#FADA5E", sets: ["36"] },
  { id: 30, brand: "Winsor & Newton", name: "Light Red", code: "WN362", color: "#D4473D", sets: ["36"] },
  { id: 31, brand: "Winsor & Newton", name: "Rose Madder", code: "WN587", color: "#E32636", sets: ["36"] },
  { id: 32, brand: "Winsor & Newton", name: "Olive Green", code: "WN447", color: "#BAB86C", sets: ["36"] },
  { id: 33, brand: "Winsor & Newton", name: "Permanent Magenta", code: "WN489", color: "#C71585", sets: ["36"] },
  { id: 34, brand: "Winsor & Newton", name: "Quinacridone Red", code: "WN548", color: "#C71585", sets: ["36"] },
  { id: 35, brand: "Winsor & Newton", name: "Cobalt Turquoise", code: "WN191", color: "#00CED1", sets: ["36"] },
  { id: 36, brand: "Winsor & Newton", name: "Dioxazine Violet", code: "WN231", color: "#8A2BE2", sets: ["36"] },
];

export const watercolorBrands = ["Winsor & Newton"];
