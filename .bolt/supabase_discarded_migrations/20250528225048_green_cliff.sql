/*
  # Set up Admin Authentication System
  
  1. Changes
    - Create admin_users table for tracking admin accounts
    - Add RLS policies for admin access
    - Create initial admin user
    - Add proper indexes
    
  2. Security
    - Strict access control
    - Proper data isolation
    - Secure admin identification
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create admin-specific RLS policies
CREATE POLICY "Admin users can manage admin_users"
ON admin_users
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Add initial admin user
INSERT INTO admin_users (id, email)
SELECT id, email
FROM auth.users
WHERE email = 'Nick@one80services.com'
ON CONFLICT (email) DO NOTHING;

-- Create updated_at trigger
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);