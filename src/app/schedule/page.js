'use client';

import { useState, useEffect } from 'react';
import { getLeads, updateLead } from '@/services/supabaseService';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';

export default function SchedulePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleLead, setScheduleLead] = useState(null);
  const [scheduleType, setScheduleType] = useState('meeting');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchLeads();
    const onFocus = () => fetchLeads();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  const fetchLeads = async () => {
    try {
      const result = await getLeads();
      // Handle both wrapped (safeSupabaseCall) and raw array results
      const leadsArray = result?.success !== undefined ? (result.data || []) : (Array.isArray(result) ? result : []);
      // Merge in follow_up_date, schedule_notes, and status from localStorage (not all in Supabase schema)
      const followUpDates = JSON.parse(localStorage.getItem('lead_follow_up_dates') || '{}');
      const scheduleNotesMap = JSON.parse(localStorage.getItem('lead_schedule_notes') || '{}');
      const leadStatusUpdates = JSON.parse(localStorage.getItem('lead_status_updates') || '{}');
      const leadsWithDates = leadsArray.map(l => ({
        ...l,
        status: leadStatusUpdates[l.id] || l.status || 'new',
        follow_up_date: followUpDates[l.id] || l.follow_up_date || null,
        schedule_notes: scheduleNotesMap[l.id] || l.schedule_notes || null,
      }));
      setLeads(leadsWithDates);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const getScheduledLeads = () => {
    return leads.filter(l => {
      const status = (l.status || 'new').toLowerCase();
      return (status === 'meeting_booked' || status === 'walkthrough') && l.follow_up_date;
    });
  };

  const getLeadsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return getScheduledLeads().filter(l => {
      const leadDate = (l.follow_up_date || '').split('T')[0];
      return leadDate === dateStr;
    });
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    while (startDate <= endDate) {
      days.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleScheduleMeeting = (lead, type) => {
    setScheduleLead(lead);
    setScheduleType(type);
    setScheduleDate('');
    setScheduleTime('');
    setScheduleNotes('');
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleDate || !scheduleLead) return;
    const dateTime = scheduleTime ? `${scheduleDate}T${scheduleTime}` : scheduleDate;
    const newStatus = scheduleType === 'meeting' ? 'meeting_booked' : 'walkthrough';
    
    // Save to localStorage first (always works)
    const followUps = JSON.parse(localStorage.getItem('lead_follow_up_dates') || '{}');
    followUps[scheduleLead.id] = dateTime;
    localStorage.setItem('lead_follow_up_dates', JSON.stringify(followUps));
    
    const notesMap = JSON.parse(localStorage.getItem('lead_schedule_notes') || '{}');
    notesMap[scheduleLead.id] = scheduleNotes;
    localStorage.setItem('lead_schedule_notes', JSON.stringify(notesMap));
    
    setLeads(leads.map(l => l.id === scheduleLead.id ? { 
      ...l, 
      status: newStatus, 
      follow_up_date: dateTime,
      schedule_notes: scheduleNotes 
    } : l));
    setShowScheduleModal(false);
    
    // Try to update status in Supabase (non-blocking)
    try {
      await updateLead(scheduleLead.id, { status: newStatus });
    } catch (error) {
      console.error('Error updating lead status in Supabase:', error);
    }
  };

  const handleCancelMeeting = async (leadId) => {
    try {
      await updateLead(leadId, { status: 'contacted' });
      // Remove follow_up_date from localStorage
      const followUps = JSON.parse(localStorage.getItem('lead_follow_up_dates') || '{}');
      delete followUps[leadId];
      localStorage.setItem('lead_follow_up_dates', JSON.stringify(followUps));
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: 'contacted', follow_up_date: null } : l));
      setShowDetails(false);
    } catch (error) {
      console.error('Error cancelling meeting:', error);
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSameMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getEventType = (lead) => {
    const status = (lead.status || 'new').toLowerCase();
    if (status === 'walkthrough') return 'walkthrough';
    if (status === 'meeting_booked') return 'meeting';
    return 'follow-up';
  };

  const getUpcomingMeetings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return getScheduledLeads()
      .filter(l => new Date(l.follow_up_date) >= today)
      .sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date));
  };

  const getTodaysMeetings = () => {
    return getLeadsForDate(new Date());
  };

  const calendarDays = generateCalendarDays();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todaysMeetings = getTodaysMeetings();
  const upcomingMeetings = getUpcomingMeetings();

  if (loading) {
    return (
      <AuthGuard>
        <div className="crm-layout">
          <Navigation />
          <div className="crm-main">
            <div className="crm-content">
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div className="loading" style={{ margin: '0 auto 24px' }}></div>
                <p className="text-secondary">Loading schedule...</p>
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
            <div className="page-header">
              <h1 className="page-title">Schedule</h1>
              <p className="page-subtitle">Meetings and walkthroughs synced with your lead pipeline</p>
            </div>

            {/* Today's Meetings Summary */}
            {todaysMeetings.length > 0 && (
              <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
                <div className="card-body">
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>
                    Today&apos;s Meetings ({todaysMeetings.length})
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {todaysMeetings.map(lead => (
                      <div
                        key={lead.id}
                        onClick={() => { setSelectedLead(lead); setShowDetails(true); }}
                        className={`calendar-event calendar-event-${getEventType(lead)}`}
                        style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <strong>{lead.business_name || lead.businessName || 'Unknown'}</strong>
                        {lead.follow_up_date && lead.follow_up_date.includes('T') && (
                          <span> — {new Date(lead.follow_up_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Calendar View (Desktop) */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{monthYear}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handlePrevMonth} className="btn btn-outline btn-sm">← Prev</button>
                    <button onClick={() => setCurrentDate(new Date())} className="btn btn-outline btn-sm">Today</button>
                    <button onClick={handleNextMonth} className="btn btn-outline btn-sm">Next →</button>
                  </div>
                </div>
                <div className="calendar-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-header-cell">{day}</div>
                  ))}
                  {calendarDays.map((date, i) => {
                    const dayLeads = getLeadsForDate(date);
                    return (
                      <div
                        key={i}
                        className={`calendar-cell ${!isSameMonth(date) ? 'other-month' : ''} ${isToday(date) ? 'today' : ''}`}
                      >
                        <div className="calendar-day-number">{date.getDate()}</div>
                        {dayLeads.map(lead => (
                          <div
                            key={lead.id}
                            onClick={() => { setSelectedLead(lead); setShowDetails(true); }}
                            className={`calendar-event calendar-event-${getEventType(lead)}`}
                          >
                            {lead.follow_up_date && lead.follow_up_date.includes('T') && (
                              <span>{new Date(lead.follow_up_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} </span>
                            )}
                            {lead.business_name || lead.businessName || 'Unknown'}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* List View (Mobile + Upcoming) */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Upcoming Meetings & Walkthroughs</h3>
                {upcomingMeetings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
                    <p style={{ fontSize: '14px', marginBottom: '16px' }}>No upcoming meetings scheduled.</p>
                    <button onClick={() => router.push('/pipeline')} className="btn btn-primary">
                      Go to Pipeline to Schedule
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {upcomingMeetings.map(lead => {
                      const eventType = getEventType(lead);
                      const eventDate = new Date(lead.follow_up_date);
                      return (
                        <div
                          key={lead.id}
                          onClick={() => { setSelectedLead(lead); setShowDetails(true); }}
                          className="card"
                          style={{ cursor: 'pointer', borderLeft: `4px solid ${eventType === 'meeting' ? 'var(--info)' : 'var(--warning)'}` }}
                        >
                          <div className="card-body" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                              <h4 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>
                                {lead.business_name || lead.businessName || 'Unknown'}
                              </h4>
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0' }}>
                                📅 {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                {lead.follow_up_date.includes('T') && (
                                  <span> at {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                )}
                              </p>
                              {lead.phone && <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>📞 {lead.phone}</p>}
                              {lead.address && <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>📍 {lead.address}</p>}
                            </div>
                            <span className={`badge ${eventType === 'meeting' ? 'badge-blue' : 'badge-yellow'}`}>
                              {eventType === 'meeting' ? 'Meeting' : 'Walkthrough'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Lead Detail Modal */}
            {showDetails && selectedLead && (
              <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>
                          {selectedLead.business_name || selectedLead.businessName || 'Unknown'}
                        </h2>
                        <span className={`badge ${getEventType(selectedLead) === 'meeting' ? 'badge-blue' : 'badge-yellow'}`}>
                          {getEventType(selectedLead) === 'meeting' ? 'Meeting' : 'Walkthrough'}
                        </span>
                      </div>
                      <button onClick={() => setShowDetails(false)} className="btn btn-outline btn-sm">✕</button>
                    </div>

                    <div className="lead-detail-section">
                      <p className="lead-detail-label">When</p>
                      <p className="lead-detail-value">
                        {new Date(selectedLead.follow_up_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        {selectedLead.follow_up_date.includes('T') && (
                          <span> at {new Date(selectedLead.follow_up_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        )}
                      </p>
                    </div>

                    <div className="lead-detail-section">
                      <p className="lead-detail-label">Contact</p>
                      <p className="lead-detail-value">📞 {selectedLead.phone || 'N/A'}</p>
                      <p className="lead-detail-value">✉️ {selectedLead.email || 'N/A'}</p>
                      <p className="lead-detail-value">📍 {selectedLead.address || 'N/A'}</p>
                    </div>

                    {selectedLead.schedule_notes && (
                      <div className="lead-detail-section">
                        <p className="lead-detail-label">Meeting Notes</p>
                        <p className="lead-detail-value">{selectedLead.schedule_notes}</p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                      <button
                        onClick={() => router.push(`/messages?lead=${selectedLead.id}`)}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        Send Message
                      </button>
                      <button
                        onClick={() => handleCancelMeeting(selectedLead.id)}
                        className="btn btn-outline"
                        style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                      >
                        Cancel Meeting
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Meeting Modal */}
            {showScheduleModal && scheduleLead && (
              <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                  <div className="card-body">
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Schedule {scheduleType === 'meeting' ? 'Meeting' : 'Walkthrough'}</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      with {scheduleLead.business_name || scheduleLead.businessName || 'Unknown'}
                    </p>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Type</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setScheduleType('meeting')}
                          className={scheduleType === 'meeting' ? 'btn btn-primary' : 'btn btn-outline'}
                          style={{ fontSize: '13px' }}
                        >
                          Meeting
                        </button>
                        <button
                          onClick={() => setScheduleType('walkthrough')}
                          className={scheduleType === 'walkthrough' ? 'btn btn-primary' : 'btn btn-outline'}
                          style={{ fontSize: '13px' }}
                        >
                          Walkthrough
                        </button>
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Date</label>
                      <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="input" />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Time</label>
                      <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="input" />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Notes (optional)</label>
                      <textarea value={scheduleNotes} onChange={(e) => setScheduleNotes(e.target.value)} className="textarea" rows={3} placeholder="What is this meeting about?" />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleSaveSchedule} className="btn btn-primary" style={{ flex: 1 }} disabled={!scheduleDate}>
                        Confirm Schedule
                      </button>
                      <button onClick={() => setShowScheduleModal(false)} className="btn btn-outline">Cancel</button>
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
