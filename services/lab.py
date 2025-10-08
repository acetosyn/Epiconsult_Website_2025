import os
import json
from flask import current_app

_lab_categories = None

def load_lab_categories():
    """Load and cache lab categories from lab_packages.json"""
    global _lab_categories
    if _lab_categories is None:
        try:
            # Always resolve path from the Flask app's static folder
            data_path = os.path.join(current_app.root_path, "static", "data", "lab_packages.json")

            if not os.path.exists(data_path):
                print(f"⚠️ lab_packages.json not found at {data_path}")
                return []

            with open(data_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            _lab_categories = [(key, item.get("category", "Unknown")) for key, item in data.items()]
            print("✅ Lab categories loaded")
        except Exception as e:
            print(f"❌ Error loading lab_packages.json: {e}")
            _lab_categories = []
    return _lab_categories
