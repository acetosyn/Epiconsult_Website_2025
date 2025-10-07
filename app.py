# app.py
import os
from datetime import timedelta
from flask import Flask, url_for, g, redirect
from supabase import create_client
from dotenv import load_dotenv

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
application = app
app.secret_key = os.environ.get("SECRET_KEY", os.environ.get("FLASK_SECRET", "supersecret"))
app.permanent_session_lifetime = timedelta(days=7)

# -------------------------------
# SUPABASE SERVER CLIENT (service_role)
# -------------------------------
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE = os.environ["SUPABASE_SERVICE_ROLE"]
SUPABASE_ANON = os.environ.get("SUPABASE_ANON_KEY")
SUPABASE_JWKS_URL = os.environ.get("SUPABASE_JWKS_URL", f"{SUPABASE_URL}/auth/v1/keys")

# Server-side client (service role)
app.supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

# Add configs for auth_supabase
app.config["SUPABASE_URL"] = SUPABASE_URL
app.config["SUPABASE_ANON_KEY"] = SUPABASE_ANON or ""
app.config["SUPABASE_SERVICE_ROLE"] = SUPABASE_SERVICE_ROLE
app.config["SUPABASE_JWKS_URL"] = SUPABASE_JWKS_URL

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
# CONTEXT PROCESSORS
# -------------------------------
@app.context_processor
def inject_user():
    return dict(current_user=getattr(g, "user", None))

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
# GLOBAL ALIASES
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
def about_alias():
    return redirect(url_for("main.about"))


# print(app.url_map)


# -------------------------------
# ENTRYPOINT
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
