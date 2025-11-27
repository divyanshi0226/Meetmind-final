// src/pages/MeetingRoom.js - COMPLETE VERSION
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

function MeetingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [duration, setDuration] = useState(0);
  const [keyPoints, setKeyPoints] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [newKeyPoint, setNewKeyPoint] = useState('');
  const [newActionItem, setNewActionItem] = useState('');
  const intervalRef = useRef(null);

  const { isRecording, transcript, isSupported, toggleRecording } = useSpeechRecognition();

  useEffect(() => {
    fetchMeeting();
    updateMeetingStatus('ongoing');

    // Start duration timer
    intervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id]);

  const fetchMeeting = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/meetings/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeeting(data);
      } else {
        alert('Meeting not found');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching meeting:', error);
      alert('Error loading meeting');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateMeetingStatus = async (status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/meetings/${id}`, {
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

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setKeyPoints([...keyPoints, newKeyPoint.trim()]);
      setNewKeyPoint('');
    }
  };

  const addActionItem = () => {
    if (newActionItem.trim()) {
      setActionItems([...actionItems, { item: newActionItem.trim(), completed: false }]);
      setNewActionItem('');
    }
  };

  const toggleActionItem = (index) => {
    const updated = [...actionItems];
    updated[index].completed = !updated[index].completed;
    setActionItems(updated);
  };

  const removeKeyPoint = (index) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  const removeActionItem = (index) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const endMeeting = async () => {
    if (!window.confirm('Are you sure you want to end this meeting?')) {
      return;
    }

    try {
      // Stop recording if active
      if (isRecording) {
        toggleRecording();
      }

      // Update meeting status
      await updateMeetingStatus('completed');

      // Create summary
      const token = localStorage.getItem('token');
      const summaryData = {
        meetingId: id,
        meeting: meeting.title,
        date: meeting.date,
        duration: `${Math.floor(duration / 60)} min`,
        transcript: transcript ? [{
          speaker: 'Recording',
          text: transcript,
          timestamp: new Date().toISOString()
        }] : [],
        keyPoints,
        actionItems: actionItems.length,
        actionItemsList: actionItems,
        transcribed: isRecording
      };

      await fetch('http://localhost:5000/api/summaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(summaryData)
      });

      alert('✅ Meeting ended and summary created!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error ending meeting:', error);
      alert('❌ Error ending meeting. Returning to dashboard...');
      navigate('/dashboard');
    }
  };

  const bgColor = darkMode ? '#1f2937' : '#f9fafb';
  const cardBg = darkMode ? '#374151' : 'white';
  const textColor = darkMode ? '#f9fafb' : '#1f2937';
  const textSecondary = darkMode ? '#d1d5db' : '#6b7280';
  const borderColor = darkMode ? '#4b5563' : '#e5e7eb';

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: bgColor
      }}>
        <div style={{ textAlign: 'center', color: textColor }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '4px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading meeting...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
              🎤 {meeting.title}
            </h1>
            <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0 0', opacity: 0.9 }}>
              {meeting.date} • {meeting.time} • {formatDuration(duration)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ← Back
            </button>
            <button
              onClick={endMeeting}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              🛑 End Meeting
            </button>
          </div>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '2rem 1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Recording Section */}
        <div style={{
          backgroundColor: cardBg,
          borderRadius: '0.5rem',
          padding: '1.5rem',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: textColor, marginBottom: '1rem' }}>
            📝 Live Transcription
          </h2>

          {!isSupported && (
            <div style={{
              backgroundColor: '#fee2e2',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              color: '#991b1b'
            }}>
              ⚠️ Speech recognition not supported. Please use Chrome or Edge.
            </div>
          )}

          {isSupported && (
            <>
              <button
                onClick={toggleRecording}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: isRecording ? '#dc2626' : '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}
              >
                {isRecording ? '⏹️ Stop Recording' : '▶️ Start Recording'}
              </button>

              <div style={{
                backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
                padding: '1rem',
                borderRadius: '0.5rem',
                minHeight: '200px',
                maxHeight: '400px',
                overflowY: 'auto',
                color: textColor,
                lineHeight: '1.6',
                border: `2px solid ${isRecording ? '#dc2626' : borderColor}`
              }}>
                {isRecording && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    paddingBottom: '0.5rem',
                    borderBottom: `1px solid ${borderColor}`
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#dc2626',
                      borderRadius: '50%',
                      animation: 'pulse 1.5s infinite'
                    }}></div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>RECORDING</span>
                  </div>
                )}
                {transcript || (isRecording ? 'Start speaking...' : 'Click "Start Recording" to begin')}
              </div>
            </>
          )}
        </div>

        {/* Key Points Section */}
        <div style={{
          backgroundColor: cardBg,
          borderRadius: '0.5rem',
          padding: '1.5rem',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: textColor, marginBottom: '1rem' }}>
            🔑 Key Points ({keyPoints.length})
          </h2>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={newKeyPoint}
              onChange={(e) => setNewKeyPoint(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyPoint()}
              placeholder="Add a key point..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: `1px solid ${borderColor}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: darkMode ? '#2d3748' : 'white',
                color: textColor
              }}
            />
            <button
              onClick={addKeyPoint}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Add
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            {keyPoints.length === 0 ? (
              <p style={{ color: textSecondary, textAlign: 'center', padding: '2rem' }}>
                No key points yet. Add important highlights!
              </p>
            ) : (
              keyPoints.map((point, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    padding: '0.75rem',
                    backgroundColor: darkMode ? '#2d3748' : '#f9fafb',
                    borderRadius: '0.5rem',
                    border: `1px solid ${borderColor}`
                  }}
                >
                  <span style={{ flex: 1, color: textColor }}>{point}</span>
                  <button
                    onClick={() => removeKeyPoint(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      padding: '0 0.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Items Section */}
        <div style={{
          backgroundColor: cardBg,
          borderRadius: '0.5rem',
          padding: '1.5rem',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: textColor, marginBottom: '1rem' }}>
            ✅ Action Items ({actionItems.length})
          </h2>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={newActionItem}
              onChange={(e) => setNewActionItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addActionItem()}
              placeholder="Add an action item..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: `1px solid ${borderColor}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: darkMode ? '#2d3748' : 'white',
                color: textColor
              }}
            />
            <button
              onClick={addActionItem}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Add
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            {actionItems.length === 0 ? (
              <p style={{ color: textSecondary, textAlign: 'center', padding: '2rem' }}>
                No action items yet. Track what needs to be done!
              </p>
            ) : (
              actionItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: darkMode ? '#2d3748' : '#f9fafb',
                    borderRadius: '0.5rem',
                    border: `1px solid ${borderColor}`
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleActionItem(index)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span style={{
                    flex: 1,
                    color: textColor,
                    textDecoration: item.completed ? 'line-through' : 'none',
                    opacity: item.completed ? 0.6 : 1
                  }}>
                    {item.item}
                  </span>
                  <button
                    onClick={() => removeActionItem(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      padding: '0 0.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default MeetingRoom;