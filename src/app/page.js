'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/authService';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { getLeads as getSupabaseLeads } from '@/services/supabaseService';

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = getCurrentUser();

  useEffect(() => {
    fetchDashboardData();
    const onFocus = () => fetchDashboardData();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const result = await getSupabaseLeads();
      const leadsArray = result?.success !== undefined ? (result.data || []) : (Array.isArray(result) ? result : []);
      // Merge localStorage status updates, follow-up dates, and schedule notes
      const statusUpdates = JSON.parse(localStorage.getItem('lead_status_updates') || '{}');
      const followUpDates = JSON.parse(localStorage.getItem('lead_follow_up_dates') || '{}');
      const scheduleNotesMap = JSON.parse(localStorage.getItem('lead_schedule_notes') || '{}');
      const mergedLeads = leadsArray.map(l => ({
        ...l,
        status: statusUpdates[l.id] || l.status || 'new',
        follow_up_date: followUpDates[l.id] || l.follow_up_date || null,
        schedule_notes: scheduleNotesMap[l.id] || l.schedule_notes || null,
      }));
      setLeads(mergedLeads);
    } catch (error) {
      console.warn('Dashboard warning:', error.message);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const getStageCount = (stageId) => {
    return leads.filter(l => (l.status || 'new').toLowerCase() === stageId).length;
  };

  const getTodaysMeetings = () => {
    const today = new Date().toISOString().split('T')[0];
    return leads.filter(l => {
      const status = (l.status || 'new').toLowerCase();
      const followDate = (l.follow_up_date || '').split('T')[0];
      return (status === 'meeting_booked' || status === 'walkthrough') && followDate === today;
    });
  };

  const getUpcomingMeetings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return leads
      .filter(l => {
        const status = (l.status || 'new').toLowerCase();
        return (status === 'meeting_booked' || status === 'walkthrough') && l.follow_up_date && new Date(l.follow_up_date) >= today;
      })
      .sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date))
      .slice(0, 5);
  };

  const getFollowUpsDue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return leads.filter(l => {
      if (!l.follow_up_date) return false;
      const due = new Date(l.follow_up_date);
      due.setHours(0, 0, 0, 0);
      const status = (l.status || 'new').toLowerCase();
      return due <= today && status !== 'won' && status !== 'lost';
    });
  };

  const totalLeads = leads.length;
  const meetingsBooked = getStageCount('meeting_booked');
  const walkthroughs = getStageCount('walkthrough');
  const wonLeads = getStageCount('won');
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(0) : 0;
  const todaysMeetings = getTodaysMeetings();
  const upcomingMeetings = getUpcomingMeetings();
  const followUpsDue = getFollowUpsDue();

  // Weekly stats
  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return { weekStart, weekEnd };
  };

  const { weekStart, weekEnd } = getWeekRange();
  const weeklyNewLeads = leads.filter(l => {
    const created = new Date(l.created_at || Date.now());
    return created >= weekStart && created <= weekEnd;
  }).length;
  const weeklyWon = leads.filter(l => {
    const status = (l.status || 'new').toLowerCase();
    if (status !== 'won') return false;
    const created = new Date(l.created_at || Date.now());
    return created >= weekStart && created <= weekEnd;
  }).length;
  const weeklyConversion = weeklyNewLeads > 0 ? ((weeklyWon / weeklyNewLeads) * 100).toFixed(0) : 0;
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const renderStatCard = (label, value, iconBg, icon, onClick) => (
    <div className="stat-card fade-in" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  );

  if (loading) {
    return (
      <AuthGuard>
        <div className="crm-layout">
          <Navigation />
          <div className="crm-main">
            <div className="crm-content">
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div className="loading" style={{ margin: '0 auto 24px' }}></div>
                <p className="text-secondary">Loading dashboard...</p>
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
              <h1 className="page-title">CRM Dashboard</h1>
              <p className="page-subtitle">Track leads, monitor your pipeline, and grow your revenue</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {renderStatCard('Total Leads', totalLeads, 'rgba(201, 169, 110, 0.12)',
                <span style={{ fontSize: '24px' }}>📊</span>, () => router.push('/pipeline')
              )}
              {renderStatCard('Meetings Booked', meetingsBooked, 'rgba(59, 130, 246, 0.12)',
                <span style={{ fontSize: '24px' }}>🤝</span>, () => router.push('/schedule')
              )}
              {renderStatCard('Walkthroughs', walkthroughs, 'rgba(245, 158, 11, 0.12)',
                <span style={{ fontSize: '24px' }}>🚶</span>, () => router.push('/schedule')
              )}
              {renderStatCard('Conversion Rate', `${conversionRate}%`, 'rgba(34, 197, 94, 0.12)',
                <span style={{ fontSize: '24px' }}>🎯</span>, () => router.push('/pipeline')
              )}
            </div>

            {/* Weekly Stats */}
            <div className="card fade-in" style={{ marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
              <div className="card-header">
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  This Week&apos;s Progress
                </h2>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{weekLabel}</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                  <div style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
                    <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)', margin: '0 0 4px 0' }}>{weeklyNewLeads}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>New Leads This Week</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
                    <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--success)', margin: '0 0 4px 0' }}>{weeklyWon}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>Won This Week</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
                    <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--info)', margin: '0 0 4px 0' }}>{meetingsBooked + walkthroughs}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>Meetings & Walkthroughs</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
                    <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--warning)', margin: '0 0 4px 0' }}>{weeklyConversion}%</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>Weekly Conversion Rate</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card fade-in" style={{ marginBottom: '24px', borderLeft: todaysMeetings.length > 0 ? '4px solid var(--primary)' : 'none' }}>
              <div className="card-header">
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Today&apos;s Meetings {todaysMeetings.length > 0 && `(${todaysMeetings.length})`}
                </h2>
                <button onClick={() => router.push('/schedule')} className="btn btn-outline btn-sm">View Schedule</button>
              </div>
              <div className="card-body">
                {todaysMeetings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>📅</div>
                    <p style={{ fontSize: '14px' }}>No meetings scheduled for today.</p>
                    <button onClick={() => router.push('/pipeline')} className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                      Go to Pipeline to Schedule
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {todaysMeetings.map(lead => {
                      const isWalkthrough = (lead.status || '').toLowerCase() === 'walkthrough';
                      return (
                        <div
                          key={lead.id}
                          onClick={() => router.push('/schedule')}
                          className={`calendar-event calendar-event-${isWalkthrough ? 'walkthrough' : 'meeting'}`}
                          style={{ padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', flex: '1 1 250px' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ fontSize: '14px' }}>{lead.business_name || lead.businessName || 'Unknown'}</strong>
                              {lead.follow_up_date && lead.follow_up_date.includes('T') && (
                                <p style={{ fontSize: '12px', margin: '4px 0 0 0', opacity: 0.8 }}>
                                  {new Date(lead.follow_up_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </p>
                              )}
                              {lead.phone && <p style={{ fontSize: '11px', margin: '2px 0 0 0', opacity: 0.7 }}>📞 {lead.phone}</p>}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
                              {isWalkthrough ? 'Walkthrough' : 'Meeting'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
              {/* Pipeline Overview */}
              <div className="card fade-in">
                <div className="card-header">
                  <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Pipeline Overview
                  </h2>
                  <button onClick={() => router.push('/pipeline')} className="btn btn-outline btn-sm">View Full Pipeline</button>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'New', count: getStageCount('new'), color: 'var(--bg-tertiary)', textColor: 'var(--text-secondary)' },
                      { label: 'Contacted', count: getStageCount('contacted'), color: 'var(--info-light)', textColor: '#1e40af' },
                      { label: 'Meeting', count: meetingsBooked, color: '#f5f3ff', textColor: '#6b21a8' },
                      { label: 'Walkthrough', count: walkthroughs, color: 'var(--warning-light)', textColor: '#92400e' },
                      { label: 'Interested', count: getStageCount('interested'), color: '#ecfeff', textColor: '#155e75' },
                      { label: 'Won', count: wonLeads, color: 'var(--success-light)', textColor: '#065f46' },
                      { label: 'Lost', count: getStageCount('lost'), color: 'var(--error-light)', textColor: '#991b1b' },
                    ].map(stage => (
                      <div key={stage.label} style={{
                        flex: '1 1 100px',
                        padding: '14px',
                        borderRadius: '10px',
                        background: stage.color,
                        textAlign: 'center'
                      }}>
                        <p style={{ fontSize: '22px', fontWeight: '800', color: stage.textColor, margin: '0 0 4px 0' }}>
                          {stage.count}
                        </p>
                        <p style={{ fontSize: '11px', color: stage.textColor, margin: 0, fontWeight: '600' }}>{stage.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card fade-in">
                <div className="card-header">
                  <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Quick Actions
                  </h2>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => router.push('/lead-finder')} className="btn btn-primary">
                    🔍 Find New Leads
                  </button>
                  <button onClick={() => router.push('/pipeline')} className="btn btn-outline">
                    📋 View Pipeline
                  </button>
                  <button onClick={() => router.push('/schedule')} className="btn btn-outline">
                    📅 View Schedule
                  </button>
                  <button onClick={() => router.push('/messages')} className="btn btn-outline">
                    ✉️ Message Leads
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Meetings & Follow-ups */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Upcoming Meetings */}
              <div className="card fade-in">
                <div className="card-header">
                  <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Upcoming Meetings
                  </h2>
                </div>
                <div className="card-body">
                  {upcomingMeetings.length === 0 ? (
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                      No upcoming meetings. Schedule one from the pipeline.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {upcomingMeetings.map(lead => {
                        const isWalkthrough = (lead.status || '').toLowerCase() === 'walkthrough';
                        const eventDate = new Date(lead.follow_up_date);
                        return (
                          <div
                            key={lead.id}
                            onClick={() => router.push('/schedule')}
                            style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)',
                              cursor: 'pointer', borderLeft: `3px solid ${isWalkthrough ? 'var(--warning)' : 'var(--info)'}`
                            }}
                          >
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 2px 0' }}>
                                {lead.business_name || lead.businessName || 'Unknown'}
                              </p>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                                {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                {lead.follow_up_date.includes('T') && (
                                  <span> at {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                )}
                              </p>
                            </div>
                            <span className={`badge ${isWalkthrough ? 'badge-yellow' : 'badge-blue'}`}>
                              {isWalkthrough ? 'Walkthrough' : 'Meeting'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Follow-ups Due */}
              <div className="card fade-in">
                <div className="card-header">
                  <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Follow-ups Due {followUpsDue.length > 0 && `(${followUpsDue.length})`}
                  </h2>
                </div>
                <div className="card-body">
                  {followUpsDue.length === 0 ? (
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                      No follow-ups due. You&apos;re all caught up!
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {followUpsDue.slice(0, 5).map(lead => {
                        const dueDate = new Date(lead.follow_up_date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isOverdue = dueDate < today;
                        return (
                          <div
                            key={lead.id}
                            onClick={() => router.push('/pipeline')}
                            style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)',
                              cursor: 'pointer', borderLeft: `3px solid ${isOverdue ? 'var(--error)' : 'var(--warning)'}`
                            }}
                          >
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 2px 0' }}>
                                {lead.business_name || lead.businessName || 'Unknown'}
                              </p>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                                Due: {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <span className={`follow-up-badge ${isOverdue ? 'overdue' : 'upcoming'}`}>
                              {isOverdue ? 'Overdue' : 'Due Today'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
