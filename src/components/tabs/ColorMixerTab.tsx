
import { useState } from "react";
import ColorMixer from "@/components/color-theory/ColorMixer";

const ColorMixerTab = () => {
  const [savedColors, setSavedColors] = useState<{name: string, color: string}[]>([]);
  
  const handleSaveColor = (color: string, name: string) => {
    setSavedColors(prev => [...prev, { color, name }]);
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Color Mixer</h2>
        <p className="text-muted-foreground">Mix colors and see the results</p>
      </div>
      
      <ColorMixer onClose={() => {}} onSaveColor={handleSaveColor} />
      
      {savedColors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Saved Color Mixes</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {savedColors.map((color, index) => (
              <div 
                key={index}
                className="flex flex-col items-center p-2 border rounded-md"
              >
                <div 
                  className="w-12 h-12 rounded-md mb-1" 
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-sm font-medium">{color.name}</span>
                <span className="text-xs text-muted-foreground">{color.color}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorMixerTab;
