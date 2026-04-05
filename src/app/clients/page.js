'use client';

import { useState, useEffect } from 'react';
import { getClients, addClient, updateClient } from '@/services/dataService';
import Navigation from '@/components/Navigation';

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
    assignedEmployees: [],
    notes: '',
    pricing: {
      pricePerClean: 200,
      employeePay: 120,
      frequency: 2
    }
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      const newClient = await addClient(clientData);
      setClients([...clients, newClient]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleUpdateClient = async (id, updates) => {
    try {
      const updatedClient = await updateClient(id, updates);
      setClients(clients.map(client => client.id === id ? updatedClient : client));
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      businessName: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      assignedEmployees: [],
      notes: '',
      pricing: {
        pricePerClean: 200,
        employeePay: 120,
        frequency: 2
      }
    });
  };

  const calculateMonthlyProfit = (client) => {
    const profitPerClean = client.pricing.pricePerClean - client.pricing.employeePay;
    return profitPerClean * client.pricing.frequency;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="md:ml-64 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-2">Manage your client relationships and pricing</p>
        </div>

        {/* Add Client Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add New Client
          </button>
        </div>

        {/* Clients List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Clients</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No clients yet. Convert leads to clients to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {clients.map((client) => (
                <div key={client.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{client.businessName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{client.contactName}</p>
                      <p className="text-sm text-gray-600">{client.phone}</p>
                      <p className="text-sm text-gray-600">{client.email}</p>
                      <p className="text-sm text-gray-600">{client.address}</p>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Price per Clean</p>
                          <p className="font-semibold">${client.pricing.pricePerClean}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Employee Pay</p>
                          <p className="font-semibold">${client.pricing.employeePay}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Frequency</p>
                          <p className="font-semibold">{client.pricing.frequency}/month</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">Monthly Profit</p>
                        <p className="font-semibold text-green-600">${calculateMonthlyProfit(client)}</p>
                      </div>
                      
                      {client.assignedEmployees && client.assignedEmployees.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500">Assigned Employees</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {client.assignedEmployees.map((employee, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {employee}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {client.notes && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500">Notes</p>
                          <p className="text-sm text-gray-600 italic">{client.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setFormData({
                            businessName: client.businessName,
                            contactName: client.contactName,
                            phone: client.phone,
                            email: client.email,
                            address: client.address,
                            assignedEmployees: client.assignedEmployees || [],
                            notes: client.notes || '',
                            pricing: client.pricing
                          });
                          setShowAddModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          const newInvoice = {
                            id: Date.now().toString(),
                            clientName: client.businessName,
                            amount: client.pricing.pricePerClean * client.pricing.frequency,
                            date: new Date().toISOString().split('T')[0],
                            status: 'Pending'
                          };
                          alert(`Invoice created for $${newInvoice.amount}`);
                        }}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Add Invoice
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Client Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content max-w-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (selectedClient) {
                  handleUpdateClient(selectedClient.id, formData);
                } else {
                  handleAddClient(formData);
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="form-label">Contact Name *</label>
                    <input
                      type="text"
                      required
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
                  <div className="md:col-span-2">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Price per Clean *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.pricing.pricePerClean}
                      onChange={(e) => setFormData({
                        ...formData, 
                        pricing: {...formData.pricing, pricePerClean: parseFloat(e.target.value)}
                      })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Employee Pay *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.pricing.employeePay}
                      onChange={(e) => setFormData({
                        ...formData, 
                        pricing: {...formData.pricing, employeePay: parseFloat(e.target.value)}
                      })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Frequency (per month) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.pricing.frequency}
                      onChange={(e) => setFormData({
                        ...formData, 
                        pricing: {...formData.pricing, frequency: parseInt(e.target.value)}
                      })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Assigned Employees (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.assignedEmployees.join(', ')}
                      onChange={(e) => setFormData({
                        ...formData, 
                        assignedEmployees: e.target.value.split(',').map(emp => emp.trim()).filter(emp => emp)
                      })}
                      className="form-input"
                      placeholder="John Doe, Jane Smith"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="form-input"
                      rows={3}
                    />
                  </div>
                </div>
                
                {formData.businessName && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Preview:</p>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Profit per clean:</span>
                        <span className="ml-2 font-medium">
                          ${formData.pricing.pricePerClean - formData.pricing.employeePay}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Monthly profit:</span>
                        <span className="ml-2 font-medium text-green-600">
                          ${(formData.pricing.pricePerClean - formData.pricing.employeePay) * formData.pricing.frequency}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Yearly profit:</span>
                        <span className="ml-2 font-medium text-green-600">
                          ${(formData.pricing.pricePerClean - formData.pricing.employeePay) * formData.pricing.frequency * 12}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="btn-primary">
                    {selectedClient ? 'Update Client' : 'Add Client'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedClient(null);
                      resetForm();
                    }}
                    className="btn-secondary"
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
  );
}
