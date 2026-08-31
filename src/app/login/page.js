'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, getCurrentUser } from '@/services/authService';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', formData.email);
    console.log('Password provided:', formData.password ? 'Yes' : 'No');

    try {
      console.log('Calling login function...');
      const user = await login(formData.email, formData.password);
      console.log('Login successful:', user);
      
      // Redirect based on role and onboarding status
      if (user.role === 'employee' && !user.onboardingComplete) {
        console.log('Redirecting to onboarding...');
        router.push('/onboarding');
      } else {
        console.log('Redirecting to dashboard...');
        router.push('/');
      }
    } catch (error) {
      console.error('=== LOGIN ERROR ===', error);
      console.error('Error message:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
      console.log('=== LOGIN ATTEMPT END ===');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
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
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input"
                  placeholder="Enter your password"
                  required
                />
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

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Business Account */}
          <div className="business-account" style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 12px 0', textAlign: 'center' }}>
              Business Account
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Owner:</strong> james@minorcleaning.com / password123
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Minor Cleaning Service
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              New employee?{' '}
              <a href="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                Create your account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
