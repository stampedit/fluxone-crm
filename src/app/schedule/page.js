'use client';

import { useState, useEffect } from 'react';
import { getJobs, addJob, updateJob, getClients } from '@/services/dataService';
import Navigation from '@/components/Navigation';

export default function SchedulePage() {
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    clientName: '',
    employeeName: '',
    date: '',
    status: 'Scheduled',
    isRecurring: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsData, clientsData] = await Promise.all([getJobs(), getClients()]);
      setJobs(jobsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async (jobData) => {
    try {
      const newJob = await addJob(jobData);
      setJobs([...jobs, newJob]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding job:', error);
    }
  };

  const handleUpdateJob = async (id, updates) => {
    try {
      const updatedJob = await updateJob(id, updates);
      setJobs(jobs.map(job => job.id === id ? updatedJob : job));
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      employeeName: '',
      date: '',
      status: 'Scheduled',
      isRecurring: false
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getJobsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return jobs.filter(job => job.date === dateString);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const openAddModal = (date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      date: date.toISOString().split('T')[0]
    });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading schedule...</p>
      </div>
    );
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="md:ml-64 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600 mt-2">Manage your cleaning jobs and appointments</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <h2 className="text-xl font-semibold">
                {viewMode === 'month' 
                  ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  : `Week of ${getWeekDays(currentDate)[0].toLocaleDateString()}`
                }
              </h2>
              <button
                onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                →
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Week
              </button>
              <button
                onClick={() => openAddModal(new Date())}
                className="btn-primary"
              >
                Add Job
              </button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {viewMode === 'month' ? (
            /* Month View */
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-7 bg-gray-50">
                {dayNames.map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */
              <div className="grid grid-cols-7">
                {getDaysInMonth(currentDate).map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="p-4 border-r border-b border-gray-200 last:border-r-0"></div>;
                  }
                  
                  const dayJobs = getJobsForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={date.toISOString()}
                      className={`p-4 border-r border-b border-gray-200 last:border-r-0 min-h-[100px] cursor-pointer hover:bg-gray-50 ${isToday ? 'bg-blue-50' : ''}`}
                      onClick={() => openAddModal(date)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {date.getDate()}
                        </span>
                        {dayJobs.length > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                            {dayJobs.length}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayJobs.slice(0, 2).map(job => (
                          <div
                            key={job.id}
                            className={`text-xs p-1 rounded ${getStatusColor(job.status)}`}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <div className="font-medium truncate">{job.clientName}</div>
                            <div className="truncate">{job.employeeName}</div>
                          </div>
                        ))}
                        {dayJobs.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayJobs.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Week View */
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-7 bg-gray-50">
                {getWeekDays(currentDate).map(date => (
                  <div key={date.toISOString()} className="p-3 text-center border-r border-gray-200 last:border-r-0">
                    <div className="text-sm font-medium text-gray-700">{dayNames[date.getDay()]}</div>
                    <div className={`text-lg font-bold ${date.toDateString() === new Date().toDateString() ? 'text-blue-600' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Week days */
              <div className="grid grid-cols-7">
                {getWeekDays(currentDate).map(date => {
                  const dayJobs = getJobsForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={date.toISOString()}
                      className={`p-4 border-r border-gray-200 last:border-r-0 min-h-[300px] cursor-pointer hover:bg-gray-50 ${isToday ? 'bg-blue-50' : ''}`}
                      onClick={() => openAddModal(date)}
                    >
                      <div className="space-y-2">
                        {dayJobs.map(job => (
                          <div
                            key={job.id}
                            className={`p-2 rounded ${getStatusColor(job.status)}`}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <div className="font-medium text-sm">{job.clientName}</div>
                            <div className="text-xs">{job.employeeName}</div>
                            <select
                              value={job.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleUpdateJob(job.id, { status: e.target.value });
                              }}
                              className="text-xs border border-gray-300 rounded px-1 py-0.5 mt-1 w-full"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="Scheduled">Scheduled</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        ))}
                        
                        {dayJobs.length === 0 && (
                          <div className="text-center text-gray-400 text-sm mt-8">
                            No jobs scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Add Job Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Job</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddJob(formData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Client *</label>
                    <select
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className="form-input"
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.businessName}>
                          {client.businessName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Employee Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.employeeName}
                      onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                      className="form-input"
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="form-input"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="isRecurring" className="text-sm text-gray-700">
                      Recurring job (will repeat weekly)
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="btn-primary">
                    Add Job
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
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
