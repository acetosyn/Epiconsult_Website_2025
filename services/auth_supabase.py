# services/auth_supabase.py
import time
import requests
from functools import wraps
from flask import request, jsonify, g, current_app, session
from jose import jwt

# a simple in-memory cache for JWKS
JWKS_CACHE = {"keys": None, "fetched_at": 0, "url": None}

def _get_jwks():
    now = time.time()
    url = current_app.config.get("SUPABASE_JWKS_URL")

    # fallback to env var if not injected
    if not url:
        url = current_app.config.get("SUPABASE_JWKS_URL") or current_app.supabase._url + "/auth/v1/keys"
    # refresh hourly
    if JWKS_CACHE["keys"] and JWKS_CACHE.get("url") == url and now - JWKS_CACHE["fetched_at"] < 3600:
        return JWKS_CACHE["keys"]
    resp = requests.get(url, timeout=6)
    resp.raise_for_status()
    JWKS_CACHE["keys"] = resp.json()
    JWKS_CACHE["fetched_at"] = now
    JWKS_CACHE["url"] = url
    return JWKS_CACHE["keys"]

def _decode_token(token):
    """
    Decode and validate Supabase JWT using JWKS.
    Returns payload dict on success or raises an exception.
    """
    jwks = _get_jwks()
    unverified = jwt.get_unverified_header(token)
    kid = unverified.get("kid")
    alg = unverified.get("alg")
    key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
    if not key:
        raise Exception("Invalid token (kid not found)")

    # jose expects the key in a jwk format object
    payload = jwt.decode(token, key, algorithms=[alg], options={"verify_aud": False})
    return payload

def verify_supabase_token(fn):
    """
    Decorator that:
     - Attempts to use Flask session['access_token'] if present
     - Otherwise expects Authorization: Bearer <token> header
     - Verifies JWT with JWKS and sets g.user to payload-like dict with uid/email
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = None
        # priority: session token
        if session and session.get("access_token"):
            token = session.get("access_token")
        else:
            authz = request.headers.get("Authorization", "")
            if authz.startswith("Bearer "):
                token = authz.split(" ", 1)[1]

        if not token:
            return jsonify({"error": "Authorization token missing"}), 401

        try:
            payload = _decode_token(token)
            # Map supabase fields to g.user for compatibility with previous code.
            g.user = {
                "uid": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("role"),
                "app_metadata": payload.get("app_metadata", {}),
                "user_metadata": payload.get("user_metadata", {}),
                "raw_payload": payload
            }
        except Exception as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401

        return fn(*args, **kwargs)
    return wrapper
