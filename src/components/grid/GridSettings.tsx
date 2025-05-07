
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface GridSettingsProps {
  gridSize: number;
  lineWidth: number;
  lineOpacity: number;
  showDiagonals: boolean;
  showGridNumbers: boolean;
  lineColor: string;
  onGridSizeChange: (value: number) => void;
  onLineWidthChange: (value: number) => void;
  onLineOpacityChange: (value: number) => void;
  onShowDiagonalsChange: (value: boolean) => void;
  onShowGridNumbersChange: (value: boolean) => void;
  onLineColorChange: (value: string) => void;
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
  // Convert gridSize to centimeters (1cm = ~28.35 pixels at 72 DPI)
  const gridSizeCm = (gridSize / 28.35).toFixed(1);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="grid-size">Grid Size: {gridSizeCm}cm</Label>
        </div>
        <Slider 
          id="grid-size"
          min={14} // 0.5cm
          max={141} // 5cm
          step={7} // 0.25cm
          value={[gridSize]} 
          onValueChange={(values) => onGridSizeChange(values[0])} 
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="line-width">Line Width: {lineWidth}px</Label>
        </div>
        <Slider 
          id="line-width"
          min={0.5} 
          max={5} 
          step={0.5} 
          value={[lineWidth]} 
          onValueChange={(values) => onLineWidthChange(values[0])} 
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="line-opacity">Opacity: {lineOpacity}%</Label>
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
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="diagonals" 
          checked={showDiagonals} 
          onCheckedChange={onShowDiagonalsChange} 
        />
        <Label htmlFor="diagonals">Show Diagonals</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="grid-numbers" 
          checked={showGridNumbers} 
          onCheckedChange={onShowGridNumbersChange} 
        />
        <Label htmlFor="grid-numbers">Show Grid Numbers</Label>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="line-color">Line Color</Label>
        <div className="flex items-center space-x-2">
          <input 
            type="color" 
            id="line-color" 
            value={lineColor} 
            onChange={(e) => onLineColorChange(e.target.value)}
            className="w-10 h-10 rounded-md" 
          />
          <span>{lineColor}</span>
        </div>
      </div>
    </div>
  );
};

export default GridSettings;
