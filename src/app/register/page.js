'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEmployeeAccount } from '@/services/authService';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    position: '',
    hireDate: '',
    hourlyRate: '',
    emergencyContact: '',
    inviteCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      // Validate invite code (in production, this would be verified against a database)
      if (formData.inviteCode !== 'MINOR2024') {
        setError('Invalid invite code. Please contact your supervisor.');
        return;
      }

      // Create employee account
      await createEmployeeAccount({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        position: formData.position,
        hireDate: formData.hireDate,
        hourlyRate: parseFloat(formData.hourlyRate),
        emergencyContact: formData.emergencyContact
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', color: 'var(--success)', marginBottom: '16px' }}>Account created successfully!</div>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You can now log in and start your onboarding process.
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body">
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 16px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                position: 'absolute',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)'
              }}></div>
              <div className="car-logo-large" style={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line className="speed-line" x1="2" y1="10" x2="10" y2="10" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                  <line className="speed-line" x1="4" y1="16" x2="12" y2="16" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                  <line className="speed-line" x1="2" y1="22" x2="10" y2="22" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                  <g className="car-body">
                    <path d="M14 22 L16 14 L24 12 L30 8 L40 8 L46 12 L52 14 L54 22 Z" fill="#dc2626"/>
                    <path d="M24 12 L30 8 L40 8 L46 12 L42 12 L38 9 L32 9 L28 12 Z" fill="#991b1b"/>
                    <path d="M28 12 L32 9 L37 9 L37 12 Z" fill="rgba(255,255,255,0.85)"/>
                    <path d="M38 12 L38 9 L41 9 L44 12 Z" fill="rgba(255,255,255,0.85)"/>
                    <circle className="headlight" cx="51" cy="15" r="2" fill="#fff" opacity="0.9"/>
                    <rect x="15" y="14" width="2" height="3" rx="0.5" fill="#ef4444"/>
                    <circle cx="22" cy="22" r="4" fill="#0a0a0a" stroke="#dc2626" strokeWidth="1.5"/>
                    <circle cx="22" cy="22" r="1.5" fill="#dc2626"/>
                    <circle cx="46" cy="22" r="4" fill="#0a0a0a" stroke="#dc2626" strokeWidth="1.5"/>
                    <circle cx="46" cy="22" r="1.5" fill="#dc2626"/>
                  </g>
                </svg>
              </div>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              Minor Cleaning Service
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '0' }}>
              Employee Registration
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Personal Information */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Personal Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input"
                      placeholder="your.email@minorcleaningservices.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="input"
                      placeholder="(555) 123-4567"
                      required
                    />
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
                      placeholder="123 Main St, City, State 12345"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Account Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="input"
                      placeholder="Create a strong password"
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="input"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Employment Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                      <option value="">Select your position</option>
                      <option value="Lead Cleaner">Lead Cleaner</option>
                      <option value="Senior Cleaner">Senior Cleaner</option>
                      <option value="Cleaner">Cleaner</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Supervisor">Supervisor</option>
                    </select>
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
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Hourly Rate ($/hour)
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
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                      className="input"
                      placeholder="Name and phone number"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Invite Code */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Verification
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Invite Code
                    </label>
                    <input
                      type="text"
                      value={formData.inviteCode}
                      onChange={(e) => setFormData({...formData, inviteCode: e.target.value})}
                      className="input"
                      placeholder="Enter your invite code"
                      required
                    />
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      Contact your supervisor for the invite code
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  background: 'var(--error)',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
