from firebase_setup import database_ref
import firebase_admin
from firebase_admin import credentials, db
import time

# WARNING: This clears the database
database_ref.set({})

# -------------------------------------------------------
# Helper: Create activity feed item
# -------------------------------------------------------
def add_activity(user_id, activity_type, ref_id):
    database_ref.child("activity").child(user_id).push().set({
        "type": activity_type,  # "stack", "stub", "note", "collection"
        "refId": ref_id,
        "timestamp": int(time.time())
    })

# -------------------------------------------------------
# USERS
# -------------------------------------------------------
def create_users():
    users = {
        "user_001": {
            "username": "alice",
            "stacks": {},
            "stubs": {},
            "notes": {},
            "collections": {},
            "followers": {"user_002": True},  # Bob follows Alice
            "following": {"user_002": True},  # Alice follows Bob
        },
        "user_002": {
            "username": "bob",
            "stacks": {},
            "stubs": {},
            "notes": {},
            "collections": {},
            "followers": {"user_001": True},  # Alice follows Bob
            "following": {"user_001": True},  # Bob follows Alice
        }
    }
    database_ref.child("users").set(users)
    print("Users created.")

# -------------------------------------------------------
# STACKS
# -------------------------------------------------------
def create_stacks():
    stacks_ref = database_ref.child("stacks")
    stack_keys = {}

    # Alice adds The Great Gatsby
    s1 = stacks_ref.push().key
    stacks_ref.child(s1).set({
        "userId": "user_001",
        "mediaType": "book",
        "externalId": "OL45883W",
        "title": "The Great Gatsby",
        "creator": "F. Scott Fitzgerald",
        "year": 1925,
        "createdAt": int(time.time())
    })
    database_ref.child("users/user_001/stacks").child(s1).set(True)
    add_activity("user_001", "stack", s1)
    stack_keys["gatsby"] = s1

    # Alice adds Interstellar
    s2 = stacks_ref.push().key
    stacks_ref.child(s2).set({
        "userId": "user_001",
        "mediaType": "movie",
        "externalId": "157336",
        "title": "Interstellar",
        "creator": "Christopher Nolan",
        "year": 2014,
        "createdAt": int(time.time())
    })
    database_ref.child("users/user_001/stacks").child(s2).set(True)
    add_activity("user_001", "stack", s2)
    stack_keys["interstellar"] = s2

    print("Stacks created.")
    return stack_keys

# -------------------------------------------------------
# STUBS
# -------------------------------------------------------
def create_stubs():
    stubs_ref = database_ref.child("stubs")
    stub_keys = {}

    # Bob goes to a concert
    st1 = stubs_ref.push().key
    stubs_ref.child(st1).set({
        "userId": "user_002",
        "category": "concert",
        "title": "Radiohead Live",
        "date": "2022-10-12",
        "createdAt": int(time.time())
    })
    database_ref.child("users/user_002/stubs").child(st1).set(True)
    add_activity("user_002", "stub", st1)
    stub_keys["radiohead"] = st1

    # Bob goes to a museum
    st2 = stubs_ref.push().key
    stubs_ref.child(st2).set({
        "userId": "user_002",
        "category": "museum",
        "title": "MoMA: Anselm Kiefer Exhibit",
        "date": "2023-03-17",
        "createdAt": int(time.time())
    })
    database_ref.child("users/user_002/stubs").child(st2).set(True)
    add_activity("user_002", "stub", st2)
    stub_keys["moma"] = st2

    print("Stubs created.")
    return stub_keys

# -------------------------------------------------------
# NOTES
# -------------------------------------------------------
def create_notes(stack_keys, stub_keys):
    notes_ref = database_ref.child("notes")
    note_keys = {}

    # Alice writes a note on Gatsby
    n1 = notes_ref.push().key
    notes_ref.child(n1).set({
        "userId": "user_001",
        "stackId": stack_keys["gatsby"],
        "stubId": None,
        "content": "A masterpiece. Haunting and beautiful.",
        "isPublic": True,
        "createdAt": int(time.time())
    })
    database_ref.child("users/user_001/notes").child(n1).set(True)
    add_activity("user_001", "note", n1)
    note_keys["gatsby"] = n1

    # Bob writes a note on Radiohead concert
    n2 = notes_ref.push().key
    notes_ref.child(n2).set({
        "userId": "user_002",
        "stackId": None,
        "stubId": stub_keys["radiohead"],
        "content": "Still can't believe how good it was.",
        "isPublic": True,
        "createdAt": int(time.time())
    })
    database_ref.child("users/user_002/notes").child(n2).set(True)
    add_activity("user_002", "note", n2)
    note_keys["radiohead"] = n2

    print("Notes created.")
    return note_keys

# -------------------------------------------------------
# COLLECTIONS
# -------------------------------------------------------
def create_collections(stack_keys, stub_keys):
    collections_ref = database_ref.child("collections")

    col1_id = collections_ref.push().key
    collections_ref.child(col1_id).set({
        "userId": "user_001",
        "title": "Alice’s 2025 Favorites",
        "description": "A mix of my favorite movies and concerts.",
        "items": {
            stack_keys["gatsby"]: True,
            stack_keys["interstellar"]: True,
            stub_keys["radiohead"]: True
        },
        "published": True,
        "createdAt": int(time.time())
    })

    database_ref.child("users/user_001/collections").child(col1_id).set(True)
    database_ref.child("publicCollections").child(col1_id).child("user_001").set(True)
    add_activity("user_001", "collection", col1_id)

    print("Collections created.")

# -------------------------------------------------------
# RUN ALL
# -------------------------------------------------------
if __name__ == "__main__":
    create_users()
    stack_keys = create_stacks()
    stub_keys = create_stubs()
    note_keys = create_notes(stack_keys, stub_keys)
    create_collections(stack_keys, stub_keys)
    print("Database fully seeded with stacks + stubs + notes + followers/following.")
