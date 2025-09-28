-- Migration script to update users table to use username only
-- Run this SQL in your PostgreSQL database to update the schema

-- First, add the new columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_new UUID DEFAULT gen_random_uuid();

-- Update existing records to have UUIDs
UPDATE users SET id_new = gen_random_uuid() WHERE id_new IS NULL;

-- Drop the old primary key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;

-- Drop the old id column
ALTER TABLE users DROP COLUMN IF EXISTS id;

-- Rename the new column to id
ALTER TABLE users RENAME COLUMN id_new TO id;

-- Add the primary key constraint
ALTER TABLE users ADD PRIMARY KEY (id);

-- Remove first_name and last_name columns if they exist
ALTER TABLE users DROP COLUMN IF EXISTS first_name;
ALTER TABLE users DROP COLUMN IF EXISTS last_name;

-- Update foreign key references in other tables
-- Note: You may need to update these based on your actual data
-- ALTER TABLE game_nights ALTER COLUMN host_user_id TYPE UUID USING host_user_id::text::uuid;
-- ALTER TABLE game_night_participants ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid;
-- ALTER TABLE game_night_games ALTER COLUMN added_by_user_id TYPE UUID USING added_by_user_id::text::uuid;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
