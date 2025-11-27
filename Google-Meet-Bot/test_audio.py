import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write

# Test Stereo Mix
print("Testing Stereo Mix recording...")
print("Playing YouTube or music in background for 5 seconds...")
print("Recording will start in 3 seconds...")

import time
time.sleep(3)

sample_rate = 44100
duration = 5  # 5 seconds

print("Recording NOW... (play some audio)")
recording = sd.rec(int(duration * sample_rate), 
                   samplerate=sample_rate, 
                   channels=2, 
                   dtype='int16')
sd.wait()

print("Recording complete!")

# Check level
level = np.max(np.abs(recording))
print(f"Audio level: {level}")

if level < 100:
    print("❌ NO AUDIO DETECTED!")
    print("Stereo Mix may not be working")
else:
    print("✅ AUDIO DETECTED!")
    write("test_recording.wav", sample_rate, recording)
    print("Saved as test_recording.wav - Play it to verify!")