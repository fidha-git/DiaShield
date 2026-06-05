-- Migration: Add glucose_period column to health_records
ALTER TABLE health_records
ADD COLUMN IF NOT EXISTS glucose_period VARCHAR;
