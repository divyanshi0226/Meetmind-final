// test_connection.js
const pythonBot = require('./services/pythonService');

async function test() {
  console.log('🧪 Testing Connection...\n');

  const status = await pythonBot.checkSetup();
  console.log('Bot Status:', status.ready ? '✅ Ready' : '❌ Not Ready');
  console.log('Message:', status.message);
  
  if (status.ready) {
    console.log('\n✅ Everything is connected!');
    console.log('\n📝 Next: Start backend and test with a real meeting');
  } else {
    console.log('\n❌ Please fix the issues above');
  }
}

test();