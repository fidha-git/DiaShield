import os
from dotenv import load_dotenv
load_dotenv('backend/.env')
import google.genai as genai
print('genai version', genai.version)
Client = genai.Client
api_key = os.environ.get('GEMINI_API_KEY')
client = Client(api_key=api_key)
print('client methods:', [n for n in dir(client) if not n.startswith('_')])
print('models methods:', [n for n in dir(client.models) if not n.startswith('_')])
model = os.environ.get('GEMINI_MODEL') or 'models/gemini-2.5-flash'
prompt = 'What foods should a diabetic patient avoid?'
print('using model', model)
import inspect
sig = inspect.signature(client.models.generate_content)
print('generate_content signature:', sig)
try:
    # Try different parameter names
    for param in ['input', 'prompt', 'text', 'messages', 'content', 'contents']:
        try:
            print('\nTrying param name', param)
            kwargs = {param: prompt}
            resp = client.models.generate_content(model=model, **kwargs)
            print('Succeeded with', param)
            break
        except Exception as e:
            print('failed with', param, '->', e)
    else:
        print('All attempts failed')
    print('response type', type(resp))
    print('response repr', repr(resp))
    try:
        print('response.output:', getattr(resp, 'output', None))
    except Exception:
        pass
    print('resp keys:', dir(resp))
except Exception as e:
    print('generate error', e)
