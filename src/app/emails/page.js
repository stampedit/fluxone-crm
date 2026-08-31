'use client';

import { useState, useEffect } from 'react';
import { getLeads, getEmailTemplates, sendEmail, scheduleEmail, getEmailHistory } from '@/services/dataService';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';

export default function EmailsPage() {
  const [leads, setLeads] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [campaignName, setCampaignName] = useState('');
  const [scheduleSend, setScheduleSend] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [activeTab, setActiveTab] = useState('compose');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateSubject, setNewTemplateSubject] = useState('');
  const [newTemplateBody, setNewTemplateBody] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [emailStats, setEmailStats] = useState({
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsData, templatesData, emailHistoryData] = await Promise.all([getLeads(), getEmailTemplates(), getEmailHistory()]);
      setLeads(leadsData);
      setTemplates(templatesData);
      setEmailHistory(emailHistoryData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const handleLeadToggle = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    setSelectedLeads(leads.map(lead => lead.id));
  };

  const handleSendEmail = async () => {
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead to email');
      return;
    }

    setSending(true);
    try {
      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Send emails to each selected lead
      for (const lead of selectedLeads) {
        const emailData = {
          to: lead.email,
          subject,
          body,
          template: selectedTemplate,
          campaign: campaignName || 'Manual Send',
          recipientName: lead.contactName,
          businessName: lead.businessName,
          sender: currentUser.name || 'User',
          senderRole: currentUser.role || 'admin'
        };

        if (scheduleSend && scheduleDate && scheduleTime) {
          const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
          await scheduleEmail({ ...emailData, scheduledFor });
        } else {
          await sendEmail(emailData);
        }
      }

      // Refresh email history
      const updatedHistory = await getEmailHistory();
      setEmailHistory(updatedHistory);

      // Update email stats
      setEmailStats(prev => ({
        sent: prev.sent + selectedLeads.length,
        opened: prev.opened,
        clicked: prev.clicked
      }));
      
      alert(`${scheduleSend ? 'Email scheduled' : 'Email sent'} to ${selectedLeads.length} lead(s)`);
      setSelectedLeads([]);
      setSubject('');
      setBody('');
      setSelectedTemplate('');
      setCampaignName('');
      setScheduleSend(false);
      setScheduleDate('');
      setScheduleTime('');
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Error sending emails');
    } finally {
      setSending(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName || !newTemplateSubject || !newTemplateBody) {
      alert('Please fill in all template fields');
      return;
    }

    const newTemplate = {
      id: Date.now(),
      name: newTemplateName,
      subject: newTemplateSubject,
      body: newTemplateBody
    };

    setTemplates(prev => [...prev, newTemplate]);
    setNewTemplateName('');
    setNewTemplateSubject('');
    setNewTemplateBody('');
    setShowTemplateEditor(false);
    alert('Template created successfully!');
  };

  const handleDeleteTemplate = (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      if (selectedTemplate === templateId) {
        setSelectedTemplate('');
        setSubject('');
        setBody('');
      }
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const segments = [
    { id: 'all', label: 'All Leads', count: leads.length },
    { id: 'new', label: 'New Leads', count: leads.filter(l => l.status === 'Lead').length },
    { id: 'contacted', label: 'Contacted', count: leads.filter(l => l.status === 'Contacted').length },
    { id: 'prospect', label: 'Prospects', count: leads.filter(l => l.status === 'Prospect').length },
    { id: 'client', label: 'Clients', count: leads.filter(l => l.status === 'Client').length }
  ];

  if (loading) {
    return (
      <AuthGuard>
        <div className="crm-layout">
          <Navigation />
          <div className="crm-main">
            <div className="crm-content">
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div className="loading" style={{ margin: '0 auto 24px' }}></div>
                <p className="text-secondary">Loading...</p>
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
              <h1 className="page-title">Email Marketing</h1>
              <p className="page-subtitle">Send targeted emails to your leads and clients</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: '32px' }}>
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Total Sent</h3>
                    <div style={{ 
                      background: 'var(--accent)', 
                      color: 'white', 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      padding: '4px 8px', 
                      borderRadius: '4px' 
                    }}>
                      {emailStats.sent.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>Last 30 days</div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Open Rate</h3>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>
                      {emailStats.opened > 0 ? ((emailStats.opened / emailStats.sent) * 100).toFixed(1) : '0'}%
                    </div>
                  </div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>Industry avg: 24.5%</div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Click Rate</h3>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)' }}>
                      {emailStats.clicked > 0 ? ((emailStats.clicked / emailStats.sent) * 100).toFixed(1) : '0'}%
                    </div>
                  </div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>Industry avg: 18.2%</div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Conversions</h3>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning)' }}>
                      {emailStats.converted > 0 ? ((emailStats.converted / emailStats.sent) * 100).toFixed(1) : '0'}%
                    </div>
                  </div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>Industry avg: 5.4%</div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="card">
              {/* Tab Navigation */}
              <div style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', padding: '0 24px' }}>
                  {[
                    { id: 'compose', label: 'Compose' },
                    { id: 'templates', label: 'Templates' },
                    { id: 'history', label: 'Email History' },
                    { id: 'campaigns', label: 'Campaigns' },
                    { id: 'analytics', label: 'Analytics' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="nav-link"
                      style={{ 
                        padding: '16px 16px', 
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
              <div style={{ padding: '24px' }}>
                {activeTab === 'compose' && (
                  <div className="grid grid-cols-3" style={{ gap: '24px' }}>
                    {/* Lead Segmentation */}
                    <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="card-body">
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                          Lead Segments
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {segments.map(segment => (
                            <button
                              key={segment.id}
                              onClick={() => setSelectedSegment(segment.id)}
                              className="btn"
                              style={{ 
                                justifyContent: 'space-between',
                                background: selectedSegment === segment.id ? 'var(--accent)' : 'var(--bg-primary)',
                                color: selectedSegment === segment.id ? 'white' : 'var(--text-primary)',
                                border: selectedSegment === segment.id ? '1px solid var(--accent)' : '1px solid var(--border)'
                              }}
                            >
                              <span>{segment.label}</span>
                              <span className="badge badge-gray">{segment.count}</span>
                            </button>
                          ))}
                        </div>
                        
                        <div style={{ marginTop: '24px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                            Select Recipients ({selectedLeads.length} selected)
                          </h4>
                          <div style={{ marginBottom: '12px' }}>
                            <input
                              type="text"
                              placeholder="Search leads..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="input"
                            />
                          </div>
                          <button
                            onClick={handleSelectAll}
                            className="btn btn-primary"
                            style={{ width: '100%', marginBottom: '12px' }}
                          >
                            Select All Leads
                          </button>
                          <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {filteredLeads.map(lead => (
                              <div key={lead.id} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '12px', 
                                background: 'var(--bg-primary)', 
                                border: '1px solid var(--border)', 
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}>
                                <input
                                  type="checkbox"
                                  checked={selectedLeads.includes(lead.id)}
                                  onChange={() => handleLeadToggle(lead.id)}
                                  style={{ marginRight: '12px' }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' }}>
                                    {lead.businessName}
                                  </div>
                                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                    {lead.email}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {lead.status}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email Composition */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Campaign Settings */}
                        <div className="card">
                          <div className="card-body">
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                              Campaign Settings
                            </h3>
                            <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                  Campaign Name
                                </label>
                                <input
                                  type="text"
                                  value={campaignName}
                                  onChange={(e) => setCampaignName(e.target.value)}
                                  className="input"
                                  placeholder="e.g., Spring Cleaning Special"
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                  Schedule Send
                                </label>
                                <select
                                  value={scheduleSend ? 'scheduled' : 'immediate'}
                                  onChange={(e) => setScheduleSend(e.target.value === 'scheduled')}
                                  className="select"
                                >
                                  <option value="immediate">Send Immediately</option>
                                  <option value="scheduled">Schedule for Later</option>
                                </select>
                              </div>
                            </div>
                            
                            {scheduleSend && (
                              <div className="grid grid-cols-2" style={{ gap: '16px', marginTop: '16px' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                    Schedule Date
                                  </label>
                                  <input
                                    type="date"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    className="input"
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                    Schedule Time
                                  </label>
                                  <input
                                    type="time"
                                    value={scheduleTime}
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    className="input"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Email Content */}
                        <div className="card">
                          <div className="card-body">
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                              Email Content
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                  Email Template
                                </label>
                                <select
                                  value={selectedTemplate}
                                  onChange={(e) => handleTemplateChange(e.target.value)}
                                  className="select"
                                >
                                  <option value="">Choose Template</option>
                                  {templates.map(template => (
                                    <option key={template.id} value={template.id}>
                                      {template.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                  Subject Line
                                </label>
                                <input
                                  type="text"
                                  value={subject}
                                  onChange={(e) => setSubject(e.target.value)}
                                  className="input"
                                  placeholder="Enter compelling subject..."
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                  Message Body
                                </label>
                                <textarea
                                  value={body}
                                  onChange={(e) => setBody(e.target.value)}
                                  rows={8}
                                  className="textarea"
                                  placeholder="Write your message here..."
                                />
                                <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  {body.length}/500 characters
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <button
                            onClick={handleSendEmail}
                            disabled={sending}
                            className="btn btn-primary btn-lg"
                            style={{ flex: 1 }}
                          >
                            {sending ? (
                              <span style={{ display: 'flex', alignItems: 'center' }}>
                                <div className="loading" style={{ marginRight: '8px' }}></div>
                                Sending...
                              </span>
                            ) : (
                              scheduleSend ? 'Schedule Email' : 'Send Email'
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTemplate('');
                              setSubject('');
                              setBody('');
                              setCampaignName('');
                              setScheduleSend(false);
                              setScheduleDate('');
                              setScheduleTime('');
                            }}
                            className="btn btn-secondary"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'templates' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        Email Templates
                      </h3>
                      <button
                        onClick={() => setShowTemplateEditor(true)}
                        className="btn btn-primary"
                      >
                        Create New Template
                      </button>
                    </div>

                    {showTemplateEditor && (
                      <div className="card" style={{ background: 'var(--bg-secondary)', marginBottom: '24px' }}>
                        <div className="card-body">
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            Create New Template
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Template Name
                              </label>
                              <input
                                type="text"
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.target.value)}
                                className="input"
                                placeholder="e.g., Welcome Email"
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Subject Line
                              </label>
                              <input
                                type="text"
                                value={newTemplateSubject}
                                onChange={(e) => setNewTemplateSubject(e.target.value)}
                                className="input"
                                placeholder="Email subject line"
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Message Body
                              </label>
                              <textarea
                                value={newTemplateBody}
                                onChange={(e) => setNewTemplateBody(e.target.value)}
                                rows={6}
                                className="textarea"
                                placeholder="Email message content"
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                              <button
                                onClick={handleCreateTemplate}
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                              >
                                Save Template
                              </button>
                              <button
                                onClick={() => {
                                  setShowTemplateEditor(false);
                                  setNewTemplateName('');
                                  setNewTemplateSubject('');
                                  setNewTemplateBody('');
                                }}
                                className="btn btn-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3" style={{ gap: '24px' }}>
                      {templates.map(template => (
                        <div key={template.id} className="card">
                          <div className="card-body">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <div>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                  {template.name}
                                </h4>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  Created: {new Date(template.id).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="btn btn-ghost"
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                              >
                                Delete
                              </button>
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                              <strong>Subject:</strong> {template.subject}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                              <strong>Message:</strong> {template.body.substring(0, 100)}...
                            </div>
                            <button
                              onClick={() => handleTemplateChange(template.id)}
                              className="btn btn-primary"
                              style={{ width: '100%' }}
                            >
                              Use This Template
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Email History & Tracking
                      </h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0' }}>
                        Track all sent emails, opens, and client engagement
                      </p>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>
                            {emailHistory.filter(e => e.status === 'sent').length}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sent</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>
                            {emailHistory.filter(e => e.openedAt).length}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Opened</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning)' }}>
                            {emailHistory.filter(e => e.clicked).length}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Clicked</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--info)' }}>
                            {emailHistory.filter(e => e.status === 'scheduled').length}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Scheduled</div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-body" style={{ padding: '0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {emailHistory.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                              <div style={{ fontSize: '48px', marginBottom: '16px' }}>**</div>
                              <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                                No Email History
                              </h4>
                              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0' }}>
                                Start sending emails to see tracking data here
                              </p>
                            </div>
                          ) : (
                            emailHistory.map((email) => (
                              <div key={email.id} style={{ 
                                padding: '20px 24px', 
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
                                      {email.subject}
                                    </h4>
                                    <span className={`status ${
                                      email.status === 'sent' ? 'status-client' : 
                                      email.status === 'scheduled' ? 'status-prospect' : 
                                      'status-lost'
                                    }`}>
                                      {email.status}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                      To: <strong>{email.to}</strong>
                                    </span>
                                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                      From: {email.sender}
                                    </span>
                                    {email.template && (
                                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
                                        {email.template}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                    <span>Sent: {email.sentAt ? new Date(email.sentAt).toLocaleString() : 'Not sent'}</span>
                                    {email.openedAt && (
                                      <span>Opened: {new Date(email.openedAt).toLocaleString()}</span>
                                    )}
                                    {email.clicked && (
                                      <span style={{ color: 'var(--success)' }}>Clicked</span>
                                    )}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                  {email.openedAt && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success)' }}>
                                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                                      Opened
                                    </div>
                                  )}
                                  {email.clicked && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--warning)' }}>
                                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></div>
                                      Clicked
                                    </div>
                                  )}
                                  <button
                                    onClick={() => {
                                      // Resend functionality
                                      alert('Resend functionality coming soon!');
                                    }}
                                    className="btn btn-ghost"
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                  >
                                    Resend
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'campaigns' && (
                  <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                      Campaign Analytics
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                      Advanced campaign tracking and analytics coming soon!
                    </p>
                    <div className="grid grid-cols-3" style={{ gap: '24px' }}>
                      <div className="card">
                        <div className="card-body" style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '32px', marginBottom: '16px' }}>📈</div>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                            Revenue Tracking
                          </h4>
                          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            Track ROI per campaign
                          </p>
                        </div>
                      </div>
                      <div className="card">
                        <div className="card-body" style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎯</div>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                            A/B Testing
                          </h4>
                          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            Test subject lines and content
                          </p>
                        </div>
                      </div>
                      <div className="card">
                        <div className="card-body" style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                            Advanced Analytics
                          </h4>
                          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            Detailed conversion metrics
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '24px' }}>
                      Email Analytics
                    </h3>
                    <div className="grid grid-cols-2" style={{ gap: '24px' }}>
                      <div className="card">
                        <div className="card-body">
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            Performance Metrics
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                              <span className="text-secondary">Total Sent</span>
                              <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--accent)' }}>{emailStats.sent}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                              <span className="text-secondary">Open Rate</span>
                              <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--success)' }}>{((emailStats.opened / emailStats.sent) * 100).toFixed(1)}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                              <span className="text-secondary">Click Rate</span>
                              <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--accent)' }}>{((emailStats.clicked / emailStats.sent) * 100).toFixed(1)}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                              <span className="text-secondary">Conversion Rate</span>
                              <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--warning)' }}>{((emailStats.converted / emailStats.sent) * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card">
                        <div className="card-body">
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            Top Performing Templates
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#dbeafe', borderRadius: '6px' }}>
                              <span className="text-secondary">Welcome Email</span>
                              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af' }}>89% open rate</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#d1fae5', borderRadius: '6px' }}>
                              <span className="text-secondary">Special Offer</span>
                              <span style={{ fontSize: '16px', fontWeight: '600', color: '#065f46' }}>67% conversion</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#fef3c7', borderRadius: '6px' }}>
                              <span className="text-secondary">Follow-up</span>
                              <span style={{ fontSize: '16px', fontWeight: '600', color: '#92400e' }}>45% conversion</span>
                            </div>
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
      </div>
    </AuthGuard>
  );
}
