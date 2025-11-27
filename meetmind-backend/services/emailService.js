const nodemailer = require('nodemailer');

// Add this to debug
console.log('📧 Email config check:');
console.log('  EMAIL_USER:', process.env.EMAIL_USER ? '✅ Found' : '❌ Missing');
console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Found' : '❌ Missing');


// Create email transporter
// Your Gmail is used as the SENDER (from address)
// Emails are SENT TO each user's email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // YOUR Gmail (the sender)
    pass: process.env.EMAIL_PASS // Your app password
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('📧 Email service error:', error.message);
  } else {
    console.log('📧 Email service ready');
  }
});


// Send meeting reminder to a user
const sendMeetingReminder = async (userEmail, userName, meeting) => {
  const mailOptions = {
    from: `MeetMind <${process.env.EMAIL_USER}>`, // FROM: Your Gmail
    to: userEmail, // TO: User's email address
    subject: `⏰ Reminder: ${meeting.title} in 10 minutes`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .meeting-card { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .meeting-card h2 { margin-top: 0; color: #1f2937; }
          .detail { margin: 10px 0; }
          .detail strong { color: #374151; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
          .btn:hover { background: #1d4ed8; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; padding: 20px; }
          .alert { background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 MeetMind Reminder</h1>
          </div>
          
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <div class="alert">
              <strong>⚡ Your meeting is starting in 10 minutes!</strong>
            </div>
            
            <div class="meeting-card">
              <h2>${meeting.title}</h2>
              <div class="detail"><strong>📅 Date:</strong> ${meeting.date}</div>
              <div class="detail"><strong>🕐 Time:</strong> ${meeting.time}</div>
              ${meeting.description ? `<div class="detail"><strong>📝 Description:</strong> ${meeting.description}</div>` : ''}
              ${meeting.participants ? `<div class="detail"><strong>👥 Participants:</strong> ${meeting.participants} people</div>` : ''}
            </div>
            
            ${meeting.meetingLink ? `
              <div style="text-align: center;">
                <a href="${meeting.meetingLink}" class="btn">
                  🚀 Join Meeting Now
                </a>
              </div>
            ` : `
              <p style="text-align: center; color: #6b7280;">
                📱 Join through your MeetMind dashboard
              </p>
            `}
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              💡 <strong>Tip:</strong> MeetMind will auto-record and transcribe your meeting!
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated reminder from MeetMind</p>
            <p>You're receiving this because you created this meeting</p>
            <p style="font-size: 12px; color: #9ca3af;">
              © ${new Date().getFullYear()} MeetMind - Your AI Meeting Co-Pilot
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reminder sent to ${userEmail} for meeting: ${meeting.title}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending email to ${userEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send welcome email to new user
const sendWelcomeEmail = async (userEmail, userName) => {
  const mailOptions = {
    from: `MeetMind <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: '🎉 Welcome to MeetMind!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px; border-radius: 10px 10px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 32px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .feature { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
          .feature h3 { margin-top: 0; color: #1f2937; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to MeetMind!</h1>
          </div>
          
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>Welcome to MeetMind - your AI-powered meeting assistant! 🚀</p>
            
            <p>We're excited to help you make your meetings more productive with:</p>
            
            <div class="feature">
              <h3>🎤 Real-Time Transcription</h3>
              <p>Automatically convert speech to text during your meetings</p>
            </div>
            
            <div class="feature">
              <h3>🤖 Auto-Join Meetings</h3>
              <p>Never miss a meeting - get notified and join automatically</p>
            </div>
            
            <div class="feature">
              <h3>📊 Smart Summaries</h3>
              <p>Get AI-generated summaries with key points and action items</p>
            </div>
            
            <div class="feature">
              <h3>📧 Email Reminders</h3>
              <p>Receive reminders 10 minutes before each meeting</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/dashboard" class="btn">
                🚀 Go to Dashboard
              </a>
            </div>
            
            <p style="margin-top: 30px; color: #6b7280;">
              Need help? Just reply to this email and we'll assist you!
            </p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing MeetMind!</p>
            <p style="font-size: 12px; color: #9ca3af;">
              © ${new Date().getFullYear()} MeetMind - Your AI Meeting Co-Pilot
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${userEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send meeting summary after meeting ends
const sendMeetingSummary = async (userEmail, userName, meeting, summary) => {
  const mailOptions = {
    from: `MeetMind <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `📊 Meeting Summary: ${meeting.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .summary-card { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .action-item { background: white; padding: 12px; margin: 10px 0; border-left: 4px solid #059669; border-radius: 4px; }
          .key-point { background: white; padding: 12px; margin: 10px 0; border-left: 4px solid #7c3aed; border-radius: 4px; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Meeting Summary</h1>
          </div>
          
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>Here's your meeting summary:</p>
            
            <div class="summary-card">
              <h2 style="margin-top: 0;">${meeting.title}</h2>
              <p><strong>Date:</strong> ${meeting.date}</p>
              <p><strong>Duration:</strong> ${summary.duration || 'N/A'}</p>
            </div>
            
            ${summary.keyPoints && summary.keyPoints.length > 0 ? `
              <h3>🔑 Key Points</h3>
              ${summary.keyPoints.map(point => `
                <div class="key-point">${point}</div>
              `).join('')}
            ` : ''}
            
            ${summary.actionItemsList && summary.actionItemsList.length > 0 ? `
              <h3>✅ Action Items</h3>
              ${summary.actionItemsList.map(item => `
                <div class="action-item">
                  ${item.completed ? '✅' : '⬜'} ${item.text}
                </div>
              `).join('')}
            ` : ''}
            
            <p style="margin-top: 30px; text-align: center;">
              <a href="http://localhost:3000/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                View Full Summary
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>Meeting recorded and transcribed by MeetMind</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Summary sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending summary to ${userEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { 
  sendMeetingReminder, 
  sendWelcomeEmail,
  sendMeetingSummary 
};


