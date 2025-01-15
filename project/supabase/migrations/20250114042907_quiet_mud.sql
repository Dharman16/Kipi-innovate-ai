/*
  # Add hidden column to ideas table
  
  1. Changes
    - Add `hidden` boolean column to ideas table with default value false
    - Update RLS policies to respect hidden status
  
  2. Security
    - Only admins can update hidden status
*/

-- Add hidden column with default value false
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;

-- Create policy for admins to update hidden status
CREATE POLICY "Admins can update hidden status"
ON ideas
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' LIKE '%@kipi.ai'
)
WITH CHECK (
  auth.jwt() ->> 'email' LIKE '%@kipi.ai'
);

-- Update existing policies to respect hidden status
DROP POLICY IF EXISTS "Ideas are viewable by everyone" ON ideas;
CREATE POLICY "Ideas are viewable by everyone"
ON ideas FOR SELECT
USING (
  NOT hidden OR 
  (auth.jwt() ->> 'email' LIKE '%@kipi.ai')
);