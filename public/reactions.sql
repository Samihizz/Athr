-- Post Reactions System for Athr Feed
-- Run this in your Supabase SQL editor

CREATE TABLE post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES content_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction TEXT DEFAULT 'like' CHECK (reaction IN ('like', 'heart', 'celebrate')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reactions" ON post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can react" ON post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reaction" ON post_reactions FOR DELETE USING (auth.uid() = user_id);
