// Safe Supabase utilities with comprehensive error handling and UUID validation

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

// Safe Supabase wrapper with comprehensive error handling
export const safeSupabaseCall = async (operation, ...args) => {
  try {
    console.log(`=== SAFE SUPABASE CALL: ${operation.name || 'anonymous'} ===`);
    console.log('Arguments:', args);
    
    const result = await operation(...args);
    
    console.log('Operation successful:', result);
    return { 
      success: true, 
      data: result, 
      error: null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const isNetworkError = error?.message?.includes('Failed to fetch') || 
                          error?.message?.includes('NetworkError') ||
                          error?.name === 'AuthRetryableFetchError' ||
                          error?.message?.includes('session missing');
    
    if (isNetworkError) {
      // Silently fail for network/offline errors - app falls back to localStorage
    } else {
      console.error('=== SAFE SUPABASE CALL FAILED ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Error code:', error.code);
      console.error('Full error:', JSON.stringify(error, null, 2));
    }
    
    return { 
      success: false, 
      data: null, 
      error: {
        message: error.message || 'Unknown error',
        details: error.details,
        hint: error.hint,
        code: error.code,
        stack: error.stack,
        full: JSON.stringify(error, null, 2)
      },
      timestamp: new Date().toISOString()
    };
  }
};

// Get current user with validation
export const getCurrentUserSafe = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser || !currentUser.id) {
      console.warn('No current user found in localStorage');
      return null;
    }
    
    const accountId = currentUser.account_id;
    if (!isValidUUID(accountId)) {
      console.warn('Invalid account_id detected:', accountId);
      return null;
    }
    
    console.log('Current user validated:', { 
      id: currentUser.id, 
      email: currentUser.email, 
      account_id: accountId 
    });
    
    return currentUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Environment variable checker
export const checkEnvironment = () => {
  const checks = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    googleApiKey: !!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
    hunterApiKey: !!process.env.NEXT_PUBLIC_HUNTER_API_KEY,
    browser: typeof window !== 'undefined',
    localStorage: typeof window !== 'undefined' && !!window.localStorage
  };

  const allPresent = Object.values(checks).every(Boolean);
  
  console.log('=== ENVIRONMENT CHECK ===');
  console.log('All environment variables present:', allPresent);
  console.log('Environment checks:', checks);
  
  return {
    allPresent,
    checks,
    missing: Object.entries(checks)
      .filter(([key, value]) => !value)
      .map(([key]) => key)
  };
};

// Safe query builder with UUID validation
export const buildSafeQuery = (baseQuery, accountId) => {
  if (!accountId) {
    console.warn('No accountId provided to buildSafeQuery');
    return baseQuery;
  }
  
  if (!isValidUUID(accountId)) {
    console.warn('Invalid accountId provided to buildSafeQuery:', accountId);
    return baseQuery;
  }
  
  return baseQuery.eq('account_id', accountId);
};

// Test data generators
export const generateTestData = {
  employee: () => ({
    name: `Test Employee ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    phone: '555-0123',
    position: 'Test Position',
    hourly_rate: 25.00,
    hire_date: new Date().toISOString().split('T')[0],
    address: '123 Test St',
    status: 'Active'
  }),
  
  client: () => ({
    name: `Test Client ${Date.now()}`,
    email: `client${Date.now()}@example.com`,
    phone: '555-0456',
    address: '456 Client Ave',
    status: 'Active'
  }),
  
  invoice: () => ({
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
  })
};

// Health check result formatter
export const formatHealthResult = (testName, result) => {
  return {
    test: testName,
    success: result.success,
    timestamp: new Date().toISOString(),
    data: result.success ? result.data : null,
    error: result.success ? null : result.error,
    summary: result.success ? 'PASS' : 'FAIL'
  };
};

// Batch test runner for health checks
export const runHealthChecks = async (tests) => {
  console.log('=== RUNNING HEALTH CHECKS ===');
  const results = {};
  
  for (const [testName, testFunction] of Object.entries(tests)) {
    try {
      console.log(`Running health check: ${testName}`);
      const result = await testFunction();
      results[testName] = formatHealthResult(testName, result);
    } catch (error) {
      results[testName] = formatHealthResult(testName, {
        success: false,
        error: {
          message: error.message,
          full: JSON.stringify(error, null, 2)
        }
      });
    }
  }
  
  const passedTests = Object.values(results).filter(test => test.success).length;
  const totalTests = Object.keys(results).length;
  const healthScore = Math.round((passedTests / totalTests) * 100);
  
  console.log(`=== HEALTH CHECK COMPLETE ===`);
  console.log(`Score: ${healthScore}% (${passedTests}/${totalTests})`);
  
  return { results, healthScore, passedTests, totalTests };
};

export default {
  isValidUUID,
  safeSupabaseCall,
  getCurrentUserSafe,
  checkEnvironment,
  buildSafeQuery,
  generateTestData,
  formatHealthResult,
  runHealthChecks
};
