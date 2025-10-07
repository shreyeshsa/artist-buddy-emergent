
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface ColorItem {
  id: number;
  color: string;
  name: string;
  brand: string;
  code?: string;
}

interface ColorPaletteGroupProps {
  id: string;
  name: string;
  colors: ColorItem[];
  onRemoveGroup: (id: string) => void;
  onRenameGroup: (id: string, newName: string) => void;
  onRemoveColor: (groupId: string, colorId: number) => void;
}

const ColorPaletteGroup = ({
  id,
  name,
  colors,
  onRemoveGroup,
  onRenameGroup,
  onRemoveColor
}: ColorPaletteGroupProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);

  const handleRename = () => {
    if (editedName.trim()) {
      onRenameGroup(id, editedName);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(name);
    setIsEditing(false);
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          {isEditing ? (
            <div className="flex items-center space-x-2 flex-1">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-base font-medium"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={handleRename}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Label className="text-base font-medium">{name}</Label>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => onRemoveGroup(id)}>
            <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {colors.length > 0 ? (
            colors.map((color) => (
              <div key={color.id} className="bg-background rounded-md p-2 border">
                <div className="flex justify-between mb-1">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: color.color }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => onRemoveColor(id, color.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <div className="font-medium text-sm line-clamp-1">{color.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {color.brand} {color.code && `· ${color.code}`}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-muted-foreground">
              No colors in this palette yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorPaletteGroup;
