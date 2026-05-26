-- Add password and update image_url to support base64 for cross-device login and profile pics
ALTER TABLE vansh_members ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE vansh_members ALTER COLUMN image_url TYPE TEXT;
