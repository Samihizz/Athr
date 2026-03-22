-- ============================================
-- Post Comments Table
-- ============================================

CREATE TABLE post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES content_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  avatar_url TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON post_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Delete policies for content_posts
-- ============================================

CREATE POLICY "Users can delete own posts"
  ON content_posts FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete any post"
  ON content_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );
