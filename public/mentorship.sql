-- Mentorship matching system
CREATE TABLE mentorship_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  track TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mentee_id, mentor_id)
);

ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own mentorship requests" ON mentorship_requests
FOR SELECT USING (auth.uid() = mentee_id OR auth.uid() = mentor_id);

CREATE POLICY "Users can create mentorship requests" ON mentorship_requests
FOR INSERT WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentors can update requests" ON mentorship_requests
FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);
