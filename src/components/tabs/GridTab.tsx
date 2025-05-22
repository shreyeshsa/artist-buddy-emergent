import { useState, useRef } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import GridCanvas from "@/components/grid/GridCanvas";
import CanvasSettings from "@/components/grid/CanvasSettings";
import GridSettings from "@/components/grid/GridSettings";
import ExportSettings from "@/components/grid/ExportSettings";

// Standard DPI for print quality
const STANDARD_DPI = 96; // Standard screen DPI
const CM_TO_PIXELS = STANDARD_DPI / 2.54; // Pixels per cm at standard DPI

const GridTab = () => {
  // State for canvas settings
  const [canvasSize, setCanvasSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [customWidth, setCustomWidth] = useState(21); // A4 width in cm
  const [customHeight, setCustomHeight] = useState(29.7); // A4 height in cm
  const [customUnit, setCustomUnit] = useState<"cm" | "inches">("cm");
  
  // State for grid settings - initialize with 1cm grid
  const [gridSize, setGridSize] = useState(Math.round(CM_TO_PIXELS)); // ~37.8px = 1cm at 96 DPI
  const [lineWidth, setLineWidth] = useState(1);
  const [lineOpacity, setLineOpacity] = useState(50);
  const [showDiagonals, setShowDiagonals] = useState(false);
  const [showGridNumbers, setShowGridNumbers] = useState(false);
  const [lineColor, setLineColor] = useState("#333333");
  const [gridUnit, setGridUnit] = useState("cm");

  // Image handling
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Track which tab is active
  const [activeTab, setActiveTab] = useState("canvas");

  // Format grid size for display
  const formatGridSize = (size: number): string => {
    if (gridUnit === "cm") {
      const cmValue = size / CM_TO_PIXELS;
      
      // Format to clean values
      if (cmValue >= 0.95 && cmValue < 1.05) return "1.0";
      if (cmValue >= 1.45 && cmValue < 1.55) return "1.5";
      if (cmValue >= 1.95 && cmValue < 2.05) return "2.0";
      if (cmValue >= 2.45 && cmValue < 2.55) return "2.5";
      if (cmValue >= 2.95 && cmValue < 3.05) return "3.0";
      if (cmValue >= 3.45 && cmValue < 3.55) return "3.5";
      if (cmValue >= 3.95 && cmValue < 4.05) return "4.0";
      if (cmValue >= 4.45 && cmValue < 4.55) return "4.5";
      
      // Default to fixed format
      return cmValue.toFixed(1);
    } else {
      const inValue = size / STANDARD_DPI;
      return inValue.toFixed(2);
    }
  };

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

  // Export canvas with grid size information
  const exportCanvas = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    try {
      // Create a temporary canvas to add grid size information
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) {
        toast.error('Could not create canvas context');
        return;
      }
      
      // Set the temp canvas size to match the original
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      // Draw the original canvas content
      ctx.drawImage(canvas, 0, 0);
      
      // Add grid size information if the option is enabled
      const includeGridInfoCheckbox = document.getElementById('include-grid-info') as HTMLInputElement;
      if (includeGridInfoCheckbox && includeGridInfoCheckbox.checked) {
        // Set text properties
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(8, canvas.height - 30, 120, 22);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        // Add grid size text
        const gridSizeText = `Grid: ${formatGridSize(gridSize)}${gridUnit}`;
        ctx.fillText(gridSizeText, 12, canvas.height - 19);
      }
      
      // Create filename with timestamp
      let filename = `grid-${Date.now()}`;
      
      // Convert to the proper format and trigger download
      let mimeType = 'image/png';
      let extension = 'png';
      
      const formatSelect = document.querySelector('#export-format [data-value]') as HTMLElement;
      if (formatSelect) {
        const format = formatSelect.getAttribute('data-value');
        if (format === 'jpeg') {
          mimeType = 'image/jpeg';
          extension = 'jpg';
        } else if (format === 'pdf') {
          // PDF export would require additional libraries
          mimeType = 'image/png'; // Fallback to PNG
          extension = 'png';
          toast.warning('PDF export not available, saving as PNG');
        }
      }
      
      // For mobile platforms, use different approaches
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // Try to use the FileSaver API for iOS/Android
        tempCanvas.toBlob((blob) => {
          if (!blob) {
            toast.error('Failed to create image blob');
            return;
          }
          
          // Use standard download approach via URL and download attribute
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.${extension}`;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
          
          toast.success('Image saved to your device');
        }, mimeType);
      } else {
        // Traditional download approach for desktop
        const link = document.createElement('a');
        link.download = `${filename}.${extension}`;
        link.href = tempCanvas.toDataURL(mimeType);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Canvas exported successfully');
      }
    } catch (err) {
      toast.error('Failed to export canvas');
      console.error('Export error:', err);
    }
  };

  // Determine if grid tab should be enabled
  const isGridTabEnabled = canvasSize !== "" && orientation !== "";
  // Determine if export tab should be enabled
  const isExportTabEnabled = isGridTabEnabled && gridSize > 0;

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (value === "grid" && !isGridTabEnabled) {
      toast.warning("Please set canvas orientation and size first");
      return;
    }
    
    if (value === "export" && !isExportTabEnabled) {
      toast.warning("Please configure grid settings first");
      return;
    }
    
    setActiveTab(value);
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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="grid" className={!isGridTabEnabled ? "opacity-50 cursor-not-allowed" : ""}>Grid</TabsTrigger>
          <TabsTrigger value="export" className={!isExportTabEnabled ? "opacity-50 cursor-not-allowed" : ""}>Export</TabsTrigger>
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
            onGridSizeChange={(size) => {
              setGridSize(size);
              // Update gridUnit when grid size changes
              const gridUnitSelect = document.querySelector('select[id^="radix-"][data-value]') as HTMLSelectElement;
              if (gridUnitSelect) {
                setGridUnit(gridUnitSelect.value);
              }
            }}
            onLineWidthChange={setLineWidth}
            onLineOpacityChange={setLineOpacity}
            onShowDiagonalsChange={setShowDiagonals}
            onShowGridNumbersChange={setShowGridNumbers}
            onLineColorChange={setLineColor}
          />
        </TabsContent>
        
        {/* Export Settings */}
        <TabsContent value="export" className="space-y-4 mt-4">
          <ExportSettings 
            onExport={exportCanvas}
            gridSize={gridSize}
            gridUnit={gridUnit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GridTab;
