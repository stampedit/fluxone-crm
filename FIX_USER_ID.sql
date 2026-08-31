-- Fix User ID to Match Supabase Auth User
-- Run this SQL in your Supabase SQL Editor after creating the Auth user

-- First, let's see what Supabase Auth user ID was created
-- Go to Authentication → Users in Supabase dashboard to get the actual user ID
-- It should look like: 550e8400-e29b-41d4-a716-446655440001 (or similar)

-- Update the database user to match the Supabase Auth user ID
-- Replace 'YOUR_SUPABASE_AUTH_USER_ID' with the actual ID from Authentication → Users

UPDATE users 
SET 
  id = 'YOUR_SUPABASE_AUTH_USER_ID'
WHERE email = 'james@minorcleaning.com';

-- If the above doesn't work, try deleting and recreating with correct ID
DELETE FROM users WHERE email = 'james@minorcleaning.com';

-- Then insert with correct ID (replace YOUR_SUPABASE_AUTH_USER_ID)
INSERT INTO users (id, name, email, password, account_id, role, created_at)
VALUES (
  'YOUR_SUPABASE_AUTH_USER_ID', -- Replace with actual Supabase Auth user ID
  'James Wilson',
  'james@minorcleaning.com',
  'password123',
  '550e8400-e29b-41d4-a716-446655440000',
  'admin',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the user was created correctly
SELECT * FROM users WHERE email = 'james@minorcleaning.com';
