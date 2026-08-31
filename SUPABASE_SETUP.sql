-- SUPABASE DATABASE SETUP FOR FLUXONE
-- Run this SQL in your Supabase project SQL Editor

-- Create accounts table
CREATE TABLE accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- In production, use proper hashing
  account_id UUID REFERENCES accounts(id),
  role TEXT DEFAULT 'employee',
  status TEXT DEFAULT 'active',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'new',
  source TEXT,
  notes TEXT,
  account_id UUID REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  service_type TEXT,
  frequency TEXT,
  pricing DECIMAL(10,2),
  account_id UUID REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration TEXT,
  service_type TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  client_phone TEXT,
  client_email TEXT,
  employee_id UUID REFERENCES users(id),
  employee_name TEXT,
  account_id UUID REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  position TEXT,
  hourly_rate DECIMAL(10,2),
  address TEXT,
  status TEXT DEFAULT 'active',
  hire_date DATE,
  account_id UUID REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'draft',
  subtotal DECIMAL(10,2),
  tax DECIMAL(10,2),
  total DECIMAL(10,2),
  items JSONB,
  notes TEXT,
  account_id UUID REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert your business account
INSERT INTO accounts (name) VALUES ('Minor Cleaning Service');

-- Insert your user account
INSERT INTO users (name, email, password, account_id, role) 
VALUES ('James Minor', 'james@minorcleaning.com', 'password123', (SELECT id FROM accounts WHERE name = 'Minor Cleaning Service'), 'admin');

-- Enable Row Level Security (RLS)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own account data" ON accounts
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own user data" ON users
  FOR ALL USING (account_id IN (SELECT id FROM accounts WHERE id = account_id));

CREATE POLICY "Users can manage their leads" ON leads
  FOR ALL USING (account_id IN (SELECT id FROM accounts WHERE id = account_id));

CREATE POLICY "Users can manage their clients" ON clients
  FOR ALL USING (account_id IN (SELECT id FROM accounts WHERE id = account_id));

CREATE POLICY "Users can manage their jobs" ON jobs
  FOR ALL USING (account_id IN (SELECT id FROM accounts WHERE id = account_id));

CREATE POLICY "Users can manage their employees" ON employees
  FOR ALL USING (account_id IN (SELECT id FROM accounts WHERE id = account_id));

CREATE POLICY "Users can manage their invoices" ON invoices
  FOR ALL USING (account_id IN (SELECT id FROM accounts WHERE id = account_id));
