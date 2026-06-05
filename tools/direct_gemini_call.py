from dotenv import load_dotenv
load_dotenv('backend/.env')
import os, sys, requests
sys.path.append('.')
from backend.services import chat_ai_service as svc

model = os.getenv('GEMINI_MODEL')
key = os.getenv('GEMINI_API_KEY')
endpoint = f'https://generativelanguage.googleapis.com/v1/models/{model}:generateText?key={key}'
print('Endpoint:', endpoint)
body = {"prompt": {"text": "What foods should a diabetic patient avoid?"}, "temperature": 0.2, "maxOutputTokens": 200}
try:
    r = requests.post(endpoint, json=body, timeout=15)
    print('Status:', r.status_code)
    print('Response body:', r.text)
except Exception as e:
    print('Exception:', e)
