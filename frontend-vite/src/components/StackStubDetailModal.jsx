import React, { useState, useEffect } from "react";
import { X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddNoteModal from "./AddNoteModal";
import { useAuth } from "@/contexts/AuthContext";

const FALLBACK_IMG =
  "https://via.placeholder.com/400x400/DDD7C8/8B7E6A?text=No+Image";

export default function StackStubDetailModal({ item, onClose, isStub = false }) {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    if (!item?.id) return;

    async function fetchNotes() {
      try {
        setLoadingNotes(true);
        const param = isStub ? `stubId=${item.id}` : `stackId=${item.id}`;
        const res = await fetch(`http://127.0.0.1:5000/api/notes?${param}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch notes (${res.status})`);
        }
        const data = await res.json();
        setNotes(data.results || []);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        setNotes([]);
      } finally {
        setLoadingNotes(false);
      }
    }

    fetchNotes();
  }, [item?.id, isStub]);

  const handleNoteSaved = async () => {
    // need to refresh notes!
    if (!item?.id) return;
    try {
      const param = isStub ? `stubId=${item.id}` : `stackId=${item.id}`;
      const res = await fetch(`http://127.0.0.1:5000/api/notes?${param}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.results || []);
      }
    } catch (err) {
      console.error("Failed to refresh notes:", err);
    }
    setEditingNote(null);
    setShowAddNote(false);
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/notes/${noteId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete note");
      }
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error("Failed to delete note:", err);
      alert("Failed to delete note. Please try again.");
    }
  };

  const imageUrl = item?.coverUrl || item?.img || FALLBACK_IMG;
  const title = item?.title || "Untitled";
  const creator = item?.creator || "";
  const year = item?.year || null;
  const mediaType = item?.mediaType || item?.type || item?.category || "other";

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="w-full max-w-4xl rounded-3xl bg-[#f8f3e9] shadow-2xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between p-6 border-b border-[#e6dfd3]">
            <h2 className="text-2xl font-semibold text-gray-900">Item Details</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-200 transition-colors"
              aria-label="Close"
            >
              <X size={24} className="text-gray-700" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Image and Title Section */}
            <div className="flex gap-6 flex-col md:flex-row">
              <div className="flex-shrink-0">
                <div className="w-full md:w-64 h-64 rounded-2xl overflow-hidden bg-[#f4efe4] shadow-lg">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {mediaType.toUpperCase()}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                    {title}
                  </h3>
                  {creator && (
                    <p className="text-lg text-gray-700 mt-2 italic">{creator}</p>
                  )}
                  {year && (
                    <p className="text-sm text-gray-600 mt-1">{year}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="border-t border-[#e6dfd3] pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Notes ({notes.length})
                </h3>
                {currentUser && (
                  <Button
                    onClick={() => setShowAddNote(true)}
                    className="bg-[#CAC444] text-black hover:bg-[#b5b03f] rounded-full"
                  >
                    Add Note
                  </Button>
                )}
              </div>

              {loadingNotes ? (
                <div className="text-center py-8 text-gray-500">Loading notes...</div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No notes yet.</p>
                  {currentUser && (
                    <p className="text-sm mt-2">Click "Add Note" to create one.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-2xl bg-white border border-[#e6dfd3] p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          {note.title && (
                            <h4 className="text-lg font-semibold text-gray-900">
                              {note.title}
                            </h4>
                          )}
                          {note.body && (
                            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                              {note.body}
                            </p>
                          )}
                          {!note.title && !note.body && note.content && (
                            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                              {note.content}
                            </p>
                          )}
                          {note.createdAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(note.createdAt * 1000).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {currentUser && (
                          <button
                            onClick={() => setEditingNote(note)}
                            className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Edit note"
                          >
                            <Pencil size={18} className="text-gray-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddNote && currentUser && (
        <AddNoteModal
          onClose={() => setShowAddNote(false)}
          onSave={handleNoteSaved}
          userId={currentUser.uid}
          initialNote={
            item?.id
              ? {
                  id: null,
                  stackId: isStub ? null : item.id.toString(),
                  stubId: isStub ? item.id.toString() : null,
                  title: item.title ? `Notes on ${item.title}` : "",
                }
              : null
          }
          onDelete={handleDeleteNote}
        />
      )}

      {/* Edit Note Modal */}
      {editingNote && currentUser && (
        <AddNoteModal
          onClose={() => setEditingNote(null)}
          onSave={handleNoteSaved}
          userId={currentUser.uid}
          initialNote={editingNote}
          onDelete={handleDeleteNote}
        />
      )}
    </>
  );
}
