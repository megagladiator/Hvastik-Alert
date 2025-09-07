-- Create pets table for Хвостик Alert platform
CREATE TABLE IF NOT EXISTS pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('lost', 'found')),
  animal_type VARCHAR(50) NOT NULL,
  breed VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  color VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  reward INTEGER,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'found', 'archived'))
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pets_type ON pets(type);
CREATE INDEX IF NOT EXISTS idx_pets_animal_type ON pets(animal_type);
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_created_at ON pets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pets_location ON pets(latitude, longitude);

-- Enable Row Level Security
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (in production, you'd want more restrictive policies)
CREATE POLICY "Allow all operations on pets" ON pets
  FOR ALL USING (true);
