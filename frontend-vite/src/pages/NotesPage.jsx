import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AddNoteModal from "../components/AddNoteModal";
import FilterBar from "../components/FilterBar";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_PATH_BUILDER = (subPath = "") =>
  `/profile/${subPath}`.replace(/\/+$/, "") || "/profile";

export default function NotesPage({
  userId = null,
  allowCreate = true,
  buildProfilePath = DEFAULT_PATH_BUILDER,
}) {
  const { currentUser } = useAuth();
  const resolvedUserId = userId || currentUser?.uid;
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const navigate = useNavigate();

  const refreshNotes = useCallback(async () => {
    try {
      // we do if theres userid is provided, show that user's notes. 
      // ow show all public notes
      const url = resolvedUserId
        ? `http://127.0.0.1:5000/api/notes?userId=${resolvedUserId}`
        : `http://127.0.0.1:5000/api/notes`;
      const res = await fetch(url);
      const data = await res.json();
      const formatted =
        (data.results || []).map((note) => {
          const createdAt = note.createdAt
            ? new Date(note.createdAt * 1000)
            : new Date();
          let resolvedTitle = (note.title || "").trim();
          let resolvedBody = (note.body || "").trim();
          if (!resolvedTitle && !resolvedBody) {
            const [firstLine, ...rest] = (note.content || "").split("\n");
            resolvedTitle = firstLine || "Untitled note";
            resolvedBody = rest.join("\n").trim();
          }
          return {
            id: note.id,
            content: note.content || "",
            createdAt,
            stackId: note.stackId || null,
            stubId: note.stubId || null,
            mediaTitle: note.mediaTitle || "",
            mediaType: note.mediaType || "",
            coverUrl: note.coverUrl || note.thumbnail || "",
            title: resolvedTitle || "Untitled note",
            body: resolvedBody,
          };
        }) ?? [];
      setNotes(formatted);
    } catch (err) {
      console.error("Failed to load notes:", err);
    }
  }, [resolvedUserId]);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  const formattedNotes = useMemo(() => notes, [notes]);

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
      navigate(buildProfilePath(`notes/${note.id}`));
    },
    [navigate, buildProfilePath]
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
        openModal={allowCreate ? handleAddNote : undefined}
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
              <div className="flex-shrink-0 self-stretch md:self-center md:ml-auto">
                <div className="w-24 h-24 rounded-2xl border border-white/50 bg-white/40 flex items-center justify-center overflow-hidden">
                  <img
                    src={note.coverUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {showModal && allowCreate && currentUser && (
        <AddNoteModal
          initialNote={null}
          onClose={handleCloseModal}
          onSave={handleModalSave}
          userId={currentUser.uid}
        />
      )}
    </section>
  );
}