import React from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

function TranscriptRecorder({ darkMode }) {
  const { isRecording, transcript, isSupported, toggleRecording } = useSpeechRecognition();

  const cardBg = darkMode ? '#374151' : 'white';
  const textColor = darkMode ? '#f9fafb' : '#1f2937';

  if (!isSupported) {
    return (
      <div style={{
        backgroundColor: '#fee2e2',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '2rem',
        textAlign: 'center',
        color: '#991b1b'
      }}>
        ⚠️ Speech recognition not supported. Please use Chrome or Edge.
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={toggleRecording}
        style={{
          backgroundColor: isRecording ? '#dc2626' : '#059669',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}
      >
        {isRecording ? ' Stop Recording' : ' Start Recording'}
      </button>

      {isRecording && (
        <div style={{
          backgroundColor: cardBg,
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: '2px solid #dc2626'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#dc2626',
              borderRadius: '50%',
              animation: 'pulse 1.5s infinite'
            }}></div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: textColor, margin: 0 }}>
              Live Transcript
            </h3>
          </div>
          <div style={{
            backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
            padding: '1rem',
            borderRadius: '0.5rem',
            minHeight: '100px',
            maxHeight: '200px',
            overflowY: 'auto',
            color: textColor
          }}>
            {transcript || 'Start speaking...'}
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default TranscriptRecorder;