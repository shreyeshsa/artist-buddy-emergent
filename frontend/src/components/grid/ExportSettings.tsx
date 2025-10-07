import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Download, Share2, Save } from "lucide-react";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { saveProject } from "@/utils/databaseUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ExportSettingsProps {
  onExport: () => void;
  gridSize?: number;
  gridUnit?: string;
  canvasData?: any;
  gridSettings?: any;
}

const ExportSettings = ({ onExport, gridSize, gridUnit = "cm", canvasData, gridSettings }: ExportSettingsProps) => {
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState("high");
  const [includeGrid, setIncludeGrid] = useState(true);
  const [includeGridInfo, setIncludeGridInfo] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const handleShare = async () => {
    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        const canvas = document.querySelector('canvas');
        if (!canvas) {
          toast.error('Canvas not found');
          return;
        }
        
        try {
          // Convert canvas to blob
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to create blob'));
            }, 'image/png');
          });

          // Create a file object from the blob
          const file = new File([blob], `grid-${Date.now()}.png`, { type: 'image/png' });

          // Share the file
          await navigator.share({
            title: 'My Grid',
            text: 'Check out this grid I created with Your Artist Buddy by Aasuri!',
            files: [file],
          });
          
          toast.success('Shared successfully');
        } catch (error) {
          console.error('Error creating sharing file:', error);
          
          // Fallback to sharing without file if it's not supported
          await navigator.share({
            title: 'My Grid',
            text: 'Check out this grid I created with Your Artist Buddy by Aasuri!',
          });
          
          toast.success('Shared successfully (without image)');
        }
      } else {
        toast.error('Web Share API not supported on this browser');
      }
    } catch (error) {
      toast.error('Failed to share');
      console.error('Error sharing:', error);
    }
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setIsSaving(true);

    const canvas = document.querySelector('canvas');
    let canvasImageData = null;

    if (canvas) {
      canvasImageData = canvas.toDataURL('image/png');
    }

    const projectData = {
      ...canvasData,
      canvasImage: canvasImageData,
    };

    const result = await saveProject(projectName, projectData, gridSettings);

    setIsSaving(false);

    if (result) {
      setProjectName("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription>
              Give your project a name to save it for later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="My Grid Project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveProject();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProject}
              disabled={isSaving || !projectName.trim()}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <div className="flex items-center space-x-2">
        <Switch
          id="include-grid-info"
          defaultChecked={includeGridInfo}
          onCheckedChange={setIncludeGridInfo}
        />
        <Label htmlFor="include-grid-info">Include Grid Size Info</Label>
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
