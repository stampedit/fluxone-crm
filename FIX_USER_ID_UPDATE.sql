-- Fix User ID by Updating Existing User
-- Run this SQL in your Supabase SQL Editor

-- First, let's see the current user
SELECT id, email, name FROM users WHERE email = 'james@minorcleaning.com';

-- Update the existing user's ID to match Supabase Auth user ID
-- Note: This might fail due to UUID constraints, so we'll use a different approach

-- Approach 1: Try direct update (might fail)
UPDATE users 
SET id = '469f5cd1-85f4-4819-b05a-f7ee1535b7f7'
WHERE email = 'james@minorcleaning.com';

-- If the above fails, try this approach:
-- Delete old user and insert new one (but handle the constraint)

-- Approach 2: Delete and recreate with proper handling
BEGIN;
-- Delete existing user
DELETE FROM users WHERE email = 'james@minorcleaning.com';
-- Insert with new ID
INSERT INTO users (id, name, email, password, account_id, role, created_at)
VALUES (
  '469f5cd1-85f4-4819-b05a-f7ee1535b7f7', -- Your actual Supabase Auth user ID
  'James Wilson',
  'james@minorcleaning.com',
  'password123',
  '550e8400-e29b-41d4-a716-446655440000',
  'admin',
  NOW()
);
COMMIT;

-- Verify the user was updated correctly
SELECT * FROM users WHERE email = 'james@minorcleaning.com';
