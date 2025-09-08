# auth.py
from functools import wraps
from flask import request, jsonify, g
from firebase_admin import auth, firestore
from firebase_admin_init import firebase_db   # ✅ use shared Firestore client


def verify_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        id_token = request.headers.get("Authorization")

        if not id_token:
            return jsonify({"error": "Authorization token missing"}), 401

        try:
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token["uid"]

            # Ensure user exists in Firestore (first-time login)
            user_ref = firebase_db.collection("users").document(uid)
            if not user_ref.get().exists:
                user_data = {
                    "uid": uid,
                    "email": decoded_token.get("email"),
                    "name": decoded_token.get("name"),
                    "provider": decoded_token.get("firebase", {}).get("sign_in_provider"),
                    "created_at": firestore.SERVER_TIMESTAMP,
                }
                user_ref.set(user_data)

            # Attach user info to Flask global context
            g.user = decoded_token

        except Exception as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401

        return f(*args, **kwargs)

    return decorated_function
print("✅ Auth module loaded")