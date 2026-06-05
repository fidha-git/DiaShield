from dotenv import load_dotenv
# Try loading project root .env then backend/.env explicitly
load_dotenv()
load_dotenv('backend/.env')
import sys
sys.path.append('.')
import backend.services.chat_ai_service as svc
import requests
import sys

print('KEY_PRESENT', bool(svc.GEMINI_API_KEY))
print('MODEL', svc.GEMINI_MODEL)

if not svc.GEMINI_API_KEY:
    sys.exit(0)

endpoint = f'https://generativelanguage.googleapis.com/v1beta2/models/{svc.GEMINI_MODEL}:generateText?key={svc.GEMINI_API_KEY}'
body = {'prompt':{'text':'Test prompt'}, 'temperature':0.2, 'maxOutputTokens':20}
try:
    r = requests.post(endpoint, json=body, timeout=15)
    print('STATUS', r.status_code)
    print('TEXT_SNIPPET', r.text[:800])
except Exception as e:
    print('EXC', e)

    # Also try v1 endpoint path
    try:
        endpoint_v1 = f'https://generativelanguage.googleapis.com/v1/models/{svc.GEMINI_MODEL}:generateText?key={svc.GEMINI_API_KEY}'
        r2 = requests.post(endpoint_v1, json=body, timeout=15)
        print('V1_STATUS', r2.status_code)
        print('V1_TEXT_SNIPPET', r2.text[:800])
    except Exception as e:
        print('V1_EXC', e)
