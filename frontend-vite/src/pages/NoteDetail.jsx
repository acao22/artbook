import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AddNoteModal from "../components/AddNoteModal";

const DEFAULT_USER_ID = "user_001";
const DEFAULT_PATH_BUILDER = (subPath = "") =>
  `/profile/${subPath}`.replace(/\/+$/, "") || "/profile";

const normalizeNote = (raw) => {
  if (!raw) return null;
  const createdAt = raw.createdAt
    ? new Date(raw.createdAt * 1000)
    : new Date();
  let title = (raw.title || "").trim();
  let body = (raw.body || "").trim();
  if (!title && !body) {
    const [firstLine, ...rest] = (raw.content || "").split("\n");
    title = firstLine || "Untitled note";
    body = rest.join("\n").trim();
  }
  return {
    id: raw.id,
    stackId: raw.stackId || null,
    stubId: raw.stubId || null,
    mediaTitle: raw.mediaTitle || "",
    mediaType: raw.mediaType || "",
    coverUrl: raw.coverUrl || raw.thumbnail || "",
    createdAt,
    title: title || "Untitled note",
    body,
  };
};

export default function NoteDetail({
  userId = DEFAULT_USER_ID,
  allowEdit = true,
  buildProfilePath = DEFAULT_PATH_BUILDER,
}) {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadNote = useCallback(async () => {
    if (!noteId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/notes?userId=${userId}`
      );
      if (!res.ok) {
        console.error("Failed to load notes:", res.status);
        return;
      }
      const data = await res.json();
      const match = (data.results || []).find(
        (entry) => entry.id?.toString() === noteId
      );
      setNote(normalizeNote(match));
    } catch (err) {
      console.error("Failed to fetch note:", err);
    } finally {
      setLoading(false);
    }
  }, [noteId, userId]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const pageTitle = useMemo(() => {
    if (loading) return "Loading note…";
    if (!note) return "Note not found";
    return note.title;
  }, [loading, note]);

  return (
    <div className="px-8 py-10 space-y-8">
      <button
        type="button"
        onClick={() => navigate(buildProfilePath("notes"))}
        className="text-sm text-gray-600 hover:text-black"
      >
        ← Back to notes
      </button>

      {loading ? (
        <div className="rounded-3xl border border-dashed border-gray-300 px-6 py-16 text-center text-gray-500">
          Fetching note…
        </div>
      ) : !note ? (
        <div className="rounded-3xl border border-dashed border-gray-300 px-6 py-16 text-center text-gray-500 space-y-4">
          <p>We couldn&apos;t find that note.</p>
          <Button onClick={() => navigate(buildProfilePath("notes"))}>
            Back to notes
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {note.mediaType || "Note"}
              </p>
              <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
                {note.title}
              </h2>
              <p className="text-sm text-gray-500">
                {note.createdAt.toLocaleString()}
              </p>
            </div>

            {allowEdit && (
              <Button
                className="rounded-full bg-[#CAC444] text-black self-start"
                onClick={() => setShowModal(true)}
              >
                Edit note
              </Button>
            )}
          </div>

          <div className="rounded-3xl bg-white shadow-sm border border-[#f1eadf] p-6">
            {note.body ? (
              <p className="text-base leading-relaxed whitespace-pre-line text-[#1f2a37]">
                {note.body}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                No additional content for this note yet.
              </p>
            )}
          </div>
        </div>
      )}

      {showModal && note && allowEdit && (
        <AddNoteModal
          initialNote={note}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            loadNote();
          }}
          userId={userId}
        />
      )}
    </div>
  );
}