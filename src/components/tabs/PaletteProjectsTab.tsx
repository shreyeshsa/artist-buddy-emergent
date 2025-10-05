import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Palette } from "lucide-react";
import { getUserPaletteProjects, deletePaletteProject } from "@/utils/databaseUtils";
import type { PaletteProject } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PaletteProjectsTabProps {
  onLoadPalette?: (palette: PaletteProject) => void;
}

export function PaletteProjectsTab({ onLoadPalette }: PaletteProjectsTabProps) {
  const [palettes, setPalettes] = useState<PaletteProject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPalettes = async () => {
    setLoading(true);
    const data = await getUserPaletteProjects();
    setPalettes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPalettes();
  }, []);

  const handleDelete = async (paletteId: string) => {
    const success = await deletePaletteProject(paletteId);
    if (success) {
      setPalettes(palettes.filter((p) => p.id !== paletteId));
    }
  };

  const handleLoad = (palette: PaletteProject) => {
    if (onLoadPalette) {
      onLoadPalette(palette);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading palettes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Saved Palettes</h2>
        <Button onClick={loadPalettes} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {palettes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Palette className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No palettes saved yet. Create and save your first palette in the Your Palette tab!
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="grid gap-4">
            {palettes.map((palette) => (
              <Card key={palette.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{palette.palette_name}</span>
                    <div className="flex gap-2">
                      {onLoadPalette && (
                        <Button
                          onClick={() => handleLoad(palette)}
                          variant="outline"
                          size="sm"
                        >
                          Load
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Palette</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{palette.palette_name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(palette.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Created: {new Date(palette.created_at).toLocaleDateString()} at {new Date(palette.created_at).toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(palette.colors) && palette.colors.map((color: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 border rounded"
                      >
                        <div
                          className="w-12 h-12 rounded border"
                          style={{ backgroundColor: color.hex || color }}
                        />
                        <span className="text-sm">{color.name || color.hex || color}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
