import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Palette, Download } from "lucide-react";
import { getUserPaletteProjects, deletePaletteProject } from "@/utils/databaseUtils";
import type { PaletteProject } from "@/lib/supabase";
import { toast } from "sonner";
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

  const handleDownload = (palette: PaletteProject) => {
    if (!Array.isArray(palette.colors) || palette.colors.length === 0) {
      toast.error("No colors in this palette");
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error("Failed to create canvas");
        return;
      }

      const swatchSize = 100;
      canvas.width = palette.colors.length * swatchSize;
      canvas.height = swatchSize;

      palette.colors.forEach((color: any, index: number) => {
        const hexColor = color.hex || color;
        ctx.fillStyle = hexColor;
        ctx.fillRect(index * swatchSize, 0, swatchSize, swatchSize);
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to create image");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${palette.palette_name}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Palette downloaded successfully");
      });
    } catch (error) {
      toast.error("Failed to download palette");
      console.error(error);
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
              No palettes saved yet. Create and save your first palette in the Color Tools tab!
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
                      <Button
                        onClick={() => handleDownload(palette)}
                        variant="outline"
                        size="sm"
                        title="Download Palette"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
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
                  {Array.isArray(palette.colors) && palette.colors.length > 0 ? (
                    <>
                      <div className="flex rounded-lg overflow-hidden border mb-3 h-16">
                        {palette.colors.map((color: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex-1"
                            style={{ backgroundColor: color.hex || color }}
                            title={color.name || color.hex || color}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {palette.colors.map((color: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 border rounded text-xs"
                          >
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: color.hex || color }}
                            />
                            <span className="text-sm">{color.name || color.hex || color}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">No colors in this palette</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
