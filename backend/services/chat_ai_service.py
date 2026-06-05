import os
import logging
import requests

from typing import Optional

logger = logging.getLogger(__name__)

# Primary configuration from env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# Default model name (adjustable via env if desired)
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
# Optional explicit endpoint override (useful when model requires full resource path)
GEMINI_ENDPOINT = os.getenv("GEMINI_ENDPOINT")

# Use Google GenAI SDK (modern package) when available
try:
    import google.genai as genai_sdk
    SDK_AVAILABLE = True
except Exception:
    genai_sdk = None
    SDK_AVAILABLE = False


def _rule_based_fallback(message: str) -> str:
    """
    Local rule-based fallback (kept compatible with previous behavior).
    """
    message_lower = message.lower()
    disclaimer = "\n\nConsult a healthcare professional for medical advice."
    if any(word in message_lower for word in ["food", "eat", "diet", "meal"]):
        return "For diabetes, focus on whole grains, vegetables, lean proteins, and avoid sugary foods." + disclaimer
    elif any(word in message_lower for word in ["exercise", "workout", "activity", "walk"]):
        return "Regular exercise like walking, cycling, or swimming helps manage blood sugar levels." + disclaimer
    elif any(word in message_lower for word in ["blood sugar", "glucose", "value", "reading"]):
        return "Normal fasting blood sugar is 70-99 mg/dL. High values may need attention, but always consult your doctor." + disclaimer
    elif any(word in message_lower for word in ["lifestyle", "healthy", "habit"]):
        return "Maintain a balanced diet, exercise regularly, manage stress, and get enough sleep for a healthy lifestyle." + disclaimer
    elif any(word in message_lower for word in ["diabetes", "what is diabetes", "about diabetes"]):
        return "Diabetes is a condition where the body has trouble regulating blood sugar. It can be managed with healthy habits." + disclaimer
    else:
        return "I'm here to help with diabetes-related questions, food, exercise, and healthy living tips." + disclaimer


def _call_gemini_api(prompt: str, timeout: int = 10) -> Optional[str]:
    """
    Attempt to call Google Generative Language (Gemini) API.
    This uses a simple REST call. If the call fails or the response
    is unexpected, return None to trigger fallback.
    """
    # Prefer SDK if available
    prompt_payload = prompt
    if SDK_AVAILABLE:
        try:
            # Instantiate modern client with API key
            client = genai_sdk.Client(api_key=GEMINI_API_KEY)
            # Normalize model: SDK expects 'models/...'
            model_to_use = GEMINI_MODEL or 'gemini-2.5-flash'
            if not model_to_use.startswith('models/'):
                sdk_model = f"models/{model_to_use}"
            else:
                sdk_model = model_to_use

            # Call generate_content on models
            resp = client.models.generate_content(model=sdk_model, contents=prompt_payload)

            # Parse response robustly
            try:
                # Prefer Candidate -> content -> parts -> text
                if getattr(resp, 'candidates', None):
                    first = resp.candidates[0]
                    content = getattr(first, 'content', None)
                    if content:
                        parts = getattr(content, 'parts', None) or []
                        texts = []
                        for p in parts:
                            t = getattr(p, 'text', None)
                            if t:
                                texts.append(t)
                        if texts:
                            return "".join(texts)
                # Fallback: check for top-level text-like fields
                if hasattr(resp, 'output') and resp.output:
                    # output may be structured
                    out = resp.output
                    if isinstance(out, str):
                        return out
            except Exception:
                pass
            finally:
                try:
                    client.close()
                except Exception:
                    pass
        except Exception as e:
            logger.exception('SDK call to Gemini failed: %s', e)
            # fallback to REST attempts below

    # If SDK not available or SDK call failed, fall back to REST endpoints (existing logic)
    if not GEMINI_API_KEY:
        logger.debug("GEMINI_API_KEY not set; skipping Gemini call")
        return None

    # Build candidate endpoints to support multiple API versions and resource formats.
    # If the user supplies GEMINI_ENDPOINT explicitly, try that first.
    candidate_endpoints = []
    if GEMINI_ENDPOINT:
        candidate_endpoints.append(GEMINI_ENDPOINT)

    # Normalize the model into a resource path accepted by the API.
    raw_model = GEMINI_MODEL or ""
    raw_model = raw_model.strip()
    if raw_model.startswith("projects/") or raw_model.startswith("models/"):
        model_path = raw_model
    else:
        model_path = f"models/{raw_model}"

    # Common endpoint shapes to try (insert model_path directly after /v1/)
    base_variants = [
        "https://generativelanguage.googleapis.com/v1/{model_path}:generateText?key={key}",
        "https://generativelanguage.googleapis.com/v1beta2/{model_path}:generateText?key={key}",
        "https://generativelanguage.googleapis.com/v1/{model_path}:generate?key={key}",
        "https://generativelanguage.googleapis.com/v1beta2/{model_path}:generate?key={key}",
    ]

    # If a project is configured and model_path doesn't already include project, try project-scoped path
    project = os.getenv('GCP_PROJECT')
    location = os.getenv('GEMINI_LOCATION', '')
    if project and not model_path.startswith('projects/'):
        project_variant = f"https://generativelanguage.googleapis.com/v1/projects/{project}/locations/{location}/models/{raw_model}:generateText?key={GEMINI_API_KEY}"
        candidate_endpoints.append(project_variant)

    # Fill in simple variants
    for v in base_variants:
        try:
            candidate_endpoints.append(v.format(model_path=model_path, key=GEMINI_API_KEY))
        except Exception:
            pass

    body = {
        "prompt": {"text": prompt},
        "temperature": 0.2,
        "maxOutputTokens": 512,
    }

    last_resp_text = None
    for endpoint in candidate_endpoints:
        if not endpoint:
            continue
        try:
            logger.debug("Trying Gemini endpoint: %s", endpoint)
            resp = requests.post(endpoint, json=body, timeout=timeout)
            last_resp_text = resp.text
            if resp.status_code != 200:
                logger.warning("Gemini API returned status %s for %s: %s", resp.status_code, endpoint, resp.text)
                # try next candidate
                continue
            data = resp.json()
            # Typical field: 'candidates' with 'content' or 'output'
            if isinstance(data, dict):
                candidates = data.get('candidates') or []
                if candidates and isinstance(candidates, list):
                    first = candidates[0]
                    text = first.get('output') or first.get('content') or first.get('text')
                    if text:
                        return text
                # some variants return 'output' at top-level with 'content'
                output = data.get('output') or data.get('result')
                if isinstance(output, dict):
                    text = output.get('content') or output.get('text') or output.get('candidates')
                    if isinstance(text, list) and text:
                        # handle list-of-candidates at top-level
                        first = text[0]
                        if isinstance(first, dict):
                            t = first.get('content') or first.get('text')
                            if t:
                                return t
                    if isinstance(text, str):
                        return text
            logger.warning("Gemini API response did not contain expected fields for %s: %s", endpoint, data)
            return None
        except Exception as e:
            logger.exception("Error calling Gemini API at %s: %s", endpoint, e)
            continue

    logger.debug("All Gemini endpoints attempted. Last response: %s", last_resp_text)
    return None


def generate_ai_response(message: str) -> str:
    """
    Primary entrypoint for generating AI responses. Tries Gemini first;
    on failure returns the local rule-based response to maintain compatibility.
    """
    # Build a simple prompt; do NOT include patient data (MVP requirement)
    prompt = (
        "You are a concise clinical assistant specialized in diabetes care. "
        "Answer briefly and add a short disclaimer. Only provide general information, not prescriptions.\n\n"
        f"User: {message}\n\nAssistant:" 
    )

    # Try Gemini
    text = _call_gemini_api(prompt)
    if text:
        return text

    # Fallback to rule-based
    return _rule_based_fallback(message)
