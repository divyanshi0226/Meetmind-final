require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./models/User');

async function debugUsers() {
  try {
    // Connect to database
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    console.log('=================================');
    console.log('DATABASE DEBUG TOOL');
    console.log('=================================\n');

    // Get all users
    const users = await User.find({});

    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('👉 Try registering a user first\n');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log('  Name:', user.name);
        console.log('  Email:', user.email);
        console.log('  Password (hashed):', user.password.substring(0, 20) + '...');
        console.log('  Created:', user.createdAt);
        console.log('');
      });
    }

    await mongoServer.stop();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugUsers();
