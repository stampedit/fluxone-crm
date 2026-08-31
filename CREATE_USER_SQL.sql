-- Run this SQL in your Supabase SQL Editor
-- This creates your user account for FluxOne

-- Create your business account
INSERT INTO accounts (id, name, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', 
  'FluxOne Business', 
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create your user account
INSERT INTO users (id, name, email, password, account_id, role, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001', 
  'James Wilson',
  'james@minorcleaning.com', 
  'password123',
  '550e8400-e29b-41d4-a716-446655440000',
  'admin',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create the user in Supabase Auth
-- Go to Authentication → Users in your Supabase dashboard
-- Click "Add user" and add:
-- Email: james@minorcleaning.com
-- Password: password123
-- Role: admin
