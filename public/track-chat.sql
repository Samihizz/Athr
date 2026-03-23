-- Track Group Chat Messages
CREATE TABLE track_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id TEXT NOT NULL CHECK (track_id IN ('ai', 'creative', 'business', 'marketing', 'finance', 'tech')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  avatar_url TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE track_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read track messages" ON track_messages FOR SELECT USING (true);
CREATE POLICY "Users can send track messages" ON track_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON track_messages FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_track_messages_track ON track_messages (track_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE track_messages;
