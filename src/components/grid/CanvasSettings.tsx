
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Upload } from "lucide-react";

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
    setUnit(newUnit);
    onCustomDimensionsChange(width, height, newUnit);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="canvas-size">Canvas Size</Label>
          <Select value={canvasSize} onValueChange={onCanvasSizeChange}>
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
          <Select value={orientation} onValueChange={onOrientationChange}>
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
      
      {canvasSize === "custom" && (
        <div className="space-y-3">
          <Label>Custom dimensions</Label>
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
      )}
      
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
