'use client';

import { useState, useEffect } from 'react';
import { getClients, addClient, updateClient, deleteClient, deleteAllClients } from '@/services/supabaseService';
import { sendEmail, getEmailTemplates } from '@/services/dataService';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    businessName: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    monthlyRevenue: '',
    serviceType: 'Regular Cleaning',
    frequency: 'Weekly',
    notes: ''
  });
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    monthlyRevenue: '',
    serviceType: 'Regular Cleaning',
    frequency: 'Weekly',
    notes: ''
  });
  const [templates, setTemplates] = useState([]);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const [clientsResult, templatesData] = await Promise.all([getClients(), getEmailTemplates()]);
      const clientsData = clientsResult?.success !== undefined ? (clientsResult.data || []) : (Array.isArray(clientsResult) ? clientsResult : []);
      setClients(clientsData);
      setTemplates(templatesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const result = await addClient({
        ...formData,
        monthlyRevenue: parseFloat(formData.monthlyRevenue) || 0
      });
      if (result && result.success === false) {
        alert('Error adding client: ' + (result.error?.message || 'Unknown error'));
        return;
      }
      setFormData({
        businessName: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        monthlyRevenue: '',
        serviceType: 'Regular Cleaning',
        frequency: 'Weekly',
        notes: ''
      });
      setShowAddModal(false);
      fetchClients();
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client: ' + error.message);
    }
  };

  const handleUpdateClient = async (id, updates) => {
    try {
      await updateClient(id, updates);
      fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

  const handleDeleteClient = async (clientId) => {
    if (!isMobile() && !confirm('Are you sure you want to delete this client?')) return;
    try {
      await deleteClient(clientId);
      await fetchClients();
      if (!isMobile()) alert('Client deleted successfully!');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client. Please try again.');
    }
  };

  const handleDeleteAllClients = async () => {
    if (!confirm('Are you sure you want to delete ALL clients? This cannot be undone.')) return;
    try {
      await deleteAllClients();
      setClients([]);
    } catch (error) {
      console.error('Error deleting all clients:', error);
      alert('Error deleting all clients: ' + error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!messageSubject.trim() || !messageBody.trim()) {
      alert('Please fill in both subject and message');
      return;
    }

    setSendingMessage(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const emailData = {
        to: selectedClient.email,
        subject: messageSubject,
        body: messageBody,
        template: selectedTemplate,
        campaign: 'Direct Client Message',
        recipientName: selectedClient.contactName,
        businessName: selectedClient.businessName,
        sender: currentUser.name || 'User',
        senderRole: currentUser.role || 'admin'
      };

      await sendEmail(emailData);
      
      alert(`Message sent to ${selectedClient.contactName} at ${selectedClient.email}`);
      setMessageSubject('');
      setMessageBody('');
      setSelectedTemplate('');
      setShowMessageForm(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setMessageSubject(template.subject);
      setMessageBody(template.body);
    }
  };

  const handleViewClientDetails = (client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const handleEditClick = (client) => {
    setEditFormData({
      businessName: client.businessName || client.business_name || '',
      contactName: client.contactName || client.contact_name || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      monthlyRevenue: client.monthlyRevenue ?? client.pricing ?? '',
      serviceType: client.serviceType || client.service_type || 'Regular Cleaning',
      frequency: client.frequency || 'Weekly',
      notes: client.notes || ''
    });
    setSelectedClient(client);
    setShowClientDetails(false);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateClient(selectedClient.id, {
        business_name: editFormData.businessName,
        contact_name: editFormData.contactName,
        phone: editFormData.phone,
        email: editFormData.email,
        address: editFormData.address,
        pricing: parseFloat(editFormData.monthlyRevenue) || 0,
        service_type: editFormData.serviceType,
        frequency: editFormData.frequency,
        notes: editFormData.notes,
      });
      setShowEditModal(false);
      fetchClients();
      alert('Client updated successfully!');
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Error updating client: ' + error.message);
    }
  };

  const statusColors = {
    'Client': 'status-client',
    'Active': 'status-client',
    'Inactive': 'status-lead',
    'Pending': 'status-prospect'
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
                <p className="text-secondary">Loading clients...</p>
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
              <h1 className="page-title">Client Management</h1>
              <p className="page-subtitle">Manage your active cleaning service clients</p>
            </div>

            {/* Add Client Button */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary btn-lg"
              >
                + Add New Client
              </button>
              <button
                onClick={handleDeleteAllClients}
                className="btn btn-outline btn-lg"
                style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
              >
                Delete All Clients
              </button>
            </div>

            {/* Clients List */}
            <div className="card">
              <div className="card-header">
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Active Clients ({clients.length})
                </h2>
              </div>
              {loading ? (
                <div className="card-body">
                  <div style={{ textAlign: 'center', padding: '32px' }}>
                    <div className="loading" style={{ margin: '0 auto 16px' }}></div>
                    <p className="text-secondary">Loading clients...</p>
                  </div>
                </div>
              ) : clients.length === 0 ? (
                <div className="card-body">
                  <div style={{ textAlign: 'center', padding: '32px' }}>
                    <p className="text-secondary">No clients yet. Convert leads to clients to get started.</p>
                  </div>
                </div>
              ) : (
                <div className="card-body" style={{ padding: '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {Array.isArray(clients) && clients.map((client) => (
                      <div 
                        key={client.id} 
                        style={{ 
                          padding: '20px 24px', 
                          borderBottom: '1px solid var(--border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease-in-out'
                        }}
                        onClick={() => handleViewClientDetails(client)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
                              {client.businessName}
                            </h3>
                            <span className={`status ${statusColors[client.status] || 'status-client'}`}>
                              {client.status || 'Client'}
                            </span>
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                            {client.contactName}
                          </p>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                            {client.phone}
                          </p>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                            {client.email}
                          </p>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            <span>${client.monthlyRevenue?.toLocaleString() || 0}/month</span>
                            <span>{client.serviceType || 'Regular Cleaning'}</span>
                            <span>{client.frequency || 'Weekly'}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewClientDetails(client);
                            }}
                            className="btn btn-outline"
                          >
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClient(client.id);
                            }}
                            className="btn btn-outline"
                            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Client Details Modal */}
            {showClientDetails && selectedClient && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '700px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Client Details
                    </h2>
                    <button
                      onClick={() => setShowClientDetails(false)}
                      className="btn btn-ghost"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Business Information */}
                    <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="card-body">
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                          Business Information
                        </h3>
                        <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                          <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Business Name</p>
                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0', fontWeight: '500' }}>
                              {selectedClient.businessName}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Contact Name</p>
                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0', fontWeight: '500' }}>
                              {selectedClient.contactName}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Phone</p>
                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0', fontWeight: '500' }}>
                              {selectedClient.phone}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Email</p>
                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0', fontWeight: '500' }}>
                              {selectedClient.email}
                            </p>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Address</p>
                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0', fontWeight: '500' }}>
                              {selectedClient.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Service Information */}
                    <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="card-body">
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                          Service Information
                        </h3>
                        <div className="grid grid-cols-3" style={{ gap: '16px' }}>
                          <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Service Type</p>
                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0', fontWeight: '500' }}>
                              {selectedClient.serviceType || 'Regular Cleaning'}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Frequency</p>
                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0', fontWeight: '500' }}>
                              {selectedClient.frequency || 'Weekly'}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Monthly Revenue</p>
                            <p style={{ fontSize: '16px', color: 'var(--success)', margin: '0', fontWeight: '600' }}>
                              ${selectedClient.monthlyRevenue?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contract Information */}
                    <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="card-body">
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                          Contract Information
                        </h3>
                        <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                          <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Contract Start</p>
                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0', fontWeight: '500' }}>
                              {selectedClient.contractStart || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Status</p>
                            <span className={`status ${statusColors[selectedClient.status] || 'status-client'}`}>
                              {selectedClient.status || 'Client'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedClient.notes && (
                      <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                        <div className="card-body">
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            Notes
                          </h3>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0', lineHeight: '1.5' }}>
                            {selectedClient.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Messaging Section */}
                    <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
                            Message Client
                          </h3>
                          <button
                            onClick={() => setShowMessageForm(!showMessageForm)}
                            className="btn btn-primary"
                            style={{ fontSize: '14px', padding: '6px 12px' }}
                          >
                            {showMessageForm ? 'Cancel' : 'Send Message'}
                          </button>
                        </div>

                        {showMessageForm && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Email Template (Optional)
                              </label>
                              <select
                                value={selectedTemplate}
                                onChange={(e) => handleTemplateSelect(e.target.value)}
                                className="select"
                                style={{ width: '100%' }}
                              >
                                <option value="">Choose a template...</option>
                                {templates.map(template => (
                                  <option key={template.id} value={template.id}>
                                    {template.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Subject
                              </label>
                              <input
                                type="text"
                                value={messageSubject}
                                onChange={(e) => setMessageSubject(e.target.value)}
                                className="input"
                                placeholder="Enter message subject"
                                style={{ width: '100%' }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Message
                              </label>
                              <textarea
                                value={messageBody}
                                onChange={(e) => setMessageBody(e.target.value)}
                                className="textarea"
                                placeholder="Type your message here..."
                                rows={4}
                                style={{ width: '100%', resize: 'vertical' }}
                              />
                            </div>

                            <div style={{ 
                              padding: '12px', 
                              background: 'var(--bg-primary)', 
                              borderRadius: '8px',
                              fontSize: '12px',
                              color: 'var(--text-secondary)'
                            }}>
                              <strong>Message will be sent to:</strong> {selectedClient.contactName} at {selectedClient.email}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => {
                                  setShowMessageForm(false);
                                  setMessageSubject('');
                                  setMessageBody('');
                                  setSelectedTemplate('');
                                }}
                                className="btn btn-secondary"
                                disabled={sendingMessage}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSendMessage}
                                className="btn btn-primary"
                                disabled={sendingMessage}
                                style={{ minWidth: '120px' }}
                              >
                                {sendingMessage ? 'Sending...' : 'Send Message'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setShowClientDetails(false)}
                        className="btn btn-secondary"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => handleEditClick(selectedClient)}
                        className="btn btn-primary"
                      >
                        Edit Client
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add Client Modal */}
            {showAddModal && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '520px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '24px' }}>
                    Add New Client
                  </h2>
                  <form onSubmit={handleAddClient}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Monthly Revenue
                          </label>
                          <input
                            type="number"
                            value={formData.monthlyRevenue}
                            onChange={(e) => setFormData({...formData, monthlyRevenue: e.target.value})}
                            className="input"
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Service Type
                          </label>
                          <select
                            value={formData.serviceType}
                            onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                            className="select"
                          >
                            <option value="Regular Cleaning">Regular Cleaning</option>
                            <option value="Deep Cleaning">Deep Cleaning</option>
                            <option value="Office Cleaning">Office Cleaning</option>
                            <option value="School Cleaning">School Cleaning</option>
                            <option value="Restaurant Cleaning">Restaurant Cleaning</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Frequency
                          </label>
                          <select
                            value={formData.frequency}
                            onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                            className="select"
                          >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Bi-weekly">Bi-weekly</option>
                            <option value="Monthly">Monthly</option>
                          </select>
                        </div>
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
                          placeholder="Additional notes about this client"
                        />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        Add Client
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

            {/* Edit Client Modal */}
            {showEditModal && selectedClient && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '520px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '24px' }}>
                    Edit Client
                  </h2>
                  <form onSubmit={handleEditSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                          Business Name
                        </label>
                        <input
                          type="text"
                          value={editFormData.businessName}
                          onChange={(e) => setEditFormData({...editFormData, businessName: e.target.value})}
                          className="input"
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                          Contact Name
                        </label>
                        <input
                          type="text"
                          value={editFormData.contactName}
                          onChange={(e) => setEditFormData({...editFormData, contactName: e.target.value})}
                          className="input"
                          required
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={editFormData.phone}
                            onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                            className="input"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Email
                          </label>
                          <input
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
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
                          value={editFormData.address}
                          onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                          className="input"
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Monthly Revenue ($)
                          </label>
                          <input
                            type="number"
                            value={editFormData.monthlyRevenue}
                            onChange={(e) => setEditFormData({...editFormData, monthlyRevenue: e.target.value})}
                            className="input"
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Service Type
                          </label>
                          <select
                            value={editFormData.serviceType}
                            onChange={(e) => setEditFormData({...editFormData, serviceType: e.target.value})}
                            className="select"
                          >
                            <option value="Regular Cleaning">Regular Cleaning</option>
                            <option value="Deep Cleaning">Deep Cleaning</option>
                            <option value="Office Cleaning">Office Cleaning</option>
                            <option value="School Cleaning">School Cleaning</option>
                            <option value="Restaurant Cleaning">Restaurant Cleaning</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Frequency
                          </label>
                          <select
                            value={editFormData.frequency}
                            onChange={(e) => setEditFormData({...editFormData, frequency: e.target.value})}
                            className="select"
                          >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Bi-weekly">Bi-weekly</option>
                            <option value="Monthly">Monthly</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                          Notes
                        </label>
                        <textarea
                          value={editFormData.notes}
                          onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                          className="textarea"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                        Save Changes
                      </button>
                      <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
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
