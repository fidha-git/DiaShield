import sys
sys.path.append('.')
try:
    import google.genai as genai
    print('module google.genai loaded as', genai)
    print('dir:', [n for n in dir(genai) if not n.startswith('_')])
    try:
        from google.genai import Client
        print('Client class found:', Client)
    except Exception as e:
        print('Client import error', e)
except Exception as e:
    print('Import error', e)
