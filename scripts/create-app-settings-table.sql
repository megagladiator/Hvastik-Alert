-- Create app_settings table for global application settings
CREATE TABLE IF NOT EXISTS app_settings (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
background_image_url TEXT,
background_darkening_percentage INTEGER DEFAULT 50 CHECK (background_darkening_percentage >= 0 AND background_darkening_percentage <= 100),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default row if it doesn't exist
INSERT INTO app_settings (id, background_image_url, background_darkening_percentage)
VALUES ('00000000-0000-0000-0000-000000000001', '/placeholder.svg?height=1080&width=1920', 50)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (adjust policies as needed for production)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to app_settings
CREATE POLICY "Allow public read access to app_settings" ON app_settings
FOR SELECT USING (true);

-- Policy to allow update access (e.g., for authenticated admins)
-- You'll need to adjust this policy based on your authentication setup.
-- For now, it allows anyone to update, which is NOT recommended for production.
CREATE POLICY "Allow authenticated users to update app_settings" ON app_settings
FOR UPDATE USING (true); -- Change to auth.uid() IS NOT NULL or specific role checks in production
