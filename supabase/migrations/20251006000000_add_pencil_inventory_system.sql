/*
  # Add Personalized Pencil Inventory System

  ## Overview
  This migration creates a system for users to track their personal pencil collections,
  allowing them to mark which pencils they own and filter recommendations accordingly.

  ## New Tables

  ### `pencil_brands`
  Stores information about pencil brands (Prismacolor, Faber-Castell, etc.)
  - `id` (uuid, primary key)
  - `name` (text) - Brand name
  - `created_at` (timestamptz) - Record creation timestamp

  ### `pencil_sets`
  Stores information about specific pencil sets (e.g., Prismacolor 24, 36, 72)
  - `id` (uuid, primary key)
  - `brand_id` (uuid, foreign key to pencil_brands)
  - `name` (text) - Set name (e.g., "24 Set", "72 Set")
  - `size` (integer) - Number of pencils in set
  - `created_at` (timestamptz) - Record creation timestamp

  ### `pencil_colors`
  Stores individual pencil color information
  - `id` (uuid, primary key)
  - `brand_id` (uuid, foreign key to pencil_brands)
  - `name` (text) - Color name
  - `code` (text) - Pencil code (e.g., "PC901")
  - `hex_color` (text) - Hex color value
  - `created_at` (timestamptz) - Record creation timestamp

  ### `user_pencil_inventory`
  Tracks which pencils each user owns
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `pencil_color_id` (uuid, foreign key to pencil_colors)
  - `acquired_date` (date) - When user acquired the pencil
  - `notes` (text) - Optional user notes
  - `created_at` (timestamptz) - Record creation timestamp
  - Unique constraint on (user_id, pencil_color_id)

  ## Security
  - Enable RLS on all tables
  - Users can only view and manage their own inventory
  - Pencil reference data (brands, sets, colors) is readable by all authenticated users
  - Only authenticated users can modify their inventory

  ## Notes
  1. This system allows users to build a personalized inventory
  2. Future features can filter color recommendations based on owned pencils
  3. Analytics can track which pencils are most commonly owned
*/

CREATE TABLE IF NOT EXISTS pencil_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pencil_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pencil brands"
  ON pencil_brands FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS pencil_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES pencil_brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  size integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(brand_id, name)
);

ALTER TABLE pencil_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pencil sets"
  ON pencil_sets FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS pencil_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES pencil_brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  hex_color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(brand_id, code)
);

ALTER TABLE pencil_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pencil colors"
  ON pencil_colors FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS user_pencil_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pencil_color_id uuid NOT NULL REFERENCES pencil_colors(id) ON DELETE CASCADE,
  acquired_date date DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pencil_color_id)
);

ALTER TABLE user_pencil_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory"
  ON user_pencil_inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory"
  ON user_pencil_inventory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON user_pencil_inventory FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory"
  ON user_pencil_inventory FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_pencil_inventory_user_id ON user_pencil_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pencil_inventory_pencil_color_id ON user_pencil_inventory(pencil_color_id);
CREATE INDEX IF NOT EXISTS idx_pencil_colors_brand_id ON pencil_colors(brand_id);
CREATE INDEX IF NOT EXISTS idx_pencil_sets_brand_id ON pencil_sets(brand_id);
