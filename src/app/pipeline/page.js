'use client';

import { useState, useEffect } from 'react';
import { getLeads, updateLead, deleteLead, convertLeadToClient } from '@/services/supabaseService';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';

const PIPELINE_STAGES = [
  { id: 'new', label: 'New', color: '#6b7280', bgColor: '#f3f4f6' },
  { id: 'contacted', label: 'Contacted', color: '#3b82f6', bgColor: '#eff6ff' },
  { id: 'meeting_booked', label: 'Meeting Booked', color: '#8b5cf6', bgColor: '#f5f3ff' },
  { id: 'walkthrough', label: 'Walkthrough', color: '#f59e0b', bgColor: '#fffbeb' },
  { id: 'interested', label: 'Interested', color: '#06b6d4', bgColor: '#ecfeff' },
  { id: 'won', label: 'Won', color: '#22c55e', bgColor: '#f0fdf4' },
  { id: 'lost', label: 'Lost', color: '#ef4444', bgColor: '#fef2f2' },
];

export default function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragOverStage, setDragOverStage] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#c9a96e');
  const [leadNotes, setLeadNotes] = useState({});
  const [newNote, setNewNote] = useState('');
  const [leadTags, setLeadTags] = useState({});
  const [newTag, setNewTag] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [activities, setActivities] = useState({});
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingType, setMeetingType] = useState('meeting');
  const [meetingNotes, setMeetingNotes] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchLeads();
    fetchGroups();
    try {
      const storedNotes = localStorage.getItem('lead_notes');
      if (storedNotes) setLeadNotes(JSON.parse(storedNotes));
      const storedTags = localStorage.getItem('lead_tags');
      if (storedTags) setLeadTags(JSON.parse(storedTags));
    } catch {}
  }, []);

  const fetchGroups = () => {
    try {
      const stored = localStorage.getItem('lead_groups');
      const parsed = stored ? JSON.parse(stored) : [];
      setGroups(Array.isArray(parsed) ? parsed : []);
    } catch {
      setGroups([]);
    }
  };

  const saveGroups = (updated) => {
    localStorage.setItem('lead_groups', JSON.stringify(updated));
    setGroups(updated);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const group = { id: Date.now().toString(), name: newGroupName.trim(), color: newGroupColor };
    saveGroups([...groups, group]);
    setNewGroupName('');
    setShowGroupModal(false);
  };

  const handleDeleteGroup = (groupId) => {
    saveGroups(groups.filter(g => g.id !== groupId));
    if (selectedGroup === groupId) setSelectedGroup(null);
  };

  const handleAssignGroup = async (leadId, groupId) => {
    try {
      // Store group assignment in localStorage since leads table doesn't have group_id column
      const groupAssignments = JSON.parse(localStorage.getItem('lead_group_assignments') || '{}');
      groupAssignments[leadId] = groupId;
      localStorage.setItem('lead_group_assignments', JSON.stringify(groupAssignments));
      
      setLeads(leads.map(l => l.id === leadId ? { ...l, group_id: groupId } : l));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, group_id: groupId });
      }
    } catch (error) {
      console.error('Error assigning group:', error);
    }
  };

  const handleAddNote = (leadId) => {
    if (!newNote.trim()) return;
    const note = { id: Date.now().toString(), text: newNote.trim(), createdAt: new Date().toISOString() };
    const updated = { ...leadNotes, [leadId]: [...(leadNotes[leadId] || []), note] };
    setLeadNotes(updated);
    localStorage.setItem('lead_notes', JSON.stringify(updated));
    setNewNote('');
  };

  const handleAddTag = (leadId) => {
    if (!newTag.trim()) return;
    const tag = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    const updated = { ...leadTags, [leadId]: [...(leadTags[leadId] || []), tag] };
    setLeadTags(updated);
    localStorage.setItem('lead_tags', JSON.stringify(updated));
    setNewTag('');
  };

  const handleSetFollowUp = async (leadId, date) => {
    try {
      // Store follow-up date in localStorage since leads table doesn't have follow_up_date column
      const followUps = JSON.parse(localStorage.getItem('lead_follow_up_dates') || '{}');
      followUps[leadId] = date;
      localStorage.setItem('lead_follow_up_dates', JSON.stringify(followUps));
      
      setLeads(leads.map(l => l.id === leadId ? { ...l, follow_up_date: date } : l));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, follow_up_date: date });
      }
    } catch (error) {
      console.error('Error setting follow-up:', error);
    }
  };

  const getFollowUpStatus = (date) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(date);
    due.setHours(0, 0, 0, 0);
    if (due < today) return 'overdue';
    if (due.getTime() === today.getTime()) return 'today';
    return 'upcoming';
  };

  const fetchLeads = async () => {
    try {
      const result = await getLeads();
      const leadsArray = result?.success !== undefined ? (result.data || []) : (Array.isArray(result) ? result : []);
      // Merge in group assignments, follow-up dates, schedule notes, and status from localStorage
      const groupAssignments = JSON.parse(localStorage.getItem('lead_group_assignments') || '{}');
      const followUpDates = JSON.parse(localStorage.getItem('lead_follow_up_dates') || '{}');
      const scheduleNotes = JSON.parse(localStorage.getItem('lead_schedule_notes') || '{}');
      const leadStatusUpdates = JSON.parse(localStorage.getItem('lead_status_updates') || '{}');
      const leadsWithGroups = leadsArray.map(l => ({
        ...l,
        group_id: groupAssignments[l.id] || null,
        status: leadStatusUpdates[l.id] || l.status || 'new',
        follow_up_date: followUpDates[l.id] || l.follow_up_date || null,
        schedule_notes: scheduleNotes[l.id] || l.schedule_notes || null
      }));
      setLeads(leadsWithGroups);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e, stageId) => {
    e.preventDefault();
    setDragOverStage(null);
    
    if (!draggedLead) return;
    
    const currentStatus = draggedLead.status?.toLowerCase() || 'new';
    if (currentStatus === stageId) return;

    // Save to localStorage first
    const statusUpdates = JSON.parse(localStorage.getItem('lead_status_updates') || '{}');
    statusUpdates[draggedLead.id] = stageId;
    localStorage.setItem('lead_status_updates', JSON.stringify(statusUpdates));
    
    setLeads(leads.map(l => l.id === draggedLead.id ? { ...l, status: stageId } : l));
    setDraggedLead(null);

    // Try Supabase (non-blocking)
    try {
      await updateLead(draggedLead.id, { status: stageId });
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    // Save to localStorage first
    const statusUpdates = JSON.parse(localStorage.getItem('lead_status_updates') || '{}');
    statusUpdates[leadId] = newStatus;
    localStorage.setItem('lead_status_updates', JSON.stringify(statusUpdates));
    
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

    // Try Supabase (non-blocking)
    try {
      await updateLead(leadId, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

  const handleDeleteLead = async (leadId) => {
    if (!isMobile() && !confirm('Delete this lead permanently?')) return;
    
    // Remove from local state immediately
    setLeads(leads.filter(l => l.id !== leadId));
    setShowDetails(false);
    
    // Clean up localStorage entries
    const groupAssignments = JSON.parse(localStorage.getItem('lead_group_assignments') || '{}');
    delete groupAssignments[leadId];
    localStorage.setItem('lead_group_assignments', JSON.stringify(groupAssignments));
    
    const followUps = JSON.parse(localStorage.getItem('lead_follow_up_dates') || '{}');
    delete followUps[leadId];
    localStorage.setItem('lead_follow_up_dates', JSON.stringify(followUps));
    
    const scheduleNotesMap = JSON.parse(localStorage.getItem('lead_schedule_notes') || '{}');
    delete scheduleNotesMap[leadId];
    localStorage.setItem('lead_schedule_notes', JSON.stringify(scheduleNotesMap));
    
    const statusUpdates = JSON.parse(localStorage.getItem('lead_status_updates') || '{}');
    delete statusUpdates[leadId];
    localStorage.setItem('lead_status_updates', JSON.stringify(statusUpdates));
    
    // Try to delete from Supabase (non-blocking)
    try {
      await deleteLead(leadId);
    } catch (error) {
      console.error('Error deleting lead from Supabase:', error);
    }
  };

  const handleConvertToClient = async (lead) => {
    if (!confirm(`Convert ${lead.business_name || lead.businessName} to a paying client?`)) return;
    try {
      const client = await convertLeadToClient(lead);
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'client' } : l));
      setShowDetails(false);
      alert(`Converted to client: ${client?.business_name || client?.businessName || lead.business_name || lead.businessName}`);
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('Error converting lead: ' + error.message);
    }
  };

  const getLeadsByStage = (stageId) => {
    return leads.filter(l => {
      const status = (l.status || 'new').toLowerCase();
      const matchesStage = stageId === 'new' 
        ? status === 'new' || status === 'lead' || status === 'no email found'
        : status === stageId;
      
      if (!matchesStage) return false;
      
      if (selectedGroup && l.group_id !== selectedGroup) return false;
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          (l.business_name || l.businessName || '').toLowerCase().includes(term) ||
          (l.email || '').toLowerCase().includes(term) ||
          (l.phone || '').toLowerCase().includes(term) ||
          (l.address || '').toLowerCase().includes(term)
        );
      }
      return true;
    });
  };

  const getStageCount = (stageId) => getLeadsByStage(stageId).length;

  const getTotalValue = () => {
    return leads.filter(l => (l.status || 'new').toLowerCase() === 'won').length;
  };

  const getConversionRate = () => {
    if (leads.length === 0) return 0;
    const won = leads.filter(l => (l.status || 'new').toLowerCase() === 'won').length;
    return ((won / leads.length) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="crm-layout">
          <Navigation />
          <div className="crm-main">
            <div className="crm-content">
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Loading pipeline...</p>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              Lead Pipeline
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: 0 }}>
              Drag and drop leads between stages to track progress.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '12px 20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Leads</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{leads.length}</div>
            </div>
            <div className="card" style={{ padding: '12px 20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Won</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{getTotalValue()}</div>
            </div>
            <div className="card" style={{ padding: '12px 20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Conversion</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{getConversionRate()}%</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
            placeholder="Search leads by name, email, phone, or address..."
            style={{ flex: 1, minWidth: '250px', maxWidth: '500px' }}
          />
          
          {/* Group filter chips */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className={`group-chip ${selectedGroup === null ? 'active' : ''}`}
              onClick={() => setSelectedGroup(null)}
            >
              All Leads
            </button>
            {groups.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  className={`group-chip ${selectedGroup === g.id ? 'active' : ''}`}
                  onClick={() => setSelectedGroup(g.id)}
                  style={selectedGroup === g.id ? {} : { borderColor: g.color, color: g.color }}
                >
                  {g.name}
                </button>
                <button
                  onClick={() => handleDeleteGroup(g.id)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', padding: '0 2px' }}
                  title="Delete group"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className="group-chip"
              onClick={() => setShowGroupModal(true)}
              style={{ borderStyle: 'dashed' }}
            >
              + New Group
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', minHeight: '500px' }}>
          {PIPELINE_STAGES.map(stage => {
            const stageLeads = getLeadsByStage(stage.id);
            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
                style={{
                  minWidth: '280px',
                  flex: '1 1 280px',
                  background: dragOverStage === stage.id ? stage.bgColor : 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: dragOverStage === stage.id ? `2px dashed ${stage.color}` : '1px solid var(--border)',
                  padding: '16px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: stage.color
                    }} />
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                      {stage.label}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-tertiary)',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {getStageCount(stage.id)}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stageLeads.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '24px 12px',
                      color: 'var(--text-muted)',
                      fontSize: '13px',
                      border: '1px dashed var(--border)',
                      borderRadius: '8px'
                    }}>
                      Drop leads here
                    </div>
                  )}
                  {stageLeads.map(lead => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead)}
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowDetails(true);
                      }}
                      className="card"
                      style={{
                        cursor: 'grab',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        borderLeft: `3px solid ${stage.color}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      <div className="card-body" style={{ padding: '14px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                          {lead.business_name || lead.businessName || 'Unknown Business'}
                        </h4>
                        {lead.phone && (
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 2px 0' }}>
                            📞 {lead.phone}
                          </p>
                        )}
                        {lead.email && (
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            ✉️ {lead.email}
                          </p>
                        )}
                        {lead.address && (
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            📍 {lead.address}
                          </p>
                        )}
                        {lead.follow_up_date && getFollowUpStatus(lead.follow_up_date) && (
                          <div className={`follow-up-badge ${getFollowUpStatus(lead.follow_up_date) === 'overdue' ? 'overdue' : getFollowUpStatus(lead.follow_up_date) === 'today' ? 'overdue' : 'upcoming'}`} style={{ marginTop: '6px' }}>
                            ⏰ {new Date(lead.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                        {leadTags[lead.id] && leadTags[lead.id].length > 0 && (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {leadTags[lead.id].map(tag => (
                              <span key={tag} className="tag">{tag}</span>
                            ))}
                          </div>
                        )}
                        <select
                          value={(lead.status || 'new').toLowerCase()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(lead.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="input"
                          style={{ marginTop: '8px', fontSize: '11px', padding: '2px 6px', width: '100%' }}
                        >
                          {PIPELINE_STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {leads.length === 0 && !loading && (
          <div className="card" style={{ textAlign: 'center', padding: '40px', marginTop: '24px' }}>
            <div className="card-body">
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                No Leads in Pipeline Yet
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Use the Lead Finder to search for businesses and add them to your pipeline.
              </p>
              <button
                onClick={() => router.push('/lead-finder')}
                className="btn btn-primary"
              >
                Go to Lead Finder
              </button>
            </div>
          </div>
        )}

        {showGroupModal && (
          <div className="modal-overlay" onClick={() => setShowGroupModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div className="card-body">
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Create Lead Group</h2>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Group Name</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="input"
                    placeholder="e.g. Dental Offices, Apartment Complexes..."
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                    autoFocus
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Color</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['#c9a96e', '#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#f59e0b', '#06b6d4'].map(c => (
                      <button
                        key={c}
                        onClick={() => setNewGroupColor(c)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: c, border: newGroupColor === c ? '3px solid var(--text-primary)' : '2px solid transparent',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCreateGroup} className="btn btn-primary" style={{ flex: 1 }}>Create Group</button>
                  <button onClick={() => setShowGroupModal(false)} className="btn btn-outline">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDetails && selectedLead && (
          <div className="modal-overlay" onClick={() => setShowDetails(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                      {selectedLead.business_name || selectedLead.businessName || 'Unknown'}
                    </h2>
                    {selectedLead.category && (
                      <span className="group-badge">{selectedLead.category}</span>
                    )}
                  </div>
                  <button onClick={() => setShowDetails(false)} className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    ✕
                  </button>
                </div>

                {/* Pipeline Status */}
                <div className="lead-detail-section">
                  <p className="lead-detail-label">Pipeline Status</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {PIPELINE_STAGES.map(stage => (
                      <button
                        key={stage.id}
                        onClick={() => {
                          handleStatusChange(selectedLead.id, stage.id);
                          setSelectedLead({ ...selectedLead, status: stage.id });
                        }}
                        className={(selectedLead.status || 'new').toLowerCase() === stage.id ? 'btn btn-primary' : 'btn btn-outline'}
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                      >
                        {stage.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Group Assignment */}
                <div className="lead-detail-section">
                  <p className="lead-detail-label">Lead Group</p>
                  <select
                    value={selectedLead.group_id || ''}
                    onChange={(e) => handleAssignGroup(selectedLead.id, e.target.value || null)}
                    className="select"
                    style={{ maxWidth: '300px' }}
                  >
                    <option value="">No Group</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Follow-up Reminder */}
                <div className="lead-detail-section">
                  <p className="lead-detail-label">Follow-up Reminder</p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="date"
                      value={selectedLead.follow_up_date || followUpDate}
                      onChange={(e) => {
                        setFollowUpDate(e.target.value);
                        handleSetFollowUp(selectedLead.id, e.target.value);
                      }}
                      className="input"
                      style={{ maxWidth: '200px' }}
                    />
                    {selectedLead.follow_up_date && getFollowUpStatus(selectedLead.follow_up_date) && (
                      <span className={`follow-up-badge ${getFollowUpStatus(selectedLead.follow_up_date) === 'overdue' || getFollowUpStatus(selectedLead.follow_up_date) === 'today' ? 'overdue' : 'upcoming'}`}>
                        {getFollowUpStatus(selectedLead.follow_up_date) === 'overdue' ? 'Overdue' : getFollowUpStatus(selectedLead.follow_up_date) === 'today' ? 'Due Today' : 'Upcoming'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="lead-detail-section">
                  <p className="lead-detail-label">Contact Information</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <p className="lead-detail-value">📞 {selectedLead.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="lead-detail-value">✉️ {selectedLead.email || 'N/A'}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <p className="lead-detail-value">📍 {selectedLead.address || 'N/A'}</p>
                    </div>
                    {selectedLead.website && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <p className="lead-detail-value">🌐 <a href={selectedLead.website.startsWith('http') ? selectedLead.website : `https://${selectedLead.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{selectedLead.website}</a></p>
                      </div>
                    )}
                    {selectedLead.rating && (
                      <div>
                        <p className="lead-detail-value">⭐ {selectedLead.rating} {selectedLead.rating_count ? `(${selectedLead.rating_count} reviews)` : ''}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="lead-detail-section">
                  <p className="lead-detail-label">Tags</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {(leadTags[selectedLead.id] || []).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    {(leadTags[selectedLead.id] || []).length === 0 && (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tags yet</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="input"
                      placeholder="Add a tag (e.g. hot, follow-up, big-account)..."
                      style={{ fontSize: '13px' }}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag(selectedLead.id)}
                    />
                    <button onClick={() => handleAddTag(selectedLead.id)} className="btn btn-outline btn-sm">Add Tag</button>
                  </div>
                </div>

                {/* Notes */}
                <div className="lead-detail-section">
                  <p className="lead-detail-label">Notes</p>
                  <div style={{ marginBottom: '8px' }}>
                    {(leadNotes[selectedLead.id] || []).map(note => (
                      <div key={note.id} className="note-item">
                        <p className="note-text">{note.text}</p>
                        <p className="note-meta">{new Date(note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ))}
                    {(leadNotes[selectedLead.id] || []).length === 0 && (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No notes yet</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="input"
                      placeholder="Add a note about this lead..."
                      style={{ fontSize: '13px' }}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote(selectedLead.id)}
                    />
                    <button onClick={() => handleAddNote(selectedLead.id)} className="btn btn-outline btn-sm">Add Note</button>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleConvertToClient(selectedLead)}
                    className="btn btn-success"
                    style={{ flex: 1 }}
                  >
                    Convert to Client
                  </button>
                  <button
                    onClick={() => router.push(`/messages?lead=${selectedLead.id}`)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Send Message
                  </button>
                  <button
                    onClick={() => {
                      setMeetingDate('');
                      setMeetingTime('');
                      setMeetingType('meeting');
                      setMeetingNotes('');
                      setShowMeetingModal(true);
                    }}
                    className="btn btn-outline"
                  >
                    Book Meeting
                  </button>
                  <button
                    onClick={() => handleDeleteLead(selectedLead.id)}
                    className="btn btn-outline"
                    style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Book Meeting Modal */}
        {showMeetingModal && selectedLead && (
          <div className="modal-overlay" onClick={() => setShowMeetingModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>Book a Meeting</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0' }}>
                      {selectedLead.business_name || selectedLead.businessName || 'Unknown'}
                    </p>
                  </div>
                  <button onClick={() => setShowMeetingModal(false)} className="btn btn-outline btn-sm">✕</button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Type</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setMeetingType('meeting')}
                      className={meetingType === 'meeting' ? 'btn btn-primary' : 'btn btn-outline'}
                      style={{ fontSize: '13px' }}
                    >
                      Meeting
                    </button>
                    <button
                      onClick={() => setMeetingType('walkthrough')}
                      className={meetingType === 'walkthrough' ? 'btn btn-primary' : 'btn btn-outline'}
                      style={{ fontSize: '13px' }}
                    >
                      Walkthrough
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Date</label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Time</label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Notes (optional)</label>
                  <textarea
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    className="textarea"
                    rows={3}
                    placeholder="What is this meeting about?"
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={async () => {
                      if (!meetingDate) return;
                      const dateTime = meetingTime ? `${meetingDate}T${meetingTime}` : meetingDate;
                      const newStatus = meetingType === 'meeting' ? 'meeting_booked' : 'walkthrough';
                      
                      // Save to localStorage first (always works)
                      const followUps = JSON.parse(localStorage.getItem('lead_follow_up_dates') || '{}');
                      followUps[selectedLead.id] = dateTime;
                      localStorage.setItem('lead_follow_up_dates', JSON.stringify(followUps));
                      
                      const meetingNotesMap = JSON.parse(localStorage.getItem('lead_schedule_notes') || '{}');
                      meetingNotesMap[selectedLead.id] = meetingNotes;
                      localStorage.setItem('lead_schedule_notes', JSON.stringify(meetingNotesMap));
                      
                      const statusUpdates = JSON.parse(localStorage.getItem('lead_status_updates') || '{}');
                      statusUpdates[selectedLead.id] = newStatus;
                      localStorage.setItem('lead_status_updates', JSON.stringify(statusUpdates));
                      
                      // Update local state immediately
                      setLeads(leads.map(l => l.id === selectedLead.id ? {
                        ...l,
                        status: newStatus,
                        follow_up_date: dateTime,
                        schedule_notes: meetingNotes
                      } : l));
                      setSelectedLead({
                        ...selectedLead,
                        status: newStatus,
                        follow_up_date: dateTime,
                        schedule_notes: meetingNotes
                      });
                      setShowMeetingModal(false);
                      
                      // Try to update status in Supabase (non-blocking)
                      try {
                        await updateLead(selectedLead.id, { status: newStatus });
                      } catch (error) {
                        console.error('Error updating lead status in Supabase:', error);
                      }
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={!meetingDate}
                  >
                    Confirm Meeting
                  </button>
                  <button onClick={() => setShowMeetingModal(false)} className="btn btn-outline">
                    Cancel
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
