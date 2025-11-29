from flask import Flask, jsonify, request
import requests
from firebase_setup import database_ref
from flask_cors import CORS
import time
import base64

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

SPOTIFY_CLIENT_ID = "fa717cc062404cdd81374a4145725899"
SPOTIFY_CLIENT_SECRET = ""

@app.route("/")
def hello():
    return jsonify({"message": "Hello World from backend"})

#api for books
@app.route("/api/books")
def get_books():
    query = request.args.get("query", "harry potter")
    url = f"https://openlibrary.org/search.json?q={query}"
    res = requests.get(url)

    if res.status_code != 200:
        return jsonify({"error": "Failed to fetch books"}), 500

    data = res.json()
    books = [
        {
            "title": b.get("title"),
            "author": b.get("author_name", ["Unknown"])[0],
            "first_publish_year": b.get("first_publish_year"),
            "thumbnail": f"http://covers.openlibrary.org/b/id/{b['cover_i']}-M.jpg" if b.get("cover_i") else None
        }
        for b in data.get("docs", [])[:5]
    ]
    return jsonify({"results": books})

#api for movies and tv
@app.route("/api/movies")
def get_movies():
    query = request.args.get("query", "inception")
    api_key = "1f655943c2cbd205457f62599e088978"
    url = f"https://api.themoviedb.org/3/search/movie?api_key={api_key}&query={query}"

    res = requests.get(url)
    if res.status_code != 200:
        return jsonify({"error": "Failed to fetch movies"}), 500

    data = res.json()
    movies = [
        {
            "title": m.get("title"),
            "thumbnail": f"https://image.tmdb.org/t/p/w500{m['poster_path']}" if m.get("poster_path") else None,
        }
        for m in data.get("results", [])[:5]
    ]
    return jsonify({"results": movies})

def get_spotify_token():
    url = "https://accounts.spotify.com/api/token"
    auth_str = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()

    headers = {
        "Authorization": f"Basic {b64_auth_str}"
    }
    data = {"grant_type": "client_credentials"}

    res = requests.post(url, headers=headers, data=data)
    res.raise_for_status()
    return res.json()["access_token"]

#api for music albums
@app.route("/api/albums")
def get_albums():
    query = request.args.get("query", "beatles")
    token = get_spotify_token()

    url = f"https://api.spotify.com/v1/search?q={query}&type=album&limit=5"
    headers = {"Authorization": f"Bearer {token}"}

    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        return jsonify({"error": "Failed to fetch albums"}), 500

    data = res.json()
    albums = [
        {
            "title": a["name"],
            "artist": a["artists"][0]["name"] if a.get("artists") else "Unknown",
            "thumbnail": a["images"][0]["url"] if a.get("images") else None,
            "release_date": a.get("release_date")
        }
        for a in data.get("albums", {}).get("items", [])
    ]
    return jsonify({"results": albums})

#ADD USER_NOTE
@app.route("/api/notes", methods=["POST"])
def create_note():
    data = request.get_json()
    user_id = data.get("userId")
    stack_id = data.get("stackId")
    stub_id = data.get("stubId")
    content = data.get("content")
    is_public = data.get("isPublic", True)

    if not user_id or not content:
        return jsonify({"error": "Missing required fields"}), 400

    note_ref = database_ref.child("notes").push()
    note_ref.set({
        "userId": user_id,
        "stackId": stack_id,
        "stubId": stub_id,
        "content": content,
        "isPublic": is_public,
        "createdAt": int(time.time())
    })

    return jsonify({"message": "Note created", "id": note_ref.key}), 201

#GET NOTES
@app.route("/api/notes", methods=["GET"])
def get_notes():
    user_id = request.args.get("userId")
    stack_id = request.args.get("stackId")
    stub_id = request.args.get("stubId")

    all_notes = database_ref.child("notes").get() or {}
    filtered = []

    for note_id, note in all_notes.items():
        if user_id and note.get("userId") != user_id:
            continue
        if stack_id and note.get("stackId") != stack_id:
            continue
        if stub_id and note.get("stubId") != stub_id:
            continue
        filtered.append({**note, "id": note_id})

    return jsonify({"results": filtered})

# ----------------------------
# ADD STACK ITEM
# ----------------------------
@app.route("/api/stacks", methods=["POST"])
def add_stack():
    data = request.get_json()
    print("Incoming data:", data)
    user_id = data.get("userId")
    media_type = data.get("mediaType")  # movie, book, album, etc
    title = data.get("title")
    creator = data.get("creator", "")
    external_id = data.get("externalId") or ""
    year = data.get("year")
    coverUrl = data.get("thumbnail")

    if not user_id or not media_type or not title:
        return jsonify({"error": "Missing required fields"}), 400

    # create stack item
    stack_ref = database_ref.child("stacks").push()
    stack_id = stack_ref.key
    stack_ref.set({
        "userId": user_id,
        "mediaType": media_type,
        "externalId": external_id or "",
        "title": title,
        "creator": creator,
        "year": year, 
        "coverUrl": coverUrl,
        "createdAt": int(time.time())
    })

    # reference under user
    database_ref.child(f"users/{user_id}/stacks").child(stack_id).set(True)

    return jsonify({"message": "Stack item added", "id": stack_id}), 201

# ----------------------------
# ADD STUB ITEM
# ----------------------------
@app.route("/api/stubs", methods=["POST"])
def add_stub():
    data = request.get_json()
    print("Incoming stub:", data)

    user_id = data.get("userId")
    category = data.get("mediaType")
    title = data.get("title")
    date = data.get("date")  # YYYY-MM-DD

    if not user_id or not category or not title:
        return jsonify({"error": "Missing required fields"}), 400

    # create stub item
    stub_ref = database_ref.child("stubs").push()
    stub_id = stub_ref.key

    stub_ref.set({
        "userId": user_id,
        "category": category,
        "title": title,
        "date": date,
        "createdAt": int(time.time())
    })

    # reference under user
    database_ref.child(f"users/{user_id}/stubs").child(stub_id).set(True)

    return jsonify({"message": "Stub added", "id": stub_id}), 201
