-- Update Database User ID to Match Supabase Auth User
-- Run this SQL in your Supabase SQL Editor

-- Delete the old user with incorrect ID
DELETE FROM users WHERE email = 'james@minorcleaning.com';

-- Insert user with correct Supabase Auth user ID
INSERT INTO users (id, name, email, password, account_id, role, created_at)
VALUES (
  '469f5cd1-85f4-4819-b05a-f7ee1535b7f7', -- Your actual Supabase Auth user ID
  'James Wilson',
  'james@minorcleaning.com',
  'password123',
  '550e8400-e29b-41d4-a716-446655440000',
  'admin',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the user was created correctly
SELECT * FROM users WHERE email = 'james@minorcleaning.com';
