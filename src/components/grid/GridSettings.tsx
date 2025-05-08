
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
  const [presetGridSizes, setPresetGridSizes] = useState<number[]>([28, 56, 84, 112]);
  
  // Update preset grid sizes when unit changes
  useEffect(() => {
    if (gridUnit === "cm") {
      // Grid sizes in pixels for 1cm, 2cm, 3cm, 4cm at 28px/cm
      setPresetGridSizes([28, 56, 84, 112]);
    } else {
      // Grid sizes in pixels for 0.5in, 1in, 1.5in, 2in at ~72px/inch
      setPresetGridSizes([36, 72, 108, 144]);
    }
  }, [gridUnit]);
  
  const handleGridSizeChange = (value: number) => {
    setCustomGridSize(value);
    onGridSizeChange(value);
  };

  // Convert pixel size to display unit
  const pixelsToUnit = (pixels: number): number => {
    if (gridUnit === "cm") {
      return parseFloat((pixels / 28).toFixed(1)); // 28px ≈ 1cm at 96dpi
    } else {
      return parseFloat((pixels / 72).toFixed(1)); // 72px ≈ 1in at 96dpi
    }
  };

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
            min={14}
            max={gridUnit === "cm" ? 140 : 216}
            step={gridUnit === "cm" ? 7 : 9}
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
