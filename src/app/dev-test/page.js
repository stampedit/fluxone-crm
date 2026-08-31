'use client';

import { useState, useEffect } from 'react';
import { login } from '@/services/authService';
import { 
  getEmployees, 
  addEmployee, 
  getClients, 
  addClient, 
  getInvoices, 
  addInvoice 
} from '@/services/supabaseService';
import { 
  isValidUUID, 
  safeSupabaseCall, 
  getCurrentUserSafe, 
  checkEnvironment,
  generateTestData,
  runHealthChecks,
  formatHealthResult
} from '@/utils/safeSupabase';

export default function DevTestPage() {
  const [testResults, setTestResults] = useState({});
  const [systemHealth, setSystemHealth] = useState({});
  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check current user on load
    const user = getCurrentUserSafe();
    setCurrentUser(user);
    
    // Check environment on load
    const env = checkEnvironment();
    console.log('Environment check on load:', env);
  }, []);

  // Test functions
  const testLogin = async () => {
    console.log('=== TESTING LOGIN ===');
    const result = await safeSupabaseCall(() => login('james@minorcleaning.com', 'password123'));
    setTestResults(prev => ({ ...prev, login: result }));
    
    if (result.success) {
      setCurrentUser(result.data);
      localStorage.setItem('currentUser', JSON.stringify(result.data));
      console.log('Login successful, user updated:', result.data);
    } else {
      console.error('Login failed:', result.error);
    }
  };

  const testFetchEmployees = async () => {
    console.log('=== TESTING FETCH EMPLOYEES ===');
    const result = await getEmployees();
    setTestResults(prev => ({ ...prev, fetchEmployees: result }));
  };

  const testCreateEmployee = async () => {
    console.log('=== TESTING CREATE EMPLOYEE ===');
    const testEmployee = generateTestData.employee();
    const result = await addEmployee(testEmployee);
    setTestResults(prev => ({ ...prev, createEmployee: result }));
  };

  const testFetchClients = async () => {
    console.log('=== TESTING FETCH CLIENTS ===');
    const result = await getClients();
    setTestResults(prev => ({ ...prev, fetchClients: result }));
  };

  const testCreateClient = async () => {
    console.log('=== TESTING CREATE CLIENT ===');
    const testClient = generateTestData.client();
    const result = await addClient(testClient);
    setTestResults(prev => ({ ...prev, createClient: result }));
  };

  const testFetchInvoices = async () => {
    console.log('=== TESTING FETCH INVOICES ===');
    const result = await getInvoices();
    setTestResults(prev => ({ ...prev, fetchInvoices: result }));
  };

  const testCreateInvoice = async () => {
    console.log('=== TESTING CREATE INVOICE ===');
    const testInvoice = generateTestData.invoice();
    const result = await addInvoice(testInvoice);
    setTestResults(prev => ({ ...prev, createInvoice: result }));
  };

  // System Health Check
  const runSystemHealthCheck = async () => {
    console.log('=== RUNNING SYSTEM HEALTH CHECK ===');
    setIsRunningHealthCheck(true);

    try {
      const healthTests = {
        authentication: async () => safeSupabaseCall(() => login('james@minorcleaning.com', 'password123')),
        employees_fetch: getEmployees,
        employees_create: async () => addEmployee(generateTestData.employee()),
        clients_fetch: getClients,
        clients_create: async () => addClient(generateTestData.client()),
        invoices_fetch: getInvoices,
        invoices_create: async () => addInvoice(generateTestData.invoice()),
        environment: async () => ({ success: checkEnvironment().allPresent, data: checkEnvironment() })
      };

      const healthResults = await runHealthChecks(healthTests);
      
      console.log('Health check results:', healthResults);
      setSystemHealth(healthResults);
    } catch (error) {
      console.error('System health check failed:', error);
      setSystemHealth({
        results: { system_error: formatHealthResult('system_error', { success: false, error: { message: error.message, full: JSON.stringify(error, null, 2) } }) },
        healthScore: 0,
        passedTests: 0,
        totalTests: 1
      });
    }

    setIsRunningHealthCheck(false);
  };

  // Clear test results
  const clearResults = () => {
    setTestResults({});
    setSystemHealth({});
  };

  const getStatusColor = (result) => {
    if (!result) return '#666';
    return result.success ? '#28a745' : '#dc3545';
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'PASS': return '#28a745';
      case 'FAIL': return '#dc3545';
      default: return '#666';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>🧪 FluxOne Dev Test Suite</h1>
      
      {/* Current User Info */}
      <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
        <h3>Current User Status</h3>
        <p><strong>User ID:</strong> {currentUser?.id || 'Not logged in'}</p>
        <p><strong>Account ID:</strong> {currentUser?.account_id || 'Not available'}</p>
        <p><strong>Valid UUID:</strong> {isValidUUID(currentUser?.account_id) ? '✅ YES' : '❌ NO'}</p>
        <p><strong>Email:</strong> {currentUser?.email || 'Not logged in'}</p>
      </div>

      {/* Manual Test Buttons */}
      <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
        <h3>Manual Tests</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          <button onClick={testLogin} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Test Login/Auth
          </button>
          <button onClick={testFetchEmployees} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Test Fetch Employees
          </button>
          <button onClick={testCreateEmployee} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Test Create Employee
          </button>
          <button onClick={testFetchClients} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Test Fetch Clients
          </button>
          <button onClick={testCreateClient} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Test Create Client
          </button>
          <button onClick={testFetchInvoices} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Test Fetch Invoices
          </button>
          <button onClick={testCreateInvoice} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Test Create Invoice
          </button>
          <button onClick={clearResults} style={{ padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Clear Results
          </button>
        </div>
      </div>

      {/* System Health Check */}
      <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
        <h3>System Health Check</h3>
        <button 
          onClick={runSystemHealthCheck} 
          disabled={isRunningHealthCheck}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: isRunningHealthCheck ? '#6c757d' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isRunningHealthCheck ? 'not-allowed' : 'pointer',
            marginBottom: '15px'
          }}
        >
          {isRunningHealthCheck ? 'Running Health Check...' : 'Run System Health Check'}
        </button>
        
        {systemHealth.results && Object.keys(systemHealth.results).length > 0 && (
          <div>
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px' }}>
              <h4>Overall Health Score: {systemHealth.healthScore}% ({systemHealth.passedTests}/{systemHealth.totalTests} tests passed)</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {Object.entries(systemHealth.results).map(([test, result]) => (
                <div key={test} style={{ padding: '10px', backgroundColor: '#f8f9fa', border: `1px solid ${getHealthColor(result.summary)}`, borderRadius: '4px' }}>
                  <strong>{test.replace(/_/g, ' ').toUpperCase()}:</strong>
                  <span style={{ color: getHealthColor(result.summary), marginLeft: '10px' }}>{result.summary}</span>
                  {result.timestamp && (
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>Test Results</h3>
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h4 style={{ color: getStatusColor(result), marginBottom: '10px' }}>
                {test.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}: {result.success ? '✅ SUCCESS' : '❌ FAILED'}
              </h4>
              
              {result.success && (
                <div>
                  <p><strong>Data:</strong></p>
                  <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {!result.success && (
                <div>
                  <p><strong>Error:</strong></p>
                  <pre style={{ backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', fontSize: '12px', maxHeight: '300px', overflow: 'auto', color: '#c62828' }}>
                    {result.error?.full || JSON.stringify(result.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* UUID Validation Info */}
      <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3>UUID Validation Status</h3>
        <p><strong>Current Account ID:</strong> {currentUser?.account_id || 'Not available'}</p>
        <p><strong>Validation Result:</strong> {isValidUUID(currentUser?.account_id) ? '✅ Valid UUID' : '❌ Invalid UUID'}</p>
        <p><strong>Validation Active:</strong> All Supabase calls are protected against invalid UUIDs</p>
      </div>
    </div>
  );
}
