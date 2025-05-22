
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface ExportSettingsProps {
  onExport: () => void;
}

const ExportSettings = ({ onExport }: ExportSettingsProps) => {
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState("high");
  const [includeGrid, setIncludeGrid] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const handleShare = async () => {
    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        // Share image (in a real implementation, this would convert canvas to blob)
        await navigator.share({
          title: 'My Grid',
          text: 'Check out this grid I created with Your Artist Buddy by Aasuri!',
        });
        toast.success('Shared successfully');
      } else {
        toast.error('Web Share API not supported on this browser');
      }
    } catch (error) {
      toast.error('Failed to share');
      console.error('Error sharing:', error);
    }
  };

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
            <SelectItem value="pdf">PDF</SelectItem>
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
          </SelectContent>
        </Select>
      </div>
      
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
      
      {isMobile && (
        <Button 
          className="w-full"
          variant="outline"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      )}
      
      <div className="text-xs text-center text-muted-foreground">
        Export your grid to use as a reference while drawing
      </div>
    </div>
  );
};

export default ExportSettings;
