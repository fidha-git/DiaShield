from dotenv import load_dotenv
load_dotenv()
import backend.services.chat_ai_service as svc
import requests

print('GEMINI_API_KEY present:', bool(svc.GEMINI_API_KEY))
print('GEMINI_MODEL:', svc.GEMINI_MODEL)

prompt = "You are a concise clinical assistant specialized in diabetes care. User: What foods should I avoid? Assistant:" 
res = svc._call_gemini_api(prompt)
print('svc._call_gemini_api returned:', '<<TEXT>>' if res else None)

if svc.GEMINI_API_KEY:
    endpoint = f"https://generativelanguage.googleapis.com/v1beta2/models/{svc.GEMINI_MODEL}:generateText?key={svc.GEMINI_API_KEY}"
    body = {"prompt":{"text":prompt}, "temperature":0.2, "maxOutputTokens":200}
    try:
        r = requests.post(endpoint, json=body, timeout=15)
        print('Direct request status:', r.status_code)
        print('Direct request text (first 1000 chars):', r.text[:1000])
    except Exception as e:
        print('Direct request exception:', e)
else:
    print('No GEMINI_API_KEY, skipping direct request')
