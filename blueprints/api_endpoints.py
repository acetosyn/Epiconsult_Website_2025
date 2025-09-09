from flask import Blueprint, jsonify
from services import data_loader
from auth import verify_token

api_bp = Blueprint("api", __name__)

@api_bp.route("/get-daily-tips")
def get_daily_tips():
    return jsonify(data_loader.tips)

@api_bp.route("/faqs")
def get_faqs():
    return jsonify(data_loader.faqs)

# Example protected API
@api_bp.route("/user-data")
@verify_token
def user_data():
    return {"message": "This is protected!"}
