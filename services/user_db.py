# services/users_db.py
import os
import json
from threading import Lock

LOCK = Lock()
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "static", "data"))
DATA_PATH = os.path.join(DATA_DIR, "users.json")

# Ensure data dir exists
os.makedirs(DATA_DIR, exist_ok=True)
# Ensure file exists
if not os.path.exists(DATA_PATH):
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump({}, f)

def load_users():
    with LOCK:
        with open(DATA_PATH, encoding="utf-8") as f:
            try:
                return json.load(f)
            except Exception:
                return {}

def save_users(data):
    with LOCK:
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

def get_user(uid):
    users = load_users()
    return users.get(uid)

def update_user(uid, user_data):
    users = load_users()
    users[uid] = user_data
    save_users(users)
    return user_data
