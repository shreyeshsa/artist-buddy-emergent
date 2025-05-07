
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Maximize, Plus } from "lucide-react";

const GridTab = () => {
  // State for canvas settings
  const [canvasSize, setCanvasSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [gridSize, setGridSize] = useState(20);
  const [lineWidth, setLineWidth] = useState(1);
  const [lineOpacity, setLineOpacity] = useState(50);
  const [showDiagonals, setShowDiagonals] = useState(false);
  const [lineColor, setLineColor] = useState("#333333");

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Grid Creator</h2>
        <p className="text-muted-foreground">Set up your canvas, import images, and apply custom grids</p>
      </div>

      {/* Canvas and workspace area */}
      <div className="rounded-lg border bg-card mb-6 overflow-hidden">
        <div className="aspect-[3/4] bg-white dark:bg-slate-800 relative flex items-center justify-center">
          {/* This would be replaced with actual canvas implementation */}
          <div className="text-center px-4">
            <p className="text-muted-foreground mb-4">Your canvas will appear here</p>
            <Button 
              variant="outline"
              className="mr-2"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Image
            </Button>
            <input 
              id="file-input" 
              type="file" 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          {/* Floating action button for canvas actions */}
          <Button 
            size="icon" 
            className="absolute bottom-4 right-4 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="canvas" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        
        {/* Canvas Settings */}
        <TabsContent value="canvas" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="canvas-size">Canvas Size</Label>
              <Select value={canvasSize} onValueChange={setCanvasSize}>
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
              <Select value={orientation} onValueChange={setOrientation}>
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
        </TabsContent>
        
        {/* Grid Settings */}
        <TabsContent value="grid" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="grid-size">Grid Size: {gridSize}px</Label>
              </div>
              <Slider 
                id="grid-size"
                min={5} 
                max={100} 
                step={1} 
                value={[gridSize]} 
                onValueChange={(values) => setGridSize(values[0])} 
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
                onValueChange={(values) => setLineWidth(values[0])} 
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
                onValueChange={(values) => setLineOpacity(values[0])} 
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="diagonals" 
                checked={showDiagonals} 
                onCheckedChange={setShowDiagonals} 
              />
              <Label htmlFor="diagonals">Show Diagonals</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="line-color">Line Color</Label>
              <div className="flex items-center space-x-2">
                <input 
                  type="color" 
                  id="line-color" 
                  value={lineColor} 
                  onChange={(e) => setLineColor(e.target.value)}
                  className="w-10 h-10 rounded-md" 
                />
                <span>{lineColor}</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Export Settings */}
        <TabsContent value="export" className="space-y-4 mt-4">
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
            
            <Button className="w-full bg-gradient-to-r from-artify-pink to-artify-purple hover:opacity-90 mt-2">
              <Download className="h-4 w-4 mr-2" />
              Export Image
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GridTab;
