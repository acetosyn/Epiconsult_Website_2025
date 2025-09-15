from flask import Blueprint, render_template, send_from_directory, current_app
from services.engine import get_test_data
from services.lab import load_lab_categories
import os

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

# Serve diagnostics.json and laboratory.json from dataset folder
@diagnostics_bp.route("/dataset/diagnostics.json")
def diagnostics_data():
    dataset_dir = os.path.join(current_app.root_path, "dataset")
    return send_from_directory(dataset_dir, "diagnostics.json")

@diagnostics_bp.route("/dataset/laboratory.json")
def laboratory_data():
    dataset_dir = os.path.join(current_app.root_path, "dataset")
    return send_from_directory(dataset_dir, "laboratory.json")
