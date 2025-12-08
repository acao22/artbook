import React, { useState, useRef, useEffect } from "react";
import { X, Heart, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEFAULT_USER_ID = "user_001";

const CATEGORY_OPTIONS = ["Concerts", "Museums", "Theatre", "Other"];
const NOTE_OPTIONS = ["New", "From Existing", "None"];
const normalizeStubCategory = (value) => {
  const lower = value?.toLowerCase?.() || "";
  if (lower.startsWith("concert")) return "Concerts";
  if (lower.startsWith("museum")) return "Museums";
  if (lower.startsWith("theatre") || lower.startsWith("theater"))
    return "Theatre";
  return "Other";
};

export default function AddModalStubs({
  onClose,
  onSave,
  userId,
  initialStub = null,
  onDelete,
}) {
  // auth
  if (!userId) {
    console.error("AddModalStubs: userId is required");
    return null;
  }
  const [category, setCategory] = useState(
    normalizeStubCategory(initialStub?.category)
  );
  const [notesType, setNotesType] = useState(initialStub ? "None" : "New");
  const [hearted, setHearted] = useState(Boolean(initialStub?.hearted));
  const [text, setText] = useState(initialStub?.title || "");

  const [imagePreview, setImagePreview] = useState(
    initialStub?.coverUrl || initialStub?.img || null
  );
  const fileInputRef = useRef(null);

  const [existingNotes, setExistingNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const isEditing = Boolean(initialStub?.id);
  const allowNotes = !isEditing;

  useEffect(() => {
    if (initialStub) {
      setCategory(normalizeStubCategory(initialStub.category));
      setText(initialStub.title || "");
      setImagePreview(initialStub.coverUrl || initialStub.img || null);
      setHearted(Boolean(initialStub.hearted));
      setNotesType("None");
      setNoteTitle("");
      setNoteBody("");
    } else {
      setCategory("Other");
      setText("");
      setImagePreview(null);
      setHearted(false);
      setNotesType("New");
      setNoteTitle("");
      setNoteBody("");
    }
  }, [initialStub]);

  useEffect(() => {
    if (!initialStub && notesType === "New" && text && !noteTitle.trim()) {
      const baseLabel = text.split("\n")[0]?.trim() || "this experience";
      setNoteTitle(`Notes on ${baseLabel}`);
    }
  }, [text, notesType, initialStub]);

  useEffect(() => {
    if (notesType !== "From Existing" || !allowNotes) {
      setSelectedNoteId(null);
    }
    if (notesType !== "New") {
      setNoteTitle("");
      setNoteBody("");
    }
    if (notesType !== "From Existing" || !allowNotes) {
      return;
    }

    let isMounted = true;

    const fetchExistingNotes = async () => {
      try {
        setNotesLoading(true);
        const res = await fetch(
          `http://127.0.0.1:5000/api/notes?userId=${userId}`
        );
        if (!res.ok) throw new Error(`Failed to fetch notes (${res.status})`);
        const data = await res.json();
        if (isMounted) {
          setExistingNotes(data.results || []);
        }
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        if (isMounted) setExistingNotes([]);
      } finally {
        if (isMounted) setNotesLoading(false);
      }
    };

    fetchExistingNotes();
    return () => {
      isMounted = false;
    };
  }, [notesType, userId, allowNotes]);

  const handleClickUploadBox = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const title = text.trim();
    if (!title) {
      alert("Please enter a title or description first.");
      return;
    }

    const mediaType = category.toLowerCase();

    if (isEditing && initialStub?.id) {
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/stubs/${initialStub.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category: mediaType,
              title,
              coverUrl: imagePreview || null,
            }),
          }
        );
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to update stub:", text);
          alert("Unable to update this stub right now.");
          return;
        }
        onSave?.();
        onClose();
      } catch (err) {
        console.error("Failed to update stub:", err);
        alert("Unable to update this stub right now.");
      }
      return;
    }

    const payload = {
      userId,
      mediaType,
      title,
      date: new Date().toISOString().slice(0, 10),
      coverUrl: imagePreview || null,
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/api/stubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Error saving stub:", data);
        alert("Something went wrong saving this stub.");
        return;
      }

      const stubId = data.id;

      if (notesType === "New" && (noteTitle.trim() || noteBody.trim())) {
        const baseLabel = title.split("\n")[0]?.trim() || "this experience";
        const payloadTitle = noteTitle.trim() || `Notes on ${baseLabel}`;
        const payloadBody = noteBody.trim();
        await fetch("http://127.0.0.1:5000/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            stubId,
            title: payloadTitle,
            body: payloadBody,
            isPublic: true,
          }),
        });
      }

      if (notesType === "From Existing" && selectedNoteId) {
        await fetch(`http://127.0.0.1:5000/api/notes/${selectedNoteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stubId,
          }),
        });
      }

      onSave({
        id: stubId,
        title,
        img: imagePreview || null,
        coverUrl: imagePreview || null,
        type: category.toLowerCase(),
        hearted,
      });

      onClose();
    } catch (err) {
      console.error("Failed to save stub:", err);
      alert("Failed to save stub. Check console for details.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[#f8f3e9] shadow-lg p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {isEditing ? "Edit stub" : "Add to stubs"}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Log an experience like a concert, museum visit, or anything else you want to remember.
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="flex gap-4 items-start flex-wrap">
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Category</p>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-[#d9d0c2] bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#CAC444]/60"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="w-40 space-y-1.5">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Image</p>
            <button
              type="button"
              onClick={handleClickUploadBox}
              className="relative w-full h-24 rounded-xl border border-dashed border-gray-300 bg-[#eee5d8] flex flex-col items-center justify-center text-xs text-gray-600 hover:border-gray-400 hover:bg-[#e7ddce] transition"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover rounded-xl"
                />
              ) : (
                <>
                  <ImageIcon size={22} className="mb-1" />
                  <span>Upload image</span>
                </>
              )}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Title / description</p>
          <textarea
            className="w-full min-h-[90px] rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CAC444]/60 focus:border-transparent"
            placeholder="Add context about the experience..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {allowNotes && (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Notes</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {NOTE_OPTIONS.map((option) => {
                  const isActive = notesType === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setNotesType(option)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                        isActive
                          ? "bg-[#CAC444] border-[#CAC444] text-black"
                          : "bg-white border-[#ddd] text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {notesType === "New" && (
              <div className="space-y-2 w-full">
                <Input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note title"
                  className="rounded-full border border-[#d8cfbf] bg-white"
                />
                <textarea
                  className="w-full min-h-[90px] rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#AEC7E0]/70 focus:border-transparent"
                  placeholder="Write your note..."
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                />
              </div>
            )}

            {notesType === "From Existing" && (
              <div className="rounded-lg border border-[#e0d6c8] bg-white max-h-40 overflow-y-auto">
                {notesLoading ? (
                  <div className="p-3 text-sm text-gray-500">Loading your notes...</div>
                ) : existingNotes.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">
                    No notes found. Visit the Notes page to create one first.
                  </div>
                ) : (
                  existingNotes.map((note) => {
                    const previewTitle = (note.title || "").trim();
                    const previewBody = (note.body || note.content || "")
                      .trim()
                      .slice(0, 160);

                    return (
                      <button
                        type="button"
                        key={note.id}
                        onClick={() => setSelectedNoteId(note.id)}
                        className={`w-full text-left px-3 py-2 text-sm transition ${
                          selectedNoteId === note.id
                            ? "bg-[#e9e2cf] text-gray-900"
                            : "hover:bg-[#f4efe4] text-gray-700"
                        }`}
                      >
                        <p className="font-semibold">
                          {previewTitle || "Untitled note"}
                        </p>
                        {previewBody && (
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {previewBody}
                          </p>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className={`flex items-center gap-1 text-sm transition ${
              hearted ? "text-[#c08c00]" : "text-gray-500"
            }`}
            onClick={() => setHearted((prev) => !prev)}
          >
            <Heart
              size={18}
              className={hearted ? "fill-[#c08c00]" : "fill-none"}
            />
            <span>{hearted ? "Marked as favorite" : "Mark as favorite"}</span>
          </button>

          <div className="flex gap-2">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="rounded-lg"
                onClick={async () => {
                  if (!initialStub?.id) return;
                  const confirmDelete = window.confirm(
                    "Delete this stub? This cannot be undone."
                  );
                  if (!confirmDelete) return;
                  await onDelete(initialStub.id);
                }}
              >
                Delete
              </Button>
            )}
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={onClose}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-[#CAC444] hover:bg-[#b5b03f] text-black px-4"
            >
              {isEditing ? "Save changes" : "Save stub"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
