
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Download } from "lucide-react";

interface ExportSettingsProps {
  onExport: () => void;
}

const ExportSettings = ({ onExport }: ExportSettingsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="export-format">Format</Label>
        <Select defaultValue="png">
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
        <Select defaultValue="high">
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
      
      <div className="flex items-center space-x-2">
        <Switch id="include-grid" defaultChecked />
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
