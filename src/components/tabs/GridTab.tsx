import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import GridCanvas from "@/components/grid/GridCanvas";
import CanvasSettings from "@/components/grid/CanvasSettings";
import GridSettings from "@/components/grid/GridSettings";
import ExportSettings from "@/components/grid/ExportSettings";

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

      const includeGridInfoCheckbox = document.getElementById('include-grid-info') as HTMLInputElement;
      if (includeGridInfoCheckbox && includeGridInfoCheckbox.checked && !showGridNumbers) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const padding = 8;
        const infoFontSize = 12;
        ctx.font = `${infoFontSize}px Arial`;

        const gridSizeText = `Grid: ${formatGridSize(gridSize)}${gridUnit}`;

        let paperWidth, paperHeight, unitLabel;
        if (customUnit === "cm") {
          paperWidth = customWidth;
          paperHeight = customHeight;
          unitLabel = "cm";
        } else {
          paperWidth = customWidth;
          paperHeight = customHeight;
          unitLabel = "in";
        }

        const orientationText = orientation.charAt(0).toUpperCase() + orientation.slice(1);
        const infoText = `${gridSizeText} | Paper: ${paperWidth}×${paperHeight}${unitLabel} (${canvasSize.toUpperCase()} ${orientationText})`;

        const textWidth = ctx.measureText(infoText).width;

        ctx.fillRect(
          tempCanvas.width - textWidth - padding * 2,
          tempCanvas.height - infoFontSize - padding * 2,
          textWidth + padding * 2,
          infoFontSize + padding * 2
        );

        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.fillText(
          infoText,
          tempCanvas.width - padding,
          tempCanvas.height - padding
        );
      }

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

  return (
    <div className="relative h-full flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
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
          />

          {!isMobile && (
            <div className="mt-6 max-w-4xl mx-auto space-y-4">
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={exportCanvas}
                  className="flex-1 max-w-xs"
                >
                  Export Image
                </Button>
              </div>

              <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="canvas">Canvas Settings</TabsTrigger>
                  <TabsTrigger value="grid">Grid Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="canvas" className="space-y-4">
                  <CanvasSettings
                    canvasSize={canvasSize}
                    orientation={orientation}
                    customWidth={customWidth}
                    customHeight={customHeight}
                    customUnit={customUnit}
                    onCanvasSizeChange={setCanvasSize}
                    onOrientationChange={setOrientation}
                    onCustomDimensionsChange={handleCustomDimensionsChange}
                    onImportClick={() => fileInputRef.current?.click()}
                  />
                </TabsContent>

                <TabsContent value="grid" className="space-y-4">
                  <GridSettings
                    gridSize={gridSize}
                    lineWidth={lineWidth}
                    lineOpacity={lineOpacity}
                    showDiagonals={showDiagonals}
                    showGridNumbers={showGridNumbers}
                    lineColor={lineColor}
                    gridUnit={gridUnit}
                    onGridSizeChange={setGridSize}
                    onLineWidthChange={setLineWidth}
                    onLineOpacityChange={setLineOpacity}
                    onShowDiagonalsChange={setShowDiagonals}
                    onShowGridNumbersChange={setShowGridNumbers}
                    onLineColorChange={setLineColor}
                    onGridUnitChange={setGridUnit}
                    formatGridSize={formatGridSize}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur border-t p-3 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            setImage(null);
            toast.info('Canvas cleared');
          }}
        >
          Clear Canvas
        </Button>

        {isMobile ? (
          <Drawer open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="default"
                className="flex-1 bg-gradient-to-r from-artify-pink to-artify-purple hover:opacity-90"
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader>
                <DrawerTitle>Grid Settings</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-8 overflow-y-auto">
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={exportCanvas}
                    className="w-full"
                  >
                    Export Image
                  </Button>
                </div>

                <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="canvas">Canvas</TabsTrigger>
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                  </TabsList>

                  <TabsContent value="canvas" className="space-y-4">
                    <CanvasSettings
                      canvasSize={canvasSize}
                      orientation={orientation}
                      customWidth={customWidth}
                      customHeight={customHeight}
                      customUnit={customUnit}
                      onCanvasSizeChange={setCanvasSize}
                      onOrientationChange={setOrientation}
                      onCustomDimensionsChange={handleCustomDimensionsChange}
                      onImportClick={() => fileInputRef.current?.click()}
                    />
                  </TabsContent>

                  <TabsContent value="grid" className="space-y-4">
                    <GridSettings
                      gridSize={gridSize}
                      lineWidth={lineWidth}
                      lineOpacity={lineOpacity}
                      showDiagonals={showDiagonals}
                      showGridNumbers={showGridNumbers}
                      lineColor={lineColor}
                      gridUnit={gridUnit}
                      onGridSizeChange={setGridSize}
                      onLineWidthChange={setLineWidth}
                      onLineOpacityChange={setLineOpacity}
                      onShowDiagonalsChange={setShowDiagonals}
                      onShowGridNumbersChange={setShowGridNumbers}
                      onLineColorChange={setLineColor}
                      onGridUnitChange={setGridUnit}
                      formatGridSize={formatGridSize}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Button
            variant="default"
            className="flex-1 bg-gradient-to-r from-artify-pink to-artify-purple hover:opacity-90"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        )}
      </div>
    </div>
  );
};

export default GridTab;
