// backend/routes/meetings.js - COMPLETE FIXED VERSION WITH DURATION
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Meeting = require('../models/Meeting');
const Summary = require('../models/Summary');
const User = require('../models/User');
const pythonBot = require('../services/pythonService');
const fs = require('fs');
const path = require('path');

// ✅ GET ALL MEETINGS
router.get('/', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET SINGLE MEETING
router.get('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Not found' });
    if (meeting.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ CREATE MEETING (WITH EXPECTED DURATION)
router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      time, 
      participants, 
      meetingLink, 
      autoJoin, 
      sendReminder,
      expectedDuration // ✅ NEW
    } = req.body;

    const meeting = new Meeting({
      title,
      description,
      date,
      time,
      participants,
      meetingLink,
      autoJoin,
      sendReminder,
      expectedDuration: expectedDuration || 60, // ✅ Default 1 hour
      userId: req.user.id,
      status: 'upcoming'
    });

    await meeting.save();
    console.log(`✅ Meeting created: ${meeting._id} (${expectedDuration || 60} min)`);
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE MEETING
router.put('/:id', auth, async (req, res) => {
  try {
    let meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Not found' });
    if (meeting.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    meeting = await Meeting.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE MEETING
router.delete('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Not found' });
    if (meeting.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ AUTO-JOIN BOT WITH CUSTOM DURATION
router.post('/:id/auto-join', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Not found' });
    if (meeting.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    if (!meeting.meetingLink) return res.status(400).json({ message: 'No link' });

    meeting.status = 'ongoing';
    await meeting.save();

    // ✅ SMART DURATION CALCULATION
    let duration = req.body.duration; // From frontend (in seconds)

    if (!duration) {
      // Fallback: Use expectedDuration from meeting
      if (meeting.expectedDuration) {
        duration = meeting.expectedDuration * 60; // Convert minutes to seconds
      } else {
        // Last fallback: Calculate from meeting time
        const now = new Date();
        const [hours, minutes] = meeting.time.split(':');
        const meetingStartTime = new Date(meeting.date);
        meetingStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        duration = Math.floor((now - meetingStartTime) / 1000);
        
        if (duration < 600) duration = 3600; // If just starting, record 1 hour
        if (duration > 7200) duration = 7200; // Max 2 hours
      }
    }

    // Ensure duration is within limits
    duration = Math.max(300, Math.min(duration, 7200)); // Min 5 min, Max 2 hours

    const user = await User.findById(meeting.userId);
    const botName = user ? user.name : 'MeetMind Bot';

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🤖 AUTO-JOIN TRIGGERED - ${meeting.title}`);
    console.log(`📍 Duration: ${Math.floor(duration/60)} minutes (${duration}s)`);
    console.log(`👤 Bot Name: ${botName}`);
    console.log('='.repeat(70) + '\n');

    res.json({ 
      success: true, 
      message: 'Bot starting', 
      meetingId: meeting._id,
      duration: duration
    });

    // ✅ RUN BOT IN BACKGROUND WITH DURATION
    pythonBot.joinMeeting(meeting.meetingLink, duration, botName)
      .then(async (result) => {
        console.log('✅ Bot completed! Creating summary...');
        
        try {
          // Handle audio
          let audioFilePath = null;
          if (result.audioPath && fs.existsSync(result.audioPath)) {
            const audioDir = path.join(__dirname, '..', 'audio_files');
            if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
            
            const audioFileName = `meeting_${meeting._id}_${Date.now()}.wav`;
            const destPath = path.join(audioDir, audioFileName);
            fs.copyFileSync(result.audioPath, destPath);
            audioFilePath = `/audio/${audioFileName}`;
            console.log(`✅ Audio saved: ${audioFileName}`);
          }

          // Parse key points
          let keyPointsArray = ['Meeting recorded successfully'];
          if (result.keyPoints && result.keyPoints !== 'N/A') {
            const parsed = result.keyPoints
              .split('\n')
              .map(p => p.trim())
              .filter(p => p && p.length > 3 && !p.includes('['));
            if (parsed.length > 0) keyPointsArray = parsed;
          }

          // Parse action items
          let actionItemsArray = [];
          if (result.actionItems && result.actionItems !== 'N/A') {
            const parsed = result.actionItems
              .split('\n')
              .map(a => a.trim())
              .filter(a => a && a.length > 3 && !a.includes('['))
              .map(a => ({ item: a, completed: false }));
            if (parsed.length > 0) actionItemsArray = parsed;
          }

          // ✅ CREATE SUMMARY
          const summary = new Summary({
            meetingId: meeting._id,
            meeting: meeting.title,
            date: meeting.date,
            duration: `${Math.floor(duration / 60)} min`,
            transcript: result.summary ? [{ 
              speaker: 'Bot', 
              text: result.summary, 
              timestamp: new Date().toISOString() 
            }] : [],
            keyPoints: keyPointsArray,
            actionItems: actionItemsArray.length,
            actionItemsList: actionItemsArray,
            transcribed: true,
            audioFilePath: audioFilePath,
            userId: meeting.userId
          });

          await summary.save();
          console.log(`✅ Summary saved: ${summary._id}`);

          meeting.status = 'completed';
          await meeting.save();
          console.log('✅ Meeting marked completed\n');

        } catch (err) {
          console.error('❌ Summary error:', err.message);
          meeting.status = 'completed';
          await meeting.save();
        }
      })
      .catch(async (error) => {
        console.error('❌ Bot failed:', error.message);
        meeting.status = 'upcoming';
        await meeting.save();
      });

  } catch (err) {
    console.error('❌ Route error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ✅ CHECK BOT STATUS
router.get('/bot/status', auth, async (req, res) => {
  try {
    const status = await pythonBot.checkSetup();
    res.json(status);
  } catch (err) {
    res.json({ ready: false, message: err.message });
  }
});

module.exports = router;