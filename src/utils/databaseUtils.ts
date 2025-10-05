import { supabase } from "@/lib/supabase";
import type { UserImage, Project, PaletteProject } from "@/lib/supabase";
import { toast } from "sonner";

export async function saveImageToDatabase(imageName: string, imageData: string): Promise<UserImage | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in to save images");
      return null;
    }

    const { data, error } = await supabase
      .from("user_images")
      .insert({
        user_id: user.id,
        image_name: imageName,
        image_data: imageData,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error saving image:", error);
      toast.error("Failed to save image");
      return null;
    }

    toast.success("Image saved successfully");
    return data;
  } catch (error) {
    console.error("Error saving image:", error);
    toast.error("Failed to save image");
    return null;
  }
}

export async function getUserImages(): Promise<UserImage[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("user_images")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching images:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching images:", error);
    return [];
  }
}

export async function deleteImage(imageId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
      return false;
    }

    toast.success("Image deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    toast.error("Failed to delete image");
    return false;
  }
}

export async function saveProject(projectName: string, canvasData: any, gridSettings: any): Promise<Project | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in to save projects");
      return null;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        project_name: projectName,
        canvas_data: canvasData,
        grid_settings: gridSettings,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
      return null;
    }

    toast.success("Project saved successfully");
    return data;
  } catch (error) {
    console.error("Error saving project:", error);
    toast.error("Failed to save project");
    return null;
  }
}

export async function getUserProjects(): Promise<Project[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function deleteProject(projectId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
      return false;
    }

    toast.success("Project deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    toast.error("Failed to delete project");
    return false;
  }
}

export async function savePaletteProject(paletteName: string, colors: any[]): Promise<PaletteProject | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in to save palettes");
      return null;
    }

    const { data, error } = await supabase
      .from("palette_projects")
      .insert({
        user_id: user.id,
        palette_name: paletteName,
        colors: colors,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error saving palette:", error);
      toast.error("Failed to save palette");
      return null;
    }

    toast.success("Palette saved successfully");
    return data;
  } catch (error) {
    console.error("Error saving palette:", error);
    toast.error("Failed to save palette");
    return null;
  }
}

export async function getUserPaletteProjects(): Promise<PaletteProject[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("palette_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching palette projects:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching palette projects:", error);
    return [];
  }
}

export async function deletePaletteProject(paletteId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("palette_projects")
      .delete()
      .eq("id", paletteId);

    if (error) {
      console.error("Error deleting palette:", error);
      toast.error("Failed to delete palette");
      return false;
    }

    toast.success("Palette deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting palette:", error);
    toast.error("Failed to delete palette");
    return false;
  }
}
