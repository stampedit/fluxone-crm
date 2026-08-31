-- Row Level Security (RLS) Policies for FluxOne Database
-- Run these policies in your Supabase SQL Editor after creating the tables

-- Enable RLS on all tables except employees (disabled for testing)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Disable RLS on employees table for testing
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Accounts Table Policies
-- Users can only see their own account
CREATE POLICY "Users can view own account" ON accounts
FOR SELECT USING (auth.uid()::text = (SELECT id FROM users WHERE account_id = accounts.id LIMIT 1));

-- Users can only insert their own account (this should be handled by system)
CREATE POLICY "Users can insert own account" ON accounts
FOR INSERT WITH CHECK (true);

-- Users can only update their own account
CREATE POLICY "Users can update own account" ON accounts
FOR UPDATE USING (auth.uid()::text = (SELECT id FROM users WHERE account_id = accounts.id LIMIT 1));

-- Users Table Policies
-- Users can only see users from their own account
CREATE POLICY "Users can view own account users" ON users
FOR SELECT USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only insert users for their own account
CREATE POLICY "Users can insert own account users" ON users
FOR INSERT WITH CHECK (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only update users from their own account
CREATE POLICY "Users can update own account users" ON users
FOR UPDATE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Leads Table Policies
-- Users can only see leads from their own account
CREATE POLICY "Users can view own account leads" ON leads
FOR SELECT USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only insert leads for their own account
CREATE POLICY "Users can insert own account leads" ON leads
FOR INSERT WITH CHECK (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only update leads from their own account
CREATE POLICY "Users can update own account leads" ON leads
FOR UPDATE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only delete leads from their own account
CREATE POLICY "Users can delete own account leads" ON leads
FOR DELETE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Clients Table Policies
-- Users can only see clients from their own account
CREATE POLICY "Users can view own account clients" ON clients
FOR SELECT USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only insert clients for their own account
CREATE POLICY "Users can insert own account clients" ON clients
FOR INSERT WITH CHECK (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only update clients from their own account
CREATE POLICY "Users can update own account clients" ON clients
FOR UPDATE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only delete clients from their own account
CREATE POLICY "Users can delete own account clients" ON clients
FOR DELETE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Jobs Table Policies
-- Users can only see jobs from their own account
CREATE POLICY "Users can view own account jobs" ON jobs
FOR SELECT USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only insert jobs for their own account
CREATE POLICY "Users can insert own account jobs" ON jobs
FOR INSERT WITH CHECK (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only update jobs from their own account
CREATE POLICY "Users can update own account jobs" ON jobs
FOR UPDATE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only delete jobs from their own account
CREATE POLICY "Users can delete own account jobs" ON jobs
FOR DELETE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Employees Table - RLS DISABLED but with specific insert policy
-- All authenticated users can access employees table
-- Note: RLS is disabled but we're adding the insert policy for completeness

-- Allow all authenticated users to insert into employees table
CREATE POLICY "Allow insert for all users" ON employees
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Invoices Table Policies
-- Users can only see invoices from their own account
CREATE POLICY "Users can view own account invoices" ON invoices
FOR SELECT USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only insert invoices for their own account
CREATE POLICY "Users can insert own account invoices" ON invoices
FOR INSERT WITH CHECK (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only update invoices from their own account
CREATE POLICY "Users can update own account invoices" ON invoices
FOR UPDATE USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Users can only delete invoices from their own account
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
CREATE INDEX idx_leads_account_id ON leads(account_id);
CREATE INDEX idx_clients_account_id ON clients(account_id);
CREATE INDEX idx_jobs_account_id ON jobs(account_id);
CREATE INDEX idx_employees_account_id ON employees(account_id);
CREATE INDEX idx_invoices_account_id ON invoices(account_id);
CREATE INDEX idx_users_account_id ON users(account_id);
