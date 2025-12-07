"""
Append-only seeding script for adding extra user profiles and notes.

Unlike `add_data.py`, this script never clears the database. It simply
adds a handful of additional users plus their public notes so search
results have more variety.
"""

import copy
import time
from typing import Dict, List, Set

from firebase_setup import database_ref

# ---------------------------------------------------------------------
# Static payloads you can customize
# ---------------------------------------------------------------------
DEFAULT_USER_TEMPLATE = {
    "collections": {},
    "followers": {},
    "following": {},
    "notes": {},
    "stacks": {},
    "stubs": {},
}

EXTERNAL_USERS: List[Dict] = [
    {
        "userId": "user_101",
        "username": "angie",
    },
    {
        "userId": "user_102",
        "username": "luci",
    },
    {
        "userId": "user_103",
        "username": "rob",
    },
]

EXTERNAL_NOTES: List[Dict] = [
    {
        "userId": "user_101",
        "content": "Notes on One Battle After Another",
        "stackId": None,
        "stubId": None,
        "isPublic": True,
    },
    {
        "userId": "user_101",
        "content": "Notes on The Myth of Sisyphus for PHIL2200 reading group.",
        "stackId": None,
        "stubId": None,
        "isPublic": True,
    },
    {
        "userId": "user_102",
        "content": "Paul Thomas Anderson and One Battle After Another",
        "stackId": None,
        "stubId": None,
        "isPublic": True,
    },
    {
        "userId": "user_102",
        "content": "Live mix breakdown from last weekend's warehouse set.",
        "stackId": None,
        "stubId": None,
        "isPublic": True,
    },
    {
        "userId": "user_103",
        "content": "Annotated outline for Glissant's Poetics of Relation.",
        "stackId": None,
        "stubId": None,
        "isPublic": True,
    },
]


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------
def add_activity(user_id: str, activity_type: str, ref_id: str) -> None:
    """Mirror the activity feed structure from `add_data.py`."""
    database_ref.child("activity").child(user_id).push().set(
        {
            "type": activity_type,
            "refId": ref_id,
            "timestamp": int(time.time()),
        }
    )


def _deep_merge_user_payload(user_payload: Dict) -> Dict:
    """Ensure new users include the expected nested keys."""
    merged = copy.deepcopy(DEFAULT_USER_TEMPLATE)
    for key, value in user_payload.items():
        if key == "userId":
            continue
        if isinstance(value, dict) and key in merged:
            merged[key].update(value)
        else:
            merged[key] = value
    if "username" not in merged:
        raise ValueError("Each user payload must include a username.")
    return merged


def create_external_users() -> int:
    created = 0
    for user in EXTERNAL_USERS:
        user_id = user["userId"]
        user_ref = database_ref.child("users").child(user_id)
        if user_ref.get():
            print(f"User {user_id} already exists. Skipping profile creation.")
            continue
        user_doc = _deep_merge_user_payload(user)
        user_ref.set(user_doc)
        created += 1
        print(f"Added profile for {user_id} ({user_doc['username']}).")
    return created


def _existing_note_signatures() -> Set[str]:
    """Avoid inserting duplicate notes (userId + content)."""
    notes_snapshot = database_ref.child("notes").get() or {}
    signatures: Set[str] = set()
    for note in notes_snapshot.values():
        if not isinstance(note, dict):
            continue
        user_id = note.get("userId")
        content = (note.get("content") or "").strip().lower()
        if user_id and content:
            signatures.add(f"{user_id}::{content}")
    return signatures


def _build_note_payload(note: Dict) -> Dict:
    payload = {
        "userId": note["userId"],
        "content": note["content"],
        "isPublic": note.get("isPublic", True),
        "stackId": note.get("stackId"),
        "stubId": note.get("stubId"),
        "createdAt": note.get("createdAt") or int(time.time()),
    }
    return payload


def create_external_notes() -> int:
    created = 0
    signatures = _existing_note_signatures()
    notes_ref = database_ref.child("notes")

    for note in EXTERNAL_NOTES:
        user_id = note["userId"]
        user_exists = database_ref.child("users").child(user_id).get()
        if not user_exists:
            print(f"User {user_id} not found. Skipping note insertion.")
            continue

        signature = f"{user_id}::{note['content'].strip().lower()}"
        if signature in signatures:
            print(f"Note already exists for {user_id}. Skipping duplicate.")
            continue

        payload = _build_note_payload(note)
        note_ref = notes_ref.push()
        note_ref.set(payload)
        database_ref.child("users").child(user_id).child("notes").child(note_ref.key).set(True)
        add_activity(user_id, "note", note_ref.key)

        signatures.add(signature)
        created += 1
        print(f"Added note for {user_id}: '{payload['content'][:40]}...'")

    return created


def run():
    users_created = create_external_users()
    notes_created = create_external_notes()
    print(f"Done. Created {users_created} users and {notes_created} notes.")


if __name__ == "__main__":
    run()