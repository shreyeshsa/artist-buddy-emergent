
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

interface ExportSettingsProps {
  onExport: () => void;
}

const ExportSettings = ({ onExport }: ExportSettingsProps) => {
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState("high");
  const [includeGrid, setIncludeGrid] = useState(true);
  const [customDpi, setCustomDpi] = useState("300");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="export-format">Format</Label>
        <Select defaultValue="png" onValueChange={setFormat}>
          <SelectTrigger id="export-format">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="export-quality">Quality</Label>
        <Select defaultValue="high" onValueChange={setQuality}>
          <SelectTrigger id="export-quality">
            <SelectValue placeholder="Select quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="custom">Custom DPI</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {quality === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="custom-dpi">Custom DPI</Label>
          <Input 
            id="custom-dpi" 
            type="number" 
            min="72" 
            max="600" 
            value={customDpi}
            onChange={(e) => setCustomDpi(e.target.value)}
          />
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="include-grid" 
          defaultChecked={includeGrid}
          onCheckedChange={setIncludeGrid}
        />
        <Label htmlFor="include-grid">Include Grid in Export</Label>
      </div>
      
      <Button 
        className="w-full bg-gradient-to-r from-artify-pink to-artify-purple hover:opacity-90 mt-2"
        onClick={onExport}
      >
        <Download className="h-4 w-4 mr-2" />
        Export Image
      </Button>
    </div>
  );
};

export default ExportSettings;
