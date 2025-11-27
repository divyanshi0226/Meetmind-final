# test_bot.py
import os
from dotenv import load_dotenv

load_dotenv()

print("Testing configuration...")
print(f"Email: {os.getenv('EMAIL_ID')}")
print(f"Password length: {len(os.getenv('EMAIL_PASSWORD', ''))} chars")
print(f"OpenAI key length: {len(os.getenv('OPENAI_API_KEY', ''))} chars")

if os.getenv('EMAIL_ID') and os.getenv('EMAIL_PASSWORD') and os.getenv('OPENAI_API_KEY'):
    print("✅ Configuration looks good!")
else:
    print("❌ Some values are missing in .env file")