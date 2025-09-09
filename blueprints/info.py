from flask import Blueprint

info_bp = Blueprint("info", __name__)

@info_bp.route("/privacy-policy")
def privacy_policy():
    return "<h1>Privacy Policy Page Coming Soon</h1>"

@info_bp.route("/terms-of-service")
def terms_of_service():
    return "<h1>Terms of Service Page Coming Soon</h1>"

@info_bp.route("/cookie-policy")
def cookie_policy():
    return "<h1>Cookie Policy Page Coming Soon</h1>"

@info_bp.route("/accessibility")
def accessibility():
    return "<h1>Accessibility Page Coming Soon</h1>"
