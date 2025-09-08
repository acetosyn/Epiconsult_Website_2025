# main.py
from flask import Blueprint, render_template, request, url_for

main_bp = Blueprint("main", __name__)

# ✅ Explicit endpoint name so url_for("home") works globally
@main_bp.route("/", endpoint="home")
@main_bp.route("/home")
def home():
    return render_template("index.html")

@main_bp.route("/login")
def login():
    next_page = request.args.get("next") or url_for("home")
    return render_template("login.html", next_page=next_page)

@main_bp.route("/book-appointment")
def book_appointment():
    from services.engine import get_test_data
    test_data = get_test_data()
    return render_template("appointment.html", test_data=test_data)

@main_bp.route("/contact")
def contact():
    return render_template("contact.html")

@main_bp.route("/about")
def about():
    return render_template("about.html")

@main_bp.route("/blog")
def blog():
    return "<h1>Blog Page Coming Soon</h1>"

@main_bp.route("/patient-portal")
def patient_portal():
    return "<h1>Patient Portal Coming Soon</h1>"

@main_bp.route("/forgot-password")
def forgot_password():
    return "<h1>Forgot Password Page Coming Soon</h1>"
