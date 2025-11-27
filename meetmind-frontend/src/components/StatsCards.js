// src/components/StatsCards.js
import React from 'react';

function StatsCards({ upcomingCount, ongoingCount, completedCount, missedCount, totalCount, autoJoinEnabled, darkMode }) {
  const cardStyle = {
    borderRadius: '1rem',
    padding: '1.5rem',
    textAlign: 'center',
    fontWeight: 'bold',
    flex: 1,
    margin: '0.5rem',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginTop: '2rem',
        color: darkMode ? '#f9fafb' : '#111827',
      }}
    >
      <div style={{ ...cardStyle, background: '#60a5fa' }}>
        <h3>Upcoming</h3>
        <p style={{ fontSize: '1.5rem' }}>{upcomingCount}</p>
      </div>

      <div style={{ ...cardStyle, background: '#fbbf24' }}>
        <h3>Ongoing</h3>
        <p style={{ fontSize: '1.5rem' }}>{ongoingCount}</p>
      </div>

      <div style={{ ...cardStyle, background: '#34d399' }}>
        <h3>Completed</h3>
        <p style={{ fontSize: '1.5rem' }}>{completedCount}</p>
      </div>

      <div style={{ ...cardStyle, background: '#f87171' }}>
        <h3>Missed</h3>
        <p style={{ fontSize: '1.5rem' }}>{missedCount}</p>
      </div>

      <div
        style={{
          ...cardStyle,
          background: darkMode ? '#4b5563' : '#e5e7eb',
          color: darkMode ? '#f9fafb' : '#1f2937',
        }}
      >
        <h3>Total</h3>
        <p style={{ fontSize: '1.5rem' }}>{totalCount}</p>
        <p style={{ fontSize: '0.8rem' }}>
          {autoJoinEnabled ? '⚙️ Auto-Join: ON' : '⏸️ Auto-Join: OFF'}
        </p>
      </div>
    </div>
  );
}

export default StatsCards;

