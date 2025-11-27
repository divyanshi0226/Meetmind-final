// src/components/Navbar.js - WITH SUMMARIES LINK
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar({ user, darkMode, setDarkMode, autoJoinEnabled, toggleAutoJoin, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{ 
      backgroundColor: '#2563eb', 
      color: 'white', 
      padding: '1rem 0', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 1rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 
            onClick={() => navigate('/dashboard')}
            style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              margin: 0,
              cursor: 'pointer'
            }}
          >
            MeetMind
          </h1>
          
          {/* Navigation Links */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                backgroundColor: location.pathname === '/dashboard' ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                padding: '0.5rem 1rem',
                border: location.pathname === '/dashboard' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              📊 Dashboard
            </button>
            
            <button
              onClick={() => navigate('/summaries')}
              style={{
                backgroundColor: location.pathname === '/summaries' ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                padding: '0.5rem 1rem',
                border: location.pathname === '/summaries' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              📄 Summaries
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          {/* Auto-Join Toggle */}
          {toggleAutoJoin && (
            <button
              onClick={toggleAutoJoin}
              style={{
                backgroundColor: autoJoinEnabled ? '#059669' : '#6b7280',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
              title="Toggle Auto-Join"
            >
              🤖 Auto: {autoJoinEnabled ? 'ON' : 'OFF'}
            </button>
          )}
          
          {/* User Info */}
          <span style={{ fontSize: '0.875rem' }}>
            Hi, {user?.name || 'User'}
          </span>
          
          {/* Logout */}
          <button
            onClick={onLogout}
            style={{ 
              backgroundColor: '#1d4ed8', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              border: 'none', 
              borderRadius: '0.5rem', 
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;