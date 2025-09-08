# services/data_loader.py
import os
import json


def load_json(app_root, filename):
    """Safely load JSON from static/data folder."""
    path = os.path.join(app_root, "static", "data", filename)
    if not os.path.exists(path):
        print(f"⚠️ Warning: JSON file not found: {path}")
        return {}
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Error loading {filename}: {e}")
        return {}


# These will be loaded once from app.py
tips = None
faqs = None
