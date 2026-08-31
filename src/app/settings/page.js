'use client';

import { useState, useEffect } from 'react';
import { deleteAllLeads, deleteAllClients, deleteAllMessages, clearAllLocalData } from '@/services/supabaseService';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: 'Minor Cleaning Service',
    email: 'contact@minorcleaningservices.com',
    phone: '(605) 940-8363',
    address: '',
    website: 'https://minorcleaningservices.com/',
    description: 'Professional cleaning services for commercial and residential properties'
  });

  const [generalSettings, setGeneralSettings] = useState({
    timezone: 'America/Chicago',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    notifications: true,
    autoBackup: true,
    darkMode: false
  });

  const [integrations, setIntegrations] = useState({
    googlePlacesKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '',
    hunterApiKey: process.env.NEXT_PUBLIC_HUNTER_API_KEY || '',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  });

  const handleSave = async (section) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Save to localStorage
      if (section === 'profile') {
        localStorage.setItem('fluxone_business_profile', JSON.stringify(formData));
      } else if (section === 'general') {
        localStorage.setItem('fluxone_general_settings', JSON.stringify(generalSettings));
      } else if (section === 'integrations') {
        localStorage.setItem('fluxone_integrations', JSON.stringify(integrations));
      }
      alert(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load saved settings from localStorage
    const savedProfile = JSON.parse(localStorage.getItem('fluxone_business_profile') || 'null');
    if (savedProfile) setFormData(savedProfile);
    const savedGeneral = JSON.parse(localStorage.getItem('fluxone_general_settings') || 'null');
    if (savedGeneral) setGeneralSettings(savedGeneral);
    const savedIntegrations = JSON.parse(localStorage.getItem('fluxone_integrations') || 'null');
    if (savedIntegrations) setIntegrations(savedIntegrations);
  }, []);

  const handleDeleteAllLeads = async () => {
    if (!confirm('Are you sure you want to delete ALL leads?')) return;
    try {
      await deleteAllLeads();
      alert('All leads deleted.');
    } catch (error) {
      console.error('Error deleting all leads:', error);
      alert('Error deleting all leads: ' + error.message);
    }
  };

  const handleDeleteAllClients = async () => {
    if (!confirm('Are you sure you want to delete ALL clients?')) return;
    try {
      await deleteAllClients();
      alert('All clients deleted.');
    } catch (error) {
      console.error('Error deleting all clients:', error);
      alert('Error deleting all clients: ' + error.message);
    }
  };

  const handleDeleteAllMessages = async () => {
    if (!confirm('Are you sure you want to delete ALL messages?')) return;
    try {
      await deleteAllMessages();
      alert('All messages deleted.');
    } catch (error) {
      console.error('Error deleting all messages:', error);
      alert('Error deleting all messages: ' + error.message);
    }
  };

  const handleClearAllLocal = () => {
    if (!confirm('Clear all locally stored test data and reload the page?')) return;
    clearAllLocalData();
    alert('Local data cleared. The page will now reload.');
    window.location.reload();
  };

  return (
    <AuthGuard>
      <div className="crm-layout">
        <Navigation />
        <div className="crm-main">
          <div className="crm-content">
            {/* Header */}
            <div className="page-header">
              <h1 className="page-title">Settings</h1>
              <p className="page-subtitle">Manage your business settings and preferences</p>
            </div>

            {/* Tab Navigation */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {[
                  { id: 'profile', label: 'Business Profile' },
                  { id: 'integrations', label: 'Integrations' },
                  { id: 'general', label: 'General' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="nav-link"
                    style={{ 
                      padding: '16px 24px', 
                      borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : 'none',
                      marginBottom: '-1px',
                      borderRadius: '0',
                      background: activeTab === tab.id ? 'transparent' : 'transparent',
                      color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="card">
              {activeTab === 'profile' && (
                <div>
                  <div className="card-header">
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Business Profile
                    </h2>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="grid grid-cols-2" style={{ gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Business Name
                          </label>
                          <input
                            type="text"
                            value={formData.businessName}
                            onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                            className="input"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="input"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2" style={{ gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="input"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Website
                          </label>
                          <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({...formData, website: e.target.value})}
                            className="input"
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
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="textarea"
                          rows={4}
                        />
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleSave('profile')}
                          disabled={loading}
                          className="btn btn-primary"
                        >
                          {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              <div className="loading" style={{ marginRight: '8px' }}></div>
                              Saving...
                            </span>
                          ) : 'Save Profile'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div>
                  <div className="card-header">
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      API Integrations
                    </h2>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--info)' }}>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                          These keys power the lead finder, email enrichment, and data storage. Keys are stored locally in your browser and are not sent anywhere except the respective APIs.
                        </p>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                          Google Places API
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          Used for business search and lead discovery. Get a key at <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info)' }}>Google Cloud Console</a>.
                        </p>
                        <input
                          type="password"
                          value={integrations.googlePlacesKey}
                          onChange={(e) => setIntegrations({...integrations, googlePlacesKey: e.target.value})}
                          className="input"
                          placeholder="AIza..."
                        />
                      </div>

                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                          Hunter.io API
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          Used for finding email addresses for leads. Get a key at <a href="https://hunter.io/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info)' }}>Hunter.io</a>.
                        </p>
                        <input
                          type="password"
                          value={integrations.hunterApiKey}
                          onChange={(e) => setIntegrations({...integrations, hunterApiKey: e.target.value})}
                          className="input"
                          placeholder="Enter Hunter.io API key"
                        />
                      </div>

                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                          Supabase
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          Used for cloud data storage and authentication. Get credentials at <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info)' }}>Supabase Dashboard</a>.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <input
                            type="text"
                            value={integrations.supabaseUrl}
                            onChange={(e) => setIntegrations({...integrations, supabaseUrl: e.target.value})}
                            className="input"
                            placeholder="https://your-project.supabase.co"
                          />
                          <input
                            type="password"
                            value={integrations.supabaseKey}
                            onChange={(e) => setIntegrations({...integrations, supabaseKey: e.target.value})}
                            className="input"
                            placeholder="Supabase anon key"
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleSave('integrations')}
                          disabled={loading}
                          className="btn btn-primary"
                        >
                          {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              <div className="loading" style={{ marginRight: '8px' }}></div>
                              Saving...
                            </span>
                          ) : 'Save Integrations'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'general' && (
                <div>
                  <div className="card-header">
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      General Settings
                    </h2>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="grid grid-cols-2" style={{ gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Timezone
                          </label>
                          <select
                            value={generalSettings.timezone}
                            onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                            className="select"
                          >
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Denver">Mountain Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Currency
                          </label>
                          <select
                            value={generalSettings.currency}
                            onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                            className="select"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2" style={{ gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Date Format
                          </label>
                          <select
                            value={generalSettings.dateFormat}
                            onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
                            className="select"
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={generalSettings.notifications}
                              onChange={(e) => setGeneralSettings({...generalSettings, notifications: e.target.checked})}
                              style={{ width: '16px', height: '16px' }}
                            />
                            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Enable email notifications</span>
                          </label>
                          
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={generalSettings.autoBackup}
                              onChange={(e) => setGeneralSettings({...generalSettings, autoBackup: e.target.checked})}
                              style={{ width: '16px', height: '16px' }}
                            />
                            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Enable automatic backups</span>
                          </label>
                          
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={generalSettings.darkMode}
                              onChange={(e) => setGeneralSettings({...generalSettings, darkMode: e.target.checked})}
                              style={{ width: '16px', height: '16px' }}
                            />
                            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Enable dark mode</span>
                          </label>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleSave('general')}
                          disabled={loading}
                          className="btn btn-primary"
                        >
                          {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              <div className="loading" style={{ marginRight: '8px' }}></div>
                              Saving...
                            </span>
                          ) : 'Save Settings'}
                        </button>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                          Data Management (Test Cleanup)
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                          Remove practice data before going live. Clearing local data also removes any cached browser entries.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <button
                            onClick={handleDeleteAllLeads}
                            className="btn btn-outline"
                            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                          >
                            Delete All Leads
                          </button>
                          <button
                            onClick={handleDeleteAllClients}
                            className="btn btn-outline"
                            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                          >
                            Delete All Clients
                          </button>
                          <button
                            onClick={handleDeleteAllMessages}
                            className="btn btn-outline"
                            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                          >
                            Delete All Messages
                          </button>
                          <button
                            onClick={handleClearAllLocal}
                            className="btn btn-outline"
                            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                          >
                            Clear All Local Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
