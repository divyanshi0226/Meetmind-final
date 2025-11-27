const cron = require('node-cron');
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const { sendMeetingReminder } = require('./emailService');

// Add to schedulerService.js
const updateMeetingStatuses = () => {
  cron.schedule('*/5 * * * *', async () => { // Every 5 minutes
    try {
      const now = new Date();
      
      // Mark meetings as completed if past end time
      await Meeting.updateMany(
        { 
          status: 'ongoing',
          // Add endTime field to schema or calculate from duration
        },
        { status: 'completed' }
      );
      
    } catch (error) {
      console.error('Status update error:', error);
    }
  });
};
// Check every minute for meetings that need reminders
const startReminderScheduler = () => {
  // Run every minute: '* * * * *'
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);

      // Find meetings starting in 10 minutes that have reminders enabled
      const meetings = await Meeting.find({
        status: 'upcoming',
        sendReminder: true,
        reminderSent: false
      }).populate('userId');


      for (const meeting of meetings) {
        const [hours, minutes] = meeting.time.split(':');
        const meetingDateTime = new Date(meeting.date);
        meetingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const timeDiff = meetingDateTime - now;

        // 9-11 minute window
        if (timeDiff >= 540000 && timeDiff <= 660000) {
          if (meeting.userId) {
            const result = await sendMeetingReminder(
              meeting.userId.email, 
              meeting.userId.name, 
              meeting
            );
            
            if (result.success) {
              meeting.reminderSent = true;
              await meeting.save();
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Reminder scheduler error:', error);
    }
  });

  console.log('📧 Reminder scheduler started');
};

module.exports = { startReminderScheduler };
