from flask import Flask, jsonify, request
import requests
from firebase_setup import database_ref
from flask_cors import CORS
import time
import base64
from typing import Tuple

app = Flask(__name__)
# CORS(app, origins=["http://localhost:3000"])
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

SPOTIFY_CLIENT_ID = "fa717cc062404cdd81374a4145725899"
SPOTIFY_CLIENT_SECRET = ""
TMDB_API_KEY = "1f655943c2cbd205457f62599e088978"

def build_note_content(title: str | None, body: str | None) -> str:
    parts = []
    if title and title.strip():
        parts.append(title.strip())
    if body and body.strip():
        parts.append(body.strip())
    return "\n".join(parts).strip()


def split_note_content(content: str | None) -> Tuple[str, str]:
    if not content:
        return "", ""
    lines = content.split("\n")
    title = lines[0] if lines else ""
    body = "\n".join(lines[1:]).strip() if len(lines) > 1 else ""
    return title, body


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
    url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={query}"

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


@app.route("/api/tv")
def get_tv():
    query = request.args.get("query", "succession")
    url = f"https://api.themoviedb.org/3/search/tv?api_key={TMDB_API_KEY}&query={query}"

    res = requests.get(url)
    if res.status_code != 200:
        return jsonify({"error": "Failed to fetch tv shows"}), 500

    data = res.json()
    shows = [
        {
            "title": show.get("name"),
            "thumbnail": f"https://image.tmdb.org/t/p/w500{show['poster_path']}" if show.get("poster_path") else None,
            "first_air_date": show.get("first_air_date"),
        }
        for show in data.get("results", [])[:5]
    ]
    return jsonify({"results": shows})

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
    content = (data.get("content") or "").strip()
    if not content:
        content = build_note_content(data.get("title"), data.get("body"))
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

@app.route("/api/notes/<note_id>", methods=["PATCH"])
def update_note(note_id):
    data = request.get_json() or {}
    allowed_keys = {"stackId", "stubId", "isPublic"}
    updates = {key: data.get(key) for key in allowed_keys if key in data}
    content_override = (data.get("content") or "").strip()
    title_override = data.get("title")
    body_override = data.get("body")

    note_ref = database_ref.child("notes").child(note_id)
    existing = note_ref.get()

    if not existing:
        return jsonify({"error": "Note not found"}), 404

    if content_override:
        updates["content"] = content_override
    elif title_override is not None or body_override is not None:
        current_title, current_body = split_note_content(existing.get("content"))
        new_title = title_override if title_override is not None else current_title
        new_body = body_override if body_override is not None else current_body
        updates["content"] = build_note_content(new_title, new_body)

    if not updates:
        return jsonify({"error": "No valid fields provided"}), 400

    note_ref.update(updates)
    latest = note_ref.get() or {}

    return jsonify({"message": "Note updated", "note": {**latest, "id": note_id}})

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
    cover_url = data.get("coverUrl") or ""

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
        "coverUrl": cover_url,      
        "hearted": False,            # optional default
        "createdAt": int(time.time())
    })

    # reference under user
    database_ref.child(f"users/{user_id}/stacks").child(stack_id).set(True)

    return jsonify({"message": "Stack item added", "id": stack_id}), 201


# ------------------------------------
# PATCH: Toggle heart on a stack item
# ------------------------------------
@app.route("/api/stacks/<stack_id>/heart", methods=["PATCH"])
def update_heart(stack_id):
    data = request.get_json()
    new_val = data.get("hearted")

    if new_val is None:
        return jsonify({"error": "Missing 'hearted' field"}), 400

    # Update in Firebase
    stack_ref = database_ref.child("stacks").child(stack_id)
    if not stack_ref.get():
        return jsonify({"error": "Stack not found"}), 404

    stack_ref.update({"hearted": new_val})

    return jsonify({"message": "Heart updated", "hearted": new_val})


# get for stacks
@app.route("/api/stacks", methods=["GET"])
def get_stacks():
    user_id = request.args.get("userId")

    stacks = database_ref.child("stacks").get() or {}
    results = []

    for stack_id, stack in stacks.items():
        if user_id and stack.get("userId") != user_id:
            continue

        results.append({ "id": stack_id, **stack })

    return jsonify({ "results": results })



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
    cover_url = data.get("coverUrl") or ""

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
        "coverUrl": cover_url,
        "hearted": bool(data.get("hearted", False)),
        "createdAt": int(time.time())
    })

    # reference under user
    database_ref.child(f"users/{user_id}/stubs").child(stub_id).set(True)

    return jsonify({"message": "Stub added", "id": stub_id}), 201

@app.route("/api/stubs", methods=["GET"])
def get_stubs():
    user_id = request.args.get("userId")

    stubs = database_ref.child("stubs").get() or {}
    results = []

    for stub_id, stub in stubs.items():
        if user_id and stub.get("userId") != user_id:
            continue

        results.append({"id": stub_id, **stub})

    return jsonify({"results": results})


@app.route("/api/stubs/<stub_id>/heart", methods=["PATCH"])
def update_stub_heart(stub_id):
    data = request.get_json() or {}
    new_val = data.get("hearted")

    if new_val is None:
        return jsonify({"error": "Missing 'hearted' field"}), 400

    stub_ref = database_ref.child("stubs").child(stub_id)
    if not stub_ref.get():
        return jsonify({"error": "Stub not found"}), 404

    stub_ref.update({"hearted": bool(new_val)})
    return jsonify({"message": "Stub heart updated", "hearted": bool(new_val)})


def sanitize_collection_items(items):
    if not isinstance(items, list):
        return []

    sanitized = []
    for item in items:
        if not isinstance(item, dict):
            continue
        sanitized.append({
            "id": str(item.get("id")) if item.get("id") is not None else "",
            "title": item.get("title"),
            "coverUrl": item.get("coverUrl") or item.get("img") or "",
            "type": item.get("type") or item.get("mediaType") or "other",
        })
    return sanitized


def sanitize_item_ids(item_ids, fallback_items=None):
    if isinstance(item_ids, list):
        sanitized = [
            str(item_id)
            for item_id in item_ids
            if item_id is not None and str(item_id).strip() != ""
        ]
        if sanitized:
            return sanitized

    if not fallback_items:
        return []

    derived = []
    for item in fallback_items:
        item_id = item.get("id")
        if item_id:
            derived.append(str(item_id))
    return derived


@app.route("/api/collections", methods=["POST"])
def create_collection():
    data = request.get_json() or {}
    user_id = data.get("userId")
    title = (data.get("title") or "").strip()

    if not user_id or not title:
        return jsonify({"error": "Missing required fields"}), 400

    items = sanitize_collection_items(data.get("items") or [])
    item_ids = sanitize_item_ids(data.get("itemIds"), items)

    collection_ref = database_ref.child("collections").push()
    collection_id = collection_ref.key
    payload = {
        "userId": user_id,
        "title": title,
        "subtitle": data.get("subtitle") or "",
        "cover": data.get("cover") or "",
        "items": items,
        "itemIds": item_ids,
        "createdAt": int(time.time()),
        "updatedAt": int(time.time()),
    }
    collection_ref.set(payload)
    database_ref.child(f"users/{user_id}/collections").child(collection_id).set(True)

    return jsonify({"message": "Collection created", "id": collection_id, "collection": payload}), 201


@app.route("/api/collections", methods=["GET"])
def get_collections():
    user_id = request.args.get("userId")

    collections = database_ref.child("collections").get() or {}
    results = []

    for collection_id, collection in collections.items():
        if user_id and collection.get("userId") != user_id:
            continue
        results.append({"id": collection_id, **collection})

    return jsonify({"results": results})


@app.route("/api/collections/<collection_id>", methods=["PATCH"])
def update_collection(collection_id):
    data = request.get_json() or {}
    allowed_keys = {"title", "subtitle", "cover", "items", "itemIds"}
    updates = {}

    for key in allowed_keys:
        if key in data:
            updates[key] = data.get(key)

    if not updates:
        return jsonify({"error": "No valid fields provided"}), 400

    if "items" in updates:
        updates["items"] = sanitize_collection_items(updates.get("items"))
    if "itemIds" in updates:
        updates["itemIds"] = sanitize_item_ids(updates.get("itemIds"), updates.get("items"))
    elif "items" in updates:
        updates["itemIds"] = sanitize_item_ids(None, updates.get("items"))

    updates["updatedAt"] = int(time.time())

    collection_ref = database_ref.child("collections").child(collection_id)
    existing = collection_ref.get()
    if not existing:
        return jsonify({"error": "Collection not found"}), 404

    collection_ref.update(updates)
    latest = collection_ref.get() or {}

    return jsonify({"message": "Collection updated", "collection": {**latest, "id": collection_id}})


@app.route("/api/collections/<collection_id>", methods=["DELETE"])
def delete_collection(collection_id):
    collection_ref = database_ref.child("collections").child(collection_id)
    existing = collection_ref.get()

    if not existing:
        return jsonify({"error": "Collection not found"}), 404

    collection_ref.delete()

    user_id = existing.get("userId")
    if user_id:
        database_ref.child(f"users/{user_id}/collections").child(collection_id).delete()
    return jsonify({"message": "Collection deleted"})


# --------------------------------------
# SEARCH ENDPOINTS
# --------------------------------------
def normalize_query(value):
    return (value or "").strip().lower()


@app.route("/api/search/profiles", methods=["GET"])
def search_profiles():
    query = normalize_query(request.args.get("query"))
    if not query:
        return jsonify({"results": []})

    users = database_ref.child("users").get() or {}
    results = []

    for user_id, user in users.items():
        username = (user.get("username") or "").strip()
        if not username:
            continue
        if query not in username.lower():
            continue

        followers = user.get("followers") or {}
        following = user.get("following") or {}

        results.append({
            "id": user_id,
            "username": username,
            "followers": len(followers),
            "following": len(following),
        })

    return jsonify({"results": results})


@app.route("/api/search/collections", methods=["GET"])
def search_collections():
    query = normalize_query(request.args.get("query"))
    if not query:
        return jsonify({"results": []})

    collections = database_ref.child("collections").get() or {}
    users = database_ref.child("users").get() or {}
    results = []

    for collection_id, collection in collections.items():
        title = (collection.get("title") or "").strip()
        subtitle = (collection.get("subtitle") or "").strip()
        combined = f"{title} {subtitle}".strip().lower()
        if query not in combined:
            continue

        owner_id = collection.get("userId")
        owner_username = ""
        if owner_id and owner_id in users:
            owner_username = users[owner_id].get("username") or ""

        results.append({
            "id": collection_id,
            "title": title or "Untitled collection",
            "subtitle": subtitle,
            "cover": collection.get("cover") or "",
            "userId": owner_id,
            "username": owner_username,
            "itemCount": len(collection.get("items") or []),
        })

    return jsonify({"results": results})


@app.route("/api/search/notes", methods=["GET"])
def search_notes():
    query = normalize_query(request.args.get("query"))
    if not query:
        return jsonify({"results": []})

    notes = database_ref.child("notes").get() or {}
    users = database_ref.child("users").get() or {}
    results = []

    for note_id, note in notes.items():
        if note.get("isPublic", True) is False:
            continue

        content = (note.get("content") or "").strip()
        if query not in content.lower():
            continue

        lines = content.split("\n")
        title = lines[0] if lines else "Untitled note"
        body = "\n".join(lines[1:]).strip()
        owner_id = note.get("userId")
        owner_username = ""
        if owner_id and owner_id in users:
            owner_username = users[owner_id].get("username") or ""

        results.append({
            "id": note_id,
            "title": title or "Untitled note",
            "body": body,
            "userId": owner_id,
            "username": owner_username,
            "createdAt": note.get("createdAt"),
        })

    return jsonify({"results": results})


if __name__ == "__main__":
    app.run(debug=True)
