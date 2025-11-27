// src/pages/Dashboard.js - COMPLETE FIXED VERSION WITH SMART DURATION
import React, { useState, useEffect, useRef } from 'react';
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
  const [botAvailable, setBotAvailable] = useState(false);
  const [processingMeetings, setProcessingMeetings] = useState(new Set());
  const [notifiedMeetings, setNotifiedMeetings] = useState({});
  const intervalRef = useRef(null);
  const pollIntervalsRef = useRef({});
  const navigate = useNavigate();

  const { meetings, upcomingMeetings, completedMeetings, loading, createMeeting, fetchMeetings } = useMeetings();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    checkBotAvailability();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#1f2937' : '#f9fafb';
  }, [darkMode]);

  useEffect(() => {
    if (!autoJoinEnabled) {
      console.log('⸮️ Auto-join disabled');
      return;
    }

    console.log('🤖 Silent auto-join enabled - Starting...');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    silentAutoJoinCheck();
    intervalRef.current = setInterval(() => {
      silentAutoJoinCheck();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      Object.values(pollIntervalsRef.current).forEach(interval => clearInterval(interval));
    };
  }, [meetings, autoJoinEnabled, notifiedMeetings]);

  const checkBotAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/meetings/bot/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBotAvailable(data.ready);
    } catch (error) {
      console.error('Bot check error:', error);
      setBotAvailable(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const silentAutoJoinCheck = async () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
    
    console.log(`⏰ Checking at: ${currentTime}`);

    for (const meeting of meetings) {
      if (meeting.status !== 'upcoming') continue;
      if (!meeting.meetingLink) continue;
      if (!botAvailable) continue;

      try {
        const meetingDate = new Date(meeting.date);
        const [hours, minutes] = meeting.time.split(':');
        meetingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const nowDate = new Date();
        const timeDiff = meetingDate - nowDate;
        const minutesUntil = Math.floor(timeDiff / 60000);

        if (minutesUntil < -10) {
          console.log(`🗑️ Auto-completing old meeting: ${meeting.title}`);
          await updateMeetingStatus(meeting._id, 'completed');
          fetchMeetings();
          continue;
        }

        console.log(`📅 ${meeting.title}: ${minutesUntil} min`);

        if (minutesUntil === 10 || minutesUntil === 5 || minutesUntil === 2) {
          const notifKey = `${meeting._id}-${minutesUntil}`;
          if (!notifiedMeetings[notifKey]) {
            console.log(`🔔 ${minutesUntil} min reminder: ${meeting.title}`);
            showSilentNotification(meeting, minutesUntil);
            setNotifiedMeetings(prev => ({ ...prev, [notifKey]: true }));
          }
        }

        if (minutesUntil <= 0 && minutesUntil >= -1) {
          const joinKey = `${meeting._id}-joined`;
          
          if (!notifiedMeetings[joinKey]) {
            console.log(`\n${'='.repeat(70)}`);
            console.log('🚀 SILENT AUTO-JOIN TRIGGERED!');
            console.log(`Meeting: ${meeting.title}`);
            console.log(`Link: ${meeting.meetingLink}`);
            console.log(`Current Time: ${currentTime}`);
            console.log(`Meeting Time: ${meeting.time}`);
            console.log('='.repeat(70) + '\n');
            
            setNotifiedMeetings(prev => ({ ...prev, [joinKey]: true }));
            await silentJoinMeeting(meeting._id, meeting.title, meeting.meetingLink, meeting);
          }
        }

      } catch (error) {
        console.error('Error processing meeting:', error);
      }
    }
  };

  // ✅ FIXED: Smart Duration Calculation
  const silentJoinMeeting = async (meetingId, meetingTitle, meetingLink, meeting) => {
    try {
      setProcessingMeetings(prev => new Set(prev).add(meetingId));
      
      const token = localStorage.getItem('token');
      
      // ✅ CALCULATE SMART DURATION
      const now = new Date();
      const [hours, minutes] = meeting.time.split(':');
      const meetingStartTime = new Date(meeting.date);
      meetingStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const timeSinceMeetingStarted = Math.floor((now - meetingStartTime) / 1000);
      
      let duration;
      
      // Use expectedDuration from meeting if available
      if (meeting.expectedDuration && meeting.expectedDuration > 0) {
        duration = meeting.expectedDuration * 60; // Convert minutes to seconds
        console.log(`📋 Using preset duration: ${meeting.expectedDuration} minutes`);
      }
      // Smart duration based on meeting time
      else if (timeSinceMeetingStarted < -300) {
        duration = 1800; // 30 minutes if meeting starts later
        console.log('📅 Meeting not started yet → Recording 30 minutes');
      } 
      else if (timeSinceMeetingStarted >= -300 && timeSinceMeetingStarted <= 300) {
        duration = 3600; // 1 hour if just starting
        console.log('🎯 Meeting starting now → Recording 1 hour');
      } 
      else if (timeSinceMeetingStarted > 300) {
        const assumedMeetingLength = 3600;
        duration = Math.max(assumedMeetingLength - timeSinceMeetingStarted, 600);
        console.log(`⏱️ Meeting in progress → Recording ${Math.floor(duration/60)} minutes`);
      } 
      else {
        duration = 1800;
      }
      
      // Cap limits
      if (duration > 7200) duration = 7200; // Max 2 hours
      if (duration < 300) duration = 300; // Min 5 minutes
      
      console.log(`\n${'='.repeat(70)}`);
      console.log('🤖 BOT STARTING');
      console.log(`📍 Meeting: ${meetingTitle}`);
      console.log(`🔗 Link: ${meetingLink}`);
      console.log(`⏱️  Duration: ${Math.floor(duration/60)} minutes (${duration}s)`);
      console.log('='.repeat(70) + '\n');
      
      const response = await fetch(`http://localhost:5000/api/meetings/${meetingId}/auto-join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration }) // ✅ Pass duration to backend
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Bot started successfully!');
        console.log('🔺 Chrome will open automatically');
        console.log('🎤 Recording will start automatically');
        console.log('📝 Transcript will be generated');
        console.log('📊 Summary will be saved\n');
        
        if (Notification.permission === 'granted') {
          new Notification('🤖 MeetMind Bot Started', {
            body: `Joining "${meetingTitle}" - Recording for ${Math.floor(duration/60)} min`,
            icon: '🤖',
            silent: false
          });
        }
        
        // Poll for completion
        const pollInterval = setInterval(async () => {
          try {
            const checkResponse = await fetch(`http://localhost:5000/api/meetings/${meetingId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (checkResponse.ok) {
              const updatedMeeting = await checkResponse.json();
              
              if (updatedMeeting.status === 'completed') {
                console.log('✅ Meeting completed! Refreshing...');
                
                clearInterval(pollInterval);
                delete pollIntervalsRef.current[meetingId];
                
                await fetchMeetings();
                
                setProcessingMeetings(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(meetingId);
                  return newSet;
                });
                
                if (Notification.permission === 'granted') {
                  new Notification('✅ Meeting Complete', {
                    body: `"${meetingTitle}" has been recorded and summarized!`,
                    icon: '✅'
                  });
                }
              }
            }
          } catch (error) {
            console.error('Poll error:', error);
          }
        }, 10000);
        
        pollIntervalsRef.current[meetingId] = pollInterval;
        
        setTimeout(() => {
          if (pollIntervalsRef.current[meetingId]) {
            clearInterval(pollIntervalsRef.current[meetingId]);
            delete pollIntervalsRef.current[meetingId];
          }
          setProcessingMeetings(prev => {
            const newSet = new Set(prev);
            newSet.delete(meetingId);
            return newSet;
          });
        }, 7200000 + 600000); // Duration + 10 min buffer
      } else {
        console.error('❌ Bot failed:', data.message);
        setProcessingMeetings(prev => {
          const newSet = new Set(prev);
          newSet.delete(meetingId);
          return newSet;
        });
      }
        
    } catch (error) {
      console.error('❌ Silent join error:', error);
      setProcessingMeetings(prev => {
        const newSet = new Set(prev);
        newSet.delete(meetingId);
        return newSet;
      });
    }
  };

  const updateMeetingStatus = async (meetingId, status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/meetings/${meetingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const showSilentNotification = (meeting, minutesUntil) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('🔔 MeetMind', {
        body: `"${meeting.title}" in ${minutesUntil} min`,
        icon: '⏰',
        silent: true,
        tag: meeting._id
      });
      setTimeout(() => notification.close(), 5000);
    }

    try {
      const audio = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.frequency.value = 600;
      gain.gain.setValueAtTime(0.1, audio.currentTime);
      osc.start(audio.currentTime);
      osc.stop(audio.currentTime + 0.2);
    } catch (e) {}
  };

  const handleManualAutoJoin = async (meeting) => {
    if (!window.confirm(`Start bot for "${meeting.title}"?\n\nDuration: ${meeting.expectedDuration || 60} minutes`)) return;
    await silentJoinMeeting(meeting._id, meeting.title, meeting.meetingLink, meeting);
  };

  const handleManualJoin = (meetingId) => {
    navigate(`/meeting/${meetingId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleCreateMeeting = async (meetingData) => {
    const result = await createMeeting(meetingData);
    if (result.success) {
      alert('✅ Meeting created!');
    } else {
      alert('❌ Failed to create meeting');
    }
    return result.success;
  };

  const toggleAutoJoin = () => {
    const newValue = !autoJoinEnabled;
    setAutoJoinEnabled(newValue);
    localStorage.setItem('autoJoin', newValue);
    
    if (newValue) {
      alert('✅ SILENT AUTO-JOIN ON\n\nBot will join automatically at meeting time.\nNO prompts, NO alerts.\nKeep tab open!');
    } else {
      alert('⸮️ Auto-join OFF');
    }
  };

  const getTimeUntilMeeting = (meeting) => {
    const now = new Date();
    const [hours, minutes] = meeting.time.split(':');
    const meetingDateTime = new Date(meeting.date);
    meetingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const timeDiff = meetingDateTime - now;
    const minutesLeft = Math.floor(timeDiff / 60000);
    
    if (minutesLeft < 0) return 'Started';
    if (minutesLeft < 60) return `${minutesLeft}m`;
    const hoursLeft = Math.floor(minutesLeft / 60);
    if (hoursLeft < 24) return `${hoursLeft}h`;
    const daysLeft = Math.floor(hoursLeft / 24);
    return `${daysLeft}d`;
  };

  const bgColor = darkMode ? '#1f2937' : '#f9fafb';
  const cardBg = darkMode ? '#374151' : 'white';
  const textColor = darkMode ? '#f9fafb' : '#1f2937';
  const textSecondary = darkMode ? '#d1d5db' : '#6b7280';
  const borderColor = darkMode ? '#4b5563' : '#e5e7eb';

  const activeUpcomingMeetings = upcomingMeetings.filter(meeting => {
    const timeUntil = getTimeUntilMeeting(meeting);
    return timeUntil !== 'Started';
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor }}>
      <Navbar 
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        autoJoinEnabled={autoJoinEnabled}
        toggleAutoJoin={toggleAutoJoin}
        onLogout={handleLogout}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: textColor, margin: 0 }}>
              Dashboard
            </h2>
            <p style={{ fontSize: '0.875rem', color: textSecondary, marginTop: '0.25rem' }}>
              {botAvailable ? '🤖 Bot Ready' : '⚠️ Bot offline'} 
              {autoJoinEnabled && ' • 🔥 SILENT auto-join ON'}
            </p>
          </div>
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

        {!botAvailable && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <strong style={{ color: '#991b1b' }}>❌ Bot Offline</strong>
            <p style={{ color: '#7f1d1d', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
              Check backend terminal
            </p>
          </div>
        )}

        {autoJoinEnabled && botAvailable && (
          <div style={{
            backgroundColor: '#d1fae5',
            border: '1px solid #059669',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <strong style={{ color: '#065f46' }}>🤫 SILENT MODE ACTIVE</strong>
            <p style={{ color: '#047857', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
              Bot will join meetings automatically. No prompts. Keep tab open.
            </p>
          </div>
        )}

        <StatsCards 
          upcomingCount={activeUpcomingMeetings.length}
          completedCount={completedMeetings.length}
          totalCount={meetings.length}
          autoJoinEnabled={autoJoinEnabled}
          darkMode={darkMode}
        />

        <div style={{ 
          backgroundColor: cardBg, 
          padding: '1.5rem', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          border: `1px solid ${borderColor}`,
          marginTop: '2rem'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: textColor }}>
            Upcoming Meetings
          </h3>
          
          {activeUpcomingMeetings.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {activeUpcomingMeetings.map((meeting) => {
                const timeUntil = getTimeUntilMeeting(meeting);
                const isProcessing = processingMeetings.has(meeting._id);
                const isSoon = !timeUntil.includes('d') && !timeUntil.includes('h');
                
                return (
                  <div
                    key={meeting._id}
                    style={{
                      border: `2px solid ${isProcessing ? '#8b5cf6' : isSoon ? '#f59e0b' : borderColor}`,
                      borderRadius: '0.5rem',
                      padding: '1.25rem',
                      backgroundColor: isSoon ? (darkMode ? '#422006' : '#fef3c7') : (darkMode ? '#2d3748' : 'white')
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '0.75rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: textColor, marginBottom: '0.5rem' }}>
                          {meeting.title}
                        </h4>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: textSecondary, flexWrap: 'wrap' }}>
                          <span>📅 {meeting.date}</span>
                          <span>🕐 {meeting.time}</span>
                          <span style={{ fontWeight: 600, color: isSoon ? '#f59e0b' : textSecondary }}>
                            ⏰ {timeUntil}
                          </span>
                          {meeting.expectedDuration && (
                            <span>⏱️ {meeting.expectedDuration} min</span>
                          )}
                        </div>
                      </div>
                      {isSoon && (
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          backgroundColor: '#f59e0b',
                          color: 'white'
                        }}>
                          ⚡ Soon
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleManualJoin(meeting._id)}
                        style={{
                          flex: 1,
                          minWidth: '120px',
                          padding: '0.75rem',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        🎤 Manual
                      </button>

                      <button
                        onClick={() => handleManualAutoJoin(meeting)}
                        disabled={!meeting.meetingLink || !botAvailable || isProcessing}
                        style={{
                          flex: 1,
                          minWidth: '120px',
                          padding: '0.75rem',
                          backgroundColor: isProcessing ? '#9ca3af' : 
                                         (!meeting.meetingLink || !botAvailable) ? '#d1d5db' : '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: (meeting.meetingLink && botAvailable && !isProcessing) ? 'pointer' : 'not-allowed',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        {isProcessing ? '⏳ Running' : '🤖 Bot Now'}
                      </button>

                      {meeting.meetingLink && (
                        <button
                          onClick={() => window.open(meeting.meetingLink, '_blank')}
                          style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: '0.875rem'
                          }}
                        >
                          🔗
                        </button>
                      )}
                    </div>

                    {isProcessing && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        backgroundColor: '#dbeafe',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#1e40af',
                        textAlign: 'center'
                      }}>
                        🤖 Bot joining... Watch backend terminal
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: textSecondary }}>
              <p style={{ marginBottom: '1rem' }}>No upcoming meetings</p>
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
                Create Meeting
              </button>
            </div>
          )}
        </div>

        {completedMeetings.length > 0 && (
          <div style={{ 
            backgroundColor: cardBg, 
            padding: '1.5rem', 
            borderRadius: '0.5rem', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            border: `1px solid ${borderColor}`,
            marginTop: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: textColor }}>
              Completed
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {completedMeetings.slice(0, 5).map((meeting) => (
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
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: textColor }}>
                      {meeting.title}
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: textSecondary }}>
                      {meeting.date}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/summaries')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ✅ View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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