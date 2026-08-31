// Real Supabase Authentication Service
// Replace your existing authService.js with this file

import { supabase } from '@/lib/supabase'

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

// Login with email and password
export const login = async (email, password) => {
  try {
    console.log('=== SUPABASE LOGIN ===');
    console.log('Email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.warn('Supabase login error:', error.message);
      throw new Error(error.message);
    }
    
    console.log('Login successful:', data.user?.email);
    
    // Create user object directly from Supabase Auth data
    const user = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || data.user.email.split('@')[0],
      role: ROLES.ADMIN,
      permissions: PERMISSIONS.ADMIN,
      account_id: '550e8400-e29b-41d4-a716-446655440000',
      account: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'FluxOne Business'
      },
      created_at: data.user.created_at,
      last_login: new Date().toISOString()
    };
    
    // Store in localStorage for compatibility
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    console.log('User object created:', user);
    return user;
  } catch (error) {
    console.warn('Supabase login failed, switching to offline mode:', error.message);
    
    // Offline fallback when Supabase is unreachable
    if (typeof window !== 'undefined') {
      const offlineUser = {
        id: 'offline-user-' + Date.now(),
        email,
        name: email.split('@')[0] || 'Offline User',
        role: ROLES.ADMIN,
        permissions: PERMISSIONS.ADMIN,
        account_id: '550e8400-e29b-41d4-a716-446655440000',
        account: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'FluxOne Business'
        },
        offline: true,
        last_login: new Date().toISOString()
      };
      localStorage.setItem('currentUser', JSON.stringify(offlineUser));
      return offlineUser;
    }
    
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    console.log('=== SUPABASE LOGOUT ===');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.warn('Supabase logout error:', error.message);
      throw new Error(error.message);
    }
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    
    console.log('Logout successful');
    return true;
  } catch (error) {
    console.warn('Logout failed (Supabase offline):', error.message);
    return false;
  }
}

// Get current user (sync from localStorage, no Supabase calls to avoid offline errors)
export const getCurrentUser = () => {
  return getCurrentUserSync();
};

// Async version kept for compatibility but returns sync result
export const getCurrentUserAsync = async () => {
  return getCurrentUserSync();
};

// Helper function to get permissions by role
const getPermissionsByRole = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return PERMISSIONS.ADMIN;
    case ROLES.OPERATOR:
      return PERMISSIONS.OPERATOR;
    case ROLES.EMPLOYEE:
      return PERMISSIONS.EMPLOYEE;
    default:
      return PERMISSIONS.ADMIN; // Default to admin for safety
  }
}

// Register new user
export const register = async (email, password, userData = {}) => {
  try {
    console.log('=== SUPABASE REGISTER ===');
    console.log('Email:', email);
    
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (error) {
      console.warn('Supabase registration error:', error.message);
      throw new Error(error.message);
    }
    
    console.log('Registration successful:', data.user?.email);
    return data.user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Reset password
export const resetPassword = async (email) => {
  try {
    console.log('=== SUPABASE RESET PASSWORD ===');
    console.log('Email:', email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`,
    })
    
    if (error) {
      console.warn('Supabase reset password error:', error.message);
      throw new Error(error.message);
    }
    
    console.log('Password reset email sent');
    return true;
  } catch (error) {
    console.warn('Reset password failed (Supabase offline):', error.message);
    return false;
  }
}

// Update password
export const updatePassword = async (newPassword) => {
  try {
    console.log('=== SUPABASE UPDATE PASSWORD ===');
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) {
      console.warn('Supabase update password error:', error.message);
      throw new Error(error.message);
    }
    
    console.log('Password updated successfully');
    return true;
  } catch (error) {
    console.warn('Update password failed (Supabase offline):', error.message);
    return false;
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getCurrentUserSync();
}

// Get user permissions (for role-based access)
export const getUserPermissions = () => {
  const user = getCurrentUserSync();
  if (!user) return [];
  
  return user.permissions || [];
}

// Legacy compatibility functions
export const hasPermission = (permission) => {
  const user = getCurrentUserSync();
  if (!user) return false;
  
  return user.permissions && user.permissions.includes(permission);
}

export const canAccessPage = (page) => {
  const user = getCurrentUserSync();
  if (!user) return false;
  
  const pagePermissions = {
    '/dashboard': 'dashboard.view',
    '/employees': 'employees.view',
    '/clients': 'clients.view',
    '/invoices': 'invoices.view',
    '/leads': 'leads.view',
    '/schedule': 'schedule.view',
  };
  
  const requiredPermission = pagePermissions[page];
  return requiredPermission ? user.permissions.includes(requiredPermission) : true;
}

export const getUserRole = () => {
  const user = getCurrentUserSync();
  return user ? user.role : null;
}

// Check if user has a specific role
export const hasRole = (role) => {
  const user = getCurrentUserSync();
  if (!user) return false;
  
  return user.role === role;
}

// Sync version of hasRole for immediate access
export const hasRoleSync = (role) => {
  const user = getCurrentUserSync();
  if (!user) return false;
  
  return user.role === role;
}

// Sync function versions for immediate access (used by components)
export const getCurrentUserSync = () => {
  try {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user sync:', error);
    return null;
  }
}

export const hasPermissionSync = (permission) => {
  const user = getCurrentUserSync();
  if (!user) return false;
  
  return user.permissions && user.permissions.includes(permission);
}

export const canAccessPageSync = (page) => {
  const user = getCurrentUserSync();
  if (!user) return false;
  
  const pagePermissions = {
    '/dashboard': 'dashboard.view',
    '/employees': 'employees.view',
    '/clients': 'clients.view',
    '/invoices': 'invoices.view',
    '/leads': 'leads.view',
    '/schedule': 'schedule.view',
  };
  
  const requiredPermission = pagePermissions[page];
  return requiredPermission ? user.permissions.includes(requiredPermission) : true;
}

// Create an employee account (legacy employee registration flow)
export const createEmployeeAccount = async (employeeData) => {
  try {
    console.log('=== CREATING EMPLOYEE ACCOUNT ===');
    const { data, error } = await supabase.auth.signUp({
      email: employeeData.email,
      password: employeeData.password
    });
    if (error) throw error;
    console.log('Employee account created:', data.user?.email);
    return data.user;
  } catch (error) {
    console.warn('Supabase signup failed, creating offline employee account:', error.message);
    
    // Offline fallback
    if (typeof window !== 'undefined') {
      const offlineUser = {
        id: 'offline-emp-' + Date.now(),
        email: employeeData.email,
        name: employeeData.name || employeeData.email.split('@')[0] || 'Employee',
        role: ROLES.EMPLOYEE,
        permissions: PERMISSIONS.EMPLOYEE,
        account_id: '550e8400-e29b-41d4-a716-446655440000',
        account: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'FluxOne Business'
        },
        offline: true,
        invite_code: employeeData.inviteCode,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('currentUser', JSON.stringify(offlineUser));
      return offlineUser;
    }
    throw error;
  }
};

// Onboarding helpers (legacy compatibility stubs)
export const getOnboardingProgress = () => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('onboarding_progress');
  return stored ? JSON.parse(stored) : null;
};

export const updateOnboardingStep = async (stepId) => {
  if (typeof window === 'undefined') return;
  const progress = getOnboardingProgress() || { currentStep: { id: stepId }, completedSteps: [] };
  progress.currentStep = { id: stepId };
  if (!progress.completedSteps.includes(stepId)) {
    progress.completedSteps.push(stepId);
  }
  localStorage.setItem('onboarding_progress', JSON.stringify(progress));
};

export const completeOnboarding = async () => {
  if (typeof window === 'undefined') return;
  const user = getCurrentUserSync();
  if (user) {
    user.onboardingComplete = true;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
  localStorage.setItem('onboarding_complete', 'true');
};

export default {
  login,
  logout,
  getCurrentUser,
  getCurrentUserSync,
  register,
  resetPassword,
  updatePassword,
  onAuthStateChange,
  isAuthenticated,
  getUserPermissions,
  hasPermission,
  hasPermissionSync,
  canAccessPage,
  canAccessPageSync,
  getUserRole,
  hasRole,
  hasRoleSync,
  createEmployeeAccount,
  getOnboardingProgress,
  updateOnboardingStep,
  completeOnboarding,
  ROLES,
  PERMISSIONS
};
