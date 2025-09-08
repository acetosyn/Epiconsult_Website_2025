import os
from datetime import timedelta
from flask import Flask, url_for, session, request, jsonify, g

# Firebase admin
from firebase_admin_init import firebase_auth, firebase_db

# Import blueprints
from blueprints.main import main_bp
from blueprints.clinic import clinic_bp
from blueprints.diagnostics import diagnostics_bp
from blueprints.info import info_bp
from blueprints.api_endpoints import api_bp

# Shared JSON data loader
from services import data_loader


# -------------------------------
# APP CONFIG
# -------------------------------
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "supersecret")
app.permanent_session_lifetime = timedelta(days=7)


# -------------------------------
# LOAD STATIC JSON DATA
# -------------------------------
data_loader.tips = data_loader.load_json(app.root_path, "tips.json")
data_loader.faqs = data_loader.load_json(app.root_path, "faqs.json")


# -------------------------------
# AUTH SESSION ROUTES
# -------------------------------
@app.route("/sessionLogin", methods=["POST"])
def session_login():
    id_token = request.json.get("idToken")
    if not id_token:
        return {"error": "Missing ID token"}, 400

    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        uid = decoded_token["uid"]

        # Persist into Flask session
        session["user"] = {
            "uid": uid,
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name") or decoded_token["email"].split("@")[0],
        }
        return {"message": "Session established"}
    except Exception as e:
        return {"error": f"Invalid token: {str(e)}"}, 401


@app.route("/sessionLogout", methods=["POST"])
def session_logout():
    session.clear()
    return {"message": "Logged out"}


# -------------------------------
# CONTEXT PROCESSORS
# -------------------------------
@app.context_processor
def inject_user():
    """
    Expose current_user to all templates.
    Priority:
    1. g.user (from verify_token-protected APIs)
    2. session["user"] (from cookie-based login)
    """
    return dict(
        current_user=getattr(g, "user", None) or session.get("user")
    )


@app.context_processor
def override_url_for():
    """Cache-busting for static files."""
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
# REGISTER BLUEPRINTS
# -------------------------------
app.register_blueprint(main_bp)
app.register_blueprint(clinic_bp, url_prefix="/clinic")
app.register_blueprint(diagnostics_bp, url_prefix="/diagnostics")
app.register_blueprint(info_bp)
app.register_blueprint(api_bp, url_prefix="/api")   # ✅ keep API routes separate


# -------------------------------
# ENTRYPOINT
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
