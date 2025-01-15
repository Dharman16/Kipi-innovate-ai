-- Drop existing policy
DROP POLICY IF EXISTS "Idea authors can manage contributors" ON idea_contributors;

-- Create new policy that allows both idea authors and admins to manage contributors
CREATE POLICY "Authors and admins can manage contributors"
ON idea_contributors
USING (
  auth.uid() IN (
    SELECT author_id FROM ideas WHERE id = idea_id
  ) OR 
  auth.jwt() ->> 'email' LIKE '%@kipi.ai'
)
WITH CHECK (
  auth.uid() IN (
    SELECT author_id FROM ideas WHERE id = idea_id
  ) OR 
  auth.jwt() ->> 'email' LIKE '%@kipi.ai'
);