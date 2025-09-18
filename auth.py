# services/auth.py
from functools import wraps
from flask import request, jsonify, g
from firebase_admin import auth, firestore
from firebase_admin_init import firebase_db   # ✅ shared Firestore client
from services import user_db                  # ✅ local JSON persistence


def verify_token(f):
    """
    Middleware decorator:
    - Verifies Firebase ID token
    - Ensures user exists in Firestore (cloud persistence)
    - Syncs user into local JSON DB (safe, not exposed)
    - Attaches decoded token into Flask global `g.user`
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        id_token = request.headers.get("Authorization")

        if not id_token:
            return jsonify({"error": "Authorization token missing"}), 401

        try:
            # ✅ Decode and verify ID token with Firebase Admin
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token["uid"]

            # --------------------------
            # Ensure Firestore user doc
            # --------------------------
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

            # --------------------------
            # Mirror user locally (safe copy)
            # --------------------------
            local_user = {
                "uid": uid,
                "email": decoded_token.get("email"),
                "name": decoded_token.get("name"),
                "provider": decoded_token.get("firebase", {}).get("sign_in_provider"),
            }
            user_db.update_user(uid, local_user)

            # Attach decoded token to Flask global context
            g.user = decoded_token

        except Exception as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401

        return f(*args, **kwargs)

    return decorated_function


print("✅ Auth module loaded with Firestore + local JSON sync")
