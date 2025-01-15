-- Create beans awards table
CREATE TABLE IF NOT EXISTS bean_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  awarded_by UUID REFERENCES profiles(id),
  beans_amount INTEGER NOT NULL CHECK (beans_amount > 0),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE bean_awards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can create bean awards"
ON bean_awards
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' LIKE '%@kipi.ai'
);

CREATE POLICY "Bean awards are viewable by everyone"
ON bean_awards
FOR SELECT
USING (true);

-- Add trigger to update total beans in ideas table
CREATE OR REPLACE FUNCTION update_total_beans()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ideas
  SET beans_earned = (
    SELECT COALESCE(SUM(beans_amount), 0)
    FROM bean_awards
    WHERE idea_id = NEW.idea_id
  )
  WHERE id = NEW.idea_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_idea_beans
AFTER INSERT OR UPDATE OR DELETE ON bean_awards
FOR EACH ROW EXECUTE FUNCTION update_total_beans();