'use client';

import { useState, useEffect } from 'react';
import { getLeads, addLead, updateLead, deleteLead, searchBusinesses, getBusinessesByCategory, getEmailTemplates } from '@/services/dataService';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    status: 'Lead'
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchBusinesses(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching businesses:', error);
    }
  };

  const handleCategorySearch = async (category) => {
    try {
      const results = await getBusinessesByCategory(category);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching by category:', error);
    }
  };

  const handleAddLead = async (businessData) => {
    try {
      const newLead = await addLead(businessData);
      setLeads([...leads, newLead]);
      setShowAddModal(false);
      setFormData({
        businessName: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        status: 'Lead'
      });
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  const handleUpdateLead = async (id, updates) => {
    try {
      const updatedLead = await updateLead(id, updates);
      setLeads(leads.map(lead => lead.id === id ? updatedLead : lead));
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleDeleteLead = async (id) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(id);
        setLeads(leads.filter(lead => lead.id !== id));
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const handleAddAndEmail = (businessData) => {
    handleAddLead(businessData);
    setSelectedLead(businessData);
    setShowEmailModal(true);
  };

  const statusColors = {
    'Lead': 'bg-gray-100 text-gray-800',
    'Contacted': 'bg-blue-100 text-blue-800',
    'Prospect': 'bg-yellow-100 text-yellow-800',
    'Client': 'bg-green-100 text-green-800',
    'Lost': 'bg-red-100 text-red-800'
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="md:ml-64 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-2">Manage and convert your leads</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Businesses</h2>
          
          {/* Normal Search */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search businesses by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input flex-1"
            />
            <button
              onClick={handleSearch}
              className="btn-primary"
            >
              Search
            </button>
          </div>

          {/* Smart Search Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategorySearch('offices')}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Offices
            </button>
            <button
              onClick={() => handleCategorySearch('dentists')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Dentists
            </button>
            <button
              onClick={() => handleCategorySearch('gyms')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Gyms
            </button>
            <button
              onClick={() => handleCategorySearch('low')}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Low Rated
            </button>
            <button
              onClick={() => handleCategorySearch('new')}
              className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
            >
              New Businesses
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Search Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((business, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">{business.businessName}</h4>
                    <p className="text-sm text-gray-600 mt-1">{business.address}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600 ml-1">{business.rating}</span>
                      <span className="text-sm text-gray-500 ml-2">• {business.phone}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAddLead({
                          businessName: business.businessName,
                          phone: business.phone,
                          address: business.address,
                          contactName: '',
                          email: '',
                          notes: `Found via search - Category: ${business.category}`
                        })}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Add to Leads
                      </button>
                      <button
                        onClick={() => handleAddAndEmail({
                          businessName: business.businessName,
                          phone: business.phone,
                          address: business.address,
                          contactName: '',
                          email: '',
                          notes: `Found via search - Category: ${business.category}`
                        })}
                        className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Add + Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Lead Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add New Lead
          </button>
        </div>

        {/* Leads List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Leads</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No leads yet. Start by searching for businesses above.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <div key={lead.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900">{lead.businessName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{lead.contactName}</p>
                      <p className="text-sm text-gray-600">{lead.phone}</p>
                      <p className="text-sm text-gray-600">{lead.email}</p>
                      <p className="text-sm text-gray-600">{lead.address}</p>
                      {lead.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">{lead.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateLead(lead.id, { status: e.target.value })}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="Lead">Lead</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Prospect">Prospect</option>
                        <option value="Client">Client</option>
                        <option value="Lost">Lost</option>
                      </select>
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowEmailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Email
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Lead Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Lead</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddLead(formData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Business Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Contact Name</label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="form-input"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="btn-primary">
                    Add Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary"
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
          <EmailModal
            lead={selectedLead}
            onClose={() => setShowEmailModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// Email Modal Component
function EmailModal({ lead, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [emailContent, setEmailContent] = useState({
    to: lead.email,
    subject: '',
    body: ''
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getEmailTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      let subject = template.subject;
      let body = template.body;
      
      // Replace variables
      subject = subject.replace(/{{business_name}}/g, lead.businessName);
      subject = subject.replace(/{{city}}/g, lead.address.split(',').pop()?.trim() || '');
      subject = subject.replace(/{{contact_name}}/g, lead.contactName || 'Contact Person');
      
      body = body.replace(/{{business_name}}/g, lead.businessName);
      body = body.replace(/{{city}}/g, lead.address.split(',').pop()?.trim() || '');
      body = body.replace(/{{contact_name}}/g, lead.contactName || 'Contact Person');
      
      setEmailContent({
        to: lead.email,
        subject,
        body
      });
      setSelectedTemplate(templateId);
    }
  };

  const handleSendEmail = () => {
    const mailtoLink = `mailto:${emailContent.to}?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;
    window.open(mailtoLink);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Send Email</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="form-label">Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="form-input"
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="form-label">To</label>
            <input
              type="email"
              value={emailContent.to}
              onChange={(e) => setEmailContent({...emailContent, to: e.target.value})}
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">Subject</label>
            <input
              type="text"
              value={emailContent.subject}
              onChange={(e) => setEmailContent({...emailContent, subject: e.target.value})}
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">Message</label>
            <textarea
              value={emailContent.body}
              onChange={(e) => setEmailContent({...emailContent, body: e.target.value})}
              className="form-input"
              rows={8}
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSendEmail}
            className="btn-primary"
          >
            Send Email
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
