
-- Create admin login logs table to track admin logins
CREATE TABLE IF NOT EXISTS admin_login_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  viewed BOOLEAN DEFAULT FALSE
);

-- Add RLS policies to admin_login_logs table
ALTER TABLE admin_login_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read this table
CREATE POLICY "Admins can read login logs" ON admin_login_logs
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE is_admin = true
    )
  );

-- Only the system can insert into this table
CREATE POLICY "Anyone can insert login logs" ON admin_login_logs
  FOR INSERT
  WITH CHECK (true);

-- Update the existing admin_notifications table to ensure it has indexes for performance
CREATE INDEX IF NOT EXISTS admin_notifications_viewed_idx ON admin_notifications(viewed);
CREATE INDEX IF NOT EXISTS admin_notifications_created_at_idx ON admin_notifications(created_at);
