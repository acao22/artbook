import time
from firebase_setup import database_ref

SAMPLE_NOTES = [
    {
        "title": "Recent trip to MoMA",
        "body": "Special exhibitions and highlights.",
        "mediaType": "museum",
        "mediaTitle": "MoMA Visit",
        "userId": "user_101",
        "coverUrl": "https://images.moma.org/museum/exterior.jpg",
    },
    {
        "title": "War and Peace brain dump",
        "body": "Notes for my final paper.",
        "mediaType": "books",
        "mediaTitle": "War and Peace",
        "userId": "user_101",
        "coverUrl": "https://upload.wikimedia.org/wikipedia/commons/8/8b/War-and-peace_1873.jpg",
    },
]


def note_exists(title: str) -> bool:
    all_notes = database_ref.child("notes").get() or {}
    for note in all_notes.values():
        if (note.get("title") or "").strip().lower() == title.strip().lower():
            return True
    return False


def add_sample_notes():
    created = 0
    for index, payload in enumerate(SAMPLE_NOTES):
        
        #if note_exists(payload["title"]):
        #    print(f"Skipping '{payload['title']}' (already exists)")
        #    continue

        note_ref = database_ref.child("notes").push()
        note_id = note_ref.key
        created_at = int(time.time()) - index * 3600
        note_ref.set(
            {
                "userId": payload["userId"],
                "stackId": None,
                "stubId": None,
                "title": payload["title"],
                "body": payload["body"],
                "content": f"{payload['title']}\n{payload['body']}",
                "isPublic": True,
                "mediaType": payload.get("mediaType", "other"),
                "mediaTitle": payload.get("mediaTitle", ""),
                "coverUrl": payload.get("coverUrl", ""),
                "createdAt": created_at,
            }
        )

        database_ref.child(f"users/{payload['userId']}/notes").child(note_id).set(True)
        created += 1
        print(f"Added note '{payload['title']}' under {payload['userId']}")

    print(f"Done. Created {created} new notes.")


if __name__ == "__main__":
    add_sample_notes()