from flask import Blueprint, render_template, send_from_directory, current_app
import os

clinic_bp = Blueprint("clinic", __name__)

@clinic_bp.route("/general")
def general():
    return render_template("clinic/general.html")

@clinic_bp.route("/teleconsultation")
def teleconsultation():
    return render_template("teleconsultation.html")

@clinic_bp.route("/sickle-cell")
def sickle_cell():
    return render_template("clinic/sickle_cell.html")

@clinic_bp.route("/specialist")
def specialist():
    return render_template("clinic/specialist.html")

# Serve clinic.json from dataset folder
@clinic_bp.route("/dataset/clinic.json")
def clinic_data():
    dataset_dir = os.path.join(current_app.root_path, "dataset")
    return send_from_directory(dataset_dir, "clinic.json")
