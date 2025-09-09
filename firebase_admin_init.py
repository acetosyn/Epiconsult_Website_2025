# firebase_admin_init.py
import firebase_admin
from firebase_admin import credentials, auth, firestore

# Initialize Firebase Admin only once
cred = credentials.Certificate("serviceAccountKey.json")
default_app = firebase_admin.initialize_app(cred)

# Export these for other modules
firebase_auth = auth
firebase_db = firestore.client()
