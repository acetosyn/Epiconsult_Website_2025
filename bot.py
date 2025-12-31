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
# FLATTEN LAB TESTS
# -----------------------------
def extract_lab_tests(data):
    tests = {}
    for category, items in (data.get("Laboratory") or {}).items():
        for item in items:
            name_match = re.match(r"^(.*?)\s*₦?[\d,]+", item.strip())
            amount_match = re.search(r"₦\s*([\d,]+)", item)
            if name_match:
                name = name_match.group(1).strip().upper()
                price = f"₦{amount_match.group(1)}" if amount_match else ""
                tests[name] = price
    return tests


lab_tests_flat = extract_lab_tests(lab_data)

# -----------------------------
# CONSTANTS
# -----------------------------
CONTACT_TEXT = (
    "📞 07035765000, 09139374672  •  "
    "📧 epiconsultdiagnostics@gmail.com"
)

# -----------------------------
# HELPERS
# -----------------------------
def _normalize(s):
    s = (s or "").upper()
    s = re.sub(r"[^\w\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def titlecase_test_name(name):
    return " ".join(w.capitalize() for w in (name or "").split())


def extract_amount(line):
    if not line:
        return ""
    m = re.search(r"₦\s*([\d,]+)", line)
    return m.group(1) if m else ""


# -----------------------------
# INTENT DETECTORS
# -----------------------------
def is_price_question(t): return any(x in t for x in ["price", "cost", "how much", "₦", "naira", "amount"])
def is_location_question(t): return any(x in t for x in ["where", "address", "location", "map"])
def wants_contact_or_booking(t): return any(x in t for x in ["book", "appointment", "contact", "call", "schedule"])
def is_farewell(t): return any(x in t for x in ["bye", "goodbye", "see you"])
def is_gratitude(t): return any(x in t for x in ["thanks", "thank you"])
def is_greeting(t): return any(x in t for x in ["hi", "hello", "hey", "good morning", "good evening"])

# -----------------------------
# SESSION MEMORY
# -----------------------------
session_memory = {}

def get_ctx(session_id):
    return session_memory.setdefault(session_id, {
        "history": [],
        "symptoms": [],
        "suspected": None,
        "last_test": None
    })


def remember(ctx, role, content):
    ctx["history"].append({"role": role, "content": content})
    if len(ctx["history"]) > 12:
        ctx["history"].pop(0)

# -----------------------------
# SYMPTOM → LIKELY CAUSE MAP (NON-DIAGNOSTIC)
# -----------------------------
SYMPTOM_MAP = {
    "fever": {
        "suspect": "malaria or typhoid",
        "tests": ["MALARIA PARASITE", "WIDAL"]
    },
    "headache": {
        "suspect": "malaria or infection",
        "tests": ["MALARIA PARASITE"]
    },
    "body pain": {
        "suspect": "malaria or viral infection",
        "tests": ["MALARIA PARASITE"]
    },
    "vomit": {
        "suspect": "typhoid or stomach infection",
        "tests": ["WIDAL"]
    },
    "stomach": {
        "suspect": "typhoid or gastrointestinal infection",
        "tests": ["WIDAL"]
    },
    "cough": {
        "suspect": "respiratory infection",
        "tests": ["FULL BLOOD COUNT"]
    }
}

# -----------------------------
# FIND TEST MATCH
# -----------------------------
def find_test_match(query):
    if not query:
        return None, None

    q = _normalize(query)
    norm_tests = {_normalize(k): v for k, v in lab_tests_flat.items()}

    for k, v in norm_tests.items():
        if k in q or q in k:
            return k, v

    matches = difflib.get_close_matches(q, list(norm_tests.keys()), n=1, cutoff=0.45)
    if matches:
        return matches[0], norm_tests[matches[0]]

    return None, None

# -----------------------------
# SYSTEM PROMPT
# -----------------------------
SYSTEM_PROMPT = """
You are e-Care, a virtual health assistant for Epiconsult Clinic & Diagnostics (Nigeria).

Rules:
- Do NOT diagnose or prescribe.
- You MAY suggest likely causes common in Nigeria.
- Always recommend lab tests for confirmation.
- Be calm, human, reassuring.
- Keep replies short and helpful.
"""

# -----------------------------
# MAIN CHAT STREAM
# -----------------------------
def stream_ecare(user_message, session_id="default"):
    text = (user_message or "").strip()
    text_l = text.lower()
    ctx = get_ctx(session_id)

    # ---- Greetings ----
    if is_greeting(text_l) and not ctx["history"]:
        reply = "👋 Hello! I’m e-Care from Epiconsult Clinic. How are you feeling today?"
        yield reply
        remember(ctx, "assistant", reply)
        return

    # ---- Farewell ----
    if is_farewell(text_l):
        reply = "Take care and stay healthy 👋 I’m here anytime you need assistance."
        yield reply
        remember(ctx, "assistant", reply)
        return

    # ---- Gratitude ----
    if is_gratitude(text_l):
        reply = "You’re very welcome 😊"
        yield reply
        remember(ctx, "assistant", reply)
        return

    # ---- Contact ----
    if wants_contact_or_booking(text_l):
        reply = f"You can reach Epiconsult here: {CONTACT_TEXT}"
        yield reply
        remember(ctx, "assistant", reply)
        return

    # ---- Location ----
    if is_location_question(text_l):
        reply = "📍 We’re at 33 Abidjan Street, Wuse Zone 3, Abuja — opposite the National Library."
        yield reply
        remember(ctx, "assistant", reply)
        return

    # ---- SYMPTOM INTELLIGENCE ----
    for symptom, info in SYMPTOM_MAP.items():
        if symptom in text_l:
            ctx["symptoms"].append(symptom)
            ctx["suspected"] = info["suspect"]
            ctx["last_test"] = info["tests"][0]

            reply = (
                f"I’m sorry you’re feeling unwell. Symptoms like this are commonly linked to "
                f"{info['suspect']} in our environment.\n\n"
                f"A lab test is the best way to confirm. Would you like me to suggest the appropriate test?"
            )
            yield reply
            remember(ctx, "assistant", reply)
            return

    # ---- PRICE / LAB QUESTIONS ----
    test_name, price_line = find_test_match(user_message)

    if is_price_question(text_l):
        if not test_name and ctx.get("last_test"):
            test_name = ctx["last_test"]
            price_line = lab_tests_flat.get(test_name)

        if test_name and price_line:
            amt = extract_amount(price_line)
            reply = f"The {titlecase_test_name(test_name)} test costs ₦{amt}."
            yield reply
            remember(ctx, "assistant", reply)
            return

    if test_name and not is_price_question(text_l):
        ctx["last_test"] = test_name
        amt = extract_amount(price_line)
        reply = (
            f"We offer {titlecase_test_name(test_name)} testing at Epiconsult."
            + (f" It costs ₦{amt}." if amt else "")
        )
        yield reply
        remember(ctx, "assistant", reply)
        return

    # ---- LLM FALLBACK ----
    ctx["history"].append({"role": "user", "content": user_message})
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + ctx["history"]

    stream = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        temperature=0.7,
        max_tokens=350,
        stream=True,
    )

    full_reply = ""
    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
            piece = chunk.choices[0].delta.content
            full_reply += piece
            yield piece

    remember(ctx, "assistant", full_reply)
