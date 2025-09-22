# main.py
from flask import Blueprint, render_template, request, url_for, jsonify, g, current_app, session, redirect
from functools import wraps
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
def login():
    # Show login form. Next param carried through form action.
    next_page = request.args.get("next") or url_for("main.home")
    return render_template("login.html", next_page=next_page)


@main_bp.route("/book-appointment")
def book_appointment():
    from services.engine import get_test_data
    test_data = get_test_data()
    return render_template("appointment.html", test_data=test_data)


@main_bp.route("/profile")
def profile():
    # If not logged in, redirect to login
    if not session.get("user"):
        return redirect(url_for("main.login", next=url_for("main.profile")))
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


# --------------------------
# API endpoints for profile (server-side)
# Using verify_supabase_token to guard API calls when called via Bearer token.
# But for typical browser flows we rely on Flask session; still decorator supports session token.
# --------------------------
# Helper to interact with patients table
def _get_or_create_patient_row_by_userid(sb_client, uid, fallback_email=None, name=None):
    # Try to find patient by user_id
    q = sb_client.table("patients").select("*").eq("user_id", uid).limit(1).execute()
    if q.data:
        return q.data[0]
    # Not found - create best-effort
    names = (name or "").split(" ", 1)
    first = names[0] if names else "Patient"
    last = names[1] if len(names) > 1 else ""
    row = {
        "user_id": uid,
        "first_name": first,
        "middle_name": None,
        "last_name": last,
        "email": fallback_email
    }
    created = sb_client.table("patients").insert(row).execute()
    return created.data[0] if created.data else row

# API: get profile (can be called via Bearer token or rely on session)
@main_bp.route("/api/profile", methods=["GET"])
@verify_supabase_token
def api_get_profile():
    """
    Return the server-side profile for the authenticated user.
    verify_supabase_token sets g.user.
    """
    uid = g.user.get("uid")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    sb = current_app.supabase
    # Try to fetch patient row matching auth user id
    res = sb.table("patients").select("*").eq("user_id", uid).limit(1).execute()
    if res.data:
        patient = res.data[0]
        return jsonify(patient), 200

    # create one if missing (best effort)
    patient = _get_or_create_patient_row_by_userid(sb, uid, fallback_email=g.user.get("email"), name=g.user.get("user_metadata", {}).get("name"))
    return jsonify(patient), 201


@main_bp.route("/api/profile/update", methods=["POST"])
@verify_supabase_token
def api_update_profile():
    """
    Update the server-side profile for the authenticated user.
    Body: JSON { first_name, middle_name, last_name, phone, address, ... }
    """
    uid = g.user.get("uid")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    payload = request.get_json(force=True, silent=True) or {}
    sb = current_app.supabase

    # find existing patient row
    res = sb.table("patients").select("*").eq("user_id", uid).limit(1).execute()
    if res.data:
        patient = res.data[0]
        updates = {}
        # allow editable fields
        for k in ("first_name", "middle_name", "last_name", "phone", "address", "date_of_birth", "sex"):
            if k in payload:
                updates[k] = payload[k]
        if updates:
            updated = sb.table("patients").update(updates).eq("id", patient["id"]).execute()
            return jsonify(updated.data[0]), 200
        return jsonify(patient), 200

    # missing: create
    row = {
        "user_id": uid,
        "first_name": payload.get("first_name") or g.user.get("user_metadata", {}).get("name", "").split(" ")[0] or "Patient",
        "middle_name": payload.get("middle_name"),
        "last_name": payload.get("last_name"),
        "email": g.user.get("email"),
        "phone": payload.get("phone"),
        "address": payload.get("address"),
    }
    created = sb.table("patients").insert(row).execute()
    return jsonify(created.data[0]), 201



@main_bp.route("/signup", methods=["POST"])
def api_signup():
    payload = request.get_json(force=True)
    email = payload.get("email")
    password = payload.get("password")
    first_name = payload.get("first_name")
    middle_name = payload.get("middle_name")
    last_name = payload.get("last_name")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    sb = current_app.supabase

    # 1. Create user in Supabase Auth
    auth_resp = sb.auth.sign_up({
        "email": email,
        "password": password,
        "options": { "data": { "name": f"{first_name or ''} {last_name or ''}".strip() } }
    })
    if auth_resp.get("error"):
        return jsonify({"error": auth_resp["error"]["message"]}), 400

    user = auth_resp["user"]

    # 2. Insert into patients table
    sb.table("patients").insert({
        "user_id": user["id"],
        "first_name": first_name,
        "middle_name": middle_name,
        "last_name": last_name,
        "email": email
    }).execute()

    return jsonify({"message": "Account created. Please check your email to verify."}), 200
