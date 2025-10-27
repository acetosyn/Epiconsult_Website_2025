# bot.py
import os
import re
import json
import difflib
from dotenv import load_dotenv
from groq import Groq

# -----------------------------
# LOAD ENV
# -----------------------------
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# -----------------------------
# DATA SOURCES
# -----------------------------
DATASET_DIR = os.path.join(os.getcwd(), "dataset")
LAB_FILE = os.path.join(DATASET_DIR, "laboratory.json")

def load_json(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

lab_data = load_json(LAB_FILE)

# -----------------------------
# FLATTEN TESTS
# -----------------------------
def extract_lab_tests(data):
    tests = {}
    for category, items in (data.get("Laboratory") or {}).items():
        for item in items:
            parts = item.rsplit(" ", 1)
            if len(parts) == 2 and "₦" in parts[1]:
                name = parts[0].strip().upper()
                tests[name] = item.strip()
    return tests

lab_tests_flat = extract_lab_tests(lab_data)

# -----------------------------
# CONSTANTS
# -----------------------------
CONTACT_TEXT = "📞 07035765000, 09139374672  •  📧 epiconsultdiagnostics@gmail.com"

# -----------------------------
# TEXT HELPERS
# -----------------------------
def _normalize(s: str) -> str:
    s = (s or "").upper()
    s = re.sub(r"[^\w\s/]", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def titlecase_test_name(name: str) -> str:
    return " ".join(w.capitalize() for w in (name or "").split())

def extract_amount(line: str) -> str:
    if not line:
        return ""
    m = re.search(r"₦\s*([\d,]+(?:\.\d{2})?)", line)
    return m.group(1) if m else ""

# -----------------------------
# LOGIC DETECTORS
# -----------------------------
def is_price_question(t): return any(x in t for x in ["how much", "price", "cost", "fee", "₦", "naira", "amount"])
def is_location_question(t): return any(x in t for x in ["where", "address", "location", "map", "directions"])
def wants_contact_or_booking(t): return any(x in t for x in ["book", "appointment", "contact", "call", "reach", "confirm", "schedule"])
def is_farewell(t): return any(x in t for x in ["bye", "goodbye", "see you", "later", "take care"])
def is_gratitude(t): return any(x in t for x in ["thanks", "thank you", "appreciate", "grateful"])
def is_greeting(t): return any(x in t for x in ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"])

# -----------------------------
# MEMORY PER SESSION
# -----------------------------
session_memory = {}

def get_session_context(session_id):
    return session_memory.setdefault(session_id, {"history": [], "symptoms": [], "last_test": None})

def update_session_context(session_id, role, content):
    ctx = get_session_context(session_id)
    ctx["history"].append({"role": role, "content": content})
    if len(ctx["history"]) > 10:
        ctx["history"].pop(0)

# -----------------------------
# SYSTEM PROMPT
# -----------------------------
ECARE_SYSTEM_PROMPT = """
You are e-Care — a friendly, conversational virtual health assistant for Epiconsult Clinic & Diagnostics, Abuja.

Guidelines:
- Always use the Nigerian Naira symbol ₦ (never ₹ or INR).
- Be warm, human-like, and short (2–3 sentences per reply).
- You may talk about lab tests, general wellness, or clinic information.
- Never prescribe medication or give diagnoses — only guide gently.
- If asked for price, give exact ₦ value from data if available.
- Keep tone empathetic and natural, not robotic.
"""

# -----------------------------
# FIND TEST MATCH
# -----------------------------
def find_test_match(query: str):
    if not query:
        return None, None
    q = _normalize(query)
    norm_tests = {_normalize(k): v for k, v in lab_tests_flat.items()}

    for k_norm, v in norm_tests.items():
        if k_norm in q:
            return k_norm, v

    candidates = difflib.get_close_matches(q, list(norm_tests.keys()), n=1, cutoff=0.7)
    if candidates:
        return candidates[0], norm_tests[candidates[0]]
    return None, None

# -----------------------------
# MAIN CHAT FUNCTION
# -----------------------------
def stream_ecare(user_message, session_id="default"):
    text = (user_message or "").strip()
    text_l = text.lower()
    ctx = get_session_context(session_id)

    # ---- Quick Keyword Rules ----
    if is_greeting(text_l):
        # Only greet once per session to avoid repeating
        if not ctx["history"]:
            reply = "Hello 😊 How are you feeling today?"
            yield reply
            update_session_context(session_id, "assistant", reply)
        # Don't return — allow detection of symptoms in same message


    if is_farewell(text_l):
        reply = "Take care and stay healthy! 👋"
        yield reply
        update_session_context(session_id, "assistant", reply)
        return

    if is_gratitude(text_l):
        reply = "You're most welcome! 😊"
        yield reply
        update_session_context(session_id, "assistant", reply)
        return

    if wants_contact_or_booking(text_l):
        reply = f"You can reach us here: {CONTACT_TEXT}"
        yield reply
        update_session_context(session_id, "assistant", reply)
        return

    if is_location_question(text_l):
        reply = "📍 We're located at 33 Abidjan Street, Wuse Zone 3, Abuja."
        yield reply
        update_session_context(session_id, "assistant", reply)
        return

    # ---- Symptom & Test Detection ----
    if any(x in text_l for x in ["fever", "typhoid", "malaria", "infection", "pain", "cough", "headache", "cold", "catarrh"]):
        ctx["symptoms"].append(text)

        if "malaria" in text_l:
            ctx["last_test"] = "MALARIA PARASITE"
        elif "typhoid" in text_l:
            ctx["last_test"] = "WIDAL"

        # Don't return here — we’ll continue to see if it's a price query
        if not is_price_question(text_l):
            reply = "I'm sorry to hear that. Would you like me to suggest the right test for confirmation?"
            yield reply
            update_session_context(session_id, "assistant", reply)
            return

    # ---- Lab / Price Queries ----
    test_name, price_line = find_test_match(user_message)

    # fallback: use last_test memory if user asks "how much is it" etc.
    if is_price_question(text_l) and not test_name and ctx.get("last_test"):
        test_name = ctx["last_test"]
        price_line = lab_tests_flat.get(test_name)

    if is_price_question(text_l) and test_name and price_line:
        amt = extract_amount(price_line)
        reply = f"The {titlecase_test_name(test_name)} test costs ₦{amt}."
        yield reply
        update_session_context(session_id, "assistant", reply)
        return

    if test_name and not is_price_question(text_l):
        reply = f"Yes, we offer {titlecase_test_name(test_name)} testing at Epiconsult Clinic."
        yield reply
        update_session_context(session_id, "assistant", reply)
        return

    if is_price_question(text_l) and not test_name:
        reply = "Which test would you like to check the price for?"
        yield reply
        update_session_context(session_id, "assistant", reply)
        return

    # ---- LLM Fallback ----
    ctx["history"].append({"role": "user", "content": user_message})
    messages = [{"role": "system", "content": ECARE_SYSTEM_PROMPT}] + ctx["history"]

    stream = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        temperature=0.8,
        max_tokens=400,
        stream=True,
    )

    collected_reply = ""
    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
            piece = chunk.choices[0].delta.content
            collected_reply += piece
            yield piece

    update_session_context(session_id, "assistant", collected_reply)

