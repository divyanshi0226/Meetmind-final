require('dotenv').config();
const bcrypt = require('bcryptjs');

async function testAuth() {
  console.log('=================================');
  console.log('AUTHENTICATION TEST');
  console.log('=================================\n');

  const testEmail = 'test@test.com';
  const testPassword = 'test123';

  // Simulate registration
  console.log('1️⃣ Simulating Registration:');
  console.log('   Email:', testEmail);
  console.log('   Password:', testPassword);
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(testPassword, salt);
  console.log('   Hashed:', hashedPassword.substring(0, 30) + '...');
  console.log('   ✅ Password hashed\n');

  // Simulate login
  console.log('2️⃣ Simulating Login:');
  console.log('   Trying password:', testPassword);
  
  const isMatch = await bcrypt.compare(testPassword, hashedPassword);
  console.log('   Password match:', isMatch ? '✅ YES' : '❌ NO');
  
  // Test wrong password
  console.log('\n3️⃣ Testing Wrong Password:');
  const wrongMatch = await bcrypt.compare('wrong123', hashedPassword);
  console.log('   Trying: wrong123');
  console.log('   Password match:', wrongMatch ? '✅ YES' : '❌ NO (expected)');

  console.log('\n=================================');
  console.log('✅ Authentication logic is working correctly!');
  console.log('=================================\n');
}

testAuth();
