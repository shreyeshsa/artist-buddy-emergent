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
  gridUnit: string;
  onGridSizeChange: (size: number) => void;
  onLineWidthChange: (width: number) => void;
  onLineOpacityChange: (opacity: number) => void;
  onShowDiagonalsChange: (show: boolean) => void;
  onShowGridNumbersChange: (show: boolean) => void;
  onLineColorChange: (color: string) => void;
  onGridUnitChange: (unit: string) => void;
  formatGridSize: (size: number) => string;
}

const GridSettings = ({
  gridSize,
  lineWidth,
  lineOpacity,
  showDiagonals,
  showGridNumbers,
  lineColor,
  gridUnit,
  onGridSizeChange,
  onLineWidthChange,
  onLineOpacityChange,
  onShowDiagonalsChange,
  onShowGridNumbersChange,
  onLineColorChange,
  onGridUnitChange,
  formatGridSize
}: GridSettingsProps) => {
  const STANDARD_DPI = 96;
  const CM_TO_PIXELS = STANDARD_DPI / 2.54;
  const INCH_TO_PIXELS = STANDARD_DPI;

  const generatePresetSizes = () => {
    if (gridUnit === "cm") {
      return [
        CM_TO_PIXELS * 1.0,
        CM_TO_PIXELS * 1.5,
        CM_TO_PIXELS * 2.0,
        CM_TO_PIXELS * 2.5,
        CM_TO_PIXELS * 3.0,
        CM_TO_PIXELS * 3.5,
        CM_TO_PIXELS * 4.0,
        CM_TO_PIXELS * 4.5,
        CM_TO_PIXELS * 5.0,
        CM_TO_PIXELS * 7.5,
        CM_TO_PIXELS * 10.0
      ].map(size => Math.round(size));
    } else {
      return [
        INCH_TO_PIXELS * 0.25,
        INCH_TO_PIXELS * 0.5,
        INCH_TO_PIXELS * 1.0,
        INCH_TO_PIXELS * 1.5,
        INCH_TO_PIXELS * 2.0,
        INCH_TO_PIXELS * 2.5,
        INCH_TO_PIXELS * 3.0,
        INCH_TO_PIXELS * 3.5,
        INCH_TO_PIXELS * 4.0
      ].map(size => Math.round(size));
    }
  };

  const presetGridSizes = generatePresetSizes();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="grid-size">Grid Cell Size</Label>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {formatGridSize(gridSize)}{gridUnit}
            </span>
            <Select
              value={gridUnit}
              onValueChange={onGridUnitChange}
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
            min={gridUnit === "cm" ? Math.round(CM_TO_PIXELS * 0.25) : Math.round(INCH_TO_PIXELS * 0.125)}
            max={gridUnit === "cm" ? Math.round(CM_TO_PIXELS * 10) : Math.round(INCH_TO_PIXELS * 4)}
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
                  "px-3 py-1 border rounded-md text-xs transition-colors",
                  Math.abs(gridSize - size) < 2 ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
                )}
                onClick={() => onGridSizeChange(size)}
              >
                {formatGridSize(size)} {gridUnit}
              </button>
            ))}
          </div>
        </div>
      </div>

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

      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="show-diagonals">Show Diagonals</Label>
        <Switch
          id="show-diagonals"
          checked={showDiagonals}
          onCheckedChange={onShowDiagonalsChange}
        />
      </div>

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
