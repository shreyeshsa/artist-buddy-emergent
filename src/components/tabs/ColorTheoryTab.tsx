
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Mock color harmony data
const colorHarmonies = {
  complementary: ["#EC407A", "#40EC9C"],
  analogous: ["#EC407A", "#EC6040", "#EC9C40"],
  triadic: ["#EC407A", "#40EC7A", "#7A40EC"],
  splitComplementary: ["#EC407A", "#40BCEC", "#40EC5C"]
};

const ColorTheoryTab = () => {
  const [selectedColor, setSelectedColor] = useState("#EC407A");
  
  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Color Theory Lab</h2>
        <p className="text-muted-foreground">Learn and apply color theory to your artwork</p>
      </div>
      
      {/* Color Wheel */}
      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-6">
          <Label className="text-sm text-muted-foreground mb-2 block">Interactive Color Wheel</Label>
          <div className="aspect-square max-w-xs mx-auto mb-4 relative">
            {/* This would be replaced with an actual interactive color wheel */}
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1/3 h-1/3 rounded-full bg-white dark:bg-gray-800 shadow-lg"></div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-lg shadow-md" 
              style={{ backgroundColor: selectedColor }}
            />
            <div>
              <div className="font-medium">{selectedColor}</div>
              <div className="text-sm text-muted-foreground">Click on the wheel to select a color</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Color Harmonies */}
      <div className="mb-6">
        <Label className="text-sm text-muted-foreground mb-2 block">Color Harmonies</Label>
        <Tabs defaultValue="complementary">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="complementary">Comp.</TabsTrigger>
            <TabsTrigger value="analogous">Analog.</TabsTrigger>
            <TabsTrigger value="triadic">Triadic</TabsTrigger>
            <TabsTrigger value="splitComplementary">Split</TabsTrigger>
          </TabsList>
          
          {Object.entries(colorHarmonies).map(([harmony, colors]) => (
            <TabsContent key={harmony} value={harmony} className="mt-4">
              <div className="flex space-x-2">
                {colors.map((color, index) => (
                  <div key={index} className="flex-1">
                    <div 
                      className="w-full aspect-[1/1.2] rounded-lg shadow-md mb-1" 
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-center">{color}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Educational Content */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-3">Color Theory Tips</h3>
          
          <div className="space-y-4">
            <div className="bg-accent/50 p-3 rounded-md">
              <h4 className="font-medium mb-1">Warm vs Cool Colors</h4>
              <p className="text-sm text-muted-foreground">Warm colors (reds, oranges, yellows) advance, while cool colors (blues, greens, purples) recede. Use this to create depth in your art.</p>
            </div>
            
            <div className="bg-accent/50 p-3 rounded-md">
              <h4 className="font-medium mb-1">Mixing Neutrals</h4>
              <p className="text-sm text-muted-foreground">Create rich neutral tones by mixing complementary colors rather than using black or gray directly.</p>
            </div>
            
            <div className="bg-accent/50 p-3 rounded-md">
              <h4 className="font-medium mb-1">Skin Tone Basics</h4>
              <p className="text-sm text-muted-foreground">Skin tones are never flat colors. They consist of reds, yellows, and blues in different proportions depending on the undertone.</p>
            </div>
            
            <div className="bg-accent/50 p-3 rounded-md">
              <h4 className="font-medium mb-1">Shadows and Highlights</h4>
              <p className="text-sm text-muted-foreground">Shadows often contain cool colors like blues and purples, while highlights can have warm yellows and oranges.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Color Mixing Tool */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-3">Color Mixing Simulator</h3>
          <p className="text-sm text-muted-foreground mb-4">Create custom colors by mixing different mediums</p>
          
          <div className="space-y-4">
            <Button className="w-full bg-gradient-to-r from-artify-pink to-artify-purple hover:opacity-90">
              Try Color Mixer
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Select colors, adjust proportions, and see the resulting mix
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorTheoryTab;
