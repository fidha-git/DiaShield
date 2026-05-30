-- Migration: Add created_at column to health_records table if it does not exist
ALTER TABLE health_records
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
