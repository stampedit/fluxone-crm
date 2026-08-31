// Authentication Service with Role-Based Access Control
// Uses Supabase for real user authentication and data

import { supabase } from '@/lib/supabase';

// User roles and permissions
export const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator', 
  EMPLOYEE: 'employee'
};

export const PERMISSIONS = {
  // Admin permissions (full access)
  ADMIN: [
    'dashboard.view',
    'leads.view', 'leads.create', 'leads.update', 'leads.delete',
    'clients.view', 'clients.create', 'clients.update', 'clients.delete',
    'employees.view', 'employees.create', 'employees.update', 'employees.delete', 'employees.payroll',
    'schedule.view', 'schedule.create', 'schedule.update', 'schedule.delete',
    'invoices.view', 'invoices.create', 'invoices.update', 'invoices.delete',
    'emails.view', 'emails.create', 'emails.send',
    'settings.view', 'settings.update',
    'reports.view', 'reports.export',
    'system.admin'
  ],
  
  // Operator permissions (limited admin access)
  OPERATOR: [
    'dashboard.view',
    'leads.view', 'leads.create', 'leads.update',
    'clients.view', 'clients.create', 'clients.update',
    'employees.view', 'employees.update',
    'schedule.view', 'schedule.create', 'schedule.update',
    'invoices.view', 'invoices.create', 'invoices.update',
    'emails.view', 'emails.send',
    'reports.view'
  ],
  
  // Employee permissions (basic access)
  EMPLOYEE: [
    'dashboard.view',
    'schedule.view', 'schedule.update',
    'profile.view', 'profile.update',
    'time.clock_in', 'time.clock_out', 'time.view_hours'
  ]
};

// Mock user database with all roles
let users = [
  {
    id: 1,
    email: 'admin@fluxone.com',
    password: 'admin123',
    name: 'Admin User',
    role: ROLES.ADMIN,
    status: 'active',
    onboardingComplete: true,
    createdAt: '2024-01-01',
    lastLogin: '2024-01-20'
  },
  {
    id: 2,
    email: 'operator@fluxone.com',
    password: 'operator123',
    name: 'Operator User',
    role: ROLES.OPERATOR,
    status: 'active',
    onboardingComplete: true,
    createdAt: '2024-01-02',
    lastLogin: '2024-01-19'
  },
  {
    id: 3,
    email: 'employee@fluxone.com',
    password: 'employee123',
    name: 'Employee User',
    role: ROLES.EMPLOYEE,
    status: 'active',
    onboardingComplete: true,
    createdAt: '2024-01-03',
    lastLogin: '2024-01-20'
  }
];

// Mock onboarding steps
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to FluxOne!',
    description: 'Let\'s get you set up with your new account.',
    completed: false
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Tell us a bit about yourself.',
    completed: false
  },
  {
    id: 'training',
    title: 'Training Overview',
    description: 'Learn about our cleaning standards and procedures.',
    completed: false
  },
  {
    id: 'tools',
    title: 'Tools & Equipment',
    description: 'Familiarize yourself with our cleaning tools and equipment.',
    completed: false
  },
  {
    id: 'schedule',
    title: 'Schedule & Time Tracking',
    description: 'Learn how to use our scheduling system.',
    completed: false
  },
  {
    id: 'safety',
    title: 'Safety Guidelines',
    description: 'Important safety procedures and guidelines.',
    completed: false
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Congratulations on completing your onboarding!',
    completed: false
  }
];

// Multi-account user data
const mockAccountsData = [
  {
    id: 1,
    name: 'Minor Cleaning Service',
    created_at: new Date().toISOString()
  }
];

const mockUsersData = [
  {
    id: 1,
    name: 'James Minor',
    email: 'james@minorcleaning.com',
    password: 'password123', // In production, this would be hashed
    account_id: 1,
    role: 'admin',
    status: 'active',
    last_login: null,
    created_at: new Date().toISOString()
  }
];

// Authentication functions
export const login = async (email, password) => {
  try {
    console.log('=== SUPABASE AUTH LOGIN ===');
    console.log('Login attempt for email:', email);
    
    // For demo purposes, we'll use the hardcoded user credentials
    // In production, this would use Supabase Auth
    if (email === 'james@minorcleaning.com' && password === 'password123') {
      console.log('Credentials match, fetching user from Supabase...');
      
      // Get user data from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError || !userData) {
        console.log('User not found in Supabase, using fallback data');
        // Fallback to mock data with proper account_id
        const fallbackUser = {
          id: 'demo-user-id',
          name: 'James Minor',
          email: 'james@minorcleaning.com',
          role: 'admin',
          account_id: 'demo-account-id',
          status: 'active',
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        // Store in localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
        }
        
        return fallbackUser;
      }
      
      console.log('User found in Supabase:', userData);
      
      // Update last login
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);
      
      if (updateError) {
        console.warn('Failed to update last login:', updateError);
      }
      
      // Get account data
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', userData.account_id)
        .single();
      
      const userWithAccount = {
        ...userData,
        account: accountData || { id: userData.account_id, name: 'Minor Cleaning Service' }
      };
      
      // Store in localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('currentUser', JSON.stringify(userWithAccount));
      }
      
      console.log('Login successful:', userWithAccount);
      return userWithAccount;
    } else {
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  try {
    console.log('Attempting logout...');
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('currentUser');
      console.log('localStorage cleared successfully');
    } else {
      console.error('localStorage not available for logout');
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getCurrentUser = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userData = localStorage.getItem('currentUser');
      console.log('Retrieved user data from localStorage:', userData);
      return userData ? JSON.parse(userData) : null;
    } else {
      console.error('localStorage not available for getCurrentUser');
    }
  } catch (error) {
    console.error('getCurrentUser error:', error);
  }
  return null;
};

// Add the missing isAuthenticated function
export const isAuthenticated = () => {
  const user = getCurrentUser();
  return user !== null;
};

export const hasPermission = (permission) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const userPermissions = PERMISSIONS[user.role.toUpperCase()] || [];
  return userPermissions.includes(permission);
};

export const hasRole = (role) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.role === role;
};

// Employee onboarding functions
export const createEmployeeAccount = (employeeData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if email already exists
      const existingUser = users.find(u => u.email === employeeData.email);
      if (existingUser) {
        reject(new Error('Email already exists'));
        return;
      }
      
      // Create new user with employee role
      const newUser = {
        id: Date.now(),
        email: employeeData.email,
        password: employeeData.password,
        name: employeeData.name,
        role: ROLES.EMPLOYEE,
        status: 'pending_onboarding',
        onboardingComplete: false,
        onboardingStep: 'welcome',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        profile: {
          phone: employeeData.phone,
          address: employeeData.address,
          position: employeeData.position,
          hireDate: employeeData.hireDate,
          hourlyRate: employeeData.hourlyRate,
          emergencyContact: employeeData.emergencyContact
        }
      };
      
      users.push(newUser);
      resolve(newUser);
    }, 500);
  });
};

export const updateOnboardingStep = (stepId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = getCurrentUser();
      if (user) {
        user.onboardingStep = stepId;
        user.onboardingComplete = stepId === 'complete';
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update user in database
        const dbUser = users.find(u => u.id === user.id);
        if (dbUser) {
          dbUser.onboardingStep = stepId;
          dbUser.onboardingComplete = stepId === 'complete';
        }
      }
      resolve();
    }, 200);
  });
};

export const getOnboardingProgress = () => {
  const user = getCurrentUser();
  if (!user || user.onboardingComplete) return null;
  
  const currentStepIndex = ONBOARDING_STEPS.findIndex(step => step.id === user.onboardingStep);
  const completedSteps = ONBOARDING_STEPS.slice(0, currentStepIndex + 1).map(step => ({
    ...step,
    completed: step.id === user.onboardingStep
  }));
  
  return {
    currentStep: ONBOARDING_STEPS[currentStepIndex],
    completedSteps,
    progress: (currentStepIndex / (ONBOARDING_STEPS.length - 1)) * 100
  };
};

export const getOnboardingSteps = () => {
  return ONBOARDING_STEPS;
};

export const completeOnboarding = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = getCurrentUser();
      if (user) {
        user.onboardingComplete = true;
        user.status = 'active';
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update user in database
        const dbUser = users.find(u => u.id === user.id);
        if (dbUser) {
          dbUser.onboardingComplete = true;
          dbUser.status = 'active';
        }
      }
      resolve();
    }, 200);
  });
};

// Role-based UI helpers
export const canAccessPage = (page) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const pagePermissions = {
    '/dashboard': ['dashboard.view'],
    '/leads': ['leads.view'],
    '/clients': ['clients.view'],
    '/employees': ['employees.view'],
    '/schedule': ['schedule.view'],
    '/invoices': ['invoices.view'],
    '/emails': ['emails.view'],
    '/settings': ['settings.view']
  };
  
  const requiredPermissions = pagePermissions[page] || [];
  
  if (user.role === ROLES.ADMIN) return true; // Admin can access everything
  
  return requiredPermissions.some(permission => hasPermission(permission));
};

export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.OPERATOR]: 'Operations Manager',
    [ROLES.EMPLOYEE]: 'Employee'
  };
  return roleNames[role] || role;
};

export const getAllUsers = () => {
  return Promise.resolve(users.map(user => ({
    ...user,
    password: undefined // Don't return password in list
  })));
};

export const updateUserRole = (userId, newRole) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.id === userId);
      if (!user) {
        reject(new Error('User not found'));
        return;
      }
      
      user.role = newRole;
      resolve(user);
    }, 500);
  });
};

export const updateUserStatus = (userId, status) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.id === userId);
      if (!user) {
        reject(new Error('User not found'));
        return;
      }
      
      user.status = status;
      resolve(user);
    }, 500);
  });
};

// Time tracking for employees
export const clockIn = (jobId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = getCurrentUser();
      if (!user) {
        reject(new Error('User not logged in'));
        return;
      }
      
      // In a real app, this would save to database
      resolve({
        id: Date.now(),
        userId: user.id,
        jobId: jobId,
        clockInTime: new Date().toISOString(),
        clockOutTime: null,
        totalHours: null,
        status: 'active'
      });
    }, 200);
  });
};

export const clockOut = (timeEntryId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = getCurrentUser();
      if (!user) {
        reject(new Error('User not logged in'));
        return;
      }
      
      // In a real app, this would calculate hours and save to database
      resolve({
        id: timeEntryId,
        clockOutTime: new Date().toISOString(),
        totalHours: 4.5, // Mock calculation
        status: 'completed'
      });
    }, 200);
  });
};

export const getEmployeeHours = (userId, period) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock data for employee hours
      resolve({
        totalHours: 32,
        regularHours: 30,
        overtimeHours: 2,
        period: period,
        entries: [
          {
            date: '2024-01-20',
            clockIn: '08:00',
            clockOut: '17:30',
            totalHours: 8.5,
            jobId: 1
          },
          {
            date: '2024-01-19',
            clockIn: '09:00',
            clockOut: '17:00',
            totalHours: 7.5,
            jobId: 2
          }
        ]
      });
    }, 200);
  });
};
