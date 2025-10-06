import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgxNTM2MDAsImV4cCI6MjA0MzcyODAwMH0.oCvZ5PXQQYqUwRnBi2TfFaFRLZzPzQJH3QU5KF5cYkY';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key available:', !!supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'x-client-info': 'supabase-js-web',
      },
    },
  }
);

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
