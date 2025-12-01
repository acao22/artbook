import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AddNoteModal from "../components/AddNoteModal";
import FilterBar from "../components/FilterBar";

const USER_ID = "user_001";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const navigate = useNavigate();

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

  const formattedNotes = useMemo(() => {
    return notes.map((note) => {
      const [title, ...rest] = note.content.split("\n");
      const body = rest.join("\n").trim();
      return {
        ...note,
        title: title || "Untitled note",
        body,
      };
    });
  }, [notes]);

  const sortedNotes = useMemo(() => {
    if (sortBy === "title") {
      return [...formattedNotes].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }
    if (sortBy === "recent") {
      return [...formattedNotes].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    }
    return formattedNotes;
  }, [formattedNotes, sortBy]);

  const handleAddNote = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleNoteClick = useCallback(
    (note) => {
      navigate(`/profile/notes/${note.id}`);
    },
    [navigate]
  );

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleModalSave = useCallback(() => {
    setShowModal(false);
    refreshNotes();
  }, [refreshNotes]);

  return (
    <section className="pb-20">
      <FilterBar
        activeFilters={{}}
        onToggleFilter={() => {}}
        sortBy={sortBy}
        onSortChange={setSortBy}
        openModal={handleAddNote}
        visibleFilters={[]}
        heartedOnlyActive={undefined}
        onHeartedToggle={undefined}
        hideFilters
      />

      <div className="max-w-5xl mx-auto px-6 mt-6 space-y-4">
        {sortedNotes.map((note) => (
          <article
            key={note.id}
            role="button"
            tabIndex={0}
            onClick={() => handleNoteClick(note)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleNoteClick(note);
              }
            }}
            className="rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 p-5 bg-[#AEC7E0]/40 text-[#1f2a37] cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#CAC444]/60"
          >
            <div className="flex-1 space-y-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-[#1f2a37]/70">
                  {note.mediaType || "note"}
                </p>
                <h2 className="text-lg font-semibold leading-tight line-clamp-2">
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

            {note.coverUrl && (
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-white/40 bg-white/40 self-start md:self-center">
                <img
                  src={note.coverUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </article>
        ))}
      </div>

      {showModal && (
        <AddNoteModal
          initialNote={null}
          onClose={handleCloseModal}
          onSave={handleModalSave}
        />
      )}
    </section>
  );
}