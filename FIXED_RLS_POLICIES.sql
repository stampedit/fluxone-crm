-- Fixed RLS Policies for FluxOne Database
-- Run these policies in your Supabase SQL Editor after creating the tables

-- First, disable RLS on all tables, then re-enable with proper policies
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own account" ON accounts;
DROP POLICY IF EXISTS "Users can insert own account" ON accounts;
DROP POLICY IF EXISTS "Users can update own account" ON accounts;
DROP POLICY IF EXISTS "Users can view own account users" ON users;
DROP POLICY IF EXISTS "Users can insert own account users" ON users;
DROP POLICY IF EXISTS "Users can update own account users" ON users;
DROP POLICY IF EXISTS "Users can view own account leads" ON leads;
DROP POLICY IF EXISTS "Users can insert own account leads" ON leads;
DROP POLICY IF EXISTS "Users can update own account leads" ON leads;
DROP POLICY IF EXISTS "Users can delete own account leads" ON leads;
DROP POLICY IF EXISTS "Users can view own account clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own account clients" ON clients;
DROP POLICY IF EXISTS "Users can update own account clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own account clients" ON clients;
DROP POLICY IF EXISTS "Users can view own account jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert own account jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own account jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete own account jobs" ON jobs;
DROP POLICY IF EXISTS "Allow insert for all users" ON employees;
DROP POLICY IF EXISTS "Users can view own account invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert own account invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own account invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own account invoices" ON invoices;

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Keep employees table RLS disabled for testing (can be enabled later)
-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Accounts Table Policies (for system use only)
CREATE POLICY "System can view accounts" ON accounts
FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "System can insert accounts" ON accounts
FOR INSERT USING (auth.role() = 'service_role');

CREATE POLICY "System can update accounts" ON accounts
FOR UPDATE USING (auth.role() = 'service_role');

-- Users Table Policies
CREATE POLICY "Users can view own account users" ON users
FOR SELECT USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can insert own account users" ON users
FOR INSERT WITH CHECK (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can update own account users" ON users
FOR UPDATE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Leads Table Policies
CREATE POLICY "Users can view own account leads" ON leads
FOR SELECT USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can insert own account leads" ON leads
FOR INSERT WITH CHECK (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can update own account leads" ON leads
FOR UPDATE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can delete own account leads" ON leads
FOR DELETE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Clients Table Policies
CREATE POLICY "Users can view own account clients" ON clients
FOR SELECT USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can insert own account clients" ON clients
FOR INSERT WITH CHECK (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can update own account clients" ON clients
FOR UPDATE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can delete own account clients" ON clients
FOR DELETE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Jobs Table Policies
CREATE POLICY "Users can view own account jobs" ON jobs
FOR SELECT USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can insert own account jobs" ON jobs
FOR INSERT WITH CHECK (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can update own account jobs" ON jobs
FOR UPDATE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can delete own account jobs" ON jobs
FOR DELETE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Employees Table - RLS DISABLED for testing
-- No policies needed since RLS is disabled
-- When ready to enable RLS, uncomment and run:
-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own account employees" ON employees FOR SELECT USING (account_id IN (SELECT account_id FROM users WHERE id = auth.uid()));
-- CREATE POLICY "Users can insert own account employees" ON employees FOR INSERT WITH CHECK (account_id IN (SELECT account_id FROM users WHERE id = auth.uid())));
-- CREATE POLICY "Users can update own account employees" ON employees FOR UPDATE USING (account_id IN (SELECT account_id FROM users WHERE id = auth.uid())));
-- CREATE POLICY "Users can delete own account employees" ON employees FOR DELETE USING (account_id IN (SELECT account_id FROM users WHERE id = auth.uid())));

-- Invoices Table Policies
CREATE POLICY "Users can view own account invoices" ON invoices
FOR SELECT USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can insert own account invoices" ON invoices
FOR INSERT WITH CHECK (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can update own account invoices" ON invoices
FOR UPDATE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can delete own account invoices" ON invoices
FOR DELETE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Create a function to get current user's account_id
CREATE OR REPLACE FUNCTION get_current_account_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT account_id 
    FROM users 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_account_id ON leads(account_id);
CREATE INDEX IF NOT EXISTS idx_clients_account_id ON clients(account_id);
CREATE INDEX IF NOT EXISTS idx_jobs_account_id ON jobs(account_id);
CREATE INDEX IF NOT EXISTS idx_invoices_account_id ON invoices(account_id);
CREATE INDEX IF NOT EXISTS idx_users_account_id ON users(account_id);

-- Create a test user and account for development (if they don't exist)
-- This helps with testing the system
DO $$
BEGIN
  -- Create test account if it doesn't exist
  INSERT INTO accounts (id, name, created_at, updated_at)
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Test Account',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Create test user if it doesn't exist
  INSERT INTO users (id, email, account_id, created_at, updated_at)
  VALUES (
    '00000000-0000-0000-0000-000000000002',
    'james@minorcleaning.com',
    '00000000-0000-0000-0000-000000000001',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
END $$;
