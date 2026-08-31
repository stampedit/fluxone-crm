'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '@/services/supabaseService';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    hourlyRate: '',
    hireDate: '',
    address: '',
    status: 'Active'
  });
  const [payrollData, setPayrollData] = useState({
    employeeId: '',
    payPeriod: 'weekly',
    hoursWorked: '',
    overtimeHours: '',
    bonus: '',
    deductions: '',
    payDate: ''
  });

  useEffect(() => {
    // Load employees from Supabase on component mount
    const loadEmployees = async () => {
      try {
        const employeeData = await getEmployees();
        setEmployees(employeeData);
      } catch (error) {
        console.error('Error loading employees:', error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadEmployees();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      console.log('=== STARTING EMPLOYEE ADDITION ===');
      console.log('Form data:', formData);
      
      // Validate required fields
      if (!formData.name || formData.name.trim() === '') {
        throw new Error('Employee name is required');
      }
      
      if (!formData.email || formData.email.trim() === '') {
        throw new Error('Employee email is required');
      }
      
      if (!formData.position || formData.position.trim() === '') {
        throw new Error('Employee position is required');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      const newEmployee = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone ? formData.phone.trim() : '',
        position: formData.position.trim(),
        hourly_rate: parseFloat(formData.hourlyRate) || 0,
        hire_date: formData.hireDate || new Date().toISOString().split('T')[0],
        address: formData.address ? formData.address.trim() : '',
        status: formData.status || 'Active',
        total_hours: 0,
        total_earnings: 0
      };
      
      console.log('Prepared employee data:', newEmployee);
      
      const savedEmployee = await addEmployee(newEmployee);
      
      // Update local state with the saved employee (includes Supabase ID)
      setEmployees(Array.isArray(employees) ? [...employees, savedEmployee] : [savedEmployee]);
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        hourlyRate: '',
        hireDate: '',
        address: '',
        status: 'Active'
      });
      setShowAddModal(false);
      
      console.log('Employee saved to Supabase:', savedEmployee);
      alert('Employee added successfully!');
    } catch (error) {
      console.error('=== EMPLOYEE ADDITION ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Error code:', error.code);
      alert(`Failed to add employee: ${error.message || 'Unknown error'}. Please check the console for details.`);
    }
  };

  const handleProcessPayroll = (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    
    const regularPay = parseFloat(payrollData.hoursWorked) * selectedEmployee.hourlyRate;
    const overtimePay = parseFloat(payrollData.overtimeHours) * (selectedEmployee.hourlyRate * 1.5);
    const bonus = parseFloat(payrollData.bonus) || 0;
    const deductions = parseFloat(payrollData.deductions) || 0;
    const totalPay = regularPay + overtimePay + bonus - deductions;
    
    alert(`Payroll processed for ${selectedEmployee.name}\nTotal Pay: $${totalPay.toFixed(2)}`);
    
    setShowPayModal(false);
    setSelectedEmployee(null);
    setPayrollData({
      employeeId: '',
      payPeriod: 'weekly',
      hoursWorked: '',
      overtimeHours: '',
      bonus: '',
      deductions: '',
      payDate: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'status-client',
      'On Leave': 'status-prospect',
      'Terminated': 'status-lost'
    };
    return colors[status] || 'status-lead';
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="crm-layout">
          <Navigation />
          <div className="crm-main">
            <div className="crm-content">
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div className="loading" style={{ margin: '0 auto 24px' }}></div>
                <p className="text-secondary">Loading employees...</p>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="crm-layout">
        <Navigation />
        <div className="crm-main">
          <div className="crm-content">
            {/* Header */}
            <div className="page-header">
              <h1 className="page-title">Employee Management</h1>
              <p className="page-subtitle">Manage your team, schedule, and payroll</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Total Employees</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0' }}>
                        {Array.isArray(employees) ? employees.length : 0}
                      </p>
                    </div>
                    <div style={{ fontSize: '32px', color: 'var(--primary)' }}>4</div>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Active Employees</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0' }}>
                        {Array.isArray(employees) ? employees.filter(e => e.status === 'Active').length : 0}
                      </p>
                    </div>
                    <div style={{ fontSize: '32px', color: 'var(--success)' }}>3</div>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Total Payroll</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0' }}>
                        ${Array.isArray(employees) ? employees.reduce((sum, e) => sum + (e.totalEarnings || 0), 0).toFixed(2) : '0.00'}
                      </p>
                    </div>
                    <div style={{ fontSize: '32px', color: 'var(--warning)' }}>$</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Employee Button */}
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary btn-lg"
              >
                + Add New Employee
              </button>
            </div>

            {/* Employees List */}
            <div className="card">
              <div className="card-header">
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Employees ({Array.isArray(employees) ? employees.length : 0})
                </h2>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {Array.isArray(employees) && employees.map((employee) => (
                    <div key={employee.id} style={{ 
                      padding: '20px 24px', 
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
                            {employee.name}
                          </h3>
                          <span className={`status ${getStatusColor(employee.status)}`}>
                            {employee.status}
                          </span>
                          <span className="badge badge-blue">
                            {employee.position}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          <span>Hourly Rate: ${employee.hourly_rate || employee.hourlyRate}/hr</span>
                          <span>Hours: {employee.total_hours || employee.totalHours}</span>
                          <span>Earnings: ${(employee.total_earnings || employee.totalEarnings || 0).toFixed(2)}</span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                          {employee.email}
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                          {employee.phone}
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                          {employee.address}
                        </p>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          <span>Hired: {employee.hire_date || employee.hireDate}</span>
                          <span>Next Pay: {employee.nextPayDate || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowPayModal(true);
                          }}
                          className="btn btn-success"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          Process Payroll
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          View Schedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Employee Modal */}
            {showAddModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '24px' }}>
                    Add New Employee
                  </h2>
                  <form onSubmit={handleAddEmployee}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Name
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="input"
                            placeholder="Employee name"
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Position
                          </label>
                          <select
                            value={formData.position}
                            onChange={(e) => setFormData({...formData, position: e.target.value})}
                            className="select"
                            required
                          >
                            <option value="">Select Position</option>
                            <option value="Lead Cleaner">Lead Cleaner</option>
                            <option value="Senior Cleaner">Senior Cleaner</option>
                            <option value="Cleaner">Cleaner</option>
                            <option value="Team Lead">Team Lead</option>
                            <option value="Supervisor">Supervisor</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="input"
                            placeholder="Email address"
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="input"
                            placeholder="Phone number"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Hourly Rate
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.hourlyRate}
                            onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                            className="input"
                            placeholder="15.00"
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Hire Date
                          </label>
                          <input
                            type="date"
                            value={formData.hireDate}
                            onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                            className="input"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                          Address
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="input"
                          placeholder="Employee address"
                          required
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="select"
                        >
                          <option value="Active">Active</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Terminated">Terminated</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        Add Employee
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Process Payroll Modal */}
            {showPayModal && selectedEmployee && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: '0' }}>
                      Process Payroll
                    </h2>
                    <button
                      onClick={() => {
                        setShowPayModal(false);
                        setSelectedEmployee(null);
                      }}
                      className="btn btn-ghost"
                      style={{ padding: '8px 12px', fontSize: '16px' }}
                    >
                      ×
                    </button>
                  </div>
                  
                  <form onSubmit={handleProcessPayroll}>
                    {/* Employee Info Card */}
                    <div className="card" style={{ background: 'var(--bg-secondary)', marginBottom: '24px' }}>
                      <div className="card-body" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: '700'
                          }}>
                            {selectedEmployee.name?.charAt(0).toUpperCase() || 'E'}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                              {selectedEmployee.name}
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0' }}>
                              {selectedEmployee.position}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                          <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Hourly Rate</p>
                            <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
                              ${selectedEmployee.hourlyRate}/hr
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Status</p>
                            <span className={`status ${selectedEmployee.status === 'Active' ? 'status-client' : 'status-lead'}`}>
                              {selectedEmployee.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payroll Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                      {/* Pay Period Section */}
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                          Pay Period
                        </h4>
                        <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>
                              Pay Period
                            </label>
                            <select
                              value={payrollData.payPeriod}
                              onChange={(e) => setPayrollData({...payrollData, payPeriod: e.target.value})}
                              className="select"
                            >
                              <option value="weekly">Weekly</option>
                              <option value="biweekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>
                              Pay Date
                            </label>
                            <input
                              type="date"
                              value={payrollData.payDate}
                              onChange={(e) => setPayrollData({...payrollData, payDate: e.target.value})}
                              className="input"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Hours Section */}
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                          Hours Worked
                        </h4>
                        <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>
                              Regular Hours
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={payrollData.hoursWorked}
                              onChange={(e) => setPayrollData({...payrollData, hoursWorked: e.target.value})}
                              className="input"
                              placeholder="40"
                              required
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>
                              Overtime Hours
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={payrollData.overtimeHours}
                              onChange={(e) => setPayrollData({...payrollData, overtimeHours: e.target.value})}
                              className="input"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Adjustments Section */}
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                          Adjustments
                        </h4>
                        <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>
                              Bonus
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={payrollData.bonus}
                              onChange={(e) => setPayrollData({...payrollData, bonus: e.target.value})}
                              className="input"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>
                              Deductions
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={payrollData.deductions}
                              onChange={(e) => setPayrollData({...payrollData, deductions: e.target.value})}
                              className="input"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                      >
                        Process Payroll
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPayModal(false);
                          setSelectedEmployee(null);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
