# main.py
from flask import Blueprint, render_template, request, url_for, jsonify, g
from functools import wraps

main_bp = Blueprint("main", __name__)

# --------------------------
# Basic routes
# --------------------------
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


@main_bp.route("/profile")
def profile():
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
# API endpoints for profile
# --------------------------
from services.user_db import get_user, update_user   # ✅ fixed import
from auth import verify_token


@main_bp.route("/api/profile", methods=["GET"])
@verify_token
def api_get_profile():
    """
    Return the server-side profile for the authenticated user.
    verify_token decorator sets g.user to the decoded token.
    """
    uid = g.user.get("uid")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    user = get_user(uid)
    if not user:
        # If user does not exist in users.json, create minimal record from token
        user_data = {
            "uid": uid,
            "email": g.user.get("email"),
            "name": g.user.get("name") or (g.user.get("email") or "").split("@")[0],
        }
        update_user(uid, user_data)
        user = user_data

    return jsonify(user), 200


@main_bp.route("/api/profile/update", methods=["POST"])
@verify_token
def api_update_profile():
    """
    Update the server-side profile for the authenticated user.
    Body: JSON { name, phone, address, ... }
    """
    uid = g.user.get("uid")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    payload = request.get_json(force=True, silent=True) or {}
    # Merge with existing user (keep email/uid)
    existing = get_user(uid) or {}
    updated = {
        "uid": uid,
        "email": existing.get("email") or g.user.get("email"),
        "name": payload.get("name", existing.get("name")),
        "phone": payload.get("phone", existing.get("phone")),
        "address": payload.get("address", existing.get("address")),
    }
    update_user(uid, updated)
    return jsonify(updated), 200
