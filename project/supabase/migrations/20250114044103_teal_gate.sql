/*
  # Add idea edit logging

  1. New Tables
    - `idea_edit_logs`
      - `id` (uuid, primary key)
      - `idea_id` (uuid, references ideas)
      - `editor_id` (uuid, references profiles)
      - `changes` (jsonb, stores before/after changes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `idea_edit_logs` table
    - Add policy for admins to create logs
    - Add policy for admins to view logs
*/

-- Create idea edit logs table
CREATE TABLE IF NOT EXISTS idea_edit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  editor_id UUID REFERENCES profiles(id),
  changes JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE idea_edit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can create edit logs"
ON idea_edit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' LIKE '%@kipi.ai'
);

CREATE POLICY "Admins can view edit logs"
ON idea_edit_logs
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' LIKE '%@kipi.ai'
);