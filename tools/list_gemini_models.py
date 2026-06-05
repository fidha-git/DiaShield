from dotenv import load_dotenv
load_dotenv('backend/.env')
import os
import sys
sys.path.append('.')
import requests

API_KEY = os.getenv('GEMINI_API_KEY')
MODEL_ENV = os.getenv('GEMINI_MODEL')
GCP_PROJECT = os.getenv('GCP_PROJECT')
GEMINI_LOCATION = os.getenv('GEMINI_LOCATION', 'us-central1')

if not API_KEY:
    print('No GEMINI_API_KEY found in backend/.env')
    raise SystemExit(1)

endpoints = [
    f'https://generativelanguage.googleapis.com/v1/models?key={API_KEY}',
    f'https://generativelanguage.googleapis.com/v1beta2/models?key={API_KEY}',
]

# project-scoped endpoint if project exists
if GCP_PROJECT:
    endpoints.append(f'https://generativelanguage.googleapis.com/v1/projects/{GCP_PROJECT}/locations/{GEMINI_LOCATION}/models?key={API_KEY}')

results = {}
for ep in endpoints:
    try:
        r = requests.get(ep, timeout=15)
        print('\nEndpoint:', ep)
        print('Status:', r.status_code)
        text = r.text
        print('Response snippet:', text[:1000])
        try:
            data = r.json()
        except Exception as e:
            data = {'_parse_error': str(e), 'text': text}
        # extract model names if present
        models = []
        if isinstance(data, dict):
            items = data.get('models') or data.get('model') or data.get('resources') or data.get('models', [])
            if isinstance(items, list):
                for m in items:
                    if isinstance(m, dict):
                        name = m.get('name') or m.get('model') or m.get('id')
                        if name:
                            models.append(name)
                    elif isinstance(m, str):
                        models.append(m)
        results[ep] = {'status': r.status_code, 'models': models, 'raw': data}
    except Exception as e:
        print('Exception querying', ep, e)
        results[ep] = {'error': str(e)}

# Summarize
print('\n=== Summary of accessible models ===')
all_models = set()
for ep, info in results.items():
    models = info.get('models') or []
    print('\nFrom', ep)
    print('Status:', info.get('status'))
    if models:
        for m in models:
            print('-', m)
            all_models.add(m)
    else:
        print('- No model names parsed from response')

print('\nOverall unique models found:', len(all_models))
for m in sorted(all_models):
    print('-', m)

print('\nConfigured GEMINI_MODEL value is:', MODEL_ENV)

# Suggest replacement heuristic
suggested = None
# If gemini-2.5-flash missing, prefer gemini-2.1 or text-bison if available
if MODEL_ENV and MODEL_ENV not in all_models:
    candidates = ['gemini-2.5-mini', 'gemini-2.1', 'gemini-2.5', 'text-bison-001', 'text-bison']
    for c in candidates:
        if c in all_models:
            suggested = c
            break

print('\nSuggested replacement for', MODEL_ENV, '->', suggested)
