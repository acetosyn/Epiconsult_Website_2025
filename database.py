# database.py
import firebase_admin
from firebase_admin import credentials, auth, firestore

# Load service account key
cred = credentials.Certificate("ServiceAccountKey.json")

# Initialize Firebase app (singleton)
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

# Firestore client
db = firestore.client()
