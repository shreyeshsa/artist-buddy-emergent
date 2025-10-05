# Database Setup Instructions

Your Artist Buddy application has been successfully configured with Supabase authentication and database persistence features. However, the database schema needs to be manually set up.

## Database Schema Required

You need to create the following tables in your Supabase database:

### 1. user_images Table

```sql
CREATE TABLE IF NOT EXISTS user_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_data text NOT NULL,
  image_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own images"
  ON user_images FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
  ON user_images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images"
  ON user_images FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON user_images FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON user_images(user_id);
```

### 2. projects Table

```sql
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_name text NOT NULL,
  canvas_data jsonb NOT NULL,
  grid_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
```

### 3. palette_projects Table

```sql
CREATE TABLE IF NOT EXISTS palette_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  palette_name text NOT NULL,
  colors jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE palette_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own palette projects"
  ON palette_projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own palette projects"
  ON palette_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own palette projects"
  ON palette_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own palette projects"
  ON palette_projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_palette_projects_user_id ON palette_projects(user_id);
```

## How to Set Up the Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL code for each table above
4. Execute the SQL to create the tables and policies
5. Verify the tables were created successfully

## Features Implemented

✅ **Authentication System**
- Email/password authentication using Supabase
- Persistent login sessions
- Sign up and login functionality
- Secure logout

✅ **Projects Tab**
- Save canvas/grid projects with a name
- View all saved projects
- Delete projects
- Projects are stored per user

✅ **Palette Projects Tab**
- Save color palettes
- View all saved palettes
- Delete palettes
- Palettes are stored per user

✅ **Save Project Button**
- Located in the Grid tab > Export section
- Saves current canvas state and grid settings

✅ **Save Palette Button**
- Located next to Export button in Your Palette tab
- Saves palette with all colors to Palette Projects

✅ **Default Grid Settings**
- Show Diagonals: ON by default
- Show Grid Numbers: ON by default
- Users can toggle these off if desired

## Testing After Database Setup

Once you've set up the database:

1. Create a new account using the Sign Up tab
2. Log in with your credentials
3. In the Grid tab, create a canvas and apply grid settings
4. Go to Export tab and click "Save Project"
5. Navigate to Projects tab to see your saved project
6. In Your Palette tab, create a palette with colors
7. Click "Save in Project" button
8. Navigate to Palette Projects tab to see your saved palette

## Notes

- All data is securely stored per user with Row Level Security (RLS)
- Users can only access their own data
- Sessions persist across page refreshes
- Images uploaded in the color picker will be saved to the database once the schema is set up

## Environment Variables

Your `.env` file is already configured with:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

These are used to connect to your Supabase instance.
