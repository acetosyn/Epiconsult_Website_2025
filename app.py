# app.py
import os
from datetime import timedelta
from flask import Flask, url_for, session, request, g, redirect, jsonify
from supabase import create_client
from dotenv import load_dotenv
import requests

# -------------------------------
# REGISTER BLUEPRINTS
# -------------------------------
from blueprints.main import main_bp
from blueprints.clinic import clinic_bp
from blueprints.diagnostics import diagnostics_bp
from blueprints.info import info_bp
from blueprints.api_endpoints import api_bp
from services import data_loader

# Load .env if present
load_dotenv()

# -------------------------------
# APP CONFIG
# -------------------------------
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", os.environ.get("FLASK_SECRET", "supersecret"))
app.permanent_session_lifetime = timedelta(days=7)

# -------------------------------
# SUPABASE SERVER CLIENT (service_role)
# -------------------------------
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE = os.environ["SUPABASE_SERVICE_ROLE"]
SUPABASE_ANON = os.environ.get("SUPABASE_ANON_KEY")
SUPABASE_JWKS_URL = os.environ.get("SUPABASE_JWKS_URL", f"{SUPABASE_URL}/auth/v1/keys")

# Server-side client uses service role (never expose to frontend)
app.supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

# Provide anon key + url to templates (if needed)
@app.context_processor
def inject_supabase_client_env():
    return dict(
        SUPABASE_URL_FROM_SERVER=SUPABASE_URL,
        SUPABASE_ANON_KEY_FROM_SERVER=SUPABASE_ANON or "",
    )

# -------------------------------
# Shared JSON data loader
# -------------------------------
data_loader.tips = data_loader.load_json(app.root_path, "tips.json")
data_loader.faqs = data_loader.load_json(app.root_path, "faqs.json")

# -------------------------------
# AUTH SESSION ROUTES
# -------------------------------

@app.route("/login", methods=["POST"])
def login():
    """
    Accepts form or JSON with { email, password }.
    Calls Supabase Auth REST token endpoint (grant_type=password).
    On success, stores session['user'] and session['access_token'].
    """
    payload = request.get_json(silent=True) or request.form or {}
    email = payload.get("email")
    password = payload.get("password")
    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    token_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {"Content-Type": "application/json", "apikey": SUPABASE_ANON or ""}
    body = {"email": email, "password": password}

    try:
        resp = requests.post(token_url, json=body, headers=headers, timeout=8)
        data = resp.json()
    except Exception as e:
        return jsonify({"error": f"Auth request failed: {str(e)}"}), 500

    if resp.status_code not in (200, 201):
        msg = data.get("error_description") or data.get("message") or data
        return jsonify({"error": "Login failed", "details": msg}), 401

    access_token = data.get("access_token")
    user = data.get("user") or {}
    if not access_token or not user:
        return jsonify({"error": "Invalid auth response"}), 500

    # Store in Flask session (cookie). Keep minimal data only.
    session.permanent = True
    session["access_token"] = access_token
    session["user"] = {
        "uid": user.get("id"),
        "email": user.get("email"),
        "role": user.get("role"),
        "user_metadata": user.get("user_metadata", {}),
    }

    return jsonify({"ok": True, "user": session["user"]}), 200


@app.route("/signup", methods=["POST"])
def signup():
    """
    Accepts form or JSON with first_name, middle_name (opt), last_name, email, password.
    Calls Supabase /auth/v1/signup. On success, optionally create patient row.
    """
    payload = request.get_json(silent=True) or request.form or {}
    email = payload.get("email")
    password = payload.get("password")
    first = payload.get("first_name") or ""
    middle = payload.get("middle_name") or ""
    last = payload.get("last_name") or ""

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    signup_url = f"{SUPABASE_URL}/auth/v1/signup"
    headers = {"Content-Type": "application/json", "apikey": SUPABASE_ANON or ""}
    user_metadata = {"name": " ".join([p for p in [first, middle, last] if p]).strip()}
    body = {"email": email, "password": password, "data": user_metadata}

    try:
        resp = requests.post(signup_url, json=body, headers=headers, timeout=8)
        data = resp.json()
    except Exception as e:
        return jsonify({"error": f"Signup request failed: {str(e)}"}), 500

    if resp.status_code not in (200, 201):
        msg = data.get("error_description") or data.get("message") or data
        return jsonify({"error": "Signup failed", "details": msg}), 400

    access_token = data.get("access_token")
    user = data.get("user")

    if access_token and user:
        session.permanent = True
        session["access_token"] = access_token
        session["user"] = {
            "uid": user.get("id"),
            "email": user.get("email"),
            "role": user.get("role"),
            "user_metadata": user.get("user_metadata", {}),
        }

    # Optionally: create a patient row server-side
    if user and user.get("id"):
        try:
            patient_row = {
                "user_id": user.get("id"),
                "first_name": first or (user.get("user_metadata", {}).get("name") or "").split(" ")[0] or "Patient",
                "middle_name": middle or None,
                "last_name": last or None,
                "email": email,
            }
            app.supabase.table("patients").insert(patient_row).execute()
        except Exception:
            pass  # ignore non-fatal errors

    return jsonify({"ok": True, "message": "Account created. Check your email to verify if required."}), 200


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True}), 200


@app.route("/session", methods=["GET"])
def get_session():
    return jsonify({"user": session.get("user")}), 200


# -------------------------------
# CONTEXT PROCESSORS
# -------------------------------
@app.context_processor
def inject_user():
    return dict(current_user=getattr(g, "user", None) or session.get("user"))


@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)


def dated_url_for(endpoint, **values):
    if endpoint == "static":
        filename = values.get("filename")
        if filename:
            file_path = os.path.join(app.root_path, endpoint, filename)
            if os.path.isfile(file_path):
                values["v"] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)


# -------------------------------
# NO-CACHE HEADERS
# -------------------------------
@app.after_request
def add_no_cache(response):
    response.headers["Cache-Control"] = "no-store"
    return response


# -------------------------------
# REGISTER BLUEPRINTS
# -------------------------------
app.register_blueprint(main_bp)
app.register_blueprint(clinic_bp, url_prefix="/clinic")
app.register_blueprint(diagnostics_bp, url_prefix="/diagnostics")
app.register_blueprint(info_bp)
app.register_blueprint(api_bp, url_prefix="/api")

# -------------------------------
# GLOBAL ALIASES (NO DUPLICATE /login)
# -------------------------------
@app.route("/", endpoint="home")
def home_alias():
    return redirect(url_for("main.home"))

@app.route("/book-appointment", endpoint="book_appointment")
def book_appointment_alias():
    return redirect(url_for("main.book_appointment"))

@app.route("/contact", endpoint="contact")
def contact_alias():
    return redirect(url_for("main.contact"))

@app.route("/about", endpoint="about")
def contact_alias_about():
    return redirect(url_for("main.about"))


# -------------------------------
# ENTRYPOINT
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
