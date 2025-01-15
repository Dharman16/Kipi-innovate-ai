/*
  # Add resource links to ideas table

  1. Changes
    - Add JSONB column `resource_links` to ideas table to store link information
    - Column will store an array of objects with title and URL

  2. Structure
    Each resource link object will have:
    - id: string (UUID)
    - title: string
    - url: string
*/

-- Add resource_links column to ideas table
ALTER TABLE ideas
ADD COLUMN IF NOT EXISTS resource_links JSONB DEFAULT '[]'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_ideas_resource_links ON ideas USING gin(resource_links);