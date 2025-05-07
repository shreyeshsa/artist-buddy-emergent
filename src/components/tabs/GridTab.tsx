
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import GridCanvas from "@/components/grid/GridCanvas";
import CanvasSettings from "@/components/grid/CanvasSettings";
import GridSettings from "@/components/grid/GridSettings";
import ExportSettings from "@/components/grid/ExportSettings";

const GridTab = () => {
  // State for canvas settings
  const [canvasSize, setCanvasSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [customWidth, setCustomWidth] = useState(21); // A4 width in cm
  const [customHeight, setCustomHeight] = useState(29.7); // A4 height in cm
  const [customUnit, setCustomUnit] = useState<"cm" | "inches">("cm");
  
  // State for grid settings
  const [gridSize, setGridSize] = useState(28); // ~1cm
  const [lineWidth, setLineWidth] = useState(1);
  const [lineOpacity, setLineOpacity] = useState(50);
  const [showDiagonals, setShowDiagonals] = useState(false);
  const [showGridNumbers, setShowGridNumbers] = useState(false);
  const [lineColor, setLineColor] = useState("#333333");
  
  // Image handling
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
        toast.success('Image uploaded successfully');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to load image');
    };
    reader.readAsDataURL(file);
  };

  // Handle custom dimensions change
  const handleCustomDimensionsChange = (width: number, height: number, unit: "cm" | "inches") => {
    setCustomWidth(width);
    setCustomHeight(height);
    setCustomUnit(unit);
  };

  // Export canvas
  const exportCanvas = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.download = `grid-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Canvas exported successfully');
    } catch (err) {
      toast.error('Failed to export canvas');
      console.error('Export error:', err);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Grid Creator</h2>
        <p className="text-muted-foreground">Set up your canvas, import images, and apply custom grids</p>
      </div>

      {/* Canvas Component */}
      <GridCanvas 
        canvasSize={canvasSize}
        orientation={orientation}
        gridSize={gridSize}
        lineWidth={lineWidth}
        lineOpacity={lineOpacity}
        showDiagonals={showDiagonals}
        showGridNumbers={showGridNumbers}
        lineColor={lineColor}
        image={image}
        customWidth={customWidth}
        customHeight={customHeight}
        customUnit={customUnit}
        onUploadImage={handleImageUpload}
      />

      <Tabs defaultValue="canvas" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        
        {/* Canvas Settings */}
        <TabsContent value="canvas" className="space-y-4 mt-4">
          <CanvasSettings 
            canvasSize={canvasSize}
            orientation={orientation}
            customWidth={customWidth}
            customHeight={customHeight}
            customUnit={customUnit}
            onCanvasSizeChange={setCanvasSize}
            onOrientationChange={setOrientation}
            onCustomDimensionsChange={handleCustomDimensionsChange}
            onImportClick={() => fileInputRef.current?.click()}
          />
        </TabsContent>
        
        {/* Grid Settings */}
        <TabsContent value="grid" className="space-y-4 mt-4">
          <GridSettings 
            gridSize={gridSize}
            lineWidth={lineWidth}
            lineOpacity={lineOpacity}
            showDiagonals={showDiagonals}
            showGridNumbers={showGridNumbers}
            lineColor={lineColor}
            onGridSizeChange={setGridSize}
            onLineWidthChange={setLineWidth}
            onLineOpacityChange={setLineOpacity}
            onShowDiagonalsChange={setShowDiagonals}
            onShowGridNumbersChange={setShowGridNumbers}
            onLineColorChange={setLineColor}
          />
        </TabsContent>
        
        {/* Export Settings */}
        <TabsContent value="export" className="space-y-4 mt-4">
          <ExportSettings onExport={exportCanvas} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GridTab;
