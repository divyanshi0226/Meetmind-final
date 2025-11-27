import React from 'react';

function MeetingList({ meetings, darkMode, onCreateClick }) {
  const textColor = darkMode ? '#f9fafb' : '#1f2937';
  const textSecondary = darkMode ? '#d1d5db' : '#6b7280';
  const borderColor = darkMode ? '#4b5563' : '#e5e7eb';

  if (meetings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: textSecondary }}>
        <p style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>
          No upcoming meetings
        </p>
        <button
          onClick={onCreateClick}
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
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {meetings.map((meeting) => (
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
                <span>📅 {meeting.date}</span>
                <span>🕐 {meeting.time}</span>
                {meeting.participants && <span>👥 {meeting.participants} participants</span>}
                {meeting.autoJoin && <span>🤖 Auto-join</span>}
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
              onClick={() => meeting.meetingLink && window.open(meeting.meetingLink, '_blank')}
              disabled={!meeting.meetingLink}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.5rem 1rem',
                backgroundColor: meeting.meetingLink ? '#2563eb' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: meeting.meetingLink ? 'pointer' : 'not-allowed',
                fontWeight: 500
              }}
            >
              {meeting.meetingLink ? 'Join Meeting' : 'No Link'}
            </button>
            <button
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
              📧 Reminder
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MeetingList;