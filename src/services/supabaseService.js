import { supabase, Lead, Client, Job, Employee, Invoice } from '@/lib/supabase'
import { safeSupabaseCall, isValidUUID, getCurrentUserSafe, checkEnvironment } from '@/utils/safeSupabase'

// Safe environment check
const validateEnvironment = () => {
  const env = checkEnvironment();
  if (!env.allPresent) {
    console.warn('Missing environment variables:', env.missing);
  }
  return env;
};

// Initialize environment check
validateEnvironment();

// LEADS OPERATIONS
export const getLeads = async () => {
  const currentUser = getCurrentUserSafe();
  if (!currentUser) {
    console.warn('No valid Supabase user — returning localStorage leads');
    const stored = JSON.parse(localStorage.getItem('fluxone_leads') || '[]');
    return stored;
  }

  const result = await safeSupabaseCall(async () => {
    console.log('=== FETCHING LEADS FROM SUPABASE ===');
    
    const accountId = currentUser.account_id;
    console.log('Current user:', { id: currentUser.id, email: currentUser.email });
    console.log('Account ID:', accountId);
    console.log('Is valid UUID:', isValidUUID(accountId));
    
    if (!isValidUUID(accountId)) {
      console.log('Invalid or demo account_id detected, returning localStorage leads');
      const stored = JSON.parse(localStorage.getItem('fluxone_leads') || '[]');
      return stored;
    }
    
    console.log('Fetching leads for valid account:', accountId);
    
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    console.log('Leads fetched:', data?.length || 0);
    return data || [];
  });

  if (!result.success) {
    console.warn('Supabase fetch failed, returning localStorage leads');
    return JSON.parse(localStorage.getItem('fluxone_leads') || '[]');
  }

  return result.data || [];
};

export const addLead = async (leadData) => {
  const currentUser = getCurrentUserSafe();

  const buildLocalLead = () => ({
    id: Date.now(),
    business_name: leadData.businessName || leadData.business_name || '',
    contact_name: leadData.contactName || leadData.contact_name || '',
    email: leadData.email || '',
    phone: leadData.phone || '',
    address: leadData.address || '',
    status: leadData.status || 'new',
    source: leadData.source || leadData.lead_source || 'manual',
    notes: leadData.notes || '',
    category: leadData.category || '',
    website: leadData.website || '',
    rating: leadData.rating || 0,
    reviews_count: leadData.rating_count || leadData.reviews_count || 0,
    email_confidence: leadData.email_confidence || 0,
    lead_source: leadData.source || leadData.lead_source || 'manual',
    estimated_value: leadData.estimated_value || 0,
    tags: leadData.tags || [],
    account_id: currentUser?.account_id || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const saveLocal = () => {
    const stored = JSON.parse(localStorage.getItem('fluxone_leads') || '[]');
    const newLead = buildLocalLead();
    stored.unshift(newLead);
    localStorage.setItem('fluxone_leads', JSON.stringify(stored));
    return newLead;
  };

  if (!currentUser) {
    console.warn('No valid Supabase user — saving lead to localStorage fallback');
    return saveLocal();
  }

  try {
    const accountId = currentUser.account_id;

    const insertData = {
      business_name: leadData.businessName || leadData.business_name || '',
      contact_name: leadData.contactName || leadData.contact_name || '',
      email: leadData.email || '',
      phone: leadData.phone || '',
      address: leadData.address || '',
      status: leadData.status || 'new',
      source: leadData.source || leadData.lead_source || 'manual',
      notes: leadData.notes || '',
      category: leadData.category || '',
      website: leadData.website || '',
      rating: leadData.rating || 0,
      reviews_count: leadData.rating_count || leadData.reviews_count || 0,
      email_confidence: leadData.email_confidence || 0,
      lead_source: leadData.source || leadData.lead_source || 'manual',
      estimated_value: leadData.estimated_value || 0,
      tags: leadData.tags || [],
      account_id: accountId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error adding lead:', JSON.stringify(error, null, 2));
      console.warn('Falling back to localStorage');
      return saveLocal();
    }
    console.log('Lead added to Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error adding lead, falling back to localStorage:', error);
    return saveLocal();
  }
};

export const updateLead = async (id, updates) => {
  // If ID is not a valid UUID, update in localStorage
  if (!isValidUUID(String(id))) {
    const stored = JSON.parse(localStorage.getItem('fluxone_leads') || '[]');
    const updated = stored.map(l => l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l);
    localStorage.setItem('fluxone_leads', JSON.stringify(updated));
    return updated.find(l => l.id === id);
  }

  try {
    const { data, error } = await supabase
      .from('leads')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    console.log('Lead updated in Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
};

export const deleteLead = async (id) => {
  // If ID is not a valid UUID, delete from localStorage
  if (!isValidUUID(String(id))) {
    const stored = JSON.parse(localStorage.getItem('fluxone_leads') || '[]');
    const filtered = stored.filter(l => l.id !== id);
    localStorage.setItem('fluxone_leads', JSON.stringify(filtered));
    console.log('Lead deleted from localStorage:', id);
    return true;
  }

  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    console.log('Lead deleted from Supabase:', id);
    return true;
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
};

// CLIENTS OPERATIONS
export const getClients = async () => {
  const currentUser = getCurrentUserSafe();
  if (!currentUser) {
    console.warn('No valid Supabase user — returning localStorage clients');
    const stored = JSON.parse(localStorage.getItem('fluxone_clients') || '[]');
    return stored;
  }

  const result = await safeSupabaseCall(async () => {
    console.log('=== FETCHING CLIENTS FROM SUPABASE ===');
    
    const accountId = currentUser.account_id;
    console.log('Current user:', { id: currentUser.id, email: currentUser.email });
    console.log('Account ID:', accountId);
    console.log('Is valid UUID:', isValidUUID(accountId));
    
    // If accountId is invalid (demo, null, or not a UUID), return localStorage fallback
    if (!isValidUUID(accountId)) {
      console.log('Invalid or demo account_id detected, returning localStorage clients');
      const stored = JSON.parse(localStorage.getItem('fluxone_clients') || '[]');
      return stored;
    }
    
    console.log('Fetching clients for valid account:', accountId);
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    console.log('Clients fetched:', data?.length || 0);
    return (data || []).map(c => ({
      ...c,
      businessName: c.business_name || c.businessName || '',
      contactName: c.contact_name || c.contactName || '',
      serviceType: c.service_type || c.serviceType || '',
      monthlyRevenue: c.pricing ?? c.monthlyRevenue ?? 0,
    }));
  });

  if (!result.success) {
    console.warn('Supabase fetch failed, returning localStorage clients');
    return JSON.parse(localStorage.getItem('fluxone_clients') || '[]');
  }

  return result.data || [];
};

export const addClient = async (clientData) => {
  const currentUser = getCurrentUserSafe();

  const buildLocalClient = () => ({
    id: Date.now(),
    business_name: clientData.businessName || clientData.business_name || '',
    contact_name: clientData.contactName || clientData.contact_name || '',
    email: clientData.email || '',
    phone: clientData.phone || '',
    address: clientData.address || '',
    service_type: clientData.serviceType || clientData.service_type || '',
    frequency: clientData.frequency || '',
    pricing: clientData.monthlyRevenue || clientData.pricing || 0,
    notes: clientData.notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const saveLocal = () => {
    const stored = JSON.parse(localStorage.getItem('fluxone_clients') || '[]');
    const newClient = buildLocalClient();
    stored.unshift(newClient);
    localStorage.setItem('fluxone_clients', JSON.stringify(stored));
    return { success: true, data: newClient, error: null };
  };

  if (!currentUser) {
    console.warn('No valid Supabase user — saving client to localStorage fallback');
    return saveLocal();
  }

  const result = await safeSupabaseCall(async () => {
    console.log('=== ADDING CLIENT TO SUPABASE ===');
    console.log('Client data:', clientData);
    
    const accountId = currentUser.account_id;
    
    const insertData = {
      business_name: clientData.businessName || clientData.business_name || '',
      contact_name: clientData.contactName || clientData.contact_name || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      address: clientData.address || '',
      service_type: clientData.serviceType || clientData.service_type || '',
      frequency: clientData.frequency || '',
      pricing: clientData.monthlyRevenue || clientData.pricing || 0,
      account_id: accountId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Insert data:', insertData);
    
    const { data, error } = await supabase
      .from('clients')
      .insert([insertData])
      .select();
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('No data returned from client insertion');
    }
    
    console.log('Client added to Supabase:', data[0]);
    return data[0];
  });

  if (result && result.success === false) {
    console.warn('Supabase insert failed, falling back to localStorage:', result.error?.message);
    return saveLocal();
  }

  return result;
};

export const updateClient = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    console.log('Client updated in Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    console.log('Client deleted from Supabase:', id);
    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

// LEAD CONVERSION & BULK CLEANUP

export const convertLeadToClient = async (lead) => {
  const currentUser = getCurrentUserSafe();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const clientData = {
    businessName: lead.business_name || lead.businessName || '',
    contactName: lead.contact_name || lead.contactName || '',
    email: lead.email || '',
    phone: lead.phone || '',
    address: lead.address || '',
    serviceType: 'Regular Cleaning',
    frequency: 'Weekly',
    monthlyRevenue: 0,
    notes: `Converted from lead. ${lead.notes || ''}`,
    account_id: lead.account_id || currentUser.account_id,
    status: 'Client'
  };

  const newClient = await addClient(clientData);
  const resultData = newClient?.data || newClient;
  await updateLead(lead.id, { status: 'client' });
  return resultData;
};

export const deleteAllLeads = async () => {
  const currentUser = getCurrentUserSafe();
  if (!currentUser) {
    localStorage.removeItem('fluxone_leads');
    return true;
  }

  const accountId = currentUser.account_id;
  if (!isValidUUID(accountId)) {
    localStorage.removeItem('fluxone_leads');
    return true;
  }

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('account_id', accountId);

  if (error) throw error;
  localStorage.removeItem('fluxone_leads');
  return true;
};

export const deleteAllClients = async () => {
  const currentUser = getCurrentUserSafe();
  if (!currentUser) {
    localStorage.removeItem('fluxone_clients');
    return true;
  }

  const accountId = currentUser.account_id;
  if (!isValidUUID(accountId)) {
    localStorage.removeItem('fluxone_clients');
    return true;
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('account_id', accountId);

  if (error) throw error;
  localStorage.removeItem('fluxone_clients');
  return true;
};

// JOBS OPERATIONS
export const getJobs = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const accountId = currentUser.account_id;
    
    if (!accountId) return [];
    
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('account_id', accountId)
      .order('date', { ascending: true });
    
    if (error) {
      console.warn('Supabase jobs fetch failed, returning localStorage jobs');
      return JSON.parse(localStorage.getItem('fluxone_jobs') || '[]');
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return JSON.parse(localStorage.getItem('fluxone_jobs') || '[]');
  }
};

export const addJob = async (jobData) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const accountId = currentUser.account_id;
    
    if (!accountId) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        ...jobData,
        account_id: accountId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    console.log('Job added to Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error adding job:', error);
    throw error;
  }
};

export const updateJob = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    console.log('Job updated in Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

export const deleteJob = async (id) => {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    console.log('Job deleted from Supabase:', id);
    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

// EMPLOYEES OPERATIONS
export const getEmployees = async () => {
  const result = await safeSupabaseCall(async () => {
    console.log('=== FETCHING EMPLOYEES FROM SUPABASE ===');
    
    const currentUser = getCurrentUserSafe();
    if (!currentUser) {
      console.warn('No valid current user found, returning empty array');
      return [];
    }
    
    const accountId = currentUser.account_id;
    console.log('Current user:', { id: currentUser.id, email: currentUser.email });
    console.log('Account ID:', accountId);
    console.log('Is valid UUID:', isValidUUID(accountId));
    
    // If accountId is invalid (demo, null, or not a UUID), return empty array safely
    if (!isValidUUID(accountId)) {
      console.log('Invalid or demo account_id detected, returning empty array');
      return [];
    }
    
    console.log('Fetching employees for valid account:', accountId);
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    console.log('Employees fetched:', data?.length || 0);
    return data || [];
  });

  if (!result.success) {
    console.warn('Supabase fetch failed, returning localStorage employees');
    return JSON.parse(localStorage.getItem('fluxone_employees') || '[]');
  }

  return result.data || [];
};

export const addEmployee = async (employeeData) => {
  return await safeSupabaseCall(async () => {
    console.log('=== ADDING EMPLOYEE TO SUPABASE ===');
    console.log('Employee data:', employeeData);
    
    const currentUser = getCurrentUserSafe();
    if (!currentUser) {
      throw new Error('User not authenticated - no valid current user found');
    }
    
    const accountId = currentUser.account_id;
    if (!isValidUUID(accountId)) {
      throw new Error('Invalid account_id - cannot add employee');
    }
    
    // Remove fields that might not exist in the database schema
    const insertData = {
      name: employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone,
      position: employeeData.position,
      hourly_rate: employeeData.hourly_rate,
      address: employeeData.address,
      status: employeeData.status,
      hire_date: employeeData.hire_date,
      account_id: accountId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Insert data:', insertData);
    
    const { data, error } = await supabase
      .from('employees')
      .insert([insertData])
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      throw new Error('No data returned from employee insertion');
    }
    
    console.log('Employee added to Supabase:', data[0]);
    return data[0];
  });
};

export const updateEmployee = async (id, employeeData) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update({
        ...employeeData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log('Employee updated in Supabase:', data[0]);
    return data[0];
  } catch (error) {
    console.error('=== ERROR UPDATING EMPLOYEE ===');
    console.error(error);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log('Employee deleted from Supabase:', id);
    return true;
  } catch (error) {
    console.error('=== ERROR DELETING EMPLOYEE ===');
    console.error(error);
    throw error;
  }
};

// INVOICES OPERATIONS
export const getInvoices = async () => {
  const result = await safeSupabaseCall(async () => {
    console.log('=== FETCHING INVOICES FROM SUPABASE ===');
    
    const currentUser = getCurrentUserSafe();
    if (!currentUser) {
      console.warn('No valid current user found, returning empty array');
      return [];
    }
    
    const accountId = currentUser.account_id;
    console.log('Current user:', { id: currentUser.id, email: currentUser.email });
    console.log('Account ID:', accountId);
    console.log('Is valid UUID:', isValidUUID(accountId));
    
    // If accountId is invalid (demo, null, or not a UUID), return empty array safely
    if (!isValidUUID(accountId)) {
      console.log('Invalid or demo account_id detected, returning empty array');
      return [];
    }
    
    console.log('Fetching invoices for valid account:', accountId);
    
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    console.log('Invoices fetched:', data?.length || 0);
    return data || [];
  });

  if (!result.success) {
    console.warn('Supabase fetch failed, returning localStorage invoices');
    return JSON.parse(localStorage.getItem('fluxone_invoices') || '[]');
  }

  return result.data || [];
};

export const addInvoice = async (invoiceData) => {
  return await safeSupabaseCall(async () => {
    console.log('=== ADDING INVOICE TO SUPABASE ===');
    console.log('Invoice data:', invoiceData);
    
    const currentUser = getCurrentUserSafe();
    if (!currentUser) {
      throw new Error('User not authenticated - no valid current user found');
    }
    
    const accountId = currentUser.account_id;
    if (!isValidUUID(accountId)) {
      throw new Error('Invalid account_id - cannot add invoice');
    }
    
    const newInvoice = {
      invoice_number: invoiceData.invoice_number,
      client_name: invoiceData.client_name,
      client_email: invoiceData.client_email,
      issue_date: invoiceData.issue_date,
      due_date: invoiceData.due_date,
      status: invoiceData.status,
      items: invoiceData.items || [],
      subtotal: parseFloat(invoiceData.subtotal) || 0,
      tax: parseFloat(invoiceData.tax) || 0,
      total: parseFloat(invoiceData.total) || 0,
      notes: invoiceData.notes,
      account_id: accountId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Insert data:', newInvoice);
    
    const { data, error } = await supabase
      .from('invoices')
      .insert([newInvoice])
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      throw new Error('No data returned from invoice insertion');
    }
    
    console.log('Invoice added to Supabase:', data[0]);
    return data[0];
  });
};

export const updateInvoice = async (id, invoiceData) => {
  try {
    console.log('=== UPDATING INVOICE IN SUPABASE ===');
    console.log('Invoice ID:', id);
    console.log('Invoice data:', invoiceData);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const accountId = currentUser.account_id;
    
    console.log('Current user:', currentUser);
    console.log('Account ID:', accountId);
    
    if (!accountId) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('invoices')
      .update({
        ...invoiceData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('account_id', accountId)
      .select();
    
    console.log('Supabase response:', { data, error });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Invoice updated in Supabase:', data[0]);
    return data[0];
  } catch (error) {
    console.error('=== ERROR UPDATING INVOICE ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    throw error;
  }
};

export const deleteInvoice = async (id) => {
  try {
    console.log('=== DELETING INVOICE FROM SUPABASE ===');
    console.log('Invoice ID:', id);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const accountId = currentUser.account_id;
    
    console.log('Current user:', currentUser);
    console.log('Account ID:', accountId);
    
    if (!accountId) throw new Error('User not authenticated');
    
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('account_id', accountId);
    
    console.log('Supabase response:', { error });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Invoice deleted from Supabase:', id);
    return true;
  } catch (error) {
    console.error('=== ERROR DELETING INVOICE ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    throw error;
  }
};

// DASHBOARD STATS
export const getDashboardStats = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const accountId = currentUser.account_id;
    
    if (!accountId) {
      return {
        totalLeads: 0,
        totalClients: 0,
        monthlyProfit: 0,
        jobsToday: 0
      };
    }
    
    const [leadsResult, clientsResult, jobsResult] = await Promise.all([
      supabase.from('leads').select('id').eq('account_id', accountId),
      supabase.from('clients').select('pricing').eq('account_id', accountId),
      supabase.from('jobs').select('date').eq('account_id', accountId)
    ]);
    
    const today = new Date().toDateString();
    const jobsToday = jobsResult.data?.filter(job => 
      new Date(job.date).toDateString() === today
    ).length || 0;
    
    const monthlyProfit = clientsResult.data?.reduce((sum, client) => 
      sum + (client.pricing || 0), 0
    ) || 0;
    
    return {
      totalLeads: leadsResult.data?.length || 0,
      totalClients: clientsResult.data?.length || 0,
      monthlyProfit,
      jobsToday
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalLeads: 0,
      totalClients: 0,
      monthlyProfit: 0,
      jobsToday: 0
    };
  }
};

export const deleteAllMessages = async () => {
  const currentUser = getCurrentUserSafe();
  if (!currentUser) {
    localStorage.removeItem('sentMessages');
    localStorage.removeItem('scheduledMessages');
    return true;
  }

  const accountId = currentUser.account_id;
  if (!isValidUUID(accountId)) {
    localStorage.removeItem('sentMessages');
    localStorage.removeItem('scheduledMessages');
    return true;
  }

  const { error } = await supabase
    .from('lead_messages')
    .delete()
    .eq('account_id', accountId);

  if (error) throw error;
  localStorage.removeItem('sentMessages');
  localStorage.removeItem('scheduledMessages');
  return true;
};

export const clearAllLocalData = () => {
  const keys = [
    'fluxone_leads',
    'fluxone_clients',
    'fluxone_jobs',
    'fluxone_invoices',
    'fluxone_employees',
    'fluxone_lead_groups',
    'fluxone_lead_notes',
    'fluxone_lead_tags',
    'fluxone_lead_status_updates',
    'fluxone_lead_follow_up_dates',
    'fluxone_lead_group_assignments',
    'fluxone_lead_schedule_notes',
    'sentMessages',
    'scheduledMessages',
    'fluxone_business_profile',
    'fluxone_general_settings',
    'fluxone_integrations'
  ];
  keys.forEach(key => localStorage.removeItem(key));
  return true;
};
