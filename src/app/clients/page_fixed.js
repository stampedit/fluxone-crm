'use client';

import { useState, useEffect } from 'react';
import { getClients, addClient, updateClient, deleteClient } from '@/services/supabaseService';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    monthlyRevenue: 0,
    serviceType: 'Regular Cleaning',
    frequency: 'Weekly',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const clientsData = await getClients();
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      await addClient(formData);
      setShowAddModal(false);
      setFormData({
        businessName: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        monthlyRevenue: 0,
        serviceType: 'Regular Cleaning',
        frequency: 'Weekly',
        notes: ''
      });
      fetchClients();
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleDeleteClient = async (id) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const statusColors = {
    'Client': 'status-client',
    'Lead': 'status-lead',
    'Prospect': 'status-prospect',
    'Contacted': 'status-contacted'
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
        <Navigation />
        
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              Clients
            </h1>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              Add Client
            </button>
          </div>

          {loading ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '48px' }}>
                <div className="loading" style={{ margin: '0 auto 16px' }}></div>
                <p className="text-secondary">Loading clients...</p>
              </div>
            </div>
          ) : clients.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '48px' }}>
                <p className="text-secondary">No clients yet. Add your first client to get started.</p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body" style={{ padding: '0' }}>
                {Array.isArray(clients) ? clients.map((client) => (
                  <div 
                    key={client.id} 
                    style={{ 
                      padding: '20px 24px', 
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
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
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-outline"
                        onClick={() => handleDeleteClient(client.id)}
                        style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )) : null}
              </div>
            </div>
          )}

          {/* Add Client Modal */}
          {showAddModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '24px' }}>
                  Add New Client
                </h2>
                <form onSubmit={handleAddClient}>
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
        </div>
      </div>
    </AuthGuard>
  );
}
