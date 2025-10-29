# app.py
import os
from datetime import timedelta
from flask import Flask, url_for, g, redirect,  request, Response, jsonify
from supabase import create_client
from dotenv import load_dotenv
from bot import stream_ecare  # Updated import
from booking import send_booking_emails
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


# ==========================================================
# BOOK APPOINTMENT — API ENDPOINT (Supports Multiple Tests)
# ==========================================================
@app.route("/book", methods=["POST"])
def submit_booking():
    try:
        import json

        # ✅ Collect multi-test data if available
        services = []
        if "multiTests" in request.form:
            try:
                raw_tests = json.loads(request.form.get("multiTests", "[]"))
                for t in raw_tests:
                    if isinstance(t, dict):
                        test_name = t.get("test") or ""
                        category = t.get("category") or ""
                        if test_name and category:
                            services.append(f"{test_name} ({category})")
                        elif test_name:
                            services.append(test_name)
                    elif isinstance(t, str):
                        services.append(t)
            except Exception as e:
                print(f"[submit_booking] ⚠️ Failed to parse multiTests: {e}")
                services = []
        else:
            # Fallback for single service
            services = request.form.getlist("serviceSubcategory") or [request.form.get("serviceCategory")]

        # ✅ Build booking data payload
        service_str = ", ".join([s for s in services if isinstance(s, str) and s.strip()])
        data = {
            "name": request.form.get("fullName"),
            "email": request.form.get("email"),
            "phone": request.form.get("phone"),
            "sex": request.form.get("sex"),
            "service": service_str or "N/A",
            "date": request.form.get("appointmentDate"),
            "time": request.form.get("appointmentTime"),
            "address": request.form.get("address"),
            "message": request.form.get("message"),
            "booking_type": request.form.get("bookingType"),
        }

        # 🚀 Send booking emails (admin + client)
        result = send_booking_emails(data)
        admin_ok = result.get("admin", False)
        client_ok = result.get("client", False)

        # ✅ Relaxed success condition: at least one email succeeded
        if admin_ok or client_ok:
            print(f"[submit_booking] ✅ Booking email(s) sent — Admin: {admin_ok}, Client: {client_ok}")
            return jsonify({"status": "success", "message": "Appointment booked successfully!"})
        else:
            print(f"[submit_booking] ❌ Both emails failed — Admin: {admin_ok}, Client: {client_ok}")
            return jsonify({"status": "failed", "message": "Unable to send booking emails."})

    except Exception as e:
        print(f"[submit_booking] ❌ Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500



@app.route("/contact", endpoint="contact")
def contact_alias():
    return redirect(url_for("main.contact"))

@app.route("/about", endpoint="about")
def about_alias():
    return redirect(url_for("main.about"))


# print(app.url_map)

# ✅ Streaming Chat endpoint for e-Care Assistant
# -------------------------------
# e-Care Chat Endpoint
# -------------------------------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True, silent=True) or {}
    user_message = data.get("message", "")
    session_id = data.get("session_id") or request.remote_addr

    if not user_message.strip():
        return jsonify({"error": "Message cannot be empty"}), 400

    def generate():
        try:
            for chunk in stream_ecare(user_message, session_id=session_id):
                yield chunk
        except Exception as e:
            yield f"⚠️ Error: {str(e)}"

    return Response(generate(), mimetype="text/plain")

# -------------------------------
# ENTRYPOINT
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
