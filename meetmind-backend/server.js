// backend/server.js - MONGODB ONLY
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { startReminderScheduler } = require('./services/schedulerService');

const app = express();

// ✅ CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

console.log('\n' + '='.repeat(60));
console.log('🚀 MeetMind Backend Starting');
console.log('='.repeat(60) + '\n');

// ✅ CREATE DIRECTORIES
const audioDir = path.join(__dirname, 'audio_files');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
  console.log(`📁 Created audio directory`);
}

app.use('/audio', express.static(audioDir));

// ✅ CONNECT TO MONGODB
async function connectDB() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI not set in .env');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}\n`);
    
    // Start scheduler
    try {
      startReminderScheduler();
      console.log('📧 Reminder scheduler started\n');
    } catch (e) {
      console.warn('⚠️ Scheduler not started\n');
    }
    
    return true;
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  }
}

connectDB();

// ✅ ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/summaries', require('./routes/summaries'));

// ✅ HEALTH CHECK
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ MeetMind API Running',
    database: mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'
  });
});

// ✅ ERROR HANDLING
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ message: err.message });
});

app.use((req, res) => {
  res.status(404).json({ message: '❌ Route not found' });
});

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`✅ Server Ready on http://localhost:${PORT}`);
  console.log('='.repeat(60) + '\n');
});

process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down...');
  await mongoose.connection.close();
  server.close(() => process.exit(0));
});