// Data Abstraction Layer - Ready for Firebase integration later

// Mock Data
let mockLeads = [
  {
    id: '1',
    businessName: 'Downtown Dental Clinic',
    contactName: 'Dr. Sarah Johnson',
    phone: '(555) 123-4567',
    email: 'sarah@downtowndental.com',
    address: '123 Main St, Downtown, NY 10001',
    notes: 'Interested in weekly cleaning services',
    status: 'Lead'
  },
  {
    id: '2',
    businessName: 'FitLife Gym',
    contactName: 'Mike Chen',
    phone: '(555) 234-5678',
    email: 'mike@fitlifegym.com',
    address: '456 Oak Ave, Midtown, NY 10002',
    notes: 'Needs daily cleaning, large facility',
    status: 'Contacted'
  },
  {
    id: '3',
    businessName: 'Office Park Plaza',
    contactName: 'Lisa Rodriguez',
    phone: '(555) 345-6789',
    email: 'lisa@officepark.com',
    address: '789 Elm St, Uptown, NY 10003',
    notes: 'Multiple office units, needs quote',
    status: 'Prospect'
  }
];

let mockClients = [
  {
    id: '1',
    businessName: 'Sparkle Clean Co.',
    contactName: 'Tom Wilson',
    phone: '(555) 456-7890',
    email: 'tom@sparkleclean.com',
    address: '321 Pine St, Brooklyn, NY 11201',
    assignedEmployees: ['John Doe', 'Jane Smith'],
    notes: 'Regular client, pays on time',
    pricing: {
      pricePerClean: 250,
      employeePay: 150,
      frequency: 4
    }
  },
  {
    id: '2',
    businessName: 'Green Leaf Restaurant',
    contactName: 'Maria Garcia',
    phone: '(555) 567-8901',
    email: 'maria@greenleaf.com',
    address: '654 Maple Dr, Queens, NY 11101',
    assignedEmployees: ['Bob Johnson'],
    notes: 'Kitchen deep cleaning required',
    pricing: {
      pricePerClean: 180,
      employeePay: 100,
      frequency: 3
    }
  }
];

let mockJobs = [
  {
    id: '1',
    clientName: 'Sparkle Clean Co.',
    employeeName: 'John Doe',
    date: '2024-01-15',
    status: 'Completed'
  },
  {
    id: '2',
    clientName: 'Green Leaf Restaurant',
    employeeName: 'Bob Johnson',
    date: '2024-01-16',
    status: 'Scheduled'
  },
  {
    id: '3',
    clientName: 'Sparkle Clean Co.',
    employeeName: 'Jane Smith',
    date: '2024-01-16',
    status: 'In Progress'
  }
];

// Mock business search data (simulating Google Places API)
const mockBusinessData = [
  {
    businessName: 'Metro Dental Associates',
    address: '100 Broadway, New York, NY 10004',
    rating: 4.5,
    phone: '(555) 111-2222',
    category: 'dentist'
  },
  {
    businessName: 'Elite Fitness Center',
    address: '200 5th Ave, New York, NY 10010',
    rating: 4.2,
    phone: '(555) 333-4444',
    category: 'gym'
  },
  {
    businessName: 'Corporate Tower Offices',
    address: '300 Madison Ave, New York, NY 10017',
    rating: 3.8,
    phone: '(555) 555-6666',
    category: 'office'
  },
  {
    businessName: 'Sunrise Wellness Spa',
    address: '400 Park Ave, New York, NY 10022',
    rating: 3.5,
    phone: '(555) 777-8888',
    category: 'spa'
  },
  {
    businessName: 'Tech Startup Hub',
    address: '500 Wall St, New York, NY 10005',
    rating: 4.7,
    phone: '(555) 999-0000',
    category: 'office'
  }
];

// LEAD FUNCTIONS
export const getLeads = () => {
  return Promise.resolve([...mockLeads]);
};

export const addLead = (lead) => {
  const newLead = {
    id: Date.now().toString(),
    ...lead,
    status: lead.status || 'Lead'
  };
  mockLeads.push(newLead);
  return Promise.resolve(newLead);
};

export const updateLead = (id, updates) => {
  const index = mockLeads.findIndex(lead => lead.id === id);
  if (index !== -1) {
    mockLeads[index] = { ...mockLeads[index], ...updates };
    return Promise.resolve(mockLeads[index]);
  }
  return Promise.reject(new Error('Lead not found'));
};

export const deleteLead = (id) => {
  const index = mockLeads.findIndex(lead => lead.id === id);
  if (index !== -1) {
    mockLeads.splice(index, 1);
    return Promise.resolve(true);
  }
  return Promise.reject(new Error('Lead not found'));
};

// CLIENT FUNCTIONS
export const getClients = () => {
  return Promise.resolve([...mockClients]);
};

export const addClient = (client) => {
  const newClient = {
    id: Date.now().toString(),
    ...client,
    pricing: {
      pricePerClean: client.pricing?.pricePerClean || 200,
      employeePay: client.pricing?.employeePay || 120,
      frequency: client.pricing?.frequency || 2
    }
  };
  mockClients.push(newClient);
  return Promise.resolve(newClient);
};

export const updateClient = (id, updates) => {
  const index = mockClients.findIndex(client => client.id === id);
  if (index !== -1) {
    mockClients[index] = { ...mockClients[index], ...updates };
    return Promise.resolve(mockClients[index]);
  }
  return Promise.reject(new Error('Client not found'));
};

// JOB FUNCTIONS
export const getJobs = () => {
  return Promise.resolve([...mockJobs]);
};

export const addJob = (job) => {
  const newJob = {
    id: Date.now().toString(),
    ...job,
    status: job.status || 'Scheduled'
  };
  mockJobs.push(newJob);
  return Promise.resolve(newJob);
};

export const updateJob = (id, updates) => {
  const index = mockJobs.findIndex(job => job.id === id);
  if (index !== -1) {
    mockJobs[index] = { ...mockJobs[index], ...updates };
    return Promise.resolve(mockJobs[index]);
  }
  return Promise.reject(new Error('Job not found'));
};

// SEARCH FUNCTIONS
export const searchBusinesses = (query) => {
  const filtered = mockBusinessData.filter(business => 
    business.businessName.toLowerCase().includes(query.toLowerCase()) ||
    business.address.toLowerCase().includes(query.toLowerCase())
  );
  return Promise.resolve(filtered);
};

export const getBusinessesByCategory = (category) => {
  let filtered = mockBusinessData;
  
  switch(category) {
    case 'offices':
      filtered = mockBusinessData.filter(b => b.category === 'office');
      break;
    case 'dentists':
      filtered = mockBusinessData.filter(b => b.category === 'dentist');
      break;
    case 'gyms':
      filtered = mockBusinessData.filter(b => b.category === 'gym');
      break;
    case 'low':
      filtered = mockBusinessData.filter(b => b.rating < 4);
      break;
    case 'new':
      filtered = mockBusinessData.filter(b => b.rating > 4.5);
      break;
    default:
      filtered = mockBusinessData;
  }
  
  return Promise.resolve(filtered);
};

// STATS FUNCTIONS
export const getDashboardStats = () => {
  const totalLeads = mockLeads.length;
  const totalClients = mockClients.length;
  const monthlyProfit = mockClients.reduce((total, client) => {
    const profitPerClean = client.pricing.pricePerClean - client.pricing.employeePay;
    return total + (profitPerClean * client.pricing.frequency);
  }, 0);
  
  const today = new Date().toISOString().split('T')[0];
  const jobsToday = mockJobs.filter(job => job.date === today).length;
  
  return Promise.resolve({
    totalLeads,
    totalClients,
    monthlyProfit,
    jobsToday
  });
};

// EMAIL TEMPLATES
export const getEmailTemplates = () => {
  return Promise.resolve([
    {
      id: 'cold',
      name: 'Cold Outreach',
      subject: 'Professional Cleaning Services for {{business_name}}',
      body: `Hi {{contact_name}},

I hope this email finds you well. My name is [Your Name] and I'm with FluxOne Cleaning Services.

I noticed {{business_name}} in {{city}} and wanted to reach out about our professional cleaning services. We specialize in commercial cleaning and help businesses like yours maintain a pristine environment.

Would you be available for a quick call next week to discuss how we can help?

Best regards,
[Your Name]
FluxOne Cleaning Services`
    },
    {
      id: 'followup',
      name: 'Follow-up',
      subject: 'Following up on Cleaning Services for {{business_name}}',
      body: `Hi {{contact_name}},

I wanted to follow up on my previous email regarding cleaning services for {{business_name}}.

We offer flexible scheduling and competitive rates. Our team is experienced and fully insured.

Would you be interested in a free consultation?

Best regards,
[Your Name]
FluxOne Cleaning Services`
    },
    {
      id: 'quote',
      name: 'Quote',
      subject: 'Cleaning Quote for {{business_name}}',
      body: `Hi {{contact_name}},

Thank you for your interest in our cleaning services for {{business_name}}.

Based on your requirements, I'm pleased to offer you the following:
- Service frequency: {{frequency}}
- Price per cleaning: ${{price}}
- Total monthly cost: ${{monthly_total}}

Please let me know if you have any questions or would like to schedule our services.

Best regards,
[Your Name]
FluxOne Cleaning Services`
    },
    {
      id: 'checkin',
      name: 'Check-in',
      subject: 'Checking in - FluxOne Cleaning Services',
      body: `Hi {{contact_name},

I just wanted to check in and see how everything is going with our cleaning services at {{business_name}}.

Is there anything we can improve or any additional services you might need?

We appreciate your business!

Best regards,
[Your Name]
FluxOne Cleaning Services`
    }
  ]);
};
