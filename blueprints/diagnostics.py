from flask import Blueprint, render_template
from services.engine import get_test_data
from services.lab import load_lab_categories

diagnostics_bp = Blueprint("diagnostics", __name__)

@diagnostics_bp.route("/radiology")
def radiology():
    return render_template("radiology.html")

@diagnostics_bp.route("/laboratory")
def laboratory():
    test_data = get_test_data()
    categories = load_lab_categories()
    return render_template(
        "laboratory.html",
        lab_services=test_data.get("Laboratory", {}),
        lab_categories=categories
    )
