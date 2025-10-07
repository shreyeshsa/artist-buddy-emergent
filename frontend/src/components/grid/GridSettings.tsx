
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GridSettingsProps {
  gridSize: number;
  setGridSize: (size: number) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  lineOpacity: number;
  setLineOpacity: (opacity: number) => void;
  showDiagonals: boolean;
  setShowDiagonals: (show: boolean) => void;
  showGridNumbers: boolean;
  setShowGridNumbers: (show: boolean) => void;
  lineColor: string;
  setLineColor: (color: string) => void;
  gridUnit: string;
  setGridUnit: (unit: string) => void;
  formatGridSize: (size: number) => string;
}

const GridSettings = ({
  gridSize,
  setGridSize,
  lineWidth,
  setLineWidth,
  lineOpacity,
  setLineOpacity,
  showDiagonals,
  setShowDiagonals,
  showGridNumbers,
  setShowGridNumbers,
  lineColor,
  setLineColor,
  gridUnit,
  setGridUnit,
  formatGridSize
}: GridSettingsProps) => {
  const [customGridSize, setCustomGridSize] = useState(gridSize);
  
  // Define standard DPI for print (300 DPI is standard for print quality)
  const STANDARD_DPI = 96; // Standard screen DPI
  
  // Pixels per unit at standard DPI
  const CM_TO_PIXELS = STANDARD_DPI / 2.54; // ~37.8 pixels per cm at 96 DPI
  const INCH_TO_PIXELS = STANDARD_DPI; // 96 pixels per inch at 96 DPI
  
  // Update preset grid sizes when unit changes
  useEffect(() => {
    setCustomGridSize(gridSize);
  }, [gridSize]);
  
  const handleGridSizeChange = (value: number) => {
    setCustomGridSize(value);
    setGridSize(value);
  };

  // Convert pixel size to display unit with better accuracy
  const pixelsToUnit = (pixels: number): number => {
    if (gridUnit === "cm") {
      return parseFloat((pixels / CM_TO_PIXELS).toFixed(2)); // Convert pixels to cm
    } else {
      return parseFloat((pixels / INCH_TO_PIXELS).toFixed(2)); // Convert pixels to inches
    }
  };
  
  // Format the display value for better visual representation
  const formatDisplayValue = (value: number): string => {
    const realValue = pixelsToUnit(value);
    
    // Format display values to show clean numbers
    if (gridUnit === "cm") {
      if (realValue >= 0.95 && realValue < 1.05) return "1.0";
      if (realValue >= 1.45 && realValue < 1.55) return "1.5";
      if (realValue >= 1.95 && realValue < 2.05) return "2.0";
      if (realValue >= 2.45 && realValue < 2.55) return "2.5";
      if (realValue >= 2.95 && realValue < 3.05) return "3.0";
      if (realValue >= 3.45 && realValue < 3.55) return "3.5";
      if (realValue >= 3.95 && realValue < 4.05) return "4.0";
      if (realValue >= 4.45 && realValue < 4.55) return "4.5";
      if (realValue >= 4.95 && realValue < 5.05) return "5.0";
    } else {
      // Similar formatting for inches if needed
      if (realValue >= 0.24 && realValue < 0.26) return "0.25";
      if (realValue >= 0.49 && realValue < 0.51) return "0.5";
      if (realValue >= 0.99 && realValue < 1.01) return "1.0";
      if (realValue >= 1.49 && realValue < 1.51) return "1.5";
    }
    
    // Default return the actual value with 1 decimal place
    return realValue.toFixed(1);
  };
  
  // Generate preset sizes based on the current unit
  const generatePresetSizes = () => {
    if (gridUnit === "cm") {
      // 1.0cm, 1.5cm, 2.0cm, 2.5cm, 3.0cm, 3.5cm, 4.0cm, 4.5cm, 5.0cm grid
      return [
        CM_TO_PIXELS * 1.0,  // 1.0cm
        CM_TO_PIXELS * 1.5,  // 1.5cm
        CM_TO_PIXELS * 2.0,  // 2.0cm
        CM_TO_PIXELS * 2.5,  // 2.5cm
        CM_TO_PIXELS * 3.0,  // 3.0cm
        CM_TO_PIXELS * 3.5,  // 3.5cm
        CM_TO_PIXELS * 4.0,  // 4.0cm
        CM_TO_PIXELS * 4.5,  // 4.5cm
        CM_TO_PIXELS * 5.0,  // 5.0cm
        CM_TO_PIXELS * 7.5,  // 7.5cm
        CM_TO_PIXELS * 10.0  // 10.0cm
      ].map(size => Math.round(size));
    } else {
      // 0.25in, 0.5in, 1in, 1.5in, 2in, 2.5in, 3in, 3.5in, 4in grid
      return [
        INCH_TO_PIXELS * 0.25, // 1/4 inch
        INCH_TO_PIXELS * 0.5,  // 1/2 inch
        INCH_TO_PIXELS * 1.0,  // 1 inch
        INCH_TO_PIXELS * 1.5,  // 1.5 inch
        INCH_TO_PIXELS * 2.0,  // 2 inch
        INCH_TO_PIXELS * 2.5,  // 2.5 inch
        INCH_TO_PIXELS * 3.0,  // 3 inch
        INCH_TO_PIXELS * 3.5,  // 3.5 inch
        INCH_TO_PIXELS * 4.0   // 4 inch
      ].map(size => Math.round(size));
    }
  };
  
  const presetGridSizes = generatePresetSizes();

  return (
    <div className="space-y-6">
      {/* Grid Size */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="grid-size">Grid Cell Size</Label>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {formatDisplayValue(gridSize)}{gridUnit}
            </span>
            <Select 
              value={gridUnit} 
              onValueChange={setGridUnit}
            >
              <SelectTrigger className="w-16 h-7">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="in">in</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="pt-2">
          <Slider
            id="grid-size"
            min={gridUnit === "cm" ? Math.round(CM_TO_PIXELS * 0.25) : Math.round(INCH_TO_PIXELS * 0.125)} // Min: 0.25cm or 1/8 inch
            max={gridUnit === "cm" ? Math.round(CM_TO_PIXELS * 10) : Math.round(INCH_TO_PIXELS * 4)} // Max: 10cm or 4 inches
            step={1}
            value={[gridSize]}
            onValueChange={(values) => setGridSize(values[0])}
            className="mb-6"
          />
          
          <div className="flex flex-wrap gap-2 mt-2">
            {presetGridSizes.map((size, index) => (
              <button
                key={index}
                className={cn(
                  "px-3 py-1 border rounded-md text-xs",
                  gridSize === size ? "bg-primary text-primary-foreground" : "bg-card"
                )}
                onClick={() => setGridSize(size)}
              >
                {formatDisplayValue(size)} {gridUnit}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Line Width */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="line-width">Line Width</Label>
          <span className="text-sm font-medium">{lineWidth}px</span>
        </div>
        <Slider
          id="line-width"
          min={1}
          max={5}
          step={1}
          value={[lineWidth]}
          onValueChange={(values) => setLineWidth(values[0])}
        />
      </div>
      
      {/* Line Opacity */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="line-opacity">Line Opacity</Label>
          <span className="text-sm font-medium">{lineOpacity}%</span>
        </div>
        <Slider
          id="line-opacity"
          min={10}
          max={100}
          step={5}
          value={[lineOpacity]}
          onValueChange={(values) => setLineOpacity(values[0])}
        />
      </div>
      
      {/* Line Color */}
      <div className="space-y-2">
        <Label htmlFor="line-color">Line Color</Label>
        <div className="flex space-x-2">
          <div 
            className="w-8 h-8 rounded-md border"
            style={{ backgroundColor: lineColor }}
          />
          <Input
            id="line-color"
            type="color"
            value={lineColor}
            onChange={(e) => setLineColor(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Show Diagonals */}
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="show-diagonals">Show Diagonals</Label>
        <Switch 
          id="show-diagonals" 
          checked={showDiagonals}
          onCheckedChange={setShowDiagonals}
        />
      </div>
      
      {/* Show Grid Numbers */}
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="show-grid-numbers">Show Grid Numbers</Label>
        <Switch 
          id="show-grid-numbers" 
          checked={showGridNumbers}
          onCheckedChange={setShowGridNumbers}
        />
      </div>
    </div>
  );
};

export default GridSettings;
