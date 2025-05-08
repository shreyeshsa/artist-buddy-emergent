
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface CanvasSettingsProps {
  canvasSize: string;
  orientation: string;
  customWidth: number;
  customHeight: number;
  customUnit: "cm" | "inches";
  onCanvasSizeChange: (value: string) => void;
  onOrientationChange: (value: string) => void;
  onCustomDimensionsChange: (width: number, height: number, unit: "cm" | "inches") => void;
  onImportClick: () => void;
}

const CanvasSettings = ({
  canvasSize,
  orientation,
  customWidth,
  customHeight,
  customUnit,
  onCanvasSizeChange,
  onOrientationChange,
  onCustomDimensionsChange,
  onImportClick
}: CanvasSettingsProps) => {
  const [width, setWidth] = useState<number>(customWidth);
  const [height, setHeight] = useState<number>(customHeight);
  const [unit, setUnit] = useState<"cm" | "inches">(customUnit);

  // Update local state when props change
  useEffect(() => {
    setWidth(customWidth);
    setHeight(customHeight);
    setUnit(customUnit);
  }, [customWidth, customHeight, customUnit]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseFloat(e.target.value);
    if (!isNaN(newWidth) && newWidth > 0) {
      setWidth(newWidth);
      onCustomDimensionsChange(newWidth, height, unit);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseFloat(e.target.value);
    if (!isNaN(newHeight) && newHeight > 0) {
      setHeight(newHeight);
      onCustomDimensionsChange(width, newHeight, unit);
    }
  };

  const handleUnitChange = (value: string) => {
    const newUnit = value as "cm" | "inches";
    
    // Convert measurements when changing units
    if (newUnit !== unit) {
      let newWidth, newHeight;
      
      if (newUnit === "cm" && unit === "inches") {
        // Convert inches to cm (1in = 2.54cm)
        newWidth = width * 2.54;
        newHeight = height * 2.54;
      } else if (newUnit === "inches" && unit === "cm") {
        // Convert cm to inches (1cm = 0.3937in)
        newWidth = width * 0.3937;
        newHeight = height * 0.3937;
      } else {
        newWidth = width;
        newHeight = height;
      }
      
      // Round to 2 decimal places
      newWidth = parseFloat(newWidth.toFixed(2));
      newHeight = parseFloat(newHeight.toFixed(2));
      
      setWidth(newWidth);
      setHeight(newHeight);
      setUnit(newUnit);
      onCustomDimensionsChange(newWidth, newHeight, newUnit);
    } else {
      setUnit(newUnit);
      onCustomDimensionsChange(width, height, newUnit);
    }
  };

  // Paper dimensions based on DIN A standard (in mm)
  const paperDimensions = {
    a2: {cm: {width: 42.0, height: 59.4}, inches: {width: 16.5, height: 23.4}},
    a3: {cm: {width: 29.7, height: 42.0}, inches: {width: 11.7, height: 16.5}},
    a4: {cm: {width: 21.0, height: 29.7}, inches: {width: 8.3, height: 11.7}}
  };

  // Update custom dimensions when paper size or orientation changes
  const handleCanvasSizeChange = (size: string) => {
    onCanvasSizeChange(size);
    
    if (size !== "custom") {
      // Set standard dimensions based on paper size
      const dimensions = paperDimensions[size as keyof typeof paperDimensions][unit];
      let newWidth = dimensions.width;
      let newHeight = dimensions.height;
      
      // Swap dimensions for landscape orientation
      if (orientation === "landscape") {
        [newWidth, newHeight] = [newHeight, newWidth];
      }
      
      setWidth(newWidth);
      setHeight(newHeight);
      onCustomDimensionsChange(newWidth, newHeight, unit);
    }
  };

  // Update dimensions when orientation changes
  const handleOrientationChange = (newOrientation: string) => {
    onOrientationChange(newOrientation);
    
    if (canvasSize !== "custom") {
      // Swap dimensions for standard paper sizes
      const dimensions = paperDimensions[canvasSize as keyof typeof paperDimensions][unit];
      let newWidth, newHeight;
      
      if (newOrientation === "landscape") {
        newWidth = dimensions.height;
        newHeight = dimensions.width;
      } else {
        newWidth = dimensions.width;
        newHeight = dimensions.height;
      }
      
      setWidth(newWidth);
      setHeight(newHeight);
      onCustomDimensionsChange(newWidth, newHeight, unit);
    } else if (width < height && newOrientation === "landscape") {
      // For custom size, suggest swapping dimensions
      setWidth(height);
      setHeight(width);
      onCustomDimensionsChange(height, width, unit);
    } else if (width > height && newOrientation === "portrait") {
      // For custom size, suggest swapping dimensions
      setWidth(height);
      setHeight(width);
      onCustomDimensionsChange(height, width, unit);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="canvas-size">Canvas Size</Label>
          <Select value={canvasSize} onValueChange={handleCanvasSizeChange}>
            <SelectTrigger id="canvas-size">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a2">A2</SelectItem>
              <SelectItem value="a3">A3</SelectItem>
              <SelectItem value="a4">A4</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="orientation">Orientation</Label>
          <Select value={orientation} onValueChange={handleOrientationChange}>
            <SelectTrigger id="orientation">
              <SelectValue placeholder="Select orientation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-3">
        <Label>Dimensions ({canvasSize === "custom" ? "Custom" : paperDimensions[canvasSize as keyof typeof paperDimensions][unit].width + " × " + paperDimensions[canvasSize as keyof typeof paperDimensions][unit].height + " " + unit})</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              min="1"
              step="0.1"
              value={width}
              onChange={handleWidthChange}
              disabled={canvasSize !== "custom"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              min="1"
              step="0.1"
              value={height}
              onChange={handleHeightChange}
              disabled={canvasSize !== "custom"}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Label>Units</Label>
          <ToggleGroup type="single" value={unit} onValueChange={handleUnitChange}>
            <ToggleGroupItem value="cm">cm</ToggleGroupItem>
            <ToggleGroupItem value="inches">inches</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          variant="outline"
          className="w-full"
          onClick={onImportClick}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import Image
        </Button>
      </div>
    </div>
  );
};

export default CanvasSettings;
