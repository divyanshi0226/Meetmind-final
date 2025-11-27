import argparse
import os
import tempfile
import sys

from join_google_meet import JoinGoogleMeet
from speech_to_text import SpeechToText


def main():
    if sys.platform == 'win32':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except:
            pass
    
    parser = argparse.ArgumentParser(description="Join Google Meet, record, and transcribe")
    parser.add_argument("--meet-link", dest="meet_link", required=True, help="Google Meet link")
    parser.add_argument("--duration", dest="duration", type=int, default=60, help="Recording duration in seconds")
    parser.add_argument("--bot-name", dest="bot_name", default="MeetMind Bot", help="Bot display name")
    args = parser.parse_args()

    temp_dir = tempfile.mkdtemp()
    audio_path = os.path.join(temp_dir, "output.wav")
    
    # CRITICAL: Print audio path FIRST (so backend can capture it)
    print(f"[AUDIO_PATH] {audio_path}", flush=True)
    print(f"[BOT_NAME] {args.bot_name}", flush=True)
    print(f"[DURATION] {args.duration} seconds", flush=True)

    try:
        # Join meeting and record
        bot = JoinGoogleMeet()
        bot.Glogin()
        bot.joinMeetingWithName(args.meet_link, args.bot_name)  # Use user's name
        bot.recordMeeting(audio_path, args.duration)
        
        # Check if host left
        if bot.checkIfHostLeft():
            print("[INFO] Host left, ending session", flush=True)
        
        bot.leaveMeeting()

        # Verify audio file exists
        if not os.path.exists(audio_path):
            print(f"[ERROR] Audio file not created at {audio_path}", flush=True)
            print("[SUMMARY] Recording failed - no audio file", flush=True)
            print("[KEY_POINTS] N/A", flush=True)
            print("[ACTION_ITEMS] N/A", flush=True)
            sys.exit(1)
        
        file_size = os.path.getsize(audio_path) / (1024 * 1024)
        print(f"[AUDIO_FILE_SIZE] {file_size:.2f} MB", flush=True)

        # Transcribe and analyze
        print("\n[TRANSCRIPTION] Starting AI analysis...", flush=True)
        try:
            stt = SpeechToText()
            result = stt.transcribe(audio_path)
            
            print("\n" + "="*60, flush=True)
            print("[TRANSCRIPTION_COMPLETE]", flush=True)
            print("="*60, flush=True)
            
            # IMPORTANT: Print each field on separate line with marker
            summary_text = result.get('abstract_summary', 'N/A')
            print(f"[SUMMARY] {summary_text}", flush=True)
            
            key_points_text = result.get('key_points', 'N/A')
            print(f"[KEY_POINTS] {key_points_text}", flush=True)
            
            action_items_text = result.get('action_items', 'N/A')
            print(f"[ACTION_ITEMS] {action_items_text}", flush=True)
            
            print("="*60, flush=True)
            
        except Exception as e:
            print(f"[TRANSCRIPTION_ERROR] {str(e)}", flush=True)
            print(f"[SUMMARY] Transcription failed but audio was recorded", flush=True)
            print(f"[KEY_POINTS] Audio recording available", flush=True)
            print(f"[ACTION_ITEMS] Check audio file for details", flush=True)
        
        print("[PROCESS_COMPLETE] Bot finished successfully", flush=True)
        
    except Exception as e:
        print(f"[ERROR] Bot execution failed: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
