from firebase_setup import database_ref
import time

# -------------------------------------------------------
# Thumbnail helpers (replace with your own Storage URLs)
# -------------------------------------------------------
THUMBNAILS = {
    "gatsby": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
    "interstellar": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    "radiohead": "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f",
    "moma": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    "collections_alice": "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
}

def stack_payload(user_id, media_type, title, creator, year, thumb_key):
    return {
        "userId": user_id,
        "mediaType": media_type,
        "externalId": "",
        "title": title,
        "creator": creator,
        "year": year,
        "coverUrl": THUMBNAILS[thumb_key],
        "hearted": False,
        "createdAt": int(time.time()),
    }

def stub_payload(user_id, category, title, date, thumb_key):
    return {
        "userId": user_id,
        "category": category,
        "title": title,
        "date": date,
        "coverUrl": THUMBNAILS[thumb_key],
        "createdAt": int(time.time()),
    }

# -------------------------------------------------------
# Wipe everything (careful!)
# -------------------------------------------------------
database_ref.set({})

def add_activity(user_id, activity_type, ref_id):
    database_ref.child("activity").child(user_id).push().set({
        "type": activity_type,
        "refId": ref_id,
        "timestamp": int(time.time()),
    })

def create_users():
    users = {
        "user_001": {
            "username": "alice",
            "stacks": {},
            "stubs": {},
            "notes": {},
            "collections": {},
            "followers": {"user_002": True},
            "following": {"user_002": True},
        },
        "user_002": {
            "username": "bob",
            "stacks": {},
            "stubs": {},
            "notes": {},
            "collections": {},
            "followers": {"user_001": True},
            "following": {"user_001": True},
        },
    }
    database_ref.child("users").set(users)
    print("Users created.")

def create_stacks():
    stacks_ref = database_ref.child("stacks")
    stack_keys = {}

    s1 = stacks_ref.push().key
    stacks_ref.child(s1).set(
        stack_payload(
            "user_001",
            "books",
            "The Great Gatsby",
            "F. Scott Fitzgerald",
            1925,
            "gatsby",
        )
    )
    database_ref.child("users/user_001/stacks").child(s1).set(True)
    add_activity("user_001", "stack", s1)
    stack_keys["gatsby"] = s1

    s2 = stacks_ref.push().key
    stacks_ref.child(s2).set(
        stack_payload(
            "user_001",
            "films",
            "Interstellar",
            "Christopher Nolan",
            2014,
            "interstellar",
        )
    )
    database_ref.child("users/user_001/stacks").child(s2).set(True)
    add_activity("user_001", "stack", s2)
    stack_keys["interstellar"] = s2

    print("Stacks created.")
    return stack_keys

def create_stubs():
    stubs_ref = database_ref.child("stubs")
    stub_keys = {}

    st1 = stubs_ref.push().key
    stubs_ref.child(st1).set(
        stub_payload(
            "user_002",
            "concerts",
            "Radiohead Live",
            "2022-10-12",
            "radiohead",
        )
    )
    database_ref.child("users/user_002/stubs").child(st1).set(True)
    add_activity("user_002", "stub", st1)
    stub_keys["radiohead"] = st1

    st2 = stubs_ref.push().key
    stubs_ref.child(st2).set(
        stub_payload(
            "user_002",
            "museums",
            "MoMA: Anselm Kiefer Exhibit",
            "2023-03-17",
            "moma",
        )
    )
    database_ref.child("users/user_002/stubs").child(st2).set(True)
    add_activity("user_002", "stub", st2)
    stub_keys["moma"] = st2

    print("Stubs created.")
    return stub_keys

def create_notes(stack_keys, stub_keys):
    notes_ref = database_ref.child("notes")
    note_keys = {}

    n1 = notes_ref.push().key
    notes_ref.child(n1).set({
        "userId": "user_001",
        "stackId": stack_keys["gatsby"],
        "stubId": None,
        "content": "A masterpiece. Haunting and beautiful.",
        "isPublic": True,
        "createdAt": int(time.time()),
    })
    database_ref.child("users/user_001/notes").child(n1).set(True)
    add_activity("user_001", "note", n1)
    note_keys["gatsby"] = n1

    n2 = notes_ref.push().key
    notes_ref.child(n2).set({
        "userId": "user_002",
        "stackId": None,
        "stubId": stub_keys["radiohead"],
        "content": "Still can't believe how good it was.",
        "isPublic": True,
        "createdAt": int(time.time()),
    })
    database_ref.child("users/user_002/notes").child(n2).set(True)
    add_activity("user_002", "note", n2)
    note_keys["radiohead"] = n2

    print("Notes created.")
    return note_keys

def create_collections(stack_keys, stub_keys):
    collections_ref = database_ref.child("collections")

    col1_id = collections_ref.push().key
    collections_ref.child(col1_id).set({
        "userId": "user_001",
        "title": "Alice’s 2025 Favorites",
        "description": "A mix of my favorite movies and concerts.",
        "coverUrl": THUMBNAILS["collections_alice"],
        "items": {
            stack_keys["gatsby"]: True,
            stack_keys["interstellar"]: True,
            stub_keys["radiohead"]: True,
        },
        "published": True,
        "createdAt": int(time.time()),
    })

    database_ref.child("users/user_001/collections").child(col1_id).set(True)
    database_ref.child("publicCollections").child(col1_id).child("user_001").set(True)
    add_activity("user_001", "collection", col1_id)

    print("Collections created.")

if __name__ == "__main__":
    create_users()
    stack_keys = create_stacks()
    stub_keys = create_stubs()
    create_notes(stack_keys, stub_keys)
    create_collections(stack_keys, stub_keys)
    print("Database fully seeded with stacks + stubs + notes + followers/following.")