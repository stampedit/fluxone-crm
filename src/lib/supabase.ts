import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

// Debug environment variables
console.log('=== SUPABASE CLIENT INITIALIZATION ===');
console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables not properly configured');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'fluxone-auth-token',
  },
})

// Database table interfaces
export interface Lead {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string
  address: string
  status: string
  source: string
  notes: string
  account_id: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string
  address: string
  service_type: string
  frequency: string
  pricing: number
  account_id: string
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  client_name: string
  date: string
  time: string
  duration: string
  service_type: string
  status: string
  notes: string
  client_phone: string
  client_email: string
  employee_id?: string
  employee_name?: string
  account_id: string
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  position: string
  hourly_rate: number
  address: string
  status: string
  hire_date: string
  account_id: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  client_name: string
  client_email: string
  issue_date: string
  due_date: string
  status: string
  subtotal: number
  tax: number
  total: number
  items: any[]
  notes: string
  account_id: string
  created_at: string
  updated_at: string
}
