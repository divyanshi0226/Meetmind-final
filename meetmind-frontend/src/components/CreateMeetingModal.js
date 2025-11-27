// src/components/CreateMeetingModal.js - COMPLETE WITH DURATION SELECTOR
import React, { useState } from 'react';

function CreateMeetingModal({ show, onClose, onSubmit, darkMode, loading }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    participants: 1,
    meetingLink: '',
    autoJoin: false,
    sendReminder: false,
    expectedDuration: 60 // ✅ NEW: Expected duration in minutes
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        participants: 1,
        meetingLink: '',
        autoJoin: false,
        sendReminder: false,
        expectedDuration: 60
      });
      onClose();
    }
  };

  if (!show) return null;

  const cardBg = darkMode ? '#374151' : 'white';
  const textColor = darkMode ? '#f9fafb' : '#1f2937';
  const borderColor = darkMode ? '#4b5563' : '#e5e7eb';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: cardBg,
          borderRadius: '0.5rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: textColor }}>
          Create New Meeting
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: textColor }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${borderColor}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: darkMode ? '#2d3748' : 'white',
                color: textColor
              }}
              required
              placeholder="Team Standup"
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: textColor }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${borderColor}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                minHeight: '80px',
                backgroundColor: darkMode ? '#2d3748' : 'white',
                color: textColor,
                resize: 'vertical'
              }}
              placeholder="What's this meeting about?"
            />
          </div>

          {/* Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: textColor }}>
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: darkMode ? '#2d3748' : 'white',
                  color: textColor
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: textColor }}>
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: darkMode ? '#2d3748' : 'white',
                  color: textColor
                }}
                required
              />
            </div>
          </div>

          {/* ✅ NEW: Expected Duration - Both Input & Dropdown */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: textColor }}>
              ⏱️ Expected Duration (minutes)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {/* Number Input - User can type custom duration */}
              <input
                type="number"
                value={formData.expectedDuration}
                onChange={(e) => setFormData({...formData, expectedDuration: parseInt(e.target.value) || 60})}
                min="5"
                max="120"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: darkMode ? '#2d3748' : 'white',
                  color: textColor
                }}
                placeholder="Enter minutes..."
              />
              
              {/* Quick Select Buttons */}
              <select
                value={formData.expectedDuration}
                onChange={(e) => setFormData({...formData, expectedDuration: parseInt(e.target.value)})}
                style={{
                  padding: '0.75rem',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: darkMode ? '#2d3748' : 'white',
                  color: textColor,
                  cursor: 'pointer'
                }}
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hrs</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              🤖 Bot will record for {formData.expectedDuration} minutes ({Math.floor(formData.expectedDuration / 60)}h {formData.expectedDuration % 60}m) when auto-joining
            </p>
          </div>

          {/* Participants */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: textColor }}>
              Participants
            </label>
            <input
              type="number"
              value={formData.participants}
              onChange={(e) => setFormData({...formData, participants: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${borderColor}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: darkMode ? '#2d3748' : 'white',
                color: textColor
              }}
              min="1"
            />
          </div>

          {/* Meeting Link */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: textColor }}>
              Meeting Link
            </label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${borderColor}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: darkMode ? '#2d3748' : 'white',
                color: textColor
              }}
              placeholder="https://meet.google.com/..."
            />
          </div>

          {/* Auto-Join Checkbox */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: textColor }}>
              <input
                type="checkbox"
                checked={formData.autoJoin}
                onChange={(e) => setFormData({...formData, autoJoin: e.target.checked})}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              🤖 Enable Auto-Join & Recording
            </label>
            {formData.autoJoin && (
              <p style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                ✅ Bot will join and record for {formData.expectedDuration} minutes
              </p>
            )}
          </div>

          {/* Email Reminder Checkbox */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: textColor }}>
              <input
                type="checkbox"
                checked={formData.sendReminder}
                onChange={(e) => setFormData({...formData, sendReminder: e.target.checked})}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              📧 Send Email Reminder (10 minutes before)
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: loading ? '#93c5fd' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              {loading ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMeetingModal;