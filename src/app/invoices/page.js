'use client';

import { useState, useEffect } from 'react';
import { getInvoices, addInvoice, updateInvoice, deleteInvoice } from '@/services/supabaseService';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    clientEmail: '',
    invoiceNumber: '',
    issueDate: '',
    dueDate: '',
    status: 'Pending',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: ''
  });
  const [itemForm, setItemForm] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  });

  useEffect(() => {
    // Load invoices from Supabase on component mount
    const loadInvoices = async () => {
      try {
        const invoiceData = await getInvoices();
        setInvoices(invoiceData);
      } catch (error) {
        console.error('Error loading invoices:', error);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadInvoices();
  }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const newInvoice = {
        invoice_number: `INV-2024-${String(Array.isArray(invoices) ? invoices.length + 1 : 1).padStart(3, '0')}`,
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        issue_date: formData.issueDate,
        due_date: formData.dueDate,
        status: formData.status,
        items: formData.items || [],
        subtotal: parseFloat(formData.subtotal) || 0,
        tax: parseFloat(formData.tax) || 0,
        total: parseFloat(formData.total) || 0,
        notes: formData.notes
      };
      
      const savedInvoice = await addInvoice(newInvoice);
      
      // Update local state with the saved invoice (includes Supabase ID)
      setInvoices([...invoices, savedInvoice]);
      
      setFormData({
        clientId: '',
        clientName: '',
        clientEmail: '',
        invoiceNumber: '',
        issueDate: '',
        dueDate: '',
        status: 'Draft',
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        notes: ''
      });
      setShowCreateModal(false);
      
      console.log('Invoice saved to Supabase:', savedInvoice);
    } catch (error) {
      console.error('Error adding invoice:', error);
      alert(`Failed to add invoice: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  const handleAddItem = () => {
    if (!itemForm.description || itemForm.unitPrice <= 0) return;
    
    const newItem = {
      ...itemForm,
      total: itemForm.quantity * itemForm.unitPrice
    };
    
    const updatedItems = [...formData.items, newItem];
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    
    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      tax,
      total
    });
    
    setItemForm({
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    
    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      tax,
      total
    });
  };

  const handleSendInvoice = (invoice) => {
    // In a real app, this would send the invoice via email
    alert(`Invoice ${invoice.invoiceNumber} sent to ${invoice.clientEmail}`);
    
    // Update status to Sent
    setInvoices(Array.isArray(invoices) ? invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'Sent' } : inv
    ) : []);
  };

  const handleMarkPaid = (invoice) => {
    setInvoices(Array.isArray(invoices) ? invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'Paid' } : inv
    ) : []);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'status-lead',
      'Sent': 'status-contacted',
      'Pending': 'status-prospect',
      'Paid': 'status-client',
      'Overdue': 'status-lost'
    };
    return colors[status] || 'status-lead';
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
                <p className="text-secondary">Loading invoices...</p>
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
              <h1 className="page-title">Invoice Management</h1>
              <p className="page-subtitle">Create and manage client invoices</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Total Invoices</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0' }}>
                        {Array.isArray(invoices) ? invoices.length : 0}
                      </p>
                    </div>
                    <div style={{ fontSize: '32px', color: 'var(--primary)' }}>3</div>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Pending Payment</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0' }}>
                        {Array.isArray(invoices) ? invoices.filter(i => i.status === 'Pending').length : 0}
                      </p>
                    </div>
                    <div style={{ fontSize: '32px', color: 'var(--warning)' }}>!</div>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Total Revenue</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0' }}>
                        ${Array.isArray(invoices) ? invoices.reduce((sum, i) => sum + (i.total || 0), 0).toFixed(2) : '0.00'}
                      </p>
                    </div>
                    <div style={{ fontSize: '32px', color: 'var(--success)' }}>$</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Invoice Button */}
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary btn-lg"
              >
                + Create New Invoice
              </button>
            </div>

            {/* Invoices List */}
            <div className="card">
              <div className="card-header">
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Invoices ({Array.isArray(invoices) ? invoices.length : 0})
                </h2>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {Array.isArray(invoices) ? invoices.map((invoice) => (
                    <div key={invoice.id} style={{ 
                      padding: '20px 24px', 
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
                            {invoice.invoiceNumber}
                          </h3>
                          <span className={`status ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                          <span className="badge badge-blue">
                            ${invoice.total.toFixed(2)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          <span>Client: {invoice.clientName}</span>
                          <span>Issued: {invoice.issueDate}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          <span>Client: {invoice.clientName}</span>
                          <span>Issued: {invoice.issueDate}</span>
                          <span>Due: {invoice.dueDate}</span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                          {invoice.clientEmail}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowViewModal(true);
                          }}
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          View
                        </button>
                        {invoice.status === 'Draft' ? (
                          <button
                            onClick={() => handleSendInvoice(invoice)}
                            className="btn btn-success"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            Send
                          </button>
                        ) : null}
                        {invoice.status === 'Pending' && (
                          <button
                            onClick={() => handleMarkPaid(invoice)}
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </div>
                  )) : null}
                </div>
              </div>
            </div>

            {/* Create Invoice Modal */}
            {showCreateModal && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxHeight: '90vh', overflow: 'auto' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '24px' }}>
                    Create New Invoice
                  </h2>
                  <form onSubmit={handleCreateInvoice}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Client Name
                          </label>
                          <input
                            type="text"
                            value={formData.clientName}
                            onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                            className="input"
                            placeholder="Client name"
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Client Email
                          </label>
                          <input
                            type="email"
                            value={formData.clientEmail}
                            onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                            className="input"
                            placeholder="Client email"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3" style={{ gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Issue Date
                          </label>
                          <input
                            type="date"
                            value={formData.issueDate}
                            onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                            className="input"
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                            className="input"
                            required
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
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Invoice Items */}
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                          Invoice Items
                        </label>
                        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px' }}>
                          <div className="grid grid-cols-4" style={{ gap: '12px', marginBottom: '12px' }}>
                            <input
                              type="text"
                              value={itemForm.description}
                              onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                              className="input"
                              placeholder="Description"
                            />
                            <input
                              type="number"
                              value={itemForm.quantity}
                              onChange={(e) => setItemForm({...itemForm, quantity: parseInt(e.target.value) || 1})}
                              className="input"
                              placeholder="Qty"
                              min="1"
                            />
                            <input
                              type="number"
                              value={itemForm.unitPrice}
                              onChange={(e) => setItemForm({...itemForm, unitPrice: parseFloat(e.target.value) || 0})}
                              className="input"
                              placeholder="Price"
                              step="0.01"
                              min="0"
                            />
                            <button
                              type="button"
                              onClick={handleAddItem}
                              className="btn btn-primary"
                            >
                              Add Item
                            </button>
                          </div>
                          
                          {/* Items List */}
                          {formData.items.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {formData.items.map((item, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'white', borderRadius: '4px' }}>
                                  <span style={{ fontSize: '14px' }}>{item.description}</span>
                                  <span style={{ fontSize: '14px' }}>Qty: {item.quantity}</span>
                                  <span style={{ fontSize: '14px' }}>${item.unitPrice.toFixed(2)}</span>
                                  <span style={{ fontSize: '14px', fontWeight: '600' }}>${item.total.toFixed(2)}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="btn btn-outline"
                                    style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--error)', borderColor: 'var(--error)' }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Totals */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                        <div>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Subtotal: ${formData.subtotal.toFixed(2)}</p>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Tax (8%): ${formData.tax.toFixed(2)}</p>
                          <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>Total: ${formData.total.toFixed(2)}</p>
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
                          placeholder="Invoice notes"
                        />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        Create Invoice
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* View Invoice Modal */}
            {showViewModal && selectedInvoice && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ 
                  maxWidth: '650px', 
                  width: '95%', 
                  maxHeight: '90vh', 
                  overflowY: 'auto',
                  padding: '32px',
                  borderRadius: '16px'
                }}>
                  {/* Invoice Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '32px',
                    paddingBottom: '20px',
                    borderBottom: '2px solid var(--border)'
                  }}>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0' }}>
                        {selectedInvoice.invoiceNumber}
                      </h2>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        FluxOne Cleaning Services
                      </p>
                    </div>
                    <span className={`status ${getStatusColor(selectedInvoice.status)}`} style={{ 
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Client and Date Information */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '32px',
                      padding: '20px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '12px'
                    }}>
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                          Bill To:
                        </p>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                          {selectedInvoice.clientName}
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0' }}>
                          {selectedInvoice.clientEmail}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                          Invoice Details:
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                          <strong>Issue:</strong> {selectedInvoice.issueDate}
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0' }}>
                          <strong>Due:</strong> {selectedInvoice.dueDate}
                        </p>
                      </div>
                    </div>
                    
                    {/* Invoice Items */}
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Items & Services
                      </h3>
                      <div style={{ 
                        background: 'white', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        {/* Header Row */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                          gap: '16px', 
                          padding: '16px 20px',
                          background: 'var(--bg-secondary)',
                          borderBottom: '1px solid var(--border)',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          <span>Description</span>
                          <span style={{ textAlign: 'center' }}>Qty</span>
                          <span style={{ textAlign: 'right' }}>Price</span>
                          <span style={{ textAlign: 'right' }}>Total</span>
                        </div>
                        {/* Item Rows */}
                        {selectedInvoice.items.map((item, index) => (
                          <div key={index} style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                            gap: '16px', 
                            padding: '16px 20px', 
                            borderBottom: index < selectedInvoice.items.length - 1 ? '1px solid var(--border)' : 'none',
                            alignItems: 'center',
                            fontSize: '14px'
                          }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{item.description}</span>
                            <span style={{ color: 'var(--text-primary)', textAlign: 'center' }}>{item.quantity}</span>
                            <span style={{ color: 'var(--text-primary)', textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: '600', textAlign: 'right' }}>${item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Invoice Totals */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end',
                      padding: '20px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '12px'
                    }}>
                      <div style={{ textAlign: 'right', minWidth: '250px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Subtotal:</span>
                          <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>${selectedInvoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Tax (8%):</span>
                          <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>${selectedInvoice.tax.toFixed(2)}</span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          paddingTop: '16px', 
                          borderTop: '2px solid var(--primary)' 
                        }}>
                          <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Total:</span>
                          <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>${selectedInvoice.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    {selectedInvoice.notes && (
                      <div style={{ 
                        padding: '20px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        borderLeft: '4px solid var(--primary)'
                      }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Notes
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0', lineHeight: '1.6' }}>
                          {selectedInvoice.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    {selectedInvoice.status === 'Draft' && (
                      <button
                        onClick={() => handleSendInvoice(selectedInvoice)}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        Send Invoice
                      </button>
                    )}
                    {selectedInvoice.status === 'Pending' && (
                      <button
                        onClick={() => handleMarkPaid(selectedInvoice)}
                        className="btn btn-success"
                        style={{ flex: 1 }}
                      >
                        Mark as Paid
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setSelectedInvoice(null);
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
