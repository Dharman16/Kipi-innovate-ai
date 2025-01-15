/*
  # Add feedback attribution and timestamps
  
  1. Changes
    - Add feedback_by column to ideas table (references profiles)
    - Add feedback_at timestamp column to ideas table
    - Update RLS policies for feedback attribution
    
  2. Security
    - Maintain existing RLS policies
    - Add policy for feedback attribution viewing
*/

-- Add feedback attribution columns
ALTER TABLE ideas
ADD COLUMN IF NOT EXISTS feedback_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS feedback_at TIMESTAMPTZ;

-- Update RLS policies for feedback attribution
CREATE POLICY "Feedback attribution is viewable by everyone"
ON ideas
FOR SELECT
USING (true);

-- Add index for feedback queries
CREATE INDEX IF NOT EXISTS idx_ideas_feedback_by ON ideas(feedback_by);
CREATE INDEX IF NOT EXISTS idx_ideas_feedback_at ON ideas(feedback_at);