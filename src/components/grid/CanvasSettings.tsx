
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface CanvasSettingsProps {
  canvasSize: string;
  orientation: string;
  onCanvasSizeChange: (value: string) => void;
  onOrientationChange: (value: string) => void;
  onImportClick: () => void;
}

const CanvasSettings = ({
  canvasSize,
  orientation,
  onCanvasSizeChange,
  onOrientationChange,
  onImportClick
}: CanvasSettingsProps) => {
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
