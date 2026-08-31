'use client';

import { useState, useEffect } from 'react';
import { getLeads, addLead, updateLead, deleteLead, convertLeadToClient, deleteAllLeads } from '@/services/supabaseService';
import { searchBusinesses, searchAndEnrichBusinesses, getEmailTemplates, addJob } from '@/services/dataService';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  
  // Business search state
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [businessSearchResults, setBusinessSearchResults] = useState([]);
  const [businessSearching, setBusinessSearching] = useState(false);
  const [showBusinessSearch, setShowBusinessSearch] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showBusinessDetails, setShowBusinessDetails] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    status: 'Lead'
  });
  const [scheduleData, setScheduleData] = useState({
    clientName: '',
    date: '',
    time: '',
    duration: '2 hours',
    serviceType: 'Initial Consultation',
    notes: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await getLeads();
      console.log('Leads fetched:', data);
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const results = await searchBusinesses(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching businesses:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleBusinessSearch = async () => {
    console.log('=== BUSINESS SEARCH START ===');
    console.log('Search query:', businessSearchQuery);
    console.log('Query length:', businessSearchQuery.length);
    console.log('Query trimmed:', businessSearchQuery.trim());
    console.log('Query trimmed length:', businessSearchQuery.trim().length);
    
    if (!businessSearchQuery || businessSearchQuery.trim() === '') {
      console.log('Empty search query detected, clearing results and returning');
      setBusinessSearchResults([]);
      return;
    }
    
    console.log('Query is valid, proceeding with search');
    setBusinessSearching(true);
    try {
      console.log('Calling searchAndEnrichBusinesses with query:', businessSearchQuery);
      const results = await searchAndEnrichBusinesses(businessSearchQuery);
      console.log('Search results received:', results);
      console.log('Number of results:', results.length);
      setBusinessSearchResults(results);
      console.log('Results set in state');
    } catch (error) {
      console.error('Error searching businesses:', error);
      console.error('Error details:', error.message);
      alert('Search error: ' + error.message);
    } finally {
      setBusinessSearching(false);
      console.log('=== BUSINESS SEARCH END ===');
    }
  };

  const handleViewBusinessDetails = (business) => {
    setSelectedBusiness(business);
    setShowBusinessDetails(true);
  };

  const handleAddBusinessToLeads = async (business) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const leadData = {
        businessName: business.name,
        contactName: '', // Will be filled by user
        phone: business.phone || '',
        email: business.email || '',
        address: business.address || '',
        notes: `Source: ${business.source || 'Google'}${business.email_confidence ? ` (Email confidence: ${business.email_confidence}%)` : ''}`,
        status: business.email ? 'Lead' : 'No email found',
        account_id: currentUser.account_id
      };
      
      const newLead = await addLead(leadData);
      
      // Refresh leads
      await fetchLeads();
      
      // Clear business search
      setBusinessSearchResults([]);
      setBusinessSearchQuery('');
      
      alert(`Business "${business.name}" added to leads!`);
    } catch (error) {
      console.error('Error adding business to leads:', error);
      alert('Error adding business to leads');
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      const newLead = await addLead(formData);
      
      // Refresh leads from server to ensure consistency
      await fetchLeads();
      
      // Reset form and close modal
      setFormData({
        businessName: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        status: 'Lead'
      });
      setShowAddModal(false);
      
      // Show success feedback
      alert('Lead added successfully!');
      
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Error adding lead. Please try again.');
    }
  };

  const handleUpdateLead = async (id, updates) => {
    try {
      await updateLead(id, updates);
      
      // Update local state immediately
      setLeads(prev => prev.map(lead => 
        lead.id === id ? { ...lead, ...updates } : lead
      ));
      
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

  const handleDeleteLead = async (id) => {
    if (!isMobile() && !confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteLead(id);
      
      // Remove from local state immediately
      setLeads(prev => prev.filter(lead => lead.id !== id));
      
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleConvertToClient = async (lead) => {
    if (!confirm(`Convert ${lead.business_name || lead.businessName} to a paying client?`)) return;
    try {
      const client = await convertLeadToClient(lead);
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'client' } : l));
      alert(`Converted to client: ${client?.business_name || client?.businessName || lead.business_name || lead.businessName}`);
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('Error converting lead: ' + error.message);
    }
  };

  const handleDeleteAllLeads = async () => {
    if (!confirm('Are you sure you want to delete ALL leads? This cannot be undone.')) return;
    try {
      await deleteAllLeads();
      setLeads([]);
    } catch (error) {
      console.error('Error deleting all leads:', error);
      alert('Error deleting all leads: ' + error.message);
    }
  };

  const handleAddFromSearch = async (business) => {
    try {
      const newLead = await addLead({
        businessName: business.businessName,
        contactName: 'Contact Person',
        phone: business.phone,
        email: business.email,
        address: `${business.address}, ${business.city}, ${business.state} ${business.zip}`,
        notes: `Found via search - Category: ${business.category}, Rating: ${business.rating}/5 (${business.reviews} reviews)`
      });
      
      // Add to local state immediately
      setLeads(prev => [newLead, ...prev]);
      
      // Remove from search results
      setSearchResults(prev => prev.filter(b => b.id !== business.id));
      
      // Show success feedback
      alert('Lead added successfully!');
      
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Error adding lead. Please try again.');
    }
  };

  const handleCall = (lead) => {
    window.location.href = `tel:${lead.phone}`;
  };

  const handleEmail = (lead) => {
    setSelectedLead(lead);
    setShowEmailModal(true);
  };

  const handleSchedule = (lead) => {
    setSelectedLead(lead);
    setScheduleData({
      clientName: lead.businessName,
      date: '',
      time: '',
      duration: '2 hours',
      serviceType: 'Initial Consultation',
      notes: `Lead contact: ${lead.contactName} - ${lead.phone}`
    });
    setShowScheduleModal(true);
  };

  const handleSendEmail = () => {
    if (selectedLead) {
      window.location.href = `mailto:${selectedLead.email}?subject=Professional Cleaning Services&body=Hello ${selectedLead.contactName},\n\nI hope this email finds you well. We offer professional cleaning services tailored to businesses like yours.\n\nWould you be available for a quick call next week to discuss how we can help maintain your facility?\n\nBest regards,\nFluxOne Cleaning Services\n\nPhone: (555) 123-4567\nEmail: info@fluxone.com`;
    }
    setShowEmailModal(false);
    setSelectedLead(null);
  };

  const handleScheduleJob = async (e) => {
    e.preventDefault();
    try {
      const newJob = await addJob({
        ...scheduleData,
        status: 'Scheduled',
        clientPhone: selectedLead.phone,
        clientEmail: selectedLead.email
      });
      
      // Update lead status immediately
      await updateLead(selectedLead.id, { status: 'Contacted' });
      setLeads(prev => prev.map(lead => 
        lead.id === selectedLead.id ? { ...lead, status: 'Contacted' } : lead
      ));
      
      setShowScheduleModal(false);
      setSelectedLead(null);
      setScheduleData({
        clientName: '',
        date: '',
        time: '',
        duration: '2 hours',
        serviceType: 'Initial Consultation',
        notes: ''
      });
      
      // Show success feedback
      alert('Meeting scheduled successfully! Lead status updated to Contacted.');
      
      // Navigate to schedule page
      router.push('/schedule');
      
    } catch (error) {
      console.error('Error scheduling job:', error);
      alert('Error scheduling meeting. Please try again.');
    }
  };

  // Filter leads by status
  const getFilteredLeads = () => {
    if (!leads || !Array.isArray(leads)) return [];
    if (activeTab === 'all') return leads;
    return leads.filter(lead => lead && lead.status === activeTab);
  };

  // Get counts for each status
  const getLeadCounts = () => {
    // Ensure leads is always an array
    const leadsArray = Array.isArray(leads) ? leads : [];
    
    const counts = {
      all: leadsArray.length,
      Lead: leadsArray.filter(l => l.status === 'Lead').length,
      Contacted: leadsArray.filter(l => l.status === 'Contacted').length,
      Prospect: leadsArray.filter(l => l.status === 'Prospect').length,
      Client: leadsArray.filter(l => l.status === 'Client').length,
      Lost: leadsArray.filter(l => l.status === 'Lost').length
    };
    return counts;
  };

  const statusColors = {
    'Lead': 'status-lead',
    'Contacted': 'status-contacted',
    'Prospect': 'status-prospect',
    'Client': 'status-client',
    'Lost': 'status-lost'
  };

  const leadCounts = getLeadCounts();
  const filteredLeads = getFilteredLeads();

  if (loading) {
    return (
      <AuthGuard>
        <div className="crm-layout">
          <Navigation />
          <div className="crm-main">
            <div className="crm-content">
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div className="loading" style={{ margin: '0 auto 24px' }}></div>
                <p className="text-secondary">Loading leads...</p>
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
              <h1 className="page-title">Lead Management</h1>
              <p className="page-subtitle">Search for businesses by niche, city, and state to find leads anywhere</p>
            </div>

            {/* Enhanced Business Search Section */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      🔍 Search Businesses (Google Places API)
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={businessSearchQuery}
                        onChange={(e) => setBusinessSearchQuery(e.target.value)}
                        placeholder="e.g., cleaning companies Houston TX, dental offices Miami FL, restaurants Los Angeles CA, medical clinics New York NY"
                        className="input"
                        style={{ flex: 1 }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            if (!businessSearchQuery || businessSearchQuery.trim() === '') {
                              alert('Please enter a search query (e.g., "restaurants in Minneapolis")');
                              return;
                            }
                            handleBusinessSearch();
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (!businessSearchQuery || businessSearchQuery.trim() === '') {
                            alert('Please enter a search query (e.g., "restaurants in Minneapolis")');
                            return;
                          }
                          handleBusinessSearch();
                        }}
                        disabled={businessSearching}
                        className="btn btn-primary"
                      >
                        {businessSearching ? (
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="loading" style={{ marginRight: '8px' }}></div>
                            Searching...
                          </span>
                        ) : 'Search Businesses'}
                      </button>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      Powered by Google Places API with automatic email enrichment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Search Results */}
            {businessSearchResults.length > 0 && (
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      📊 Business Search Results ({businessSearchResults.length})
                    </h2>
                    <button
                      onClick={() => {
                        setBusinessSearchResults([]);
                        setBusinessSearchQuery('');
                      }}
                      className="btn btn-ghost"
                      style={{ fontSize: '12px' }}
                    >
                      Clear Results
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {businessSearchResults.map((business, index) => (
                      <div key={business.place_id || index} style={{
                        padding: '16px',
                        background: business.isSetupMessage ? 'var(--warning-bg)' : 'var(--bg-secondary)',
                        borderRadius: '8px',
                        border: business.isSetupMessage ? '1px solid var(--warning)' : '1px solid var(--border)',
                        cursor: business.isSetupMessage ? 'default' : 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onClick={() => !business.isSetupMessage && handleViewBusinessDetails(business)}
                      onMouseEnter={(e) => {
                        if (!business.isSetupMessage) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!business.isSetupMessage) {
                          e.currentTarget.style.backgroundColor = business.isSetupMessage ? 'var(--warning-bg)' : 'var(--bg-secondary)';
                        }
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: business.isSetupMessage ? 'var(--warning)' : 'var(--text-primary)', margin: '0 0 8px 0' }}>
                              {business.name}
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                              📍 {business.address}
                            </p>
                            {business.message && (
                              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 0 0', fontStyle: 'italic' }}>
                                {business.message}
                              </p>
                            )}
                            {business.phone && (
                              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                                📞 {business.phone}
                              </p>
                            )}
                            {business.email && (
                              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                                📧 {business.email} {business.email_confidence && (
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    (Confidence: {business.email_confidence}%)
                                  </span>
                                )}
                              </p>
                            )}
                            {business.website && (
                              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                                🌐 {business.website}
                              </p>
                            )}
                            {business.rating && (
                              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                                ⭐ {business.rating} stars
                              </p>
                            )}
                          </div>
                          {!business.isSetupMessage && (
                            <button
                              onClick={() => handleAddBusinessToLeads(business)}
                              className="btn btn-primary"
                              style={{ padding: '8px 16px', fontSize: '12px' }}
                            >
                              Add to Leads
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Search Results ({searchResults.length})
                    </h2>
                    <button
                      onClick={() => setSearchResults([])}
                      className="btn btn-ghost"
                      style={{ fontSize: '12px' }}
                    >
                      Clear Results
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {searchResults.map((business) => (
                      <div key={business.id} className="card" style={{ background: 'var(--bg-secondary)' }}>
                        <div className="card-body">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                                {business.businessName}
                              </h3>
                              <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                                <span className="badge badge-blue">
                                  {business.category}
                                </span>
                                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                  {business.city}, {business.state}
                                </span>
                              </div>
                              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                {business.address}
                              </p>
                              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                {business.phone}
                              </p>
                              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                {business.email}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                  Rating: {business.rating}/5
                                </span>
                                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                  ({business.reviews} reviews)
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddFromSearch(business)}
                              className="btn btn-primary"
                            >
                              Add as Lead
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Add Lead Button */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary btn-lg"
              >
                + Add New Lead Manually
              </button>
              <button
                onClick={handleDeleteAllLeads}
                className="btn btn-outline btn-lg"
                style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
              >
                Delete All Leads
              </button>
            </div>

            {/* Status Tabs */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-body">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'All Leads', count: leadCounts.all },
                    { id: 'Lead', label: 'Leads', count: leadCounts.Lead },
                    { id: 'Contacted', label: 'Contacted', count: leadCounts.Contacted },
                    { id: 'Prospect', label: 'Prospects', count: leadCounts.Prospect },
                    { id: 'Client', label: 'Clients', count: leadCounts.Client },
                    { id: 'Lost', label: 'Lost', count: leadCounts.Lost }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontSize: '14px'
                      }}
                    >
                      {tab.label}
                      <span style={{ 
                        background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Leads List */}
            <div className="card">
              <div className="card-header">
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {activeTab === 'all' ? 'All Leads' : `${activeTab}s`} ({filteredLeads.length})
                </h2>
              </div>
              {loading ? (
                <div className="card-body">
                  <div style={{ textAlign: 'center', padding: '32px' }}>
                    <div className="loading" style={{ margin: '0 auto 16px' }}></div>
                    <p className="text-secondary">Loading leads...</p>
                  </div>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="card-body">
                  <div style={{ textAlign: 'center', padding: '32px' }}>
                    <p className="text-secondary">
                      {activeTab === 'all' ? 'No leads yet. Start by searching for businesses above.' : `No ${activeTab.toLowerCase()} leads yet.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="card-body" style={{ padding: '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {filteredLeads.map((lead) => (
                      <div key={`${lead.id}-${lead.createdAt}`} style={{ 
                        padding: '20px 24px', 
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
                              {lead.businessName}
                            </h3>
                            <span className={`status ${statusColors[lead.status]}`}>
                              {lead.status}
                            </span>
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                            {lead.contactName}
                          </p>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                            {lead.phone}
                          </p>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                            {lead.email}
                          </p>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                            {lead.address}
                          </p>
                          {lead.notes && (
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0' }}>
                              {lead.notes}
                            </p>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px', flexWrap: 'wrap' }}>
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateLead(lead.id, { status: e.target.value })}
                            className="select"
                            style={{ fontSize: '13px' }}
                          >
                            <option value="Lead">Lead</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Prospect">Prospect</option>
                            <option value="Client">Client</option>
                            <option value="Lost">Lost</option>
                          </select>
                          
                          {/* Action Buttons */}
                          <button
                            onClick={() => handleCall(lead)}
                            className="btn btn-success"
                            title="Call Lead"
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.09 2.5a.678.678 0 0 0 .063 1.015l3.236 2.984a.678.678 0 0 0 .958-.006l6.08-6.08a.678.678 0 0 0-.064-1.015L9.5 1.328a.678.678 0 0 0-1.015.063L8.984 2.5a.678.678 0 0 1-.958.006L5.5 1.328a.678.678 0 0 0-1.015-.063zm-3.236 7.04a.678.678 0 0 1 .958-.006L5.5 9.5a.678.678 0 0 1 .958-.006l3.236 2.984a.678.678 0 0 0 1.015-.063l1.548-1.235a.678.678 0 0 0-.064-1.015l-6.08-6.08a.678.678 0 0 0-.958.006L1.09 8.5a.678.678 0 0 0 .063 1.015l3.236 2.984a.678.678 0 0 0 .958-.006l3.236-2.984a.678.678 0 0 1 .958.006l3.236 2.984a.678.678 0 0 0 1.015-.063l1.548-1.235a.678.678 0 0 0-.064-1.015l-6.08-6.08a.678.678 0 0 0-.958.006L1.09 8.5a.678.678 0 0 0 .063 1.015z"/>
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleEmail(lead)}
                            className="btn btn-primary"
                            title="Email Lead"
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.114V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.114l4.708-2.876L1 5.383v5.73Z"/>
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleSchedule(lead)}
                            className="btn btn-secondary"
                            title="Schedule Meeting"
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1Z"/>
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleConvertToClient(lead)}
                            className="btn btn-success"
                            title="Convert to Client"
                          >
                            Convert
                          </button>
                          
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="btn btn-outline"
                            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                            title="Delete Lead"
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add Lead Modal */}
            {showAddModal && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxHeight: '90vh', overflow: 'auto' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '24px' }}>
                    Add New Lead
                  </h2>
                  <form onSubmit={handleAddLead}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Business Name
                          </label>
                          <input
                            type="text"
                            value={formData.businessName}
                            onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                            className="input"
                            placeholder="Business name"
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Contact Name
                          </label>
                          <input
                            type="text"
                            value={formData.contactName}
                            onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                            className="input"
                            placeholder="Contact person name"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2" style={{ gap: '16px' }}>
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
                          placeholder="Business address"
                          required
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                          Notes
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          className="textarea"
                          rows={3}
                          placeholder="Additional notes"
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
                          <option value="Lead">Lead</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Prospect">Prospect</option>
                          <option value="Client">Client</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        Add Lead
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

            {/* Email Modal */}
            {showEmailModal && selectedLead && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxHeight: '90vh', overflow: 'auto' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '24px' }}>
                    Email {selectedLead.businessName}
                  </h2>
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                      To: {selectedLead.email}
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                      Contact: {selectedLead.contactName}
                    </p>
                  </div>
                  
                  <div className="card" style={{ background: 'var(--bg-secondary)', marginBottom: '16px' }}>
                    <div className="card-body">
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                        Email Preview
                      </h3>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        <p style={{ margin: '0 0 12px 0' }}>Subject: Professional Cleaning Services</p>
                        <p style={{ margin: '0 0 12px 0' }}>Hello {selectedLead.contactName},</p>
                        <p style={{ margin: '0 0 12px 0' }}>I hope this email finds you well. We offer professional cleaning services tailored to businesses like yours.</p>
                        <p style={{ margin: '0 0 12px 0' }}>Would you be available for a quick call next week to discuss how we can help maintain your facility?</p>
                        <p style={{ margin: '0 0 12px 0' }}>Best regards,</p>
                        <p style={{ margin: '0' }}>FluxOne Cleaning Services</p>
                        <p style={{ margin: '0' }}>Phone: (555) 123-4567</p>
                        <p style={{ margin: '0' }}>Email: info@fluxone.com</p>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleSendEmail}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      Send Email
                    </button>
                    <button
                      onClick={() => {
                        setShowEmailModal(false);
                        setSelectedLead(null);
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Modal */}
            {showScheduleModal && selectedLead && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxHeight: '90vh', overflow: 'auto' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '24px' }}>
                    Schedule Meeting - {selectedLead.businessName}
                  </h2>
                  <form onSubmit={handleScheduleJob}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                        <div className="card-body">
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                            Lead Information
                          </h3>
                          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            <p style={{ margin: '0 0 4px 0' }}>Business: {selectedLead.businessName}</p>
                            <p style={{ margin: '0 0 4px 0' }}>Contact: {selectedLead.contactName}</p>
                            <p style={{ margin: '0 0 4px 0' }}>Phone: {selectedLead.phone}</p>
                            <p style={{ margin: '0' }}>Email: {selectedLead.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Date
                          </label>
                          <input
                            type="date"
                            value={scheduleData.date}
                            onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
                            className="input"
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Time
                          </label>
                          <input
                            type="time"
                            value={scheduleData.time}
                            onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
                            className="input"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Duration
                          </label>
                          <select
                            value={scheduleData.duration}
                            onChange={(e) => setScheduleData({...scheduleData, duration: e.target.value})}
                            className="select"
                          >
                            <option value="30 minutes">30 minutes</option>
                            <option value="1 hour">1 hour</option>
                            <option value="2 hours">2 hours</option>
                            <option value="3 hours">3 hours</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Service Type
                          </label>
                          <select
                            value={scheduleData.serviceType}
                            onChange={(e) => setScheduleData({...scheduleData, serviceType: e.target.value})}
                            className="select"
                          >
                            <option value="Initial Consultation">Initial Consultation</option>
                            <option value="Site Visit">Site Visit</option>
                            <option value="Service Demonstration">Service Demonstration</option>
                            <option value="Price Quote">Price Quote</option>
                            <option value="Follow-up Meeting">Follow-up Meeting</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                          Notes
                        </label>
                        <textarea
                          value={scheduleData.notes}
                          onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                          className="textarea"
                          rows={3}
                          placeholder="Meeting notes and agenda"
                        />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        Schedule & Update Lead
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowScheduleModal(false);
                          setSelectedLead(null);
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Business Details Modal */}
            {showBusinessDetails && selectedBusiness && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      📊 Business Details
                    </h2>
                    <button
                      onClick={() => {
                        setShowBusinessDetails(false);
                        setSelectedBusiness(null);
                      }}
                      className="btn btn-ghost"
                      style={{ fontSize: '20px', padding: '4px 8px' }}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                        {selectedBusiness.name}
                      </h3>
                      {selectedBusiness.rating && (
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                          ⭐ {selectedBusiness.rating} stars {selectedBusiness.reviews && `(${selectedBusiness.reviews} reviews)`}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                        📍 Location
                      </h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0' }}>
                        {selectedBusiness.address}
                      </p>
                    </div>

                    {selectedBusiness.phone && (
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                          📞 Phone
                        </h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0' }}>
                          {selectedBusiness.phone}
                        </p>
                      </div>
                    )}

                    {selectedBusiness.email && (
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                          📧 Email
                        </h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0' }}>
                          {selectedBusiness.email}
                          {selectedBusiness.email_confidence && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                              (Confidence: {selectedBusiness.email_confidence}%)
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {selectedBusiness.website && (
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                          🌐 Website
                        </h4>
                        <a 
                          href={selectedBusiness.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ fontSize: '14px', color: 'var(--primary)', textDecoration: 'none' }}
                        >
                          {selectedBusiness.website}
                        </a>
                      </div>
                    )}

                    {selectedBusiness.category && (
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                          🏢 Category
                        </h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0' }}>
                          {selectedBusiness.category}
                        </p>
                      </div>
                    )}

                    {selectedBusiness.source && (
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                          🔍 Data Source
                        </h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0' }}>
                          {selectedBusiness.source}
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button
                      onClick={() => {
                        handleAddBusinessToLeads(selectedBusiness);
                        setShowBusinessDetails(false);
                        setSelectedBusiness(null);
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      Add to Leads
                    </button>
                    <button
                      onClick={() => {
                        setShowBusinessDetails(false);
                        setSelectedBusiness(null);
                      }}
                      className="btn btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
