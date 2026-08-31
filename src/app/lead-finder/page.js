'use client';

import { useState, useEffect } from 'react';
import { searchAndEnrichBusinesses, searchBusinesses } from '@/services/dataService';
import { addLead, getLeads } from '@/services/supabaseService';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';

export default function LeadFinderPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkQueries, setBulkQueries] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [bulkResults, setBulkResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [bulkSearching, setBulkSearching] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [savedLeads, setSavedLeads] = useState([]);
  const [savedLeadIds, setSavedLeadIds] = useState(new Set());
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchMode, setSearchMode] = useState('single');
  const [savingLead, setSavingLead] = useState(null);
  const [leadStatus, setLeadStatus] = useState('new');

  useEffect(() => {
    fetchSavedLeads();
  }, []);

  const fetchSavedLeads = async () => {
    try {
      const result = await getLeads();
      const leadsArray = result?.success !== undefined ? (result.data || []) : (Array.isArray(result) ? result : []);
      setSavedLeads(leadsArray);
      const ids = new Set(leadsArray.map(l => l.business_name || l.businessName || l.name));
      setSavedLeadIds(ids);
    } catch (error) {
      console.warn('Error fetching saved leads:', error);
    }
  };

  const handleSingleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchAndEnrichBusinesses(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.warn('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleBulkSearch = async () => {
    const queries = bulkQueries
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0);
    
    if (queries.length === 0) {
      alert('Please enter at least one search query');
      return;
    }

    setBulkSearching(true);
    setBulkResults([]);
    
    try {
      const allResults = [];
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        try {
          const results = await searchAndEnrichBusinesses(query);
          const mapped = results.map(r => ({ ...r, searchQuery: query }));
          allResults.push(...mapped);
          setBulkResults([...allResults]);
        } catch (error) {
          console.warn(`Error searching "${query}":`, error);
        }
      }
    } catch (error) {
      console.warn('Bulk search error:', error);
      setBulkResults([]);
    } finally {
      setBulkSearching(false);
    }
  };

  const handleSaveLead = async (business) => {
    setSavingLead(business.place_id || business.id);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const contacts = business.contacts || [];
      const contactNames = contacts.map(c => c.name).filter(Boolean).join('; ');
      const contactTitles = contacts.map(c => `${c.name} (${c.position})`).filter(Boolean).join('; ');
      const leadData = {
        businessName: business.name,
        contactName: business.primary_contact_name || contactNames || '',
        phone: business.phone || business.formatted_phone_number || business.international_phone || '',
        email: business.email || '',
        address: business.address || business.formatted_address || '',
        notes: `Source: ${business.source || 'Google Places'}${business.email_confidence ? ` | Email confidence: ${business.email_confidence}%` : ''}${business.rating ? ` | Rating: ${business.rating}` : ''}${business.rating_count ? ` | Reviews: ${business.rating_count}` : ''}${business.primary_contact_name ? ` | Key Contact: ${business.primary_contact_name} (${business.primary_contact_title})` : ''}${business.opening_hours?.weekdayText ? ` | Hours: ${business.opening_hours.weekdayText.join(', ')}` : ''}`,
        status: leadStatus,
        account_id: currentUser.account_id,
        category: business.types ? business.types.join(', ') : '',
        website: business.website || '',
        rating: business.rating || 0,
        rating_count: business.rating_count || business.user_ratings_total || 0,
        domain: business.domain || '',
        city: business.city || '',
        state: business.state || '',
        zip: business.zip || '',
        primary_contact_name: business.primary_contact_name || '',
        primary_contact_title: business.primary_contact_title || '',
        primary_contact_email: business.email || '',
        primary_contact_phone: business.primary_contact_phone || '',
        primary_contact_linkedin: business.primary_contact_linkedin || '',
        contacts: JSON.stringify(contacts),
        opening_hours: business.opening_hours?.weekdayText ? JSON.stringify(business.opening_hours) : '',
        reviews: business.reviews ? JSON.stringify(business.reviews) : '',
        google_url: business.google_url || '',
      };
      
      await addLead(leadData);
      await fetchSavedLeads();
      setSavingLead(null);
    } catch (error) {
      console.warn('Error saving lead:', error);
      setSavingLead(null);
    }
  };

  const handleSaveAll = async (results) => {
    const unsaved = results.filter(r => !savedLeadIds.has(r.name));
    if (unsaved.length === 0) {
      alert('All results are already saved!');
      return;
    }
    
    if (!confirm(`Save ${unsaved.length} leads to pipeline?`)) return;
    
    for (const business of unsaved) {
      await handleSaveLead(business);
    }
    alert(`Saved ${unsaved.length} leads!`);
  };

  const exportToCSV = (results) => {
    if (!results || results.length === 0) {
      alert('No results to export');
      return;
    }

    const headers = ['Business Name', 'Phone', 'Email', 'Address', 'Website', 'Rating', 'Reviews', 'Category', 'Key Contact', 'Contact Title', 'Contact LinkedIn', 'City', 'State', 'Source'];
    const rows = results.map(b => [
      b.name || '',
      b.phone || b.formatted_phone_number || '',
      b.email || '',
      b.address || b.formatted_address || '',
      b.website || '',
      b.rating || 0,
      b.rating_count || b.user_ratings_total || b.reviews || 0,
      b.types ? b.types.join('; ') : b.category || '',
      b.primary_contact_name || '',
      b.primary_contact_title || '',
      b.primary_contact_linkedin || '',
      b.city || '',
      b.state || '',
      b.source || 'Google Places'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLeadSaved = (business) => {
    return savedLeadIds.has(business.name);
  };

  const getFilteredResults = () => {
    const allResults = searchMode === 'single' ? searchResults : bulkResults;
    let filtered = [...allResults];

    if (filterCategory !== 'all') {
      if (filterCategory === 'with_email') {
        filtered = filtered.filter(r => r.email);
      } else if (filterCategory === 'with_phone') {
        filtered = filtered.filter(r => r.phone || r.formatted_phone_number);
      } else if (filterCategory === 'with_contact') {
        filtered = filtered.filter(r => r.contacts && r.contacts.length > 0);
      } else if (filterCategory === 'high_rating') {
        filtered = filtered.filter(r => r.rating >= 4.0);
      } else if (filterCategory === 'unsaved') {
        filtered = filtered.filter(r => !isLeadSaved(r));
      }
    }

    if (sortBy === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'reviews') {
      filtered.sort((a, b) => (b.user_ratings_total || b.reviews || 0) - (a.user_ratings_total || a.reviews || 0));
    }

    return filtered;
  };

  const filteredResults = getFilteredResults();

  const categories = [
    { value: 'all', label: 'All Results' },
    { value: 'with_email', label: 'Has Email' },
    { value: 'with_phone', label: 'Has Phone' },
    { value: 'with_contact', label: 'Has Key Contact' },
    { value: 'high_rating', label: 'High Rating (4+)' },
    { value: 'unsaved', label: 'Not Saved Yet' },
  ];

  return (
    <AuthGuard>
      <div className="crm-layout">
        <Navigation />
        <div className="crm-main">
          <div className="crm-content">
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
            Lead Finder
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: 0 }}>
            Search for businesses using Google Places API, enrich with contact info, and save to your pipeline.
          </p>
        </div>

        {/* Search Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => setSearchMode('single')}
            className={searchMode === 'single' ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ fontSize: '14px' }}
          >
            Single Search
          </button>
          <button
            onClick={() => setSearchMode('bulk')}
            className={searchMode === 'bulk' ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ fontSize: '14px' }}
          >
            Bulk Search
          </button>
        </div>

        {/* Single Search */}
        {searchMode === 'single' && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-body">
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Single Search
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Search for businesses by type and location (e.g., "dental offices in Minneapolis MN")
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSingleSearch()}
              className="input"
              placeholder="e.g., restaurants in Chicago IL"
              style={{ flex: 1 }}
            />
            <button
              onClick={handleSingleSearch}
              disabled={searching}
              className="btn btn-primary"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
            </div>
          </div>
        )}

        {/* Bulk Search */}
        {searchMode === 'bulk' && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-body">
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Bulk Search
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Enter multiple searches (one per line). Results will be combined and enriched.
          </p>
          <textarea
            value={bulkQueries}
            onChange={(e) => setBulkQueries(e.target.value)}
            className="input"
            placeholder={"dental offices in Minneapolis MN\ncleaning services in St Paul MN\nrestaurants in Bloomington MN"}
            rows={6}
            style={{ width: '100%', marginBottom: '12px', resize: 'vertical' }}
          />
          <button
            onClick={handleBulkSearch}
            disabled={bulkSearching}
            className="btn btn-primary"
          >
            {bulkSearching ? `Searching... ${bulkResults.length} found so far` : 'Search All'}
          </button>
            </div>
          </div>
        )}

        {/* Results */}
        {filteredResults.length > 0 && (
          <>
            {/* Filter & Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Filter:</span>
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setFilterCategory(cat.value)}
                    className={filterCategory === cat.value ? 'btn btn-primary' : 'btn btn-outline'}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input"
                  style={{ width: 'auto', fontSize: '13px', padding: '4px 8px' }}
                >
                  <option value="name">Sort by Name</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="reviews">Sort by Reviews</option>
                </select>
                <button
                  onClick={() => handleSaveAll(filteredResults)}
                  className="btn btn-success"
                  style={{ fontSize: '13px' }}
                >
                  Save All to Pipeline
                </button>
                <button
                  onClick={() => exportToCSV(filteredResults)}
                  className="btn btn-outline"
                  style={{ fontSize: '13px' }}
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Showing {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
              {searchMode === 'bulk' && bulkResults.length > 0 && ` (${bulkResults.length} total found)`}
            </div>

            {/* Results Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
              {filteredResults.map((business, index) => (
                <div
                  key={`${business.place_id || business.id || 'unknown'}-${index}`}
                  className="card"
                  style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease', cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div className="card-body">
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0', flex: 1 }}>
                        {business.name}
                      </h3>
                      {business.isSetupMessage ? (
                        <span className="badge badge-blue" style={{ fontSize: '11px' }}>Setup Required</span>
                      ) : isLeadSaved(business) ? (
                        <span className="badge badge-success" style={{ fontSize: '11px' }}>Saved</span>
                      ) : null}
                    </div>

                    {/* Setup message */}
                    {business.isSetupMessage && (
                      <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '8px' }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                          {business.message}
                        </p>
                      </div>
                    )}

                    {/* Rating */}
                    {!business.isSetupMessage && business.rating > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ color: '#fbbf24', fontSize: '14px' }}>★</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {business.rating}
                        </span>
                        {business.user_ratings_total > 0 && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            ({business.user_ratings_total} reviews)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Contact Info */}
                    {!business.isSetupMessage && (
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {business.address || business.formatted_address ? (
                          <p style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>📍</span>
                            {business.address || business.formatted_address}
                          </p>
                        ) : null}
                        {(business.phone || business.formatted_phone_number) && (
                          <p style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>📞</span>
                            {business.phone || business.formatted_phone_number}
                          </p>
                        )}
                        {business.email && (
                          <p style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>✉️</span>
                            {business.email}
                            {business.email_confidence > 0 && (
                              <span style={{ fontSize: '11px', color: business.email_confidence > 70 ? 'var(--success)' : 'var(--warning)' }}>
                                ({business.email_confidence}% confidence)
                              </span>
                            )}
                          </p>
                        )}
                        {business.website && (
                          <p style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>🌐</span>
                            <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                               target="_blank" rel="noopener noreferrer"
                               style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                              {business.website}
                            </a>
                          </p>
                        )}
                        {/* Key Contact */}
                        {business.primary_contact_name && (
                          <div style={{ marginTop: '8px', padding: '8px 10px', background: 'var(--bg-tertiary)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                            <p style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                              👤 {business.primary_contact_name}
                            </p>
                            {business.primary_contact_title && (
                              <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {business.primary_contact_title}
                              </p>
                            )}
                            {business.primary_contact_phone && (
                              <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                                📞 {business.primary_contact_phone}
                              </p>
                            )}
                            {business.primary_contact_linkedin && (
                              <p style={{ margin: 0, fontSize: '11px' }}>
                                <a href={business.primary_contact_linkedin} target="_blank" rel="noopener noreferrer"
                                   style={{ color: 'var(--info)', textDecoration: 'none' }}>
                                  LinkedIn Profile
                                </a>
                              </p>
                            )}
                          </div>
                        )}
                        {/* Hours summary */}
                        {business.opening_hours && business.opening_hours.isOpen !== undefined && (
                          <p style={{ margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                            <span style={{ color: business.opening_hours.isOpen ? 'var(--success)' : 'var(--error)', fontWeight: '600' }}>
                              {business.opening_hours.isOpen ? '● Open Now' : '● Closed'}
                            </span>
                          </p>
                        )}
                        {business.types && business.types.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {business.types.slice(0, 3).map((type, i) => (
                              <span key={i} className="badge badge-blue" style={{ fontSize: '10px' }}>
                                {type.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {!business.isSetupMessage && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedBusiness(business);
                            setShowDetails(true);
                          }}
                          className="btn btn-outline"
                          style={{ fontSize: '12px', padding: '6px 12px', flex: 1 }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleSaveLead(business)}
                          disabled={isLeadSaved(business) || savingLead === (business.place_id || business.id)}
                          className={isLeadSaved(business) ? 'btn btn-success' : 'btn btn-primary'}
                          style={{ fontSize: '12px', padding: '6px 12px', flex: 1 }}
                        >
                          {savingLead === (business.place_id || business.id) ? 'Saving...' : isLeadSaved(business) ? 'Saved ✓' : 'Save to Pipeline'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty States */}
        {!searching && !bulkSearching && filteredResults.length === 0 && (searchQuery || bulkQueries) && (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="card-body">
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: 0 }}>
                No results found. Try a different search query.
              </p>
            </div>
          </div>
        )}

        {!searching && !bulkSearching && filteredResults.length === 0 && !searchQuery && !bulkQueries && (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="card-body">
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Start Searching for Leads
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                Use the search above to find businesses. Try queries like "dental offices in Minneapolis MN" or "cleaning services in Chicago IL".
              </p>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedBusiness && (
          <div
            onClick={() => setShowDetails(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '20px'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}
            >
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {selectedBusiness.name}
                  </h2>
                  <button onClick={() => setShowDetails(false)} className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    ✕
                  </button>
                </div>

                {selectedBusiness.rating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ color: '#fbbf24', fontSize: '18px' }}>★</span>
                    <span style={{ fontSize: '18px', fontWeight: '600' }}>{selectedBusiness.rating}</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                      ({selectedBusiness.user_ratings_total || 0} reviews)
                    </span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Address</label>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                      {selectedBusiness.address || selectedBusiness.formatted_address || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone</label>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                      {selectedBusiness.phone || selectedBusiness.formatted_phone_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email</label>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                      {selectedBusiness.email || 'N/A'}
                      {selectedBusiness.email_confidence > 0 && ` (${selectedBusiness.email_confidence}% confidence)`}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Website</label>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                      {selectedBusiness.website ? (
                        <a href={selectedBusiness.website.startsWith('http') ? selectedBusiness.website : `https://${selectedBusiness.website}`}
                           target="_blank" rel="noopener noreferrer"
                           style={{ color: 'var(--primary)' }}>
                          {selectedBusiness.website}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedBusiness.types && selectedBusiness.types.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Categories</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {selectedBusiness.types.map((type, i) => (
                        <span key={i} className="badge badge-blue" style={{ fontSize: '11px' }}>
                          {type.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key People / Contacts */}
                {selectedBusiness.contacts && selectedBusiness.contacts.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
                      👥 Key People to Contact
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedBusiness.contacts.map((contact, i) => (
                        <div key={i} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', borderLeft: '3px solid var(--primary)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                                {contact.name || 'Unknown'}
                              </p>
                              {contact.position && (
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                                  {contact.position}{contact.department ? ` • ${contact.department}` : ''}{contact.seniority ? ` • ${contact.seniority}` : ''}
                                </p>
                              )}
                              {contact.email && (
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 2px 0' }}>
                                  ✉️ {contact.email}
                                  {contact.confidence > 0 && <span style={{ fontSize: '10px', marginLeft: '4px', color: contact.confidence > 70 ? 'var(--success)' : 'var(--warning)' }}>({contact.confidence}%)</span>}
                                </p>
                              )}
                              {contact.phone_number && (
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 2px 0' }}>📞 {contact.phone_number}</p>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {contact.linkedin && (
                                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer"
                                   style={{ fontSize: '11px', color: 'var(--info)', textDecoration: 'none' }}>LinkedIn</a>
                              )}
                              {contact.twitter && (
                                <a href={contact.twitter} target="_blank" rel="noopener noreferrer"
                                   style={{ fontSize: '11px', color: 'var(--info)', textDecoration: 'none' }}>Twitter</a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Hours */}
                {selectedBusiness.opening_hours && selectedBusiness.opening_hours.weekdayText && selectedBusiness.opening_hours.weekdayText.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                      🕐 Business Hours {selectedBusiness.opening_hours.isOpen !== undefined && (
                        <span style={{ fontSize: '12px', color: selectedBusiness.opening_hours.isOpen ? 'var(--success)' : 'var(--error)' }}>
                          ({selectedBusiness.opening_hours.isOpen ? 'Open Now' : 'Closed'})
                        </span>
                      )}
                    </label>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {selectedBusiness.opening_hours.weekdayText.map((day, i) => (
                        <p key={i} style={{ margin: '2px 0' }}>{day}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Reviews */}
                {selectedBusiness.reviews && selectedBusiness.reviews.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                      ⭐ Recent Reviews
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedBusiness.reviews.map((review, i) => (
                        <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{review.author}</span>
                            <span style={{ fontSize: '12px', color: '#fbbf24' }}>
                              {'★'.repeat(review.rating)}<span style={{ color: 'var(--text-muted)' }}>{'★'.repeat(5 - review.rating)}</span>
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 2px 0' }}>
                            {review.text.length > 200 ? review.text.substring(0, 200) + '...' : review.text}
                          </p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{review.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Maps Link */}
                {selectedBusiness.google_url && (
                  <div style={{ marginBottom: '20px' }}>
                    <a href={selectedBusiness.google_url} target="_blank" rel="noopener noreferrer"
                       style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}>
                      📍 View on Google Maps
                    </a>
                  </div>
                )}

                {/* Save with status */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                    Save to Pipeline as:
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {['new', 'contacted', 'meeting_booked', 'walkthrough', 'interested', 'won', 'lost'].map(status => (
                      <button
                        key={status}
                        onClick={() => setLeadStatus(status)}
                        className={leadStatus === status ? 'btn btn-primary' : 'btn btn-outline'}
                        style={{ fontSize: '12px', padding: '4px 10px', textTransform: 'capitalize' }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      handleSaveLead(selectedBusiness);
                      setShowDetails(false);
                    }}
                    disabled={isLeadSaved(selectedBusiness)}
                    className={isLeadSaved(selectedBusiness) ? 'btn btn-success' : 'btn btn-primary'}
                    style={{ width: '100%' }}
                  >
                    {isLeadSaved(selectedBusiness) ? 'Already Saved ✓' : 'Save to Pipeline'}
                  </button>
                </div>
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
