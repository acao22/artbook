from firebase_setup import database_ref


def resolve_cover_from_stack(stack_id: str | None) -> str:
    if not stack_id:
        return ""
    stack = database_ref.child("stacks").child(stack_id).get() or {}
    if not stack:
        return ""
    return (
        stack.get("coverUrl")
        or stack.get("img")
        or stack.get("thumbnail")
        or ""
    )


def resolve_cover_from_stub(stub_id: str | None) -> str:
    if not stub_id:
        return ""
    stub = database_ref.child("stubs").child(stub_id).get() or {}
    if not stub:
        return ""
    return (
        stub.get("coverUrl")
        or stub.get("img")
        or stub.get("thumbnail")
        or ""
    )


def split_content(raw: str | None) -> tuple[str, str]:
    if not raw:
        return "", ""
    lines = raw.split("\n")
    title = (lines[0] or "").strip() if lines else ""
    body = "\n".join(lines[1:]).strip() if len(lines) > 1 else ""
    return title, body


def backfill_notes() -> None:
    notes_ref = database_ref.child("notes")
    notes = notes_ref.get() or {}

    updated_cover = 0
    updated_text = 0

    for note_id, note in notes.items():
        updates: dict[str, str] = {}

        # cover art
        existing_cover = note.get("coverUrl") or note.get("thumbnail")
        if not existing_cover:
            cover = resolve_cover_from_stack(note.get("stackId")) or resolve_cover_from_stub(
                note.get("stubId")
            )
            if cover:
                updates["coverUrl"] = cover
                updated_cover += 1

        # title/body
        title = (note.get("title") or "").strip()
        body = (note.get("body") or "").strip()
        content = note.get("content") or ""
        if not title or not body:
            derived_title, derived_body = split_content(content)
            if not title:
                updates["title"] = derived_title or "Untitled note"
            if not body:
                updates["body"] = derived_body
            if "title" in updates or "body" in updates:
                updated_text += 1

        if updates:
            notes_ref.child(note_id).update(updates)
            print(f"[update] note {note_id}: {list(updates.keys())}")

    print(
        "Finished backfill."
        f" Covers added: {updated_cover}."
        f" Notes with text normalized: {updated_text}."
    )


if __name__ == "__main__":
    backfill_notes()