
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GridSettingsProps {
  gridSize: number;
  lineWidth: number;
  lineOpacity: number;
  showDiagonals: boolean;
  showGridNumbers: boolean;
  lineColor: string;
  onGridSizeChange: (size: number) => void;
  onLineWidthChange: (width: number) => void;
  onLineOpacityChange: (opacity: number) => void;
  onShowDiagonalsChange: (show: boolean) => void;
  onShowGridNumbersChange: (show: boolean) => void;
  onLineColorChange: (color: string) => void;
}

const GridSettings = ({
  gridSize,
  lineWidth,
  lineOpacity,
  showDiagonals,
  showGridNumbers,
  lineColor,
  onGridSizeChange,
  onLineWidthChange,
  onLineOpacityChange,
  onShowDiagonalsChange,
  onShowGridNumbersChange,
  onLineColorChange
}: GridSettingsProps) => {
  const [customGridSize, setCustomGridSize] = useState(gridSize);
  const [gridUnit, setGridUnit] = useState("cm");
  
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
    onGridSizeChange(value);
  };

  // Convert pixel size to display unit with better accuracy
  const pixelsToUnit = (pixels: number): number => {
    if (gridUnit === "cm") {
      return parseFloat((pixels / CM_TO_PIXELS).toFixed(2)); // Convert pixels to cm
    } else {
      return parseFloat((pixels / INCH_TO_PIXELS).toFixed(2)); // Convert pixels to inches
    }
  };
  
  // Generate preset sizes based on the current unit
  const generatePresetSizes = () => {
    if (gridUnit === "cm") {
      // 0.5cm, 1cm, 2cm, 5cm grid
      return [
        CM_TO_PIXELS * 0.5,  // ~19 pixels (0.5cm)
        CM_TO_PIXELS,        // ~38 pixels (1cm)
        CM_TO_PIXELS * 2,    // ~76 pixels (2cm)
        CM_TO_PIXELS * 5     // ~189 pixels (5cm)
      ].map(size => Math.round(size));
    } else {
      // 0.25in, 0.5in, 1in, 2in grid
      return [
        INCH_TO_PIXELS * 0.25, // 24 pixels (1/4 inch)
        INCH_TO_PIXELS * 0.5,  // 48 pixels (1/2 inch)
        INCH_TO_PIXELS,        // 96 pixels (1 inch)
        INCH_TO_PIXELS * 2     // 192 pixels (2 inches)
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
              {pixelsToUnit(gridSize)}{gridUnit}
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
            onValueChange={(values) => onGridSizeChange(values[0])}
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
                onClick={() => onGridSizeChange(size)}
              >
                {pixelsToUnit(size)} {gridUnit}
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
          onValueChange={(values) => onLineWidthChange(values[0])}
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
          onValueChange={(values) => onLineOpacityChange(values[0])}
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
            onChange={(e) => onLineColorChange(e.target.value)}
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
          onCheckedChange={onShowDiagonalsChange}
        />
      </div>
      
      {/* Show Grid Numbers */}
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="show-grid-numbers">Show Grid Numbers</Label>
        <Switch 
          id="show-grid-numbers" 
          checked={showGridNumbers}
          onCheckedChange={onShowGridNumbersChange}
        />
      </div>
    </div>
  );
};

export default GridSettings;
