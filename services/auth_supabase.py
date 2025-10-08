# services/auth_supabase.py
import time
import requests
from functools import wraps
from flask import request, jsonify, g, current_app, session
from jose import jwt

# Simple in-memory cache for JWKS
JWKS_CACHE = {"keys": None, "fetched_at": 0, "url": None}

def _get_jwks():
    now = time.time()
    url = current_app.config.get("SUPABASE_JWKS_URL")
    if not url:
        # fallback if not configured
        base = getattr(current_app, "config", {}).get("SUPABASE_URL")
        if base:
            url = f"{base.rstrip('/')}/auth/v1/keys"
    if not url:
        raise RuntimeError("SUPABASE_JWKS_URL is not configured")

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
        raise Exception("Invalid token (kid not found in JWKS)")

    # jwt.decode accepts a JWK dict here
    payload = jwt.decode(token, key, algorithms=[alg], options={"verify_aud": False})
    return payload

def verify_supabase_token(fn):
    """
    Decorator that:
     - First tries to use server-side Flask session (session['access_token'] + session['user'])
       and sets g.user directly (no JWKS call).
     - Otherwise expects Authorization: Bearer <token> header and verifies JWT via JWKS.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # 1) If the server already set a session user & token, trust it for browser flows.
        if session and session.get("access_token") and session.get("user"):
            g.user = {
                # normalize to the shape other code expects
                "uid": session["user"].get("uid") or session["user"].get("id"),
                "email": session["user"].get("email"),
                "role": session["user"].get("role"),
                "user_metadata": session["user"].get("user_metadata", {}),
                "app_metadata": session["user"].get("app_metadata", {}),
                "raw_payload": None,
            }
            return fn(*args, **kwargs)

        # 2) Otherwise try Authorization header
        authz = request.headers.get("Authorization", "")
        token = None
        if authz.startswith("Bearer "):
            token = authz.split(" ", 1)[1].strip()

        if not token:
            return jsonify({"error": "Authorization token missing"}), 401

        try:
            payload = _decode_token(token)
            g.user = {
                "uid": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("role"),
                "app_metadata": payload.get("app_metadata", {}),
                "user_metadata": payload.get("user_metadata", {}),
                "raw_payload": payload,
            }
        except Exception as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401

        return fn(*args, **kwargs)
    return wrapper
