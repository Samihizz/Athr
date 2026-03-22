-- Admin Panel Updates: Verified badge + admin delete policy
-- Run this in Supabase SQL Editor

-- Add verified column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Policy for admin to delete profiles
CREATE POLICY "Admins can delete profiles" ON profiles
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
  )
);

-- Policy for admin to update verified status
CREATE POLICY "Admins can update profiles" ON profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
  )
);
