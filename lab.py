# lab.py
import json, os

DATA_PATH = os.path.join("static", "data", "lab_packages.json")
_lab_categories = None

def load_lab_categories():
    global _lab_categories
    if _lab_categories is None:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        _lab_categories = [(key, item["category"]) for key, item in data.items()]
    print("DEBUG lab_categories:", _lab_categories)   # 👈 add this
    return _lab_categories
