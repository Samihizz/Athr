CREATE TABLE user_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  source_url TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('saudi_arabia', 'sudan', 'technology', 'business', 'general')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read news" ON user_news FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create news" ON user_news FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own news" ON user_news FOR DELETE USING (auth.uid() = author_id);
