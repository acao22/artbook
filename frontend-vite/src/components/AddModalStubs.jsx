import React, { useState, useRef, useEffect } from "react";
import { X, Heart, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_OPTIONS = ["Concerts", "Museums", "Theatre", "Other"];
const NOTE_OPTIONS = ["New", "From Existing", "None"];

export default function AddModalStubs({ onClose, onSave }) {
  const [category, setCategory] = useState("Other");
  const [notesType, setNotesType] = useState("New");
  const [hearted, setHearted] = useState(false);
  const [text, setText] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [existingNotes, setExistingNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => {
    if (notesType !== "From Existing") {
      setSelectedNoteId(null);
      return;
    }

    let isMounted = true;

    const fetchExistingNotes = async () => {
      try {
        setNotesLoading(true);
        const res = await fetch("http://127.0.0.1:5000/api/notes?userId=user_001");
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
  }, [notesType]);

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

    const payload = {
      userId: "user_001",
      mediaType: category.toLowerCase(),
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

      if (notesType === "New" && noteContent.trim()) {
        await fetch("http://127.0.0.1:5000/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "user_001",
            stubId,
            content: noteContent.trim(),
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
            <h2 className="text-lg font-semibold text-gray-800">Add to stubs</h2>
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
            <textarea
              className="w-full min-h-[90px] rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#AEC7E0]/70 focus:border-transparent"
              placeholder="Write your note..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
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
                existingNotes.map((note) => (
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
                    {note.content?.slice(0, 120)}
                    {note.content && note.content.length > 120 ? "..." : ""}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

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
              Save stub
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
