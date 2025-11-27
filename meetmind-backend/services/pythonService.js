// backend/services/pythonService.js - COMPLETE FIXED VERSION
const { spawn } = require('child_process');
const path = require('path');

class PythonBotService {
  constructor() {
    this.pythonBotPath = path.join(__dirname, '..', '..', 'Google-Meet-Bot');
    this.venvPython = path.join(this.pythonBotPath, 'venv', 'Scripts', 'python.exe');
    
    console.log('🤖 Python Bot Service initialized');
    console.log('📂 Bot folder:', this.pythonBotPath);
    console.log('🐍 Python exe:', this.venvPython);
  }

  // UPDATED: Now accepts botName parameter
  async joinMeeting(meetLink, durationInSeconds = 60, botName = 'MeetMind Bot') {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║       🤖 STARTING PYTHON BOT            ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('📍 Meeting Link:', meetLink);
    console.log('⏱️  Duration:', durationInSeconds, 'seconds');
    console.log('👤 Bot Name:', botName);
    console.log('⏰ Started at:', new Date().toLocaleTimeString());
    console.log();

    return new Promise((resolve, reject) => {
      const cliPath = path.join(this.pythonBotPath, 'cli.py');
      
      // UPDATED: Added --bot-name argument
      const args = [
        cliPath,
        '--meet-link', meetLink,
        '--duration', durationInSeconds.toString(),
        '--bot-name', botName
      ];

      console.log('🔧 Command:', this.venvPython);
      console.log('📄 Script:', cliPath);
      console.log('📋 Args:', args.slice(1).join(' '));
      console.log('\n' + '─'.repeat(60));
      console.log('BOT OUTPUT:');
      console.log('─'.repeat(60) + '\n');

      const pythonProcess = spawn(this.venvPython, args, {
        cwd: this.pythonBotPath,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1'
        }
      });

      let output = '';
      let errorOutput = '';
      let audioPath = null;
      let summary = null;
      let keyPoints = null;
      let actionItems = null;

      pythonProcess.stdout.on('data', (data) => {
        const text = data.toString();
        console.log(text.trim());
        output += text;

        // IMPROVED: Better parsing - check each line
        const lines = text.split('\n');
        lines.forEach(line => {
          const trimmedLine = line.trim();
          
          if (trimmedLine.includes('[AUDIO_PATH]')) {
            audioPath = trimmedLine.split('[AUDIO_PATH]')[1].trim();
            console.log('✅ Extracted audio path:', audioPath);
          }
          
          if (trimmedLine.includes('[SUMMARY]')) {
            summary = trimmedLine.split('[SUMMARY]')[1].trim();
            console.log('✅ Extracted summary');
          }
          
          if (trimmedLine.includes('[KEY_POINTS]')) {
            keyPoints = trimmedLine.split('[KEY_POINTS]')[1].trim();
            console.log('✅ Extracted key points');
          }
          
          if (trimmedLine.includes('[ACTION_ITEMS]')) {
            actionItems = trimmedLine.split('[ACTION_ITEMS]')[1].trim();
            console.log('✅ Extracted action items');
          }
        });
      });

      pythonProcess.stderr.on('data', (data) => {
        const text = data.toString();
        console.error('⚠️ ', text.trim());
        errorOutput += text;
      });

      pythonProcess.on('close', (code) => {
        console.log('\n' + '─'.repeat(60));
        console.log('🏁 Bot process finished');
        console.log('⏰ Finished at:', new Date().toLocaleTimeString());
        console.log('📊 Exit code:', code);
        console.log('─'.repeat(60) + '\n');
        
        if (code === 0) {
          console.log('✅ SUCCESS! Meeting recorded and transcribed\n');
          resolve({ 
            success: true, 
            output,
            audioPath,
            summary,
            keyPoints,
            actionItems,
            exitCode: code
          });
        } else {
          console.error('❌ FAILED! Bot exited with error\n');
          reject(new Error(`Bot failed with exit code ${code}. ${errorOutput || 'Check console.'}`));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('\n❌ SPAWN ERROR!');
        console.error('Failed to start Python process');
        console.error('Error:', error.message);
        reject(new Error(`Cannot start Python: ${error.message}`));
      });
    });
  }

  async checkSetup() {
    const fs = require('fs');
    
    try {
      console.log('\n🔍 Checking Python Bot Setup...\n');
      
      if (!fs.existsSync(this.pythonBotPath)) {
        return { 
          ready: false, 
          message: `Google-Meet-Bot folder not found at: ${this.pythonBotPath}` 
        };
      }
      console.log('✅ Bot folder exists');
      
      const cliPath = path.join(this.pythonBotPath, 'cli.py');
      if (!fs.existsSync(cliPath)) {
        return { 
          ready: false, 
          message: 'cli.py not found. Create it in Google-Meet-Bot folder.' 
        };
      }
      console.log('✅ cli.py found');
      
      if (!fs.existsSync(this.venvPython)) {
        return { 
          ready: false, 
          message: 'Virtual environment not found. Run: python -m venv venv' 
        };
      }
      console.log('✅ Virtual environment found');
      
      const envPath = path.join(this.pythonBotPath, '.env');
      if (!fs.existsSync(envPath)) {
        return { 
          ready: false, 
          message: '.env file not found. Create it with your credentials.' 
        };
      }
      console.log('✅ .env file found');

      const requiredFiles = [
        'join_google_meet.py',
        'record_audio.py',
        'speech_to_text.py'
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(this.pythonBotPath, file);
        if (!fs.existsSync(filePath)) {
          return {
            ready: false,
            message: `Missing required file: ${file}`
          };
        }
      }
      console.log('✅ All Python modules found');

      console.log('\n🎉 All checks passed! Bot is ready.\n');
      return { 
        ready: true, 
        message: 'Python bot is ready to use!' 
      };
      
    } catch (error) {
      console.error('❌ Setup check failed:', error.message);
      return { 
        ready: false, 
        message: `Setup check error: ${error.message}` 
      };
    }
  }

  async testPython() {
    return new Promise((resolve) => {
      const testProcess = spawn(this.venvPython, ['--version']);
      
      testProcess.on('close', (code) => {
        resolve(code === 0);
      });

      testProcess.on('error', () => {
        resolve(false);
      });
    });
  }
}

module.exports = new PythonBotService();