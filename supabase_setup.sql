-- Create the family_members table
CREATE TABLE family_members (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  gender TEXT,
  age INTEGER,
  caste TEXT,
  sub_caste TEXT,
  gotra TEXT,
  native_place TEXT,
  parents JSONB DEFAULT '[]',
  spouse TEXT,
  verified BOOLEAN DEFAULT true,
  gen INTEGER DEFAULT 2,
  bio TEXT,
  education TEXT,
  occupation TEXT,
  image_url TEXT,
  mobile TEXT,
  password TEXT,
  deceased BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Turn off Row Level Security for easy public access (since this is a shared family tree)
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
