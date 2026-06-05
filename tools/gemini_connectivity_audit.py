from dotenv import load_dotenv
load_dotenv('backend/.env')
import os, sys, requests
sys.path.append('.')
from backend.services import chat_ai_service as svc

API_KEY = os.getenv('GEMINI_API_KEY')
MODEL_ENV = os.getenv('GEMINI_MODEL')

prompt = "What foods should a diabetic patient avoid?"

# Build model_path same as service
raw_model = MODEL_ENV or ""
raw_model = raw_model.strip()
if raw_model.startswith('projects/') or raw_model.startswith('models/'):
    model_path = raw_model
else:
    model_path = f'models/{raw_model}'

candidate_endpoints = []
GEMINI_ENDPOINT = os.getenv('GEMINI_ENDPOINT')
if GEMINI_ENDPOINT:
    candidate_endpoints.append(GEMINI_ENDPOINT)

base_variants = [
    f'https://generativelanguage.googleapis.com/v1/{model_path}:generateText?key={API_KEY}',
    f'https://generativelanguage.googleapis.com/v1beta2/{model_path}:generateText?key={API_KEY}',
    f'https://generativelanguage.googleapis.com/v1/{model_path}:generate?key={API_KEY}',
    f'https://generativelanguage.googleapis.com/v1beta2/{model_path}:generate?key={API_KEY}',
]

candidate_endpoints.extend(base_variants)

# Try endpoints and capture first 200 chars of response body
results = []
final_endpoint = None
final_status = None
final_body = None
for ep in candidate_endpoints:
    try:
        r = requests.post(ep, json={"prompt": {"text": prompt}, "temperature": 0.2, "maxOutputTokens": 200}, timeout=15)
        status = r.status_code
        body = r.text
        results.append((ep, status, body))
        if status == 200 and final_endpoint is None:
            final_endpoint = ep
            final_status = status
            final_body = body
            break
    except Exception as e:
        results.append((ep, 'EXC', str(e)))

# Call library generate to get parsed response (which may fallback)
parsed = svc.generate_ai_response(prompt)

print('Final endpoint used (first 200 OK):', final_endpoint)
print('Final status:', final_status)
print('Raw body (first 200 chars):', (final_body or '')[:200])
print('\nParsed chatbot response:')
print(parsed)
print('\nWhether fallback used:', parsed.startswith('For diabetes') or parsed.startswith("I'm here to help"))

print('\nAll endpoint attempts:')
for ep, status, body in results:
    print('\nEndpoint:', ep)
    print('Status:', status)
    print('Body snippet:', (body or '')[:300])
