// Testing utilities for FluxOne development

// UUID validation helper
export const isValidUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;
  
  // Check for demo/test IDs that aren't real UUIDs
  if (uuid === 'demo-account-id' || uuid === 'demo-user-id' || uuid.startsWith('demo-')) {
    return false;
  }
  
  // UUID regex pattern (v4 and v1)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Safe Supabase wrapper
export const safeSupabaseCall = async (operation, ...args) => {
  try {
    const result = await operation(...args);
    return { success: true, data: result, error: null };
  } catch (error) {
    return { 
      success: false, 
      data: null, 
      error: {
        message: error.message,
        details: error.details,
        hint: error.hint,
        stack: error.stack,
        full: JSON.stringify(error, null, 2)
      }
    };
  }
};

// Test data generators
export const generateTestEmployee = () => ({
  name: `Test Employee ${Date.now()}`,
  email: `test${Date.now()}@example.com`,
  phone: '555-0123',
  position: 'Test Position',
  hourly_rate: 25.00,
  hire_date: new Date().toISOString().split('T')[0],
  address: '123 Test St',
  status: 'Active'
});

export const generateTestClient = () => ({
  name: `Test Client ${Date.now()}`,
  email: `client${Date.now()}@example.com`,
  phone: '555-0456',
  address: '456 Client Ave',
  status: 'Active'
});

export const generateTestInvoice = () => ({
  invoice_number: `TEST-${Date.now()}`,
  client_name: 'Test Invoice Client',
  client_email: `invoice${Date.now()}@example.com`,
  issue_date: new Date().toISOString().split('T')[0],
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'Draft',
  subtotal: 100.00,
  tax: 8.00,
  total: 108.00,
  notes: 'Test invoice created by dev test'
});

// Environment checker
export const checkEnvironment = () => {
  const checks = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    googleApiKey: !!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
    hunterApiKey: !!process.env.NEXT_PUBLIC_HUNTER_API_KEY,
    browser: typeof window !== 'undefined',
    localStorage: typeof window !== 'undefined' && !!window.localStorage
  };

  return {
    allPresent: Object.values(checks).every(Boolean),
    checks
  };
};

// Current user validator
export const validateCurrentUser = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isValid = currentUser && 
                   currentUser.id && 
                   currentUser.email && 
                   isValidUUID(currentUser.account_id);
    
    return {
      isValid,
      user: currentUser,
      accountIdValid: isValidUUID(currentUser.account_id),
      issues: [
        !currentUser?.id && 'No user ID',
        !currentUser?.email && 'No user email',
        !isValidUUID(currentUser.account_id) && 'Invalid account_id UUID'
      ].filter(Boolean)
    };
  } catch (error) {
    return {
      isValid: false,
      user: null,
      accountIdValid: false,
      issues: ['Failed to parse current user from localStorage']
    };
  }
};

// Test result formatter
export const formatTestResult = (testName, result) => {
  return {
    test: testName,
    success: result.success,
    timestamp: new Date().toISOString(),
    data: result.success ? result.data : null,
    error: result.success ? null : result.error,
    summary: result.success ? 'PASS' : 'FAIL'
  };
};

// Batch test runner
export const runBatchTests = async (tests) => {
  const results = {};
  
  for (const [testName, testFunction] of Object.entries(tests)) {
    try {
      console.log(`Running test: ${testName}`);
      const result = await testFunction();
      results[testName] = formatTestResult(testName, result);
    } catch (error) {
      results[testName] = formatTestResult(testName, {
        success: false,
        error: {
          message: error.message,
          full: JSON.stringify(error, null, 2)
        }
      });
    }
  }
  
  return results;
};

// Health check calculator
export const calculateHealthScore = (results) => {
  const tests = Object.values(results);
  if (tests.length === 0) return 0;
  
  const passedTests = tests.filter(test => test.success).length;
  return Math.round((passedTests / tests.length) * 100);
};

// Test suite definitions
export const testSuites = {
  authentication: {
    name: 'Authentication Tests',
    tests: {
      login: async () => {
        const { login } = await import('@/services/authService');
        return await safeSupabaseCall(() => login('james@minorcleaning.com', 'password123'));
      }
    }
  },
  
  employees: {
    name: 'Employee Tests',
    tests: {
      fetch: async () => {
        const { getEmployees } = await import('@/services/supabaseService');
        return await safeSupabaseCall(getEmployees);
      },
      create: async () => {
        const { addEmployee } = await import('@/services/supabaseService');
        return await safeSupabaseCall(() => addEmployee(generateTestEmployee()));
      }
    }
  },
  
  clients: {
    name: 'Client Tests',
    tests: {
      fetch: async () => {
        const { getClients } = await import('@/services/supabaseService');
        return await safeSupabaseCall(getClients);
      },
      create: async () => {
        const { addClient } = await import('@/services/supabaseService');
        return await safeSupabaseCall(() => addClient(generateTestClient()));
      }
    }
  },
  
  invoices: {
    name: 'Invoice Tests',
    tests: {
      fetch: async () => {
        const { getInvoices } = await import('@/services/supabaseService');
        return await safeSupabaseCall(getInvoices);
      },
      create: async () => {
        const { addInvoice } = await import('@/services/supabaseService');
        return await safeSupabaseCall(() => addInvoice(generateTestInvoice()));
      }
    }
  }
};

// Export all utilities
export default {
  isValidUUID,
  safeSupabaseCall,
  generateTestEmployee,
  generateTestClient,
  generateTestInvoice,
  checkEnvironment,
  validateCurrentUser,
  formatTestResult,
  runBatchTests,
  calculateHealthScore,
  testSuites
};
