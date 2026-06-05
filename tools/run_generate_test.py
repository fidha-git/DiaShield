from dotenv import load_dotenv
load_dotenv('backend/.env')
import sys
sys.path.append('.')
from backend.services.chat_ai_service import generate_ai_response
print(generate_ai_response('What foods should I avoid for diabetes?'))
