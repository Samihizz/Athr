CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('design', 'development', 'marketing', 'translation', 'consulting', 'tutoring', 'photography', 'video', 'writing', 'other')),
  price_range TEXT,
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'negotiable')),
  track TEXT,
  contact_method TEXT DEFAULT 'whatsapp',
  contact_value TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read services" ON services FOR SELECT USING (true);
CREATE POLICY "Users can create services" ON services FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own services" ON services FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own services" ON services FOR DELETE USING (auth.uid() = author_id);
