// src/pages/Summaries.js - WITH TEST TRANSCRIPT BUTTON
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Summaries() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [testingTranscript, setTestingTranscript] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('User loaded:', parsedUser.name);
      } else {
        console.log('No user found, redirecting to login');
        navigate('/');
        return;
      }
    } catch (err) {
      console.error('Error loading user:', err);
      navigate('/');
      return;
    }
    
    fetchSummaries();
  }, [navigate]);

  const fetchSummaries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token, redirecting to login');
        navigate('/');
        return;
      }

      console.log('Fetching summaries from API...');
      
      const response = await fetch('http://localhost:5000/api/summaries', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        console.log('Unauthorized - token may be expired');
        localStorage.clear();
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Summaries received:', data.length);
      
      setSummaries(data || []);
      
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
      setSummaries([]);
      
    } finally {
      setLoading(false);
    }
  };

  // ✅ TEST TRANSCRIPT FUNCTION
  const testTranscript = async () => {
    setTestingTranscript(true);
    try {
      console.log('🧪 Testing transcript functionality...');
      
      // Create a test audio file path (you can use any small WAV file)
      const testAudioPath = prompt('Enter path to test audio file (or leave empty to skip):');
      
      if (!testAudioPath) {
        alert('⚠️ No audio path provided. Test cancelled.');
        setTestingTranscript(false);
        return;
      }

      const token = localStorage.getItem('token');
      
      // Call a test endpoint (you'll need to create this in backend)
      const response = await fetch('http://localhost:5000/api/summaries/test-transcript', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ audioPath: testAudioPath })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ Test Successful!\n\nTranscription: ${result.transcription?.substring(0, 200)}...\n\nCheck console for full details.`);
        console.log('Full test result:', result);
      } else {
        alert(`❌ Test Failed: ${result.message}`);
      }
      
    } catch (error) {
      alert(`❌ Test Error: ${error.message}`);
      console.error('Test error:', error);
    } finally {
      setTestingTranscript(false);
    }
  };

  const downloadPDF = async (summaryId, meetingTitle) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/summaries/${summaryId}/download-pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${meetingTitle.replace(/[^a-z0-9]/gi, '_')}-report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('❌ Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF error:', error);
      alert('❌ Failed to download PDF');
    }
  };

  const downloadAudio = async (summaryId, meetingTitle) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/summaries/${summaryId}/download-audio`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${meetingTitle.replace(/[^a-z0-9]/gi, '_')}-recording.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('❌ Failed to download audio');
      }
    } catch (error) {
      console.error('Audio download error:', error);
      alert('❌ Failed to download audio');
    }
  };

  const bgColor = darkMode ? '#1f2937' : '#f9fafb';
  const cardBg = darkMode ? '#374151' : 'white';
  const textColor = darkMode ? '#f9fafb' : '#1f2937';
  const textSecondary = darkMode ? '#d1d5db' : '#6b7280';
  const borderColor = darkMode ? '#4b5563' : '#e5e7eb';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor }}>
      <Navbar 
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={() => {
          localStorage.clear();
          window.location.href = '/';
        }}
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
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: textColor, margin: 0 }}>
              Meeting Summaries
            </h2>
            <p style={{ fontSize: '0.875rem', color: textSecondary, marginTop: '0.25rem' }}>
              {loading ? 'Loading...' : `${summaries.length} summaries found`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* ✅ TEST TRANSCRIPT BUTTON */}
            <button
              onClick={testTranscript}
              disabled={testingTranscript}
              style={{
                backgroundColor: testingTranscript ? '#9ca3af' : '#7c3aed',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: testingTranscript ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              {testingTranscript ? '⏳ Testing...' : '🧪 Test Transcript'}
            </button>
            
            <button
              onClick={fetchSummaries}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#93c5fd' : '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              {loading ? '⏳ Loading...' : '🔄 Refresh'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <strong style={{ color: '#991b1b' }}>❌ Error Loading Summaries</strong>
            <p style={{ color: '#7f1d1d', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
              {error}
            </p>
            <button
              onClick={fetchSummaries}
              style={{
                marginTop: '0.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: textSecondary }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: '4px solid #e5e7eb',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p>Loading summaries...</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && summaries.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: cardBg,
            borderRadius: '0.5rem',
            border: `1px solid ${borderColor}`
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ color: textColor, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              No Summaries Yet
            </h3>
            <p style={{ color: textSecondary, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Complete a meeting with the bot to see summaries here
            </p>
            <button
              onClick={() => navigate('/dashboard')}
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
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Summaries List */}
        {!loading && !error && summaries.length > 0 && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {summaries.map((summary, index) => (
              <div
                key={summary._id || index}
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {/* Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: textColor, margin: 0 }}>
                      {summary.meeting || 'Untitled Meeting'}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: textSecondary, marginTop: '0.25rem' }}>
                      {summary.date || 'No date'} • {summary.duration || '0 min'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {summary.audioFilePath && (
                      <button
                        onClick={() => downloadAudio(summary._id, summary.meeting)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        🎤 Audio
                      </button>
                    )}
                    <button
                      onClick={() => downloadPDF(summary._id, summary.meeting)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      📄 PDF
                    </button>
                    <button
                      onClick={() => setSelectedSummary(selectedSummary === summary._id ? null : summary._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      {selectedSummary === summary._id ? '▲ Hide' : '▼ View'}
                    </button>
                  </div>
                </div>

                {/* Audio Player */}
                {summary.audioFilePath && (
                  <div style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    backgroundColor: darkMode ? '#2d3748' : '#f0f9ff',
                    borderRadius: '0.5rem',
                    border: `2px solid ${darkMode ? '#4b5563' : '#3b82f6'}`
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>🎤</span>
                      <div>
                        <h4 style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 600, 
                          color: textColor,
                          margin: 0 
                        }}>
                          Meeting Recording
                        </h4>
                      </div>
                    </div>
                    <audio 
                      controls 
                      style={{ width: '100%', height: '40px' }}
                      preload="metadata"
                    >
                      <source 
                        src={`http://localhost:5000${summary.audioFilePath}`} 
                        type="audio/wav" 
                      />
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}

                {/* Expandable Details */}
                {selectedSummary === summary._id && (
                  <div style={{ 
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: darkMode ? '#2d3748' : '#f9fafb',
                    borderRadius: '0.5rem'
                  }}>
                    {/* Key Points */}
                    {summary.keyPoints && summary.keyPoints.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: textColor, marginBottom: '0.5rem' }}>
                          🔑 Key Points
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: textColor }}>
                          {summary.keyPoints.map((point, i) => (
                            <li key={i} style={{ marginBottom: '0.25rem' }}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Items */}
                    {summary.actionItemsList && summary.actionItemsList.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: textColor, marginBottom: '0.5rem' }}>
                          ✅ Action Items
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: textColor }}>
                          {summary.actionItemsList.map((item, i) => (
                            <li key={i}>{item.item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Transcript */}
                    {summary.transcript && summary.transcript.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: textColor, marginBottom: '0.5rem' }}>
                          📝 Transcript
                        </h4>
                        <div style={{ 
                          maxHeight: '200px',
                          overflowY: 'auto',
                          padding: '0.75rem',
                          backgroundColor: darkMode ? '#1f2937' : 'white',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem'
                        }}>
                          {summary.transcript.map((t, i) => (
                            <p key={i} style={{ marginBottom: '0.5rem' }}>
                              <strong>[{t.speaker}]:</strong> {t.text}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Summaries;