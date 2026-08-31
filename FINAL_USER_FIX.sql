-- Final Fix for User ID Constraint Issue
-- Try this approach if the previous ones failed

-- Approach 1: Check what users exist
SELECT id, email, name FROM users WHERE email = 'james@minorcleaning.com';

-- Approach 2: Try to update the existing user's ID directly
-- This might work if there are no foreign key constraints
UPDATE users 
SET id = '469f5cd1-85f4-4819-b05a-f7ee1535b7f7'
WHERE email = 'james@minorcleaning.com';

-- If that fails, try this more forceful approach:
-- Drop and recreate the user table temporarily (only if you have no important data)

-- Approach 3: Use a temporary email to bypass constraint
BEGIN;
-- Update existing user to temporary email
UPDATE users SET email = 'temp_james@minorcleaning.com' WHERE email = 'james@minorcleaning.com';
-- Insert new user with correct ID and original email
INSERT INTO users (id, name, email, password, account_id, role, created_at)
VALUES (
  '469f5cd1-85f4-4819-b05a-f7ee1535b7f7',
  'James Wilson',
  'james@minorcleaning.com',
  'password123',
  '550e8400-e29b-41d4-a716-446655440000',
  'admin',
  NOW()
);
-- Delete the old user with temporary email
DELETE FROM users WHERE email = 'temp_james@minorcleaning.com';
COMMIT;

-- Verify the fix worked
SELECT * FROM users WHERE email = 'james@minorcleaning.com';
