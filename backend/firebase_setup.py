import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("servicekey.json")

firebase_admin.initialize_app(cred, {
    "databaseURL": "https://artsbook-default-rtdb.firebaseio.com/"
})

database_ref = db.reference("/")