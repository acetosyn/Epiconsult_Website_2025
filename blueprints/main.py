# main.py
import requests
from flask import Blueprint, render_template, request, url_for, jsonify, g, current_app, session, redirect, flash
from services.auth_supabase import verify_supabase_token

main_bp = Blueprint("main", __name__)

# --------------------------
# Basic routes (templates)
# --------------------------
@main_bp.route("/", endpoint="home")
@main_bp.route("/home")
def home():
    return render_template("index.html")

@main_bp.route("/login", methods=["GET"])
def login_page():
    next_page = request.args.get("next") or url_for("main.home")
    return render_template("login.html", next_page=next_page)

@main_bp.route("/book-appointment")
def book_appointment():
    from services.engine import get_test_data
    test_data = get_test_data()
    return render_template("appointment.html", test_data=test_data)

@main_bp.route("/profile")
def profile():
    if not session.get("user"):
        return redirect(url_for("main.login_page", next=url_for("main.profile")))
    return render_template("profile.html")

@main_bp.route("/community")
def community():
    return render_template("community.html")

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



# -------------------------- #
# AUTH ROUTES
# -------------------------- #

@main_bp.route("/login", methods=["POST"])
def api_login():
    """
    POST { email, password }
    Calls Supabase Auth (grant_type=password).
    On success, stores in Flask session.
    """
    payload = request.get_json(silent=True) or request.form or {}
    email = payload.get("email")
    password = payload.get("password")

    if not email or not password:
        return jsonify({"error": "Please enter both email and password."}), 400

    url = f"{current_app.config['SUPABASE_URL'].rstrip('/')}/auth/v1/token?grant_type=password"
    headers = {
        "Content-Type": "application/json",
        "apikey": current_app.config.get("SUPABASE_ANON_KEY", ""),
    }
    body = {"email": email, "password": password}

    try:
        resp = requests.post(url, json=body, headers=headers, timeout=8)
        data = resp.json()
    except Exception as e:
        return jsonify({"error": f"Could not reach authentication server: {str(e)}"}), 500

    if resp.status_code not in (200, 201):
        # Friendly contextual error messages
        message = (data.get("message") or "").lower()
        if "invalid login credentials" in message:
            msg = "Incorrect email or password. Please try again."
        elif "email not confirmed" in message:
            msg = "Your email is not confirmed yet. Please check your inbox."
        elif "user not found" in message:
            msg = "Account not found. Please check your details or sign up."
        else:
            msg = (
                data.get("error_description")
                or data.get("message")
                or "Login failed."
            )
        return jsonify({"error": msg}), 401

    access_token = data.get("access_token")
    user = data.get("user") or {}

    if not access_token or not user:
        return jsonify({"error": "Invalid authentication response. Please try again."}), 500

    # Optional: fetch fresh user profile
    try:
        profile_url = f"{current_app.config['SUPABASE_URL'].rstrip('/')}/auth/v1/user"
        profile_headers = {
            "Authorization": f"Bearer {access_token}",
            "apikey": current_app.config.get("SUPABASE_ANON_KEY", ""),
        }
        profile_resp = requests.get(profile_url, headers=profile_headers, timeout=8)
        if profile_resp.status_code in (200, 201):
            user = profile_resp.json()
    except Exception:
        pass

    # Save session
    session.permanent = True
    session["access_token"] = access_token
    session["user"] = {
        "uid": user.get("id"),
        "email": user.get("email"),
        "role": user.get("role"),
        "user_metadata": user.get("user_metadata", {}),
    }

    return jsonify({"ok": True, "user": session["user"]}), 200


@main_bp.route("/signup", methods=["POST"])
def api_signup():
    """
    POST { first_name, middle_name?, last_name, email, password }
    Calls Supabase signup endpoint and inserts into patients table.
    """
    payload = request.get_json(silent=True) or request.form or {}
    email = payload.get("email")
    password = payload.get("password")
    first = payload.get("first_name") or ""
    middle = payload.get("middle_name") or ""
    last = payload.get("last_name") or ""

    if not email or not password:
        return jsonify({"error": "Missing email or password."}), 400

    url = f"{current_app.config['SUPABASE_URL'].rstrip('/')}/auth/v1/signup"
    headers = {
        "Content-Type": "application/json",
        "apikey": current_app.config.get("SUPABASE_ANON_KEY", ""),
    }
    body = {
        "email": email,
        "password": password,
        "options": {
            "data": {
                "name": " ".join([p for p in [first, middle, last] if p]).strip()
            }
        },
    }

    try:
        resp = requests.post(url, json=body, headers=headers, timeout=8)
        data = resp.json()
    except Exception as e:
        return jsonify({"error": f"Signup request failed: {str(e)}"}), 500

    if resp.status_code not in (200, 201):
        msg = (
            data.get("error_description")
            or data.get("message")
            or "Signup failed."
        )
        return jsonify({"error": msg}), 400

    user = data.get("user")

    # Insert row into patients table
    if user:
        try:
            patient_row = {
                "user_id": user.get("id"),
                "first_name": first
                or (user.get("user_metadata", {}).get("name") or "").split(" ")[0]
                or "User",
                "middle_name": middle or None,
                "last_name": last or None,
                "email": email,
            }
            current_app.supabase.table("patients").insert(patient_row).execute()
        except Exception:
            pass

    return jsonify({
        "ok": True,
        "redirect": "/login?signup=success",
        "message": "Account created successfully. Please login with your new credentials."
    }), 200






@main_bp.route("/logout", methods=["POST"])
def api_logout():
    session.clear()
    return jsonify({"ok": True}), 200

@main_bp.route("/session", methods=["GET"])
def api_get_session():
    return jsonify({"user": session.get("user")}), 200

# --------------------------
# PROFILE APIs (protected)
# --------------------------
def _get_or_create_patient_row_by_userid(sb_client, uid, fallback_email=None, name=None):
    q = sb_client.table("patients").select("*").eq("user_id", uid).limit(1).execute()
    if q.data:
        return q.data[0]

    names = (name or "").split(" ", 1)
    first = names[0] if names else "Patient"
    last = names[1] if len(names) > 1 else ""

    row = {
        "user_id": uid,
        "first_name": first,
        "middle_name": None,
        "last_name": last,
        "email": fallback_email,
    }
    created = sb_client.table("patients").insert(row).execute()
    return created.data[0] if created.data else row


@main_bp.route("/api/profile", methods=["GET"])
@verify_supabase_token
def api_get_profile():
    """
    Returns merged profile:
      - Supabase Auth user (from g.user)
      - Patients table row (auto-created if missing)
    """
    uid = g.user.get("uid")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    sb = current_app.supabase

    # get or create patient row
    patient = _get_or_create_patient_row_by_userid(
        sb,
        uid,
        fallback_email=g.user.get("email"),
        name=g.user.get("user_metadata", {}).get("name"),
    )

    # merge auth + patient
    profile = {
        "uid": uid,
        "email": g.user.get("email"),
        "role": g.user.get("role"),
        "user_metadata": g.user.get("user_metadata", {}),
        "patient": patient,
    }

    return jsonify({"ok": True, "profile": profile}), 200


@main_bp.route("/api/profile/update", methods=["POST"])
@verify_supabase_token
def api_update_profile():
    """
    Updates patient row for logged-in user.
    Always returns merged profile.
    """
    uid = g.user.get("uid")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    payload = request.get_json(force=True, silent=True) or {}
    sb = current_app.supabase

    # ensure patient row exists
    patient = _get_or_create_patient_row_by_userid(
        sb,
        uid,
        fallback_email=g.user.get("email"),
        name=g.user.get("user_metadata", {}).get("name"),
    )

    # apply updates
    updates = {}
    for k in ("first_name", "middle_name", "last_name", "phone", "address", "date_of_birth", "sex"):
        if k in payload:
            updates[k] = payload[k]

    if updates:
        updated = sb.table("patients").update(updates).eq("id", patient["id"]).execute()
        if updated.data:
            patient = updated.data[0]

    profile = {
        "uid": uid,
        "email": g.user.get("email"),
        "role": g.user.get("role"),
        "user_metadata": g.user.get("user_metadata", {}),
        "patient": patient,
    }

    return jsonify({"ok": True, "profile": profile}), 200

