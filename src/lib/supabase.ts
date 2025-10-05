import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Configuration Check:');
console.log('URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✓ Set' : '✗ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your hosting platform.');
  throw new Error('Supabase environment variables are not configured. Please contact support.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export interface UserImage {
  id: string;
  user_id: string;
  image_data: string;
  image_name: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  project_name: string;
  canvas_data: any;
  grid_settings: any;
  created_at: string;
  updated_at: string;
}

export interface PaletteProject {
  id: string;
  user_id: string;
  palette_name: string;
  colors: any[];
  created_at: string;
  updated_at: string;
}
