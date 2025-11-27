from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import os
from dotenv import load_dotenv

from record_audio import AudioRecorder

load_dotenv()

class JoinGoogleMeet:
    def __init__(self):
        self.mail_address = os.getenv('EMAIL_ID')
        self.password = os.getenv('EMAIL_PASSWORD')
        
        # Chrome options
        opt = Options()
        opt.add_argument('--disable-blink-features=AutomationControlled')
        opt.add_argument('--start-maximized')
        opt.add_argument('--use-fake-ui-for-media-stream')
        opt.add_argument('--disable-infobars')
        opt.add_experimental_option("excludeSwitches", ["enable-automation"])
        opt.add_experimental_option('useAutomationExtension', False)
        
        # Auto-allow mic/camera permissions
        opt.add_experimental_option("prefs", {
            "profile.default_content_setting_values.media_stream_mic": 1,
            "profile.default_content_setting_values.media_stream_camera": 1,
            "profile.default_content_setting_values.geolocation": 1,
            "profile.default_content_setting_values.notifications": 1
        })
        
        self.driver = webdriver.Chrome(options=opt)
        self.wait = WebDriverWait(self.driver, 20)

    def Glogin(self):
        print("[LOGIN] Starting Google login...")
        self.driver.get('https://accounts.google.com/ServiceLogin')
        time.sleep(2)

        try:
            # Email input
            email_input = self.wait.until(
                EC.presence_of_element_located((By.ID, "identifierId"))
            )
            email_input.send_keys(self.mail_address)
            email_input.send_keys(Keys.RETURN)
            time.sleep(3)

            # Password input
            password_input = self.wait.until(
                EC.presence_of_element_located((By.NAME, "Passwd"))
            )
            password_input.send_keys(self.password)
            password_input.send_keys(Keys.RETURN)
            time.sleep(5)
            
            print("[LOGIN] ✅ Gmail login successful")
        except Exception as e:
            print(f"[LOGIN_ERROR] ❌ {str(e)}")

    def joinMeetingWithName(self, meet_link, bot_name="Diva"):
        print(f"[MEET] Navigating to: {meet_link}")
        self.driver.get(meet_link)
        time.sleep(5)
        
        try:
            # 1. Set bot name (if name input exists)
            try:
                name_input = self.wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'input[placeholder*="Your name"]'))
                )
                name_input.clear()
                name_input.send_keys(bot_name)
                print(f"[NAME] ✅ Set name to: {bot_name}")
            except:
                print("[NAME] ℹ️ Name input not found (already logged in)")

            # 2. Turn OFF Microphone (before joining)
            try:
                mic_buttons = self.driver.find_elements(By.CSS_SELECTOR, 'div[data-is-muted="false"]')
                for btn in mic_buttons:
                    aria_label = btn.get_attribute('aria-label')
                    if aria_label and 'microphone' in aria_label.lower():
                        btn.click()
                        print("[MIC] ✅ Microphone turned OFF")
                        time.sleep(1)
                        break
            except Exception as e:
                print(f"[MIC] ⚠️ Could not toggle mic: {e}")

            # 3. Turn OFF Camera (before joining)
            try:
                cam_buttons = self.driver.find_elements(By.CSS_SELECTOR, 'div[data-is-muted="false"]')
                for btn in cam_buttons:
                    aria_label = btn.get_attribute('aria-label')
                    if aria_label and 'camera' in aria_label.lower():
                        btn.click()
                        print("[CAMERA] ✅ Camera turned OFF")
                        time.sleep(1)
                        break
            except Exception as e:
                print(f"[CAMERA] ⚠️ Could not toggle camera: {e}")

            time.sleep(2)

            # 4. Click "Ask to Join" or "Join now" button
            try:
                # Try multiple selectors
                join_selectors = [
                    'button[jsname="Qx7uuf"]',  # Ask to join
                    'button:has-text("Ask to join")',
                    'button:has-text("Join now")',
                    'span:has-text("Ask to join")',
                    'span:has-text("Join now")'
                ]
                
                joined = False
                for selector in join_selectors:
                    try:
                        join_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                        if join_button.is_displayed():
                            join_button.click()
                            print("[JOIN] ✅ Clicked join button")
                            joined = True
                            break
                    except:
                        continue
                
                if not joined:
                    # Try finding by text
                    buttons = self.driver.find_elements(By.TAG_NAME, 'button')
                    for button in buttons:
                        if 'ask to join' in button.text.lower() or 'join now' in button.text.lower():
                            button.click()
                            print("[JOIN] ✅ Clicked join button (found by text)")
                            joined = True
                            break
                
                if not joined:
                    print("[JOIN] ⚠️ Could not find join button")
                    
            except Exception as e:
                print(f"[JOIN_ERROR] ❌ {str(e)}")

            time.sleep(10)  # Wait for meeting to connect
            print("[JOIN] ✅ Successfully joined meeting")
            
        except Exception as e:
            print(f"[MEET_ERROR] ❌ {str(e)}")

    def recordMeeting(self, audio_path, duration):
        """Record meeting audio and keep browser open"""
        print(f"\n{'='*60}")
        print(f"[RECORDING] 🎤 Starting recording")
        print(f"[RECORDING] Duration: {duration} seconds ({duration//60} minutes)")
        print(f"[RECORDING] Audio file: {audio_path}")
        print(f"{'='*60}\n")
        
        # Start audio recording in background
        recorder = AudioRecorder()
        
        try:
            # Record audio (this will block for 'duration' seconds)
            recorder.get_audio(audio_path, duration)
            print(f"\n[RECORDING] ✅ Recording completed!")
            print(f"[AUDIO_SAVED] {audio_path}")
            
        except Exception as e:
            print(f"[RECORDING_ERROR] ❌ {str(e)}")

    def checkIfHostLeft(self):
        """Check if host has left the meeting"""
        try:
            # Check for "Host has ended the meeting" message
            messages = self.driver.find_elements(By.TAG_NAME, 'span')
            for msg in messages:
                if 'host' in msg.text.lower() and ('ended' in msg.text.lower() or 'left' in msg.text.lower()):
                    print("[MEETING] ℹ️ Host has left the meeting")
                    return True
        except:
            pass
        return False

    def leaveMeeting(self):
        """Leave the meeting and close browser"""
        try:
            print("\n[LEAVE] Leaving meeting...")
            
            # Try to find and click leave button
            leave_selectors = [
                'button[aria-label*="Leave call"]',
                'button[aria-label*="Leave meeting"]',
                'button[jsname="CQylAd"]'
            ]
            
            for selector in leave_selectors:
                try:
                    leave_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if leave_button.is_displayed():
                        leave_button.click()
                        print("[LEAVE] ✅ Left meeting")
                        time.sleep(2)
                        break
                except:
                    continue
                    
        except Exception as e:
            print(f"[LEAVE_ERROR] ⚠️ {str(e)}")
        finally:
            time.sleep(2)
            self.driver.quit()
            print("[BROWSER] ✅ Browser closed")

    def AskToJoin(self, audio_path, duration):
        """Main method: Join meeting, record, and leave"""
        try:
            # Join meeting with bot name
            self.joinMeetingWithName(self.driver.current_url, "Diva")
            
            # Record the meeting
            self.recordMeeting(audio_path, duration)
            
            # Check if host left during recording
            if self.checkIfHostLeft():
                print("[MEETING] Host left, ending recording early")
            
            # Leave meeting
            self.leaveMeeting()
            
        except Exception as e:
            print(f"[ERROR] ❌ {str(e)}")
            self.driver.quit()


# For testing
if __name__ == "__main__":
    import tempfile
    
    meet_link = "https://meet.google.com/syb-bvhg-kjv"
    duration = 120  # 2 minutes for testing
    
    temp_dir = tempfile.mkdtemp()
    audio_path = os.path.join(temp_dir, "output.wav")
    
    bot = JoinGoogleMeet()
    bot.Glogin()
    bot.joinMeetingWithName(meet_link, "Diva")
    bot.recordMeeting(audio_path, duration)
    bot.leaveMeeting()