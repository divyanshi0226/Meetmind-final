# speech_to_text.py - FIXED VERSION WITH BETTER ERROR HANDLING
from openai import OpenAI
import json
import os
import subprocess
import tempfile
import datetime
from dotenv import load_dotenv

load_dotenv()

class SpeechToText:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("❌ OPENAI_API_KEY not found in .env file")
            
        self.client = OpenAI(api_key=api_key)
        self.MAX_AUDIO_SIZE_BYTES = int(os.getenv('MAX_AUDIO_SIZE_BYTES', 20 * 1024 * 1024))
        self.GPT_MODEL = os.getenv('GPT_MODEL', 'gpt-4')
        self.WHISPER_MODEL = os.getenv('WHISPER_MODEL', 'whisper-1')
        
        print(f"✅ OpenAI initialized")
        print(f"   GPT Model: {self.GPT_MODEL}")
        print(f"   Whisper Model: {self.WHISPER_MODEL}")

    def get_file_size(self, file_path):
        return os.path.getsize(file_path)

    def get_audio_duration(self, audio_file_path):
        """Get audio duration using ffprobe"""
        try:
            result = subprocess.run(
                ['ffprobe', '-i', audio_file_path, '-show_entries', 
                 'format=duration', '-v', 'quiet', '-of', 'csv=p=0'], 
                stdout=subprocess.PIPE, 
                stderr=subprocess.STDOUT,
                timeout=10,
                check=False
            )
            duration = float(result.stdout.decode('utf-8').strip())
            print(f"📊 Audio duration: {duration:.2f} seconds ({duration/60:.2f} minutes)")
            return duration
        except Exception as e:
            print(f"⚠️ Could not get audio duration: {e}")
            return 0

    def resize_audio_if_needed(self, audio_file_path):
        """Compress audio if it exceeds size limit"""
        audio_size = self.get_file_size(audio_file_path)
        print(f"📦 Audio file size: {audio_size / (1024*1024):.2f} MB")
        
        if audio_size > self.MAX_AUDIO_SIZE_BYTES:
            print(f"⚠️ File too large! Compressing...")
            current_duration = self.get_audio_duration(audio_file_path)
            if current_duration <= 0:
                return audio_file_path
                
            target_duration = current_duration * self.MAX_AUDIO_SIZE_BYTES / audio_size
            
            temp_dir = tempfile.mkdtemp()
            print(f"📂 Temp dir: {temp_dir}")
            
            compressed_audio_path = os.path.join(
                temp_dir, 
                f'compressed_audio_{datetime.datetime.now().strftime("%Y%m%d%H%M%S")}.wav'
            )
            
            try:
                subprocess.run(
                    ['ffmpeg', '-i', audio_file_path, '-ss', '0', 
                     '-t', str(target_duration), compressed_audio_path],
                    timeout=60,
                    check=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                print(f"✅ Compressed to {target_duration:.2f} seconds")
                return compressed_audio_path
            except Exception as e:
                print(f"⚠️ Compression failed: {e}")
                return audio_file_path
        
        print("✅ File size OK, no compression needed")
        return audio_file_path

    def transcribe_audio(self, audio_file_path):
        """Transcribe audio using OpenAI Whisper"""
        try:
            print(f"\n{'='*60}")
            print("🎤 STARTING TRANSCRIPTION")
            print(f"{'='*60}")
            print(f"📁 File: {audio_file_path}")
            print(f"📦 Size: {self.get_file_size(audio_file_path) / (1024*1024):.2f} MB")
            
            with open(audio_file_path, 'rb') as audio_file:
                print("🔄 Sending to OpenAI Whisper API...")
                
                # ✅ USE 'transcriptions' NOT 'translations'
                transcript = self.client.audio.transcriptions.create(
                    file=audio_file,
                    model=self.WHISPER_MODEL,
                    response_format="text",
                    language="en"  # Specify English
                )
                
                print("✅ Transcription completed!")
                print(f"📝 Length: {len(transcript)} characters")
                print(f"{'='*60}\n")
                
                return transcript
                
        except Exception as e:
            print(f"\n❌ TRANSCRIPTION ERROR!")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            print(f"{'='*60}\n")
            return None

    def abstract_summary_extraction(self, transcription):
        """Generate summary using GPT"""
        try:
            print("📊 Generating summary...")
            response = self.client.chat.completions.create(
                model=self.GPT_MODEL,
                temperature=0,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the following text and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points."
                    },
                    {
                        "role": "user",
                        "content": transcription
                    }
                ]
            )
            print("✅ Summary generated")
            return response.choices[0].message.content
        except Exception as e:
            print(f"❌ Summary error: {e}")
            return "Summary unavailable due to processing error."

    def key_points_extraction(self, transcription):
        """Extract key points using GPT"""
        try:
            print("🔑 Extracting key points...")
            response = self.client.chat.completions.create(
                model=self.GPT_MODEL,
                temperature=0,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a proficient AI with a specialty in distilling information into key points. Based on the following text, identify and list the main points that were discussed or brought up. These should be the most important ideas, findings, or topics that are crucial to the essence of the discussion. Your goal is to provide a list that someone could read to quickly understand what was talked about."
                    },
                    {
                        "role": "user",
                        "content": transcription
                    }
                ]
            )
            print("✅ Key points extracted")
            return response.choices[0].message.content
        except Exception as e:
            print(f"❌ Key points error: {e}")
            return "Key points unavailable due to processing error."

    def action_item_extraction(self, transcription):
        """Extract action items using GPT"""
        try:
            print("✅ Extracting action items...")
            response = self.client.chat.completions.create(
                model=self.GPT_MODEL,
                temperature=0,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI expert in analyzing conversations and extracting action items. Please review the text and identify any tasks, assignments, or actions that were agreed upon or mentioned as needing to be done. These could be tasks assigned to specific individuals, or general actions that the group has decided to take. Please list these action items clearly and concisely."
                    },
                    {
                        "role": "user",
                        "content": transcription
                    }
                ]
            )
            print("✅ Action items extracted")
            return response.choices[0].message.content
        except Exception as e:
            print(f"❌ Action items error: {e}")
            return "Action items unavailable due to processing error."

    def sentiment_analysis(self, transcription):
        """Analyze sentiment using GPT"""
        try:
            print("😊 Analyzing sentiment...")
            response = self.client.chat.completions.create(
                model=self.GPT_MODEL,
                temperature=0,
                messages=[
                    {
                        "role": "system",
                        "content": "As an AI with expertise in language and emotion analysis, your task is to analyze the sentiment of the following text. Please consider the overall tone of the discussion, the emotion conveyed by the language used, and the context in which words and phrases are used. Indicate whether the sentiment is generally positive, negative, or neutral, and provide brief explanations for your analysis where possible."
                    },
                    {
                        "role": "user",
                        "content": transcription
                    }
                ]
            )
            print("✅ Sentiment analyzed")
            return response.choices[0].message.content
        except Exception as e:
            print(f"❌ Sentiment error: {e}")
            return "Neutral (analysis unavailable)"

    def meeting_minutes(self, transcription):
        """Generate complete meeting minutes"""
        print(f"\n{'='*60}")
        print("📋 GENERATING MEETING ANALYSIS")
        print(f"{'='*60}\n")
        
        abstract_summary = self.abstract_summary_extraction(transcription)
        key_points = self.key_points_extraction(transcription)
        action_items = self.action_item_extraction(transcription)
        sentiment = self.sentiment_analysis(transcription)
        
        print(f"\n{'='*60}")
        print("✅ ANALYSIS COMPLETE")
        print(f"{'='*60}\n")
        
        return {
            'abstract_summary': abstract_summary,
            'key_points': key_points,
            'action_items': action_items,
            'sentiment': sentiment
        }

    def store_in_json_file(self, data):
        """Save meeting data to JSON file"""
        try:
            temp_dir = tempfile.mkdtemp()
            file_path = os.path.join(
                temp_dir, 
                f'meeting_data_{datetime.datetime.now().strftime("%Y%m%d%H%M%S")}.json'
            )
            print(f"💾 Saving JSON: {file_path}")
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print("✅ JSON saved successfully")
        except Exception as e:
            print(f"❌ JSON save error: {e}")

    def _create_fallback_summary(self, reason):
        """Create a basic summary when transcription fails"""
        return {
            'abstract_summary': f'Meeting was recorded. {reason}',
            'key_points': '1. Meeting audio recorded\n2. Transcription unavailable\n3. Audio playback available',
            'action_items': 'No action items detected',
            'sentiment': 'Neutral'
        }

    def transcribe(self, audio_file_path):
        """Main transcription workflow"""
        try:
            print(f"\n{'='*70}")
            print("🚀 STARTING TRANSCRIPTION WORKFLOW")
            print(f"{'='*70}\n")
            
            # Check file exists
            if not os.path.exists(audio_file_path):
                print(f"❌ Audio file not found: {audio_file_path}")
                return self._create_fallback_summary("Audio file not found")
            
            file_size = os.path.getsize(audio_file_path)
            if file_size < 1000:  # Less than 1KB
                print(f"⚠️ Audio file too small ({file_size} bytes)")
                return self._create_fallback_summary("Audio file too small")
            
            print(f"✅ Audio file found: {file_size / (1024*1024):.2f} MB")
            
            # Resize if needed
            audio_file_path = self.resize_audio_if_needed(audio_file_path)
            
            # Transcribe
            transcription = self.transcribe_audio(audio_file_path)
            
            if not transcription or len(transcription.strip()) == 0:
                print("⚠️ No transcription - no speech detected")
                return self._create_fallback_summary("No speech detected in recording")
            
            print(f"✅ Transcription successful: {len(transcription)} characters")
            print(f"📝 First 200 chars: {transcription[:200]}...")
            
            # Generate summary
            summary = self.meeting_minutes(transcription)
            self.store_in_json_file(summary)
            
            print(f"\n{'='*70}")
            print("🎉 TRANSCRIPTION WORKFLOW COMPLETE")
            print(f"{'='*70}\n")
            
            return summary
            
        except Exception as e:
            print(f"\n{'='*70}")
            print("❌ TRANSCRIPTION WORKFLOW FAILED")
            print(f"{'='*70}")
            print(f"Error: {str(e)}")
            import traceback
            traceback.print_exc()
            print(f"{'='*70}\n")
            return self._create_fallback_summary(f"Transcription error: {str(e)}")