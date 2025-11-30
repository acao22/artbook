import React, { useEffect, useMemo, useState } from "react";
import AddNoteModal from "../components/AddNoteModal";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const USER_ID = "user_001";
const NOTE_BG = "#AEC7E0";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const refreshNotes = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/notes?userId=${USER_ID}`);
      const data = await res.json();
      const formatted =
        (data.results || []).map((note) => ({
          id: note.id,
          content: note.content || "",
          createdAt: note.createdAt ? new Date(note.createdAt * 1000) : new Date(),
          stackId: note.stackId || null,
          stubId: note.stubId || null,
          mediaTitle: note.mediaTitle || "",
          mediaType: note.mediaType || "",
          coverUrl: note.coverUrl || note.thumbnail || "",
        })) ?? [];
      setNotes(formatted);
    } catch (err) {
      console.error("Failed to load notes:", err);
    }
  };

  useEffect(() => {
    refreshNotes();
  }, []);

  const noteCards = useMemo(
    () =>
      notes.map((note) => {
        const [title, ...rest] = note.content.split("\n");
        const body = rest.join("\n").trim();
        return {
          ...note,
          title: title || "Untitled note",
          body,
        };
      }),
    [notes]
  );

  return (
    <div className="px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setShowModal(true)}
          className="rounded-full bg-[#CAC444] text-black shadow-md w-10 h-10 flex items-center justify-center"
        >
          <Plus size={18} />
        </Button>
      </div>

      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        {noteCards.map((note) => (
          <article
            key={note.id}
            className="rounded-3xl shadow-sm flex items-center gap-4 p-4"
            style={{ backgroundColor: NOTE_BG }}
          >
            <div className="flex-1 space-y-2 text-[#1f2a37]">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-[#1f2a37]/70">
                  {note.mediaType || "note"}
                </p>
                <h2 className="text-lg font-semibold line-clamp-2">
                  {note.title}
                </h2>
              </div>
              {note.body && (
                <p className="text-sm line-clamp-2 opacity-80">{note.body}</p>
              )}

              <div className="pt-1 text-xs opacity-70">
                {note.createdAt.toLocaleDateString()}
              </div>
            </div>

            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-white/40 bg-white/40">
              {note.coverUrl ? (
                <img
                  src={note.coverUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-[#1f2a37]/60">
                  No image
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {showModal && (
        <AddNoteModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            refreshNotes();
          }}
        />
      )}
    </div>
  );
}
