-- Add author name + avatar columns to vansh_posts so all viewers can display them
ALTER TABLE vansh_posts ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE vansh_posts ADD COLUMN IF NOT EXISTS author_avatar TEXT;
