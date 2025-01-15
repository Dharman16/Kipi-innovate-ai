-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_idea_status_changed ON ideas;
DROP FUNCTION IF EXISTS create_status_notification;

-- Create improved status notification function
CREATE OR REPLACE FUNCTION create_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status != OLD.status) AND (NEW.status IN ('approved', 'rejected')) THEN
    INSERT INTO notifications (
      user_id,
      actor_id,
      idea_id,
      type,
      content
    )
    VALUES (
      NEW.author_id,
      COALESCE(NEW.feedback_by, auth.uid()),
      NEW.id,
      NEW.status,
      CASE
        WHEN NEW.status = 'approved' THEN 
          CASE 
            WHEN NEW.feedback IS NOT NULL THEN 
              'approved your idea with feedback: ' || NEW.feedback
            ELSE 
              'approved your idea'
          END
        WHEN NEW.status = 'rejected' THEN 
          CASE 
            WHEN NEW.feedback IS NOT NULL THEN 
              'rejected your idea with feedback: ' || NEW.feedback
            ELSE 
              'rejected your idea'
          END
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_idea_status_changed
  AFTER UPDATE OF status ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION create_status_notification();