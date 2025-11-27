import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatsCards from '../components/StatsCards';
import CreateMeetingModal from '../components/CreateMeetingModal';
import { useMeetings } from '../hooks/useMeetings';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [autoJoinEnabled, setAutoJoinEnabled] = useState(
    localStorage.getItem('autoJoin') === 'true'
  );
  const navigate = useNavigate();

  const { meetings, upcomingMeetings, completedMeetings, loading, createMeeting } = useMeetings();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#1f2937' : '#f9fafb';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!autoJoinEnabled) return;
    const interval = setInterval(() => {
      checkUpcomingMeetings();
    }, 60000);
    return () => clearInterval(interval);
  }, [autoJoinEnabled, meetings]);

  const checkUpcomingMeetings = () => {
    const now = new Date();
    meetings.forEach(meeting => {
      if (meeting.status === 'upcoming' && meeting.autoJoin) {
        const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
        const timeDiff = meetingDateTime - now;
        if (timeDiff > 0 && timeDiff <= 120000) {
          if (window.confirm(`Meeting "${meeting.title}" is starting soon! Join now?`)) {
            navigate(`/meeting/${meeting._id}`);
          }
        }
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const toggleAutoJoin = () => {
    const newValue = !autoJoinEnabled;
    setAutoJoinEnabled(newValue);
    localStorage.setItem('autoJoin', newValue);
    alert(newValue ? 'Auto-join enabled!' : 'Auto-join disabled');
  };

  const handleCreateMeeting = async (meetingData) => {
    const result = await createMeeting(meetingData);
    if (result.success) {
      alert('Meeting created successfully!');
      if (meetingData.sendReminder) {
        alert('Reminder will be sent 10 minutes before the meeting!');
      }
    } else {
      alert('Failed to create meeting');
    }
    return result.success;
  };

  const handleJoinMeeting = (meetingId) => {
    navigate(`/meeting/${meetingId}`);
  };

  const bgColor = darkMode ? '#1f2937' : '#f9fafb';
  const cardBg = darkMode ? '#374151' : 'white';
  const textColor = darkMode ? '#f9fafb' : '#1f2937';
  const textSecondary = darkMode ? '#d1d5db' : '#6b7280';
  const borderColor = darkMode ? '#4b5563' : '#e5e7eb';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor, transition: 'all 0.3s' }}>
      <Navbar 
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        autoJoinEnabled={autoJoinEnabled}
        toggleAutoJoin={toggleAutoJoin}
        onLogout={handleLogout}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem', 
          flexWrap: 'wrap', 
          gap: '1rem' 
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: textColor, margin: 0 }}>
            Dashboard
          </h2>
          <button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            + Create Meeting
          </button>
        </div>

        {/* Stats Cards */}
        <StatsCards 
          upcomingCount={upcomingMeetings.length}
          completedCount={completedMeetings.length}
          totalCount={meetings.length}
          autoJoinEnabled={autoJoinEnabled}
          darkMode={darkMode}
        />

        {/* Meetings List */}
        <div style={{ 
          backgroundColor: cardBg, 
          padding: '1.5rem', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          border: `1px solid ${borderColor}` 
        }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem', 
            color: textColor 
          }}>
            Upcoming Meetings
          </h3>
          
          {upcomingMeetings.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting._id}
                  style={{
                    border: `1px solid ${borderColor}`,
                    borderRadius: '0.5rem',
                    padding: '1.25rem',
                    backgroundColor: darkMode ? '#2d3748' : 'white',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'start', 
                    marginBottom: '0.75rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: textColor, marginBottom: '0.5rem' }}>
                        {meeting.title}
                      </h4>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: textSecondary, flexWrap: 'wrap' }}>
                        <span> {meeting.date}</span>
                        <span>{meeting.time}</span>
                        {meeting.participants && <span> {meeting.participants} participants</span>}
                        {meeting.autoJoin && <span> Auto-join enabled</span>}
                      </div>
                      {meeting.description && (
                        <p style={{ fontSize: '0.875rem', color: textSecondary, marginTop: '0.5rem' }}>
                          {meeting.description}
                        </p>
                      )}
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      whiteSpace: 'nowrap'
                    }}>
                      Upcoming
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleJoinMeeting(meeting._id)}
                      style={{
                        flex: 1,
                        minWidth: '120px',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                    >
                       Join & Record
                    </button>
                    {meeting.meetingLink && (
                      <button
                        onClick={() => window.open(meeting.meetingLink, '_blank')}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                         Open Link
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: textSecondary }}>
              <p style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>
                No upcoming meetings
              </p>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Create Your First Meeting
              </button>
            </div>
          )}
        </div>

        {/* Recent Summaries */}
        {completedMeetings.length > 0 && (
          <div style={{ 
            backgroundColor: cardBg, 
            padding: '1.5rem', 
            borderRadius: '0.5rem', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            border: `1px solid ${borderColor}`,
            marginTop: '1.5rem'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem', 
              color: textColor 
            }}>
              Completed Meetings
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {completedMeetings.slice(0, 3).map((meeting) => (
                <div
                  key={meeting._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '0.5rem',
                    backgroundColor: darkMode ? '#2d3748' : '#f9fafb'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: textColor, marginBottom: '0.25rem' }}>
                      {meeting.title}
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: textSecondary }}>
                      {meeting.date}
                    </p>
                  </div>
                  <button
                    style={{
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '0.875rem'
                    }}
                  >
                    View Summary
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      <CreateMeetingModal 
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateMeeting}
        darkMode={darkMode}
        loading={loading}
      />
    </div>
  );
}

export default Dashboard;
