'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, logout, hasPermission, canAccessPage } from '@/services/authService';

export default function Navigation() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const isActive = (path) => pathname === path;

  // Get navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];
    
    const baseItems = [
      { path: '/', label: 'Dashboard', icon: 'dashboard', permission: 'dashboard.view' }
    ];

    if (hasPermission('leads.view')) {
      baseItems.push({ path: '/lead-finder', label: 'Lead Finder', icon: 'search', permission: 'leads.view' });
      baseItems.push({ path: '/pipeline', label: 'Pipeline', icon: 'pipeline', permission: 'leads.view' });
    }
    
    if (hasPermission('emails.view')) {
      baseItems.push({ path: '/messages', label: 'Messages', icon: 'message', permission: 'emails.view' });
    }
    
    if (hasPermission('clients.view')) {
      baseItems.push({ path: '/clients', label: 'Clients', icon: 'briefcase', permission: 'clients.view' });
    }
    
    if (hasPermission('schedule.view')) {
      baseItems.push({ path: '/schedule', label: 'Schedule', icon: 'calendar', permission: 'schedule.view' });
    }
    
    if (hasPermission('settings.view')) {
      baseItems.push({ path: '/settings', label: 'Settings', icon: 'settings', permission: 'settings.view' });
    }
    
    return baseItems;
  };

  const navItems = getNavItems();

  const getIcon = (iconName) => {
    const icons = {
      dashboard: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      ),
      users: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      briefcase: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
      people: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      calendar: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      receipt: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
          <path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/>
        </svg>
      ),
      mail: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="m22 7-10 5L2 7"/>
        </svg>
      ),
      message: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      settings: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
      search: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
      pipeline: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="5" height="18" rx="1"/>
          <rect x="10" y="3" width="5" height="12" rx="1"/>
          <rect x="17" y="3" width="5" height="8" rx="1"/>
        </svg>
      ),
      logout: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      )
    };
    return icons[iconName] || icons.dashboard;
  };

  const handleNavigation = (path) => {
    if (canAccessPage(path)) {
      router.push(path);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="crm-sidebar">
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer'
        }} onClick={() => handleNavigation('/')}>
          <div className="car-logo">
            <svg viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Speed lines */}
              <line className="speed-line" x1="2" y1="10" x2="10" y2="10" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
              <line className="speed-line" x1="4" y1="16" x2="12" y2="16" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
              <line className="speed-line" x1="2" y1="22" x2="10" y2="22" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
              {/* Car body */}
              <g className="car-body">
                {/* Main body */}
                <path d="M14 22 L16 14 L24 12 L30 8 L40 8 L46 12 L52 14 L54 22 Z" fill="#dc2626"/>
                {/* Roof/cabin */}
                <path d="M24 12 L30 8 L40 8 L46 12 L42 12 L38 9 L32 9 L28 12 Z" fill="#991b1b"/>
                {/* Windows */}
                <path d="M28 12 L32 9 L37 9 L37 12 Z" fill="rgba(255,255,255,0.85)"/>
                <path d="M38 12 L38 9 L41 9 L44 12 Z" fill="rgba(255,255,255,0.85)"/>
                {/* Headlight */}
                <circle className="headlight" cx="51" cy="15" r="2" fill="#fff" opacity="0.9"/>
                {/* Taillight */}
                <rect x="15" y="14" width="2" height="3" rx="0.5" fill="#ef4444"/>
                {/* Wheels */}
                <circle cx="22" cy="22" r="4" fill="#0a0a0a" stroke="#dc2626" strokeWidth="1.5"/>
                <circle cx="22" cy="22" r="1.5" fill="#dc2626"/>
                <circle cx="46" cy="22" r="4" fill="#0a0a0a" stroke="#dc2626" strokeWidth="1.5"/>
                <circle cx="46" cy="22" r="1.5" fill="#dc2626"/>
              </g>
            </svg>
          </div>
          <span className="sidebar-label" style={{
            fontSize: '16px',
            fontWeight: '800',
            color: 'white',
            letterSpacing: '-0.5px',
            lineHeight: '1.2'
          }}>
            FluxOne
          </span>
        </div>

        {/* Nav Items */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            >
              {getIcon(item.icon)}
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile + Logout */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              flexShrink: 0
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="sidebar-label" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'white',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.name || 'User'}
              </span>
              {user && user.role && (
                <span style={{
                  fontSize: '11px',
                  color: 'var(--sidebar-text-muted)',
                  textTransform: 'capitalize'
                }}>
                  {user.role}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-item"
            style={{ color: 'var(--sidebar-text-muted)' }}
          >
            {getIcon('logout')}
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
