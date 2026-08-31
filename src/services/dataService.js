// Business Search Service - Ready for Google API Integration
// Mock implementation that can be easily swapped with real Google Places API

// Google API Integration Point - Replace this with real API when ready
const USE_GOOGLE_API = false; // Set to true when you have Google API key

// Business name templates for mock generation
const businessTemplates = {
  'dental office': ['Family Dental Care', 'Smile Dental Center', 'Professional Dentistry', 'Community Dental', 'Dental Arts Studio'],
  'medical clinic': ['Medical Center', 'Health Clinic', 'Family Practice', 'Urgent Care', 'Wellness Center'],
  'restaurant': ['The Local Restaurant', 'Family Dining', 'Cafe & Bistro', 'Fine Dining', 'Food House'],
  'school': ['Elementary School', 'High School', 'Academy', 'Learning Center', 'Educational Institute'],
  'office cleaning': ['CleanPro Services', 'Sparkle Clean', 'Professional Cleaners', 'Office Solutions', 'Corporate Clean'],
  'gym': ['Fitness Center', 'Health Club', 'Workout Gym', 'Power Gym', 'Athletic Club'],
  'salon': ['Beauty Salon', 'Hair Studio', 'Style Salon', 'Glamour Studio', 'Beauty Spa'],
  'retail store': ['Retail Shop', 'Store Front', 'Market Place', 'Local Store', 'Shopping Center'],
  'auto repair': ['Auto Service Center', 'Car Care', 'Mechanic Shop', 'Auto Repair', 'Garage Services'],
  'barber shop': ['Classic Barber', 'Master Barber', 'Gentlemen\'s Cuts', 'Traditional Barber', 'Style Barber'],
  'law firm': ['Law Associates', 'Legal Services', 'Law Office', 'Legal Counsel', 'Attorney Group'],
  'pharmacy': ['Community Pharmacy', 'Health Pharmacy', 'Medicine Shop', 'Drug Store', 'Care Pharmacy'],
  'hotel': ['Hotel & Suites', 'Inn & Lodge', 'Hospitality Group', 'Accommodation', 'Lodge & Resort'],
  'construction': ['Construction Co', 'Building Services', 'Contractor Group', 'Development', 'Building Solutions'],
  'consulting': ['Consulting Group', 'Business Solutions', 'Management Consulting', 'Strategy Firm', 'Advisory Services'],
  'marketing': ['Marketing Agency', 'Digital Solutions', 'Brand Agency', 'Creative Group', 'Advertising Co'],
  'technology': ['Tech Solutions', 'IT Services', 'Software Co', 'Technology Group', 'Digital Agency'],
  'real estate': ['Realty Group', 'Property Management', 'Real Estate Co', 'Housing Agency', 'Property Solutions'],
  'insurance': ['Insurance Agency', 'Coverage Solutions', 'Protection Services', 'Insurance Co', 'Risk Management'],
  'bank': ['Community Bank', 'Financial Center', 'Bank & Trust', 'Credit Union', 'Financial Services'],
  'veterinary': ['Vet Clinic', 'Animal Hospital', 'Pet Care', 'Veterinary Services', 'Animal Medical'],
  'manufacturing': ['Manufacturing Co', 'Production Services', 'Industrial Group', 'Factory Solutions', 'Production Co'],
  'plumbing': ['Professional Plumbing', 'Pipe Masters', 'Drain Services', 'Plumbing Solutions', 'Water Works'],
  'electrician': ['Electric Services', 'Power Pro', 'Electrical Contractors', 'Wiring Solutions', 'Current Electric'],
  'landscaping': ['Green Thumb Landscaping', 'Outdoor Services', 'Lawn Care', 'Garden Pros', 'Landscaping Co'],
  'bakery': ['Fresh Bakery', 'Sweet Treats', 'Artisan Bakery', 'Local Bakery', 'Bread & Co'],
  'pet store': ['Pet Paradise', 'Animal Kingdom', 'Pet Supplies', 'Furry Friends', 'Pet World'],
  'fitness': ['Fit Life Gym', 'Power Fitness', 'Training Center', 'Athletic Club', 'Workout Studio'],
  'spa': ['Relaxation Spa', 'Wellness Center', 'Day Spa', 'Beauty Spa', 'Therapeutic Massage'],
  'photography': ['Photo Studio', 'Capture Moments', 'Professional Photography', 'Image Works', 'Lens Lab'],
  'accounting': ['Accounting Firm', 'Financial Services', 'Tax Services', 'CPA Group', 'Bookkeeping Co'],
  'insurance': ['Insurance Agency', 'Coverage Solutions', 'Protection Services', 'Risk Management', 'Policy Co']
};

// Street names and types for realistic addresses
const streetNames = ['Main', 'Oak', 'Pine', 'Maple', 'Elm', 'Cedar', 'Washington', 'Park', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Central', 'Broad', 'Market', 'Church', 'State', 'Union', 'Franklin', 'Madison', 'Jackson', 'Lincoln', 'Adams', 'Jefferson', 'Wilson', 'Taylor'];
const streetTypes = ['St', 'Ave', 'Dr', 'Blvd', 'Ln', 'Rd', 'Ct', 'Pl', 'Way', 'Terrace', 'Circle', 'Court', 'Pkwy', 'Hwy'];

// Generate unique ID for mock businesses
let mockBusinessIdCounter = 1000000; // Start with a high number to avoid conflicts

// Generate realistic mock business data
function generateMockBusiness(businessType, location, index) {
  const templates = businessTemplates[businessType] || ['Business', 'Company', 'Services', 'Center'];
  const template = templates[index % templates.length];
  
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
  
  return {
    id: mockBusinessIdCounter++, // Use unique counter instead of Date.now()
    businessName: `${template} ${location}`,
    category: businessType,
    phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    email: `contact${mockBusinessIdCounter}@${template.toLowerCase().replace(/\s+/g, '').replace(/'/g, '')}${location.toLowerCase().replace(/\s+/g, '')}.com`,
    address: `${streetNumber} ${streetName} ${streetType}`,
    city: location,
    state: extractState(location),
    zip: `${Math.floor(Math.random() * 90000) + 10000}`,
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviews: Math.floor(Math.random() * 500) + 1,
    website: `www.${template.toLowerCase().replace(/\s+/g, '').replace(/'/g, '')}${location.toLowerCase().replace(/\s+/g, '')}.com`,
    verified: Math.random() > 0.7,
    description: `Professional ${businessType} serving ${location} and surrounding areas. Quality service and customer satisfaction guaranteed.`,
    hours: generateBusinessHours(businessType),
    features: generateBusinessFeatures(businessType),
    established: Math.floor(Math.random() * 30) + 1990,
    priceRange: generatePriceRange(businessType)
  };
}

// Extract state from location
function extractState(location) {
  const stateMap = {
    'al': 'AL', 'alabama': 'AL', 'ak': 'AK', 'alaska': 'AK', 'az': 'AZ', 'arizona': 'AZ',
    'ar': 'AR', 'arkansas': 'AR', 'ca': 'CA', 'california': 'CA', 'co': 'CO', 'colorado': 'CO',
    'ct': 'CT', 'connecticut': 'CT', 'de': 'DE', 'delaware': 'DE', 'fl': 'FL', 'florida': 'FL',
    'ga': 'GA', 'georgia': 'GA', 'hi': 'HI', 'hawaii': 'HI', 'ia': 'IA', 'iowa': 'IA',
    'id': 'ID', 'idaho': 'ID', 'il': 'IL', 'illinois': 'IL', 'in': 'IN', 'indiana': 'IN',
    'ks': 'KS', 'kansas': 'KS', 'ky': 'KY', 'kentucky': 'KY', 'la': 'LA', 'louisiana': 'LA',
    'ma': 'MA', 'massachusetts': 'MA', 'md': 'MD', 'maryland': 'MD', 'me': 'ME', 'maine': 'ME',
    'mi': 'MI', 'michigan': 'MI', 'mn': 'MN', 'minnesota': 'MN', 'mo': 'MO', 'missouri': 'MO',
    'ms': 'MS', 'mississippi': 'MS', 'mt': 'MT', 'montana': 'MT', 'nc': 'NC', 'north carolina': 'NC',
    'nd': 'ND', 'north dakota': 'ND', 'ne': 'NE', 'nebraska': 'NE', 'nh': 'NH', 'new hampshire': 'NH',
    'nj': 'NJ', 'new jersey': 'NJ', 'nm': 'NM', 'new mexico': 'NM', 'nv': 'NV', 'nevada': 'NV',
    'ny': 'NY', 'new york': 'NY', 'oh': 'OH', 'ohio': 'OH', 'ok': 'OK', 'oklahoma': 'OK',
    'or': 'OR', 'oregon': 'OR', 'pa': 'PA', 'pennsylvania': 'PA', 'ri': 'RI', 'rhode island': 'RI',
    'sc': 'SC', 'south carolina': 'SC', 'sd': 'SD', 'south dakota': 'SD', 'tn': 'TN', 'tennessee': 'TN',
    'tx': 'TX', 'texas': 'TX', 'ut': 'UT', 'utah': 'UT', 'va': 'VA', 'virginia': 'VA',
    'vt': 'VT', 'vermont': 'VT', 'wa': 'WA', 'washington': 'WA', 'wi': 'WI', 'wisconsin': 'WI',
    'wv': 'WV', 'west virginia': 'WV', 'wy': 'WY', 'wyoming': 'WY'
  };
  
  const lowerLocation = location.toLowerCase();
  
  // Check for state names or abbreviations
  for (const [key, value] of Object.entries(stateMap)) {
    if (lowerLocation.includes(key)) {
      return value;
    }
  }
  
  // Default to a state if none found
  return 'CA';
}

// Generate business hours
function generateBusinessHours(businessType) {
  const hours = {
    'dental office': 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM',
    'medical clinic': 'Mon-Fri: 7AM-7PM, Sat: 8AM-12PM',
    'restaurant': 'Mon-Thu: 11AM-10PM, Fri-Sat: 11AM-11PM, Sun: 10AM-9PM',
    'school': 'Mon-Fri: 8AM-3PM',
    'office cleaning': 'Mon-Fri: 6AM-10PM',
    'gym': 'Mon-Fri: 5AM-11PM, Sat-Sun: 6AM-10PM',
    'salon': 'Mon-Sat: 9AM-7PM, Sun: 10AM-5PM',
    'retail store': 'Mon-Sat: 9AM-9PM, Sun: 10AM-6PM',
    'auto repair': 'Mon-Fri: 8AM-6PM, Sat: 8AM-4PM',
    'barber shop': 'Mon-Sat: 9AM-7PM, Sun: 10AM-4PM',
    'pharmacy': 'Mon-Fri: 8AM-9PM, Sat-Sun: 9AM-7PM',
    'restaurant': 'Mon-Thu: 11AM-10PM, Fri-Sat: 11AM-11PM, Sun: 10AM-9PM',
    'hotel': '24/7',
    'plumbing': 'Mon-Fri: 7AM-6PM, Sat: 8AM-4PM',
    'electrician': 'Mon-Fri: 7AM-6PM, Sat: 8AM-4PM'
  };
  
  return hours[businessType] || 'Mon-Fri: 9AM-5PM';
}

// Generate business features
function generateBusinessFeatures(businessType) {
  const features = {
    'dental office': ['Free Parking', 'Insurance Accepted', 'Emergency Services', 'Modern Equipment'],
    'medical clinic': ['Walk-ins Welcome', 'Insurance Accepted', 'Multiple Specialties', 'Lab Services'],
    'restaurant': ['Outdoor Seating', 'Private Events', 'Catering', 'Full Bar'],
    'school': ['Certified Teachers', 'Small Class Sizes', 'After School Programs', 'Bus Service'],
    'office cleaning': ['Eco-Friendly Products', 'Flexible Scheduling', 'Insured & Bonded', '24/7 Service'],
    'gym': ['Personal Training', 'Group Classes', 'Locker Rooms', 'Free Weights'],
    'salon': ['Hair Styling', 'Color Services', 'Waxing', 'Facials'],
    'retail store': ['Online Shopping', 'Gift Cards', 'Loyalty Program', 'Free Returns'],
    'auto repair': ['ASE Certified', 'Warranty Work', 'Tire Service', 'Oil Changes'],
    'barber shop': ['Traditional Cuts', 'Hot Towel Service', 'Beard Trimming', 'Walk-ins Welcome'],
    'pharmacy': ['Prescription Filling', 'Health Products', 'Drive-Thru', 'Consultation'],
    'plumbing': ['24/7 Emergency', 'Licensed Insured', 'Free Estimates', 'All Plumbing Services'],
    'electrician': ['Licensed Electricians', 'Emergency Service', 'Free Estimates', 'Upgrades'],
    'landscaping': ['Lawn Care', 'Tree Service', 'Irrigation', 'Design Services']
  };
  
  return features[businessType] || ['Professional Service', 'Customer Satisfaction', 'Quality Work', 'Experienced Staff'];
}

// Generate price range
function generatePriceRange(businessType) {
  const priceRanges = {
    'dental office': '$$$',
    'medical clinic': '$$$',
    'restaurant': '$$',
    'school': '$',
    'office cleaning': '$$',
    'gym': '$$',
    'salon': '$$',
    'retail store': '$$',
    'auto repair': '$$$',
    'barber shop': '$',
    'pharmacy': '$$',
    'hotel': '$$$',
    'plumbing': '$$',
    'electrician': '$$',
    'restaurant': '$$',
    'bakery': '$',
    'pet store': '$$',
    'fitness': '$$',
    'spa': '$$$',
    'law firm': '$$$',
    'accounting': '$$',
    'insurance': '$$'
  };
  
  return priceRanges[businessType] || '$$';
}

// Normalize business type (handle variations)
function normalizeBusinessType(businessType) {
  const typeMap = {
    'dental': 'dental office',
    'dentist': 'dental office',
    'dental office': 'dental office',
    'medical': 'medical clinic',
    'clinic': 'medical clinic',
    'doctor': 'medical clinic',
    'hospital': 'medical clinic',
    'restaurant': 'restaurant',
    'food': 'restaurant',
    'dining': 'restaurant',
    'eatery': 'restaurant',
    'cafe': 'restaurant',
    'school': 'school',
    'education': 'school',
    'university': 'school',
    'college': 'school',
    'cleaning': 'office cleaning',
    'janitorial': 'office cleaning',
    'maintenance': 'office cleaning',
    'office': 'office cleaning',
    'gym': 'gym',
    'fitness': 'gym',
    'health club': 'gym',
    'workout': 'gym',
    'salon': 'salon',
    'beauty': 'salon',
    'hair': 'salon',
    'barber': 'barber shop',
    'barber shop': 'barber shop',
    'retail': 'retail store',
    'store': 'retail store',
    'shop': 'retail store',
    'auto': 'auto repair',
    'car': 'auto repair',
    'repair': 'auto repair',
    'mechanic': 'auto repair',
    'law': 'law firm',
    'legal': 'law firm',
    'attorney': 'law firm',
    'pharmacy': 'pharmacy',
    'drug': 'pharmacy',
    'medicine': 'pharmacy',
    'hotel': 'hotel',
    'motel': 'hotel',
    'construction': 'construction',
    'building': 'construction',
    'consulting': 'consulting',
    'marketing': 'marketing',
    'tech': 'technology',
    'technology': 'technology',
    'real estate': 'real estate',
    'insurance': 'insurance',
    'bank': 'bank',
    'vet': 'veterinary',
    'veterinary': 'veterinary',
    'manufacturing': 'manufacturing',
    'plumbing': 'plumbing',
    'electrician': 'electrician',
    'landscaping': 'landscaping',
    'bakery': 'bakery',
    'pet store': 'pet store',
    'photography': 'photography',
    'accounting': 'accounting'
  };
  
  return typeMap[businessType.toLowerCase()] || businessType;
}

// Clean up location name
function cleanLocation(location) {
  const locationMap = {
    'la': 'Los Angeles',
    'nyc': 'New York',
    'sf': 'San Francisco',
    'chi': 'Chicago',
    'dc': 'Washington DC',
    'phx': 'Phoenix',
    'dal': 'Dallas',
    'hou': 'Houston',
    'mia': 'Miami',
    'atl': 'Atlanta',
    'bos': 'Boston',
    'sea': 'Seattle',
    'den': 'Denver',
    'lv': 'Las Vegas',
    'por': 'Portland',
    'phi': 'Philadelphia'
  };
  
  const lowerLocation = location.toLowerCase();
  return locationMap[lowerLocation] || location;
}


// Location-based search
export const searchBusinessesByLocation = async (city, state, businessType = '') => {
  try {
    const query = businessType ? `${businessType} in ${city}, ${state}` : `${city}, ${state}`;
    return await searchBusinesses(query);
  } catch (error) {
    console.warn('Location search error:', error);
    return [];
  }
};

// Multi-account system
let mockAccountsData = [
  {
    id: 1,
    name: 'Minor Cleaning Service',
    created_at: new Date().toISOString()
  }
];


// Data persistence with localStorage
const getStoredData = (key, defaultValue = []) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.warn('Error loading data from localStorage:', error);
    return defaultValue;
  }
};

const saveDataToStorage = (key, data) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Data saved to localStorage: ${key}`);
    }
  } catch (error) {
    console.warn('Error saving data to localStorage:', error);
  }
};

// Initialize data from localStorage or start empty
let mockLeadsData = getStoredData('fluxone_leads', []); // Start empty for real business use
let mockClientsData = getStoredData('fluxone_clients', []); // Start empty for real business use
let mockJobsData = getStoredData('fluxone_jobs', []); // Start empty for real business use

// Enhanced email templates with professional content
const mockEmailTemplates = [
  {
    id: 1,
    name: 'Initial Contact',
    subject: 'Professional Cleaning Services for Your Business',
    body: `Hello [Name],

I hope this email finds you well. I'm reaching out from FluxOne, a premier commercial cleaning company serving businesses in your area.

We specialize in providing customized cleaning solutions for:
• Offices and commercial spaces
• Medical facilities and clinics
• Restaurants and food service establishments
• Schools and educational institutions
• Retail spaces and showrooms

Our services include:
✓ Daily, weekly, or monthly cleaning schedules
✓ Eco-friendly cleaning products
✓ Fully insured and bonded staff
✓ Competitive pricing with no hidden fees
✓ 24/7 emergency cleaning services

I would love to schedule a brief 15-minute call to discuss your specific cleaning needs and provide you with a complimentary quote.

What day and time works best for you next week?

Best regards,
FluxOne Cleaning Services
📞 (555) 123-4567
📧 info@fluxone.com
🌐 www.fluxone.com`
  },
  {
    id: 2,
    name: 'Follow-up',
    subject: 'Following Up - Cleaning Services Discussion',
    body: `Hi [Name],

I hope you're having a great week!

Following up on our previous conversation about cleaning services for [Business Name]. I wanted to provide you with some additional information about why our clients choose FluxOne:

Why Businesses Choose FluxOne:
🌟 Consistent Quality: Our quality control system ensures the same high standards every visit
🌟 Flexible Scheduling: We work around your business hours to minimize disruption
🌟 Dedicated Team: You'll have the same cleaning team for consistency
🌟 Detailed Reporting: After each service, you'll receive a checklist of completed tasks
🌟 Satisfaction Guarantee: If you're not happy, we'll re-clean at no extra charge

I have a few time slots available next week for a site visit and detailed quote:
• Tuesday at 10:00 AM
• Wednesday at 2:00 PM  
• Thursday at 11:00 AM

Which of these times works for you, or would you prefer a different day?

Looking forward to helping you maintain a clean, professional environment for your customers and staff.

Best regards,
[Your Name]
FluxOne Cleaning Services
📞 (555) 123-4567
📧 info@fluxone.com`
  },
  {
    id: 3,
    name: 'Special Offer',
    subject: 'Limited Time Offer - Premium Cleaning Services',
    body: `Dear [Name],

I have some exciting news! FluxOne Cleaning Services is currently offering special incentives for new commercial clients in your area.

🎯 LIMITED TIME OFFER:
✅ 25% OFF your first month of cleaning services
✅ FREE deep cleaning with 6-month contract
✅ NO setup fees or hidden charges
✅ Satisfaction guaranteed or your money back

This offer is perfect for businesses like yours because:
• We use hospital-grade disinfectants
• Our staff is professionally trained and background-checked
• We carry full liability insurance
• We customize our services to your specific needs

Here's what our current clients are saying:
★★★★★ "The best cleaning service we've ever used!" - Local Restaurant Owner
★★★★★ "Reliable, thorough, and professional." - Medical Clinic Manager
★★★★★ "Worth every penny. Our office has never looked better." - Office Manager

This special offer expires on [Date], so I'd love to schedule a quick consultation while these savings are available.

Would 15 minutes on Tuesday or Wednesday work for a brief walkthrough and quote?

Best regards,
[Your Name]
FluxOne Cleaning Services
📞 (555) 123-4567
📧 info@fluxone.com
🌐 www.fluxone.com`
  },
  {
    id: 4,
    name: 'Thank You / Meeting Confirmation',
    subject: 'Meeting Confirmation - FluxOne Cleaning Services',
    body: `Dear [Name],

Thank you for your time today! I enjoyed learning more about [Business Name] and discussing how FluxOne Cleaning Services can help you maintain a clean, professional environment.

As discussed, here's what we covered:
• Service Type: [Service Type]
• Frequency: [Frequency]
• Pricing: [Pricing Details]
• Start Date: [Start Date]
• Special Requirements: [Special Requirements]

Next Steps:
✓ Our team will arrive [Time] on [Date]
✓ All cleaning supplies and equipment provided
✓ Initial deep cleaning included
✓ Quality checklist provided after each service

I'm excited to get started and show you why businesses trust FluxOne for their cleaning needs.

If you have any questions before our first service, please don't hesitate to reach out.

Looking forward to serving you!

Best regards,
[Your Name]
FluxOne Cleaning Services
📞 (555) 123-4567
📧 info@fluxone.com`
  },
  {
    id: 5,
    name: 'Service Reminder',
    subject: 'Reminder: Your Cleaning Service Tomorrow',
    body: `Hi [Name],

Just a friendly reminder that your FluxOne cleaning service is scheduled for tomorrow:

📅 Date: [Date]
⏰ Time: [Time]
🏢 Service: [Service Type]
👥 Team: [Team Name/Lead Cleaner]

What to expect:
✓ Professional, uniformed cleaning team
✓ All necessary supplies and equipment
✓ Thorough cleaning of all agreed areas
✓ Quality inspection before departure
✓ Lock-up and security check

If you need to reschedule or have any special requests, please let us know by calling (555) 123-4567.

We look forward to keeping your business sparkling clean!

Best regards,
[Your Name]
FluxOne Cleaning Services`
  }
];

const mockPricingData = {
  officeCleaning: {
    hourlyRate: 35,
    perSquareFoot: 0.15,
    minimumCharge: 150,
    frequencyMultiplier: 1.0
  },
  residentialCleaning: {
    hourlyRate: 25,
    perSquareFoot: 0.10,
    minimumCharge: 100,
    frequencyMultiplier: 1.0
  },
  deepCleaning: {
    hourlyRate: 45,
    perSquareFoot: 0.25,
    minimumCharge: 200,
    frequencyMultiplier: 1.5
  },
  postConstruction: {
    hourlyRate: 55,
    perSquareFoot: 0.35,
    minimumCharge: 300,
    frequencyMultiplier: 2.0
  }
};

// Generate unique ID for leads and jobs
let leadIdCounter = 3000000;
let jobIdCounter = 4000000;
let mockJobIdCounter = 2000003; // Separate counter for jobs

// Authentication and account management
export const authenticateUser = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsersData.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Update last login
        user.last_login = new Date().toISOString();
        resolve({
          ...user,
          account: mockAccountsData.find(acc => acc.id === user.account_id)
        });
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 500);
  });
};

export const getCurrentUserAccount = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return currentUser.account || null;
};

// Account-based data filtering
export const getAccountLeads = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const accountId = currentUser.account_id;
  
  if (!accountId) return Promise.resolve([]);
  
  const accountLeads = mockLeadsData.filter(lead => lead.account_id === accountId);
  return Promise.resolve(accountLeads);
};

export const getAccountClients = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const accountId = currentUser.account_id;
  
  if (!accountId) return Promise.resolve([]);
  
  const accountClients = mockClientsData.filter(client => client.account_id === accountId);
  return Promise.resolve(accountClients);
};

// Export all other functions
export const getLeads = () => getAccountLeads();
export const addLead = (leadData) => {
  const newLead = {
    id: leadIdCounter++,
    ...leadData,
    createdAt: new Date().toISOString()
  };
  mockLeadsData.push(newLead);
  saveDataToStorage('fluxone_leads', mockLeadsData);
  console.log('New lead added and saved:', newLead);
  return Promise.resolve(newLead);
};
export const updateLead = (id, updates) => {
  const index = mockLeadsData.findIndex(lead => lead.id === id);
  if (index !== -1) {
    mockLeadsData[index] = { ...mockLeadsData[index], ...updates };
    saveDataToStorage('fluxone_leads', mockLeadsData);
    console.log('Lead updated and saved:', mockLeadsData[index]);
  }
  return Promise.resolve(mockLeadsData[index]);
};
export const deleteLead = (id) => {
  mockLeadsData = mockLeadsData.filter(lead => lead.id !== id);
  saveDataToStorage('fluxone_leads', mockLeadsData);
  console.log('Lead deleted and data saved');
  return Promise.resolve(true);
};

export const getClients = () => Promise.resolve(mockClientsData);
export const addClient = (clientData) => {
  const newClient = { id: Date.now(), ...clientData, createdAt: new Date().toISOString() };
  mockClientsData.push(newClient);
  saveDataToStorage('fluxone_clients', mockClientsData);
  console.log('New client added and saved:', newClient);
  return Promise.resolve(newClient);
};
export const updateClient = (id, updates) => {
  const index = mockClientsData.findIndex(client => client.id === id);
  if (index !== -1) {
    mockClientsData[index] = { ...mockClientsData[index], ...updates };
    saveDataToStorage('fluxone_clients', mockClientsData);
    console.log('Client updated and saved:', mockClientsData[index]);
  }
  return Promise.resolve(mockClientsData[index]);
};
export const deleteClient = (id) => {
  mockClientsData = mockClientsData.filter(client => client.id !== id);
  saveDataToStorage('fluxone_clients', mockClientsData);
  console.log('Client deleted and data saved');
  return Promise.resolve(true);
};

export const getEmailTemplates = () => Promise.resolve(mockEmailTemplates);

export const getDashboardStats = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const accountId = currentUser.account_id;
  
  if (!accountId) return Promise.resolve({
    totalLeads: 0,
    totalClients: 0,
    monthlyProfit: 0,
    jobsToday: 0
  });
  
  const accountLeads = mockLeadsData.filter(lead => lead.account_id === accountId);
  const accountClients = mockClientsData.filter(client => client.account_id === accountId);
  const accountJobs = mockJobsData.filter(job => job.account_id === accountId);
  
  return Promise.resolve({
    totalLeads: accountLeads.length,
    totalClients: accountClients.length,
    monthlyProfit: accountClients.reduce((sum, client) => sum + (client.monthlyRevenue || 0), 0),
    jobsToday: accountJobs.filter(job => {
      const today = new Date().toDateString();
      return new Date(job.date).toDateString() === today;
    }).length
  });
};

export const getPricingData = () => Promise.resolve(mockPricingData);
export const getScheduleData = () => Promise.resolve(mockJobsData);
export const getJobs = () => Promise.resolve(mockJobsData);
export const addJob = (jobData) => {
  const newJob = { id: jobIdCounter++, ...jobData, createdAt: new Date().toISOString() };
  mockJobsData.push(newJob);
  saveDataToStorage('fluxone_jobs', mockJobsData);
  console.log('New job added and saved:', newJob);
  return Promise.resolve(newJob);
};
export const updateJob = (id, updates) => {
  const index = mockJobsData.findIndex(job => job.id === id);
  if (index !== -1) {
    mockJobsData[index] = { ...mockJobsData[index], ...updates };
    saveDataToStorage('fluxone_jobs', mockJobsData);
    console.log('Job updated and saved:', mockJobsData[index]);
  }
  return Promise.resolve(mockJobsData[index]);
};
export const deleteJob = (id) => {
  mockJobsData = mockJobsData.filter(job => job.id !== id);
  saveDataToStorage('fluxone_jobs', mockJobsData);
  console.log('Job deleted and data saved');
  return Promise.resolve(true);
};

// Email tracking system
let mockEmailHistory = []; // Start empty for real business use

let emailIdCounter = 1000;

export const sendEmail = (emailData) => {
  const newEmail = {
    id: emailIdCounter++,
    ...emailData,
    status: 'sent',
    sentAt: new Date().toISOString(),
    openedAt: null,
    clicked: false
  };
  mockEmailHistory.unshift(newEmail);
  return Promise.resolve(newEmail);
};

export const getEmailHistory = () => Promise.resolve(mockEmailHistory);

export const scheduleEmail = (emailData) => {
  const newEmail = {
    id: emailIdCounter++,
    ...emailData,
    status: 'scheduled',
    scheduledFor: emailData.scheduledFor,
    sentAt: null,
    openedAt: null,
    clicked: false
  };
  mockEmailHistory.unshift(newEmail);
  return Promise.resolve(newEmail);
};

export const markEmailOpened = (emailId) => {
  const email = mockEmailHistory.find(e => e.id === emailId);
  if (email && !email.openedAt) {
    email.openedAt = new Date().toISOString();
  }
  return Promise.resolve(email);
};

export const markEmailClicked = (emailId) => {
  const email = mockEmailHistory.find(e => e.id === emailId);
  if (email) {
    email.clicked = true;
  }
  return Promise.resolve(email);
};

// Internal messaging system
let mockInternalMessages = []; // Start empty for real business use

let internalMessageIdCounter = 1000;

export const getInternalMessages = (userId) => {
  const userMessages = mockInternalMessages.filter(msg => 
    msg.toUserId === userId || msg.fromUserId === userId
  );
  return Promise.resolve(userMessages);
};

export const sendInternalMessage = (messageData) => {
  const newMessage = {
    id: internalMessageIdCounter++,
    ...messageData,
    timestamp: new Date().toISOString(),
    read: false,
    type: 'message'
  };
  mockInternalMessages.unshift(newMessage);
  return Promise.resolve(newMessage);
};

export const markMessageAsRead = (messageId) => {
  const message = mockInternalMessages.find(msg => msg.id === messageId);
  if (message) {
    message.read = true;
  }
  return Promise.resolve(message);
};

export const getUnreadMessageCount = (userId) => {
  const unreadCount = mockInternalMessages.filter(msg => 
    msg.toUserId === userId && !msg.read
  ).length;
  return Promise.resolve(unreadCount);
};

// Google Places API integration
export const searchBusinesses = async (query) => {
  try {
    console.log('=== GOOGLE PLACES API SEARCH ===');
    console.log('Query received:', query);
    
    // Check if Google API key is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (apiKey && apiKey !== 'your_google_api_key_here') {
      console.log('Using real Google Places API...');
      try {
        return await searchWithRealGoogleAPI(query, apiKey);
      } catch (googleError) {
        console.warn('Google API call failed:', googleError);
        return [
          {
            place_id: 'google_api_error',
            name: 'Google API Error',
            address: `Error: ${googleError.message}`,
            phone: '',
            website: '',
            rating: 0,
            isSetupMessage: true,
            message: `Google Places API error: ${googleError.message}. Please check your API key and billing status.`
          }
        ];
      }
    } else {
      console.log('Google API key not found, showing setup message...');
      console.log('Set NEXT_PUBLIC_GOOGLE_PLACES_API_KEY in your environment variables to use real Google API');
      return [
        {
          place_id: 'setup_required',
          name: 'Google Places API Setup Required',
          address: 'Add your Google API key to search real businesses',
          phone: '',
          website: '',
          rating: 0,
          isSetupMessage: true,
          message: 'To search for real businesses, you need to add your Google Places API key to the environment variables.'
        }
      ];
    }
  } catch (error) {
    console.warn('=== GOOGLE PLACES API WARNING ===', error);
    return [
      {
        place_id: 'search_error',
        name: 'Search Error',
        address: `Error: ${error.message}`,
        phone: '',
        website: '',
        rating: 0,
        isSetupMessage: true,
        message: `Search failed: ${error.message}. Please try again.`
      }
    ];
  }
};

// Real Google Places API integration (using server-side API route)
const searchWithRealGoogleAPI = async (query, apiKey) => {
  try {
    console.log('=== GOOGLE PLACES API CALL (SERVER-SIDE) ===');
    console.log('Query:', query);
    
    // Validate input query
    if (!query || query.trim() === '') {
      console.warn('Empty query provided to Google Places API');
      throw new Error('Query parameter is required');
    }
    
    // Parse location from query
    const { location, businessType } = parseSearchQuery(query);
    
    // Validate parsed components
    if (!location || location.trim() === '') {
      console.warn('No location found in query:', query);
      throw new Error('Please include a location in your search (e.g., "restaurants in Minneapolis")');
    }
    
    const searchQuery = businessType ? `${businessType} in ${location}` : location;
    
    console.log('Search Query:', searchQuery);
    
    // Use our server-side API route instead of calling Google directly
    const apiUrl = `/api/google-places?query=${encodeURIComponent(searchQuery)}`;
    
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    
    if (data.status !== 'OK') {
      console.warn('API error:', data);
      throw new Error(data.error || 'Unknown API error');
    }
    
    // Results are already transformed by the server
    console.log('Results count:', data.results.length);
    return data.results;
    
  } catch (error) {
    // Return a setup/error card instead of throwing so no red console error appears
    return [
      {
        place_id: 'google_api_error',
        name: 'Google API Error',
        address: `Error: ${error.message}`,
        phone: '',
        website: '',
        rating: 0,
        isSetupMessage: true,
        message: `Google Places API error: ${error.message}. Please check your API key and billing status.`
      }
    ];
  }
};

// Parse location and business type from search query
const parseSearchQuery = (query) => {
  console.log('Parsing search query:', query);
  
  if (!query || query.trim() === '') {
    console.log('Empty query provided');
    return { location: '', businessType: '' };
  }
  
  const queryLower = query.toLowerCase().trim();
  
  // Common city/state patterns
  const locationPatterns = [
    /\b(\w+)\s+(\w{2})\b/, // "Houston TX", "Dallas TX"
    /\b(\w+)\s+,\s*(\w{2})\b/, // "Houston, TX"
    /\b(\w+)\s+(\w+)\s+(\w{2})\b/, // "New York NY"
    /\b(\w+)\s+(\w+)\s*,\s*(\w{2})\b/, // "New York, NY"
    /\b(\w+)\s+(\w+)\s+(\w+)\s+(\w{2})\b/, // "Minneapolis MN"
    /\b(\w+)\s+(\w+)\s+(\w+)\s*,\s*(\w{2})\b/, // "Minneapolis, MN"
  ];
  
  // Business type patterns
  const businessTypes = [
    'cleaning', 'cleaners', 'janitorial', 'maintenance',
    'dental', 'dentist', 'orthodontist', 'oral',
    'restaurant', 'food', 'dining', 'cafe',
    'medical', 'doctor', 'clinic', 'health',
    'office', 'business', 'corporate', 'commercial',
    'retail', 'shop', 'store', 'mall',
    'school', 'education', 'university', 'college',
    'hotel', 'motel', 'lodging', 'hospitality'
  ];
  
  let location = '';
  let businessType = '';
  
  // Extract location
  for (const pattern of locationPatterns) {
    const match = queryLower.match(pattern);
    if (match) {
      if (match.length === 3) {
        location = match[1] + ' ' + match[2].toUpperCase();
      } else if (match.length === 4) {
        location = match[1] + ' ' + match[2] + ' ' + match[3].toUpperCase();
      } else if (match.length === 5) {
        location = match[1] + ' ' + match[2] + ' ' + match[3] + ' ' + match[4].toUpperCase();
      }
      break;
    }
  }
  
  // If no location found, use the whole query as location
  if (!location) {
    location = query;
  }
  
  // Extract business type
  for (const type of businessTypes) {
    if (queryLower.includes(type)) {
      businessType = type;
      break;
    }
  }
  
  console.log('Parsed location:', location);
  console.log('Parsed business type:', businessType);
  
  return { location, businessType };
};


// Hunter.io API integration for email finding
export const findEmail = async (domain) => {
  try {
    console.log('Finding email for domain:', domain);
    
    const apiKey = process.env.NEXT_PUBLIC_HUNTER_API_KEY;
    
    if (apiKey && apiKey !== 'your_hunter_api_key_here') {
      // Use server-side API route to avoid CORS
      try {
        const response = await fetch(`/api/hunter-email?domain=${encodeURIComponent(domain)}`);
        const data = await response.json();
        
        if (data.error) {
          console.log('Hunter.io error for domain', domain, ':', data.error);
          return null;
        }
        
        console.log('Hunter.io API response:', data);
        return data.data || data;
      } catch (fetchErr) {
        console.log('Hunter.io fetch failed for domain', domain, ':', fetchErr.message);
        return null;
      }
    } else {
      // Fallback to mock response with realistic contact data
      console.log('Hunter API key not found, using mock response...');
      const mockNames = [
        { first: 'John', last: 'Smith', position: 'Owner', department: 'executive', seniority: 'owner' },
        { first: 'Sarah', last: 'Johnson', position: 'Office Manager', department: 'operations', seniority: 'manager' },
        { first: 'Mike', last: 'Davis', position: 'General Manager', department: 'operations', seniority: 'manager' },
        { first: 'Emily', last: 'Brown', position: 'Marketing Director', department: 'marketing', seniority: 'director' },
        { first: 'David', last: 'Wilson', position: 'CEO', department: 'executive', seniority: 'c-level' },
      ];
      const mockEmails = mockNames.map((person, i) => ({
        value: `${person.first.toLowerCase()}.${person.last.toLowerCase()}@${domain}`,
        first_name: person.first,
        last_name: person.last,
        position: person.position,
        department: person.department,
        seniority: person.seniority,
        confidence: 90 - i * 10,
        linkedin: `https://linkedin.com/in/${person.first.toLowerCase()}-${person.last.toLowerCase()}`,
        twitter: i < 2 ? `https://twitter.com/${person.first.toLowerCase()}${person.last.toLowerCase()}` : null,
        phone_number: i === 0 ? null : null,
        sources: [{ domain: domain }],
      }));
      const mockEmailResponse = {
        domain: domain,
        emails: mockEmails,
      };
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return mockEmailResponse;
    }
  } catch (error) {
    console.warn('Error finding email:', error);
    throw new Error('Failed to find email address');
  }
};

// Clean domain from website URL
const cleanDomain = (website) => {
  if (!website) return '';
  return website
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
};

// Scrape emails directly from business website
const scrapeEmailsFromWebsite = async (website) => {
  if (!website) return [];
  try {
    const response = await fetch(`/api/scrape-emails?website=${encodeURIComponent(website)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.emails || [];
  } catch (error) {
    console.warn('Error scraping emails from website:', error);
    return [];
  }
};

// Fetch place details from our server-side API
const fetchPlaceDetails = async (placeId) => {
  try {
    const response = await fetch(`/api/google-places/details?place_id=${placeId}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.result || null;
  } catch (error) {
    console.warn('Error fetching place details:', error);
    return null;
  }
};

// Extract key contacts from Hunter.io response
const extractKeyContacts = (emailData) => {
  if (!emailData || !emailData.emails) return [];

  const contacts = emailData.emails.map(entry => ({
    name: entry.first_name && entry.last_name ? `${entry.first_name} ${entry.last_name}` : entry.first_name || entry.last_name || '',
    email: entry.value || '',
    position: entry.position || '',
    department: entry.department || '',
    seniority: entry.seniority || '',
    linkedin: entry.linkedin || '',
    twitter: entry.twitter || '',
    phone_number: entry.phone_number || '',
    confidence: entry.confidence || 0,
    sources: (entry.sources || []).slice(0, 2).map(s => s.domain),
  }));

  const priorityRoles = ['owner', 'ceo', 'founder', 'president', 'partner', 'director', 'manager', 'principal', 'head', 'chief', 'vp', 'vice president', 'general manager', 'operations', 'marketing'];
  contacts.sort((a, b) => {
    const aPriority = priorityRoles.some(r => (a.position || '').toLowerCase().includes(r)) ? 0 : 1;
    const bPriority = priorityRoles.some(r => (b.position || '').toLowerCase().includes(r)) ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return (b.confidence || 0) - (a.confidence || 0);
  });

  return contacts.slice(0, 5);
};

// Combined business search with email enrichment
export const searchAndEnrichBusinesses = async (query) => {
  try {
    const businesses = await searchBusinesses(query);

    const enrichedBusinesses = await Promise.all(
      businesses.map(async (business) => {
        if (business.isSetupMessage) return business;

        try {
          // Fetch details first since Text Search doesn't return website/phone
          const details = business.place_id ? await fetchPlaceDetails(business.place_id) : null;
          const website = details?.website || business.website || '';
          const domain = cleanDomain(website);

          // Step 1: Try Hunter.io for email enrichment
          const emailData = domain ? await findEmail(domain) : null;

          const contacts = emailData ? extractKeyContacts(emailData.data || emailData) : [];
          const primaryContact = contacts[0] || null;
          const emailList = emailData?.data?.emails || emailData?.emails || [];

          let foundEmail = primaryContact?.email || emailList[0]?.value || null;
          let emailConfidence = primaryContact?.confidence || emailList[0]?.confidence || 0;
          let emailSource = 'Google + Hunter.io';

          // Step 2: If Hunter.io found nothing, scrape the website directly
          if (!foundEmail && website) {
            console.log('Hunter.io found no emails, trying website scrape for:', website);
            const scrapedEmails = await scrapeEmailsFromWebsite(website);
            if (scrapedEmails.length > 0) {
              foundEmail = scrapedEmails[0];
              emailConfidence = 60; // Lower confidence for scraped emails
              emailSource = 'Google + Website Scrape';
              console.log('Found email via website scrape:', foundEmail);
            }
          }

          return {
            ...business,
            ...(details || {}),
            website: website,
            email: foundEmail,
            email_confidence: emailConfidence,
            contacts,
            primary_contact_name: primaryContact?.name || '',
            primary_contact_title: primaryContact?.position || '',
            primary_contact_linkedin: primaryContact?.linkedin || '',
            primary_contact_phone: primaryContact?.phone_number || '',
            domain: domain || '',
            source: emailSource,
          };
        } catch (error) {
          return {
            ...business,
            email: null,
            email_confidence: 0,
            contacts: [],
            source: 'Google',
            status: 'No email found'
          };
        }
      })
    );

    return enrichedBusinesses;
  } catch (error) {
    console.warn('Business search and enrichment error:', error);
    return [];
  }
};


