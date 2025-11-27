// src/utils/api.js - COMPLETELY FIXED
const API_URL = 'http://localhost:5000/api';

console.log('🌐 API Base URL:', API_URL);

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Make authenticated requests
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log(`📍 ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Handle 401 - redirect to login
    if (response.status === 401) {
      console.warn('❌ Unauthorized - clearing localStorage');
      localStorage.clear();
      window.location.href = '/';
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Error ${response.status}:`, errorData.message);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Response:', data);
    return data;

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    throw error;
  }
};

// AUTH API
export const authAPI = {
  login: async (email, password) => {
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register: async (name, email, password) => {
    return makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// MEETINGS API
export const meetingAPI = {
  getAll: () => {
    return makeRequest('/meetings', { method: 'GET' });
  },

  getById: (id) => {
    return makeRequest(`/meetings/${id}`, { method: 'GET' });
  },

  create: (data) => {
    return makeRequest('/meetings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: (id, data) => {
    return makeRequest(`/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete: (id) => {
    return makeRequest(`/meetings/${id}`, {
      method: 'DELETE'
    });
  },

  autoJoin: (id) => {
    return makeRequest(`/meetings/${id}/auto-join`, {
      method: 'POST'
    });
  },

  checkBotStatus: () => {
    return makeRequest('/meetings/bot/status', { method: 'GET' });
  }
};

// SUMMARIES API
export const summaryAPI = {
  getAll: () => {
    return makeRequest('/summaries', { method: 'GET' });
  },

  getById: (id) => {
    return makeRequest(`/summaries/${id}`, { method: 'GET' });
  },

  create: (data) => {
    return makeRequest('/summaries', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: (id, data) => {
    return makeRequest(`/summaries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  downloadPDF: async (id, filename) => {
    const token = getToken();
    const url = `${API_URL}/summaries/${id}/download-pdf`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = filename || 'meeting-report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);

    } catch (error) {
      console.error('❌ PDF download error:', error);
      throw error;
    }
  },

  downloadAudio: async (id, filename) => {
    const token = getToken();
    const url = `${API_URL}/summaries/${id}/download-audio`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = filename || 'meeting-recording.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);

    } catch (error) {
      console.error('❌ Audio download error:', error);
      throw error;
    }
  }
};

export default {
  authAPI,
  meetingAPI,
  summaryAPI
};