import sounddevice as sd
from scipy.io.wavfile import write
import os
import numpy as np
from dotenv import load_dotenv

load_dotenv()

class AudioRecorder:
    def __init__(self):
        self.sample_rate = int(os.getenv('SAMPLE_RATE', 44100))
        
    def list_audio_devices(self):
        """List all available audio devices for debugging"""
        print("\n[AUDIO_DEVICES] Available devices:")
        devices = sd.query_devices()
        for i, device in enumerate(devices):
            if device['max_input_channels'] > 0:
                print(f"  [{i}] {device['name']} - Input channels: {device['max_input_channels']}")
        print()
    
    def find_stereo_mix_device(self):
        """Find Stereo Mix or similar device"""
        devices = sd.query_devices()
        
        # Search for Stereo Mix
        for i, device in enumerate(devices):
            name = device['name'].lower()
            if device['max_input_channels'] > 0:
                if 'stereo mix' in name or 'wave out' in name or 'what u hear' in name:
                    print(f"[AUDIO_DEVICE] Found: {device['name']} (ID: {i})")
                    return i
        
        print("[AUDIO_DEVICE] Using default input device")
        return None
    
    def get_audio(self, filename, duration):
        try:
            print(f"\n{'='*60}")
            print(f"[RECORDING] Starting audio capture")
            print(f"{'='*60}")
            
            # List available devices
            self.list_audio_devices()
            
            # Find Stereo Mix device
            input_device = self.find_stereo_mix_device()
            
            if input_device is None:
                print("[WARNING] Stereo Mix not found! Using default device.")
                print("[WARNING] Audio may not capture meeting sound!")
            
            print(f"[RECORDING] Duration: {duration} seconds ({duration//60}m {duration%60}s)")
            print(f"[RECORDING] Sample rate: {self.sample_rate} Hz")
            print(f"[RECORDING] File: {filename}")
            print(f"\n[RECORDING] Recording started... Please wait...")
            
            # Record audio
            recording = sd.rec(
                int(duration * self.sample_rate), 
                samplerate=self.sample_rate, 
                channels=2,
                dtype='int16',
                device=input_device
            )
            
            # Wait for recording to complete
            sd.wait()
            
            print(f"\n[RECORDING] Recording completed!")
            
            # Check audio level
            audio_level = np.max(np.abs(recording))
            print(f"[AUDIO_LEVEL] Peak level: {audio_level}")
            
            if audio_level < 100:
                print("[WARNING] ⚠️ Audio level is very low!")
                print("[WARNING] Possible issues:")
                print("  1. Stereo Mix not enabled properly")
                print("  2. No sound playing during recording")
                print("  3. System volume too low")
            else:
                print(f"[SUCCESS] ✅ Good audio level detected!")
            
            # Save to WAV file
            write(filename, self.sample_rate, recording)
            
            # Get file size
            file_size = os.path.getsize(filename) / (1024 * 1024)  # MB
            print(f"[FILE] Saved: {filename}")
            print(f"[FILE] Size: {file_size:.2f} MB")
            print(f"{'='*60}\n")
            
        except Exception as e:
            print(f"\n[RECORDING_ERROR] ❌ {str(e)}")
            print(f"[RECORDING_ERROR] This usually means:")
            print(f"  1. Stereo Mix is not enabled")
            print(f"  2. Audio device is in use by another application")
            print(f"  3. Permissions issue")