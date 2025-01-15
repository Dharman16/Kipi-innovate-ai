-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'vote', 'beans', 'approved', 'rejected')),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Create notification trigger functions
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if the comment author is not the idea author
  IF NEW.author_id != (SELECT author_id FROM ideas WHERE id = NEW.idea_id) THEN
    INSERT INTO notifications (
      user_id,
      actor_id,
      idea_id,
      type,
      content
    )
    SELECT
      author_id,
      NEW.author_id,
      NEW.idea_id,
      'comment',
      'commented on your idea'
    FROM ideas
    WHERE id = NEW.idea_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_vote_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if the voter is not the idea author
  IF NEW.user_id != (SELECT author_id FROM ideas WHERE id = NEW.idea_id) THEN
    INSERT INTO notifications (
      user_id,
      actor_id,
      idea_id,
      type,
      content
    )
    SELECT
      author_id,
      NEW.user_id,
      NEW.idea_id,
      'vote',
      'voted on your idea'
    FROM ideas
    WHERE id = NEW.idea_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_beans_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    actor_id,
    idea_id,
    type,
    content
  )
  SELECT
    author_id,
    NEW.awarded_by,
    NEW.idea_id,
    'beans',
    format('awarded %s beans to your idea', NEW.beans_amount)
  FROM ideas
  WHERE id = NEW.idea_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'approved' AND OLD.status != 'approved') OR
     (NEW.status = 'rejected' AND OLD.status != 'rejected') THEN
    INSERT INTO notifications (
      user_id,
      actor_id,
      idea_id,
      type,
      content
    )
    VALUES (
      NEW.author_id,
      NEW.feedback_by,
      NEW.id,
      NEW.status,
      CASE
        WHEN NEW.status = 'approved' THEN 'approved your idea'
        WHEN NEW.status = 'rejected' THEN 'rejected your idea'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION create_comment_notification();

CREATE TRIGGER on_vote_created
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION create_vote_notification();

CREATE TRIGGER on_beans_awarded
  AFTER INSERT ON bean_awards
  FOR EACH ROW
  EXECUTE FUNCTION create_beans_notification();

CREATE TRIGGER on_idea_status_changed
  AFTER UPDATE OF status ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION create_status_notification();