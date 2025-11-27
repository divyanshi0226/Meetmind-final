// src/hooks/useMeetings.js - COMPLETELY FIXED
import { useState, useEffect } from 'react';
import { meetingAPI, summaryAPI } from '../utils/api';

export function useMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all meetings
  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📍 Fetching meetings...');
      const data = await meetingAPI.getAll();
      setMeetings(data || []);
      console.log(`✅ Got ${data.length} meetings`);
    } catch (error) {
      console.error('❌ Fetch meetings error:', error.message);
      setError(error.message);
      setMeetings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch all summaries
  const fetchSummaries = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📍 Fetching summaries...');
      const data = await summaryAPI.getAll();
      setSummaries(data || []);
      console.log(`✅ Got ${data.length} summaries`);
      return data;
    } catch (error) {
      console.error('❌ Fetch summaries error:', error.message);
      setError(error.message);
      setSummaries([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create meeting
  const createMeeting = async (meetingData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📍 Creating meeting...', meetingData);
      const result = await meetingAPI.create(meetingData);
      console.log('✅ Meeting created:', result._id);
      
      // Refresh meetings list
      await fetchMeetings();
      
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Create meeting error:', error.message);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update meeting
  const updateMeeting = async (id, data) => {
    setLoading(true);
    try {
      console.log('📍 Updating meeting...', id);
      const result = await meetingAPI.update(id, data);
      console.log('✅ Meeting updated');
      
      // Update local state
      setMeetings(meetings.map(m => m._id === id ? result : m));
      
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Update meeting error:', error.message);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete meeting
  const deleteMeeting = async (id) => {
    setLoading(true);
    try {
      console.log('📍 Deleting meeting...', id);
      await meetingAPI.delete(id);
      console.log('✅ Meeting deleted');
      
      // Remove from local state
      setMeetings(meetings.filter(m => m._id !== id));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Delete meeting error:', error.message);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Create summary
  const createSummary = async (summaryData) => {
    setLoading(true);
    try {
      console.log('📍 Creating summary...');
      const result = await summaryAPI.create(summaryData);
      console.log('✅ Summary created');
      
      // Refresh summaries
      await fetchSummaries();
      
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Create summary error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMeetings();
    fetchSummaries();
  }, []);

  // Calculate stats
  const upcomingMeetings = meetings.filter(m => m.status === 'upcoming');
  const completedMeetings = meetings.filter(m => m.status === 'completed');
  const ongoingMeetings = meetings.filter(m => m.status === 'ongoing');

  return {
    // State
    meetings,
    summaries,
    loading,
    error,
    
    // Meetings
    upcomingMeetings,
    completedMeetings,
    ongoingMeetings,
    
    // Fetch functions
    fetchMeetings,
    fetchSummaries,
    
    // Mutation functions
    createMeeting,
    updateMeeting,
    deleteMeeting,
    createSummary
  };
}