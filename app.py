import os
from flask import Flask, render_template, request, url_for, redirect
from engine import get_test_data, get_department_info
from flask import jsonify
import json
from lab import load_lab_categories   # 👈 import our helper


app = Flask(__name__)


# 🔹 Load JSON files from /static
with open(os.path.join(app.root_path, "static", "data", "tips.json"), "r", encoding="utf-8") as f:
    tips = json.load(f)

with open(os.path.join(app.root_path, "static", "faqs.json"), "r", encoding="utf-8") as f:
    faqs = json.load(f)

# 🔹 Cache-busting helper
@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path, endpoint, filename)
            if os.path.isfile(file_path):
                values['v'] = int(os.stat(file_path).st_mtime)  # use file's last modified time
    return url_for(endpoint, **values)


# --- Routes ---
@app.route("/")
def root():
    return render_template("index.html")

@app.route("/home")
def home():
    return render_template("index.html")


# ...

@app.route("/login")
def login():
    next_page = request.args.get("next")
    return render_template("login.html", next_page=next_page)



@app.route("/google-login")
def google_login():
    return redirect(url_for("login", next="home"))

@app.route("/register", methods=["POST"])
def register():
    # For now, just redirect back to login page
    # Later you’ll implement user creation logic
    return redirect(url_for("login", next="home"))






# -------------------------------
# 🏥 CLINIC ROUTES
# -------------------------------
@app.route("/clinic/general")
def general():
    return render_template("clinic/general.html")

@app.route("/teleconsultation")
def teleconsultation():
    return render_template("teleconsultation.html")

@app.route("/clinic/sickle-cell")
def sickle_cell():
    return render_template("clinic/sickle_cell.html")

@app.route("/clinic/specialist")
def specialist():
    return render_template("clinic/specialist.html")




# -------------------------------
# 🏥 JSON FILES
# -------------------------------

# ✅ JSON endpoints
@app.route("/get-daily-tips")
def get_daily_tips():
    return jsonify(tips)

@app.route("/faqs")
def get_faqs():
    return jsonify(faqs)




# -------------------------------
# 🔬 DIAGNOSTICS ROUTES
# -------------------------------
@app.route("/diagnostics/imaging")
def imaging():
    return render_template("imaging.html")


@app.route("/diagnostics/laboratory")
def laboratory():
    test_data = get_test_data()
    categories = load_lab_categories()
    return render_template(
        "laboratory.html",
        lab_services=test_data.get("Laboratory", {}),
        lab_categories=categories
    )




# -------------------------------
# OTHER MAIN ROUTES
# -------------------------------

@app.route("/book-appointment")
def book_appointment():
    test_data = get_test_data()
    return render_template("appointment.html", test_data=test_data)



@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/blog")
def blog():
    return "<h1>Blog Page Coming Soon</h1>"

@app.route("/patient-portal")
def patient_portal():
    return "<h1>Patient Portal Coming Soon</h1>"




# -------------------------------
# INFO / LEGAL ROUTES
# -------------------------------
@app.route("/privacy-policy")
def privacy_policy():
    return "<h1>Privacy Policy Page Coming Soon</h1>"

@app.route("/terms-of-service")
def terms_of_service():
    return "<h1>Terms of Service Page Coming Soon</h1>"

@app.route("/cookie-policy")
def cookie_policy():
    return "<h1>Cookie Policy Page Coming Soon</h1>"

@app.route("/accessibility")
def accessibility():
    return "<h1>Accessibility Page Coming Soon</h1>"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
