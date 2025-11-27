require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('=================================');
console.log('EMAIL CONFIGURATION TEST');
console.log('=================================');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length, 'characters');
console.log('EMAIL_PASSWORD (first 4 chars):', process.env.EMAIL_PASSWORD?.substring(0, 4) + '...');
console.log('=================================\n');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const testEmail = async () => {
  try {
    console.log('📧 Sending test email...\n');
    
    const info = await transporter.sendMail({
      from: `MeetMind Test <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '✅ MeetMind Email Test - SUCCESS!',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center;">
            <h1>🎉 Email Setup Successful!</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2>Test Results:</h2>
            <p>✅ Gmail connection: <strong>Working</strong></p>
            <p>✅ App password: <strong>Valid</strong></p>
            <p>✅ Email sending: <strong>Successful</strong></p>
            <hr style="margin: 20px 0;">
            <p>Your MeetMind email system is ready to use!</p>
            <p><small>From: ${process.env.EMAIL_USER}</small></p>
          </div>
        </div>
      `
    });
    
    console.log('✅ SUCCESS! Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('\n🎉 Check your Gmail inbox:', process.env.EMAIL_USER);
    console.log('(Check spam folder if not in inbox)\n');
    
  } catch (error) {
    console.error('\n❌ ERROR sending email:');
    console.error('Error message:', error.message);
    console.error('\nCommon fixes:');
    console.error('1. Check EMAIL_USER is full email: yourname@gmail.com');
    console.error('2. Check EMAIL_PASSWORD is 16-char app password (no spaces)');
    console.error('3. Enable 2-Step Verification on Gmail');
    console.error('4. Generate NEW app password');
    console.error('5. Make sure no quotes around values in .env\n');
  }
};

testEmail();
