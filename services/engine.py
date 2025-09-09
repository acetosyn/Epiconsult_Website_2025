# services/engine.py
import os
import json

# Absolute path to test_data.json
DATA_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "static", "data", "test_data.json")
)

with open(DATA_PATH, encoding="utf-8") as f:
    test_data = json.load(f)


def get_test_data():
    """Return full test data (dict)."""
    return test_data


def get_department_info(dept: str):
    """Return info for a specific department, or None if not found."""
    return test_data.get(dept)
