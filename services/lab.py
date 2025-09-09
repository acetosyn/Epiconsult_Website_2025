# services/lab.py
import os
import json

# Build absolute path to lab_packages.json
DATA_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "static", "data", "lab_packages.json")
)

_lab_categories = None


def load_lab_categories():
    """Load and cache lab categories from lab_packages.json"""
    global _lab_categories
    if _lab_categories is None:
        if not os.path.exists(DATA_PATH):
            print(f"⚠️ Warning: lab_packages.json not found at {DATA_PATH}")
            return []
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            _lab_categories = [(key, item.get("category", "Unknown")) for key, item in data.items()]
            print("✅ Lab categories loaded")
        except Exception as e:
            print(f"❌ Error loading lab_packages.json: {e}")
            _lab_categories = []
    return _lab_categories
