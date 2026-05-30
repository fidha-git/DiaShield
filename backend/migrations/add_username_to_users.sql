-- Migration: Add username column to users table
ALTER TABLE users ADD COLUMN username VARCHAR;

-- Set username to email for existing users
UPDATE users SET username = email WHERE username IS NULL;

-- Make username unique and not null
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username);
