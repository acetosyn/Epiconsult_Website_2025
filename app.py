import os
from flask import Flask, render_template, request, url_for
from engine import get_test_data, get_department_info

app = Flask(__name__)

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

@app.route("/services")
def services():
    test_data = get_test_data()
    return render_template("services.html", lab_services=test_data.get("Laboratory", {}))


@app.route("/book-appointment")
def book_appointment():
    test_data = get_test_data()
    return render_template("appointment.html", test_data=test_data)

@app.route("/teleconsultation")
def teleconsultation():
    return render_template("teleconsultation.html")


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
