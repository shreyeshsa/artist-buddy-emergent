import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Settings, Upload, Download, Save } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import GridCanvas from "@/components/grid/GridCanvas";
import CanvasSettings from "@/components/grid/CanvasSettings";
import GridSettings from "@/components/grid/GridSettings";
import { saveProject } from "@/utils/databaseUtils";

const STANDARD_DPI = 96;
const CM_TO_PIXELS = STANDARD_DPI / 2.54;

const GridTab = () => {
  const [canvasSize, setCanvasSize] = usePersistedState("grid_canvasSize", "a4");
  const [orientation, setOrientation] = usePersistedState("grid_orientation", "portrait");
  const [customWidth, setCustomWidth] = usePersistedState("grid_customWidth", 21);
  const [customHeight, setCustomHeight] = usePersistedState("grid_customHeight", 29.7);
  const [customUnit, setCustomUnit] = usePersistedState<"cm" | "inches">("grid_customUnit", "cm");

  const [gridSize, setGridSize] = usePersistedState("grid_gridSize", Math.round(CM_TO_PIXELS));
  const [lineWidth, setLineWidth] = usePersistedState("grid_lineWidth", 1);
  const [lineOpacity, setLineOpacity] = usePersistedState("grid_lineOpacity", 50);
  const [showDiagonals, setShowDiagonals] = usePersistedState("grid_showDiagonals", true);
  const [showGridNumbers, setShowGridNumbers] = usePersistedState("grid_showGridNumbers", true);
  const [lineColor, setLineColor] = usePersistedState("grid_lineColor", "#333333");
  const [gridUnit, setGridUnit] = usePersistedState("grid_gridUnit", "cm");

  const [image, setImage] = usePersistedState<string | null>("grid_image", null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [activeSettingsTab, setActiveSettingsTab] = useState("canvas");

  const formatGridSize = (size: number): string => {
    if (gridUnit === "cm") {
      const cmValue = size / CM_TO_PIXELS;

      if (cmValue >= 0.95 && cmValue < 1.05) return "1.0";
      if (cmValue >= 1.45 && cmValue < 1.55) return "1.5";
      if (cmValue >= 1.95 && cmValue < 2.05) return "2.0";
      if (cmValue >= 2.45 && cmValue < 2.55) return "2.5";
      if (cmValue >= 2.95 && cmValue < 3.05) return "3.0";
      if (cmValue >= 3.45 && cmValue < 3.55) return "3.5";
      if (cmValue >= 3.95 && cmValue < 4.05) return "4.0";
      if (cmValue >= 4.45 && cmValue < 4.55) return "4.5";

      return cmValue.toFixed(1);
    } else {
      const inValue = size / STANDARD_DPI;
      return inValue.toFixed(2);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
        toast.success('Image uploaded successfully');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to load image');
    };
    reader.readAsDataURL(file);
  };

  const handleCustomDimensionsChange = (width: number, height: number, unit: "cm" | "inches") => {
    setCustomWidth(width);
    setCustomHeight(height);
    setCustomUnit(unit);
  };

  const exportCanvas = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    try {
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) {
        toast.error('Could not create canvas context');
        return;
      }

      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;

      ctx.drawImage(canvas, 0, 0);

      let filename = `grid-${Date.now()}`;
      let mimeType = 'image/png';
      let extension = 'png';

      tempCanvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to create image blob');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Canvas exported successfully!');
      }, mimeType);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export canvas');
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
      image,
      canvasSize,
      orientation,
      customWidth,
      customHeight,
      customUnit,
      canvasImage: canvasImageData,
    };

    const gridSettings = {
      gridSize,
      lineWidth,
      lineOpacity,
      showDiagonals,
      showGridNumbers,
      lineColor,
      gridUnit,
    };

    const result = await saveProject(projectName, projectData, gridSettings);

    setIsSaving(false);

    if (result) {
      setProjectName("");
      setSaveDialogOpen(false);
    }
  };

  return (
    <div className="relative h-full">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      {!image ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] px-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
              <Upload className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold">Start Creating</h3>
            <p className="text-muted-foreground">
              Upload an image to add a reference grid overlay
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:opacity-90 shadow-lg"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Image
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-4 pb-20">
            <div className="mb-4 flex gap-2 flex-wrap">
              <Button
                onClick={exportCanvas}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:opacity-90"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
              <Button
                onClick={() => setSaveDialogOpen(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Project
              </Button>
            </div>

            <div className="relative">
              <GridCanvas
                ref={canvasRef}
                image={image}
                canvasSize={canvasSize}
                orientation={orientation}
                customWidth={customWidth}
                customHeight={customHeight}
                customUnit={customUnit}
                gridSize={gridSize}
                lineWidth={lineWidth}
                lineOpacity={lineOpacity}
                showDiagonals={showDiagonals}
                showGridNumbers={showGridNumbers}
                lineColor={lineColor}
                gridUnit={gridUnit}
                formatGridSize={formatGridSize}
                onUploadImage={handleImageUpload}
                onClearCanvas={() => setImage(null)}
              />

            </div>

            {!isMobile && (
              <div className="mt-6 max-w-4xl mx-auto">
                <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="canvas">Canvas Settings</TabsTrigger>
                    <TabsTrigger value="grid">Grid Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="canvas" className="space-y-4">
                    <CanvasSettings
                      canvasSize={canvasSize}
                      setCanvasSize={setCanvasSize}
                      orientation={orientation}
                      setOrientation={setOrientation}
                      customWidth={customWidth}
                      customHeight={customHeight}
                      customUnit={customUnit}
                      onCustomDimensionsChange={handleCustomDimensionsChange}
                    />
                  </TabsContent>

                  <TabsContent value="grid" className="space-y-4">
                    <GridSettings
                      gridSize={gridSize}
                      setGridSize={setGridSize}
                      lineWidth={lineWidth}
                      setLineWidth={setLineWidth}
                      lineOpacity={lineOpacity}
                      setLineOpacity={setLineOpacity}
                      showDiagonals={showDiagonals}
                      setShowDiagonals={setShowDiagonals}
                      showGridNumbers={showGridNumbers}
                      setShowGridNumbers={setShowGridNumbers}
                      lineColor={lineColor}
                      setLineColor={setLineColor}
                      gridUnit={gridUnit}
                      setGridUnit={setGridUnit}
                      formatGridSize={formatGridSize}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          {isMobile && (
            <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20">
              <Drawer open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DrawerTrigger asChild>
                  <Button
                    className="h-12 px-6 rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Grid Settings
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[85vh]">
                  <DrawerHeader>
                    <DrawerTitle>Grid Settings</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-8 overflow-y-auto">
                    <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab}>
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="canvas">Canvas</TabsTrigger>
                        <TabsTrigger value="grid">Grid</TabsTrigger>
                      </TabsList>

                      <TabsContent value="canvas" className="space-y-4">
                        <CanvasSettings
                          canvasSize={canvasSize}
                          setCanvasSize={setCanvasSize}
                          orientation={orientation}
                          setOrientation={setOrientation}
                          customWidth={customWidth}
                          customHeight={customHeight}
                          customUnit={customUnit}
                          onCustomDimensionsChange={handleCustomDimensionsChange}
                        />
                      </TabsContent>

                      <TabsContent value="grid" className="space-y-4">
                        <GridSettings
                          gridSize={gridSize}
                          setGridSize={setGridSize}
                          lineWidth={lineWidth}
                          setLineWidth={setLineWidth}
                          lineOpacity={lineOpacity}
                          setLineOpacity={setLineOpacity}
                          showDiagonals={showDiagonals}
                          setShowDiagonals={setShowDiagonals}
                          showGridNumbers={showGridNumbers}
                          setShowGridNumbers={setShowGridNumbers}
                          lineColor={lineColor}
                          setLineColor={setLineColor}
                          gridUnit={gridUnit}
                          setGridUnit={setGridUnit}
                          formatGridSize={formatGridSize}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          )}
        </>
      )}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
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
              onClick={() => setSaveDialogOpen(false)}
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
    </div>
  );
};

export default GridTab;
