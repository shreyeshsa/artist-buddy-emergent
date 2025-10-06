import type { UserImage, Project, PaletteProject } from "@/lib/supabase";
import { toast } from "sonner";

const getCurrentUserId = (): string | null => {
  try {
    const stored = localStorage.getItem('artist_buddy_current_user');
    if (!stored) return null;
    const user = JSON.parse(stored);
    return user?.id || null;
  } catch {
    return null;
  }
};

const IMAGES_KEY = 'artist_buddy_images';
const PROJECTS_KEY = 'artist_buddy_projects';
const PALETTES_KEY = 'artist_buddy_palettes';

const getStorageData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStorageData = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export async function saveImageToDatabase(imageName: string, imageData: string): Promise<UserImage | null> {
  try {
    const userId = getCurrentUserId();

    if (!userId) {
      toast.error("You must be logged in to save images");
      return null;
    }

    const images = getStorageData<UserImage>(IMAGES_KEY);
    const newImage: UserImage = {
      id: crypto.randomUUID(),
      user_id: userId,
      image_name: imageName,
      image_data: imageData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    images.push(newImage);
    setStorageData(IMAGES_KEY, images);

    toast.success("Image saved successfully");
    return newImage;
  } catch (error) {
    console.error("Error saving image:", error);
    toast.error("Failed to save image");
    return null;
  }
}

export async function getUserImages(): Promise<UserImage[]> {
  try {
    const userId = getCurrentUserId();
    if (!userId) return [];

    const images = getStorageData<UserImage>(IMAGES_KEY);
    return images
      .filter(img => img.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error("Error fetching images:", error);
    return [];
  }
}

export async function deleteImage(imageId: string): Promise<boolean> {
  try {
    const images = getStorageData<UserImage>(IMAGES_KEY);
    const filtered = images.filter(img => img.id !== imageId);
    setStorageData(IMAGES_KEY, filtered);

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
    const userId = getCurrentUserId();

    if (!userId) {
      toast.error("You must be logged in to save projects");
      return null;
    }

    const projects = getStorageData<Project>(PROJECTS_KEY);
    const newProject: Project = {
      id: crypto.randomUUID(),
      user_id: userId,
      project_name: projectName,
      canvas_data: canvasData,
      grid_settings: gridSettings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    projects.push(newProject);
    setStorageData(PROJECTS_KEY, projects);

    toast.success("Project saved successfully");
    return newProject;
  } catch (error) {
    console.error("Error saving project:", error);
    toast.error("Failed to save project");
    return null;
  }
}

export async function getUserProjects(): Promise<Project[]> {
  try {
    const userId = getCurrentUserId();
    if (!userId) return [];

    const projects = getStorageData<Project>(PROJECTS_KEY);
    return projects
      .filter(proj => proj.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function deleteProject(projectId: string): Promise<boolean> {
  try {
    const projects = getStorageData<Project>(PROJECTS_KEY);
    const filtered = projects.filter(proj => proj.id !== projectId);
    setStorageData(PROJECTS_KEY, filtered);

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
    const userId = getCurrentUserId();

    if (!userId) {
      toast.error("You must be logged in to save palettes");
      return null;
    }

    const palettes = getStorageData<PaletteProject>(PALETTES_KEY);
    const newPalette: PaletteProject = {
      id: crypto.randomUUID(),
      user_id: userId,
      palette_name: paletteName,
      colors: colors,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    palettes.push(newPalette);
    setStorageData(PALETTES_KEY, palettes);

    toast.success("Palette saved successfully");
    return newPalette;
  } catch (error) {
    console.error("Error saving palette:", error);
    toast.error("Failed to save palette");
    return null;
  }
}

export async function getUserPaletteProjects(): Promise<PaletteProject[]> {
  try {
    const userId = getCurrentUserId();
    if (!userId) return [];

    const palettes = getStorageData<PaletteProject>(PALETTES_KEY);
    return palettes
      .filter(pal => pal.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error("Error fetching palette projects:", error);
    return [];
  }
}

export async function deletePaletteProject(paletteId: string): Promise<boolean> {
  try {
    const palettes = getStorageData<PaletteProject>(PALETTES_KEY);
    const filtered = palettes.filter(pal => pal.id !== paletteId);
    setStorageData(PALETTES_KEY, filtered);

    toast.success("Palette deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting palette:", error);
    toast.error("Failed to delete palette");
    return false;
  }
}
