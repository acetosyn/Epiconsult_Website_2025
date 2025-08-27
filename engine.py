import json

# Load test_data once at startup
with open("static/data/test_data.json") as f:
    test_data = json.load(f)

def get_test_data():
    """Return full test data (dict)."""
    return test_data

def get_department_info(dept: str):
    """Return info for a specific department, or None if not found."""
    return test_data.get(dept)
