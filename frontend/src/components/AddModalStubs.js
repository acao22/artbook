import React, { useState, useRef } from "react";
import { X, Heart, Image as ImageIcon } from "lucide-react";

function AddModalStubs({ onClose, onSave }) {
  const [category, setCategory] = useState("Other");
  const [notesType, setNotesType] = useState("New");
  const [hearted, setHearted] = useState(false);
  const [text, setText] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Notes system
  const [existingNotes, setExistingNotes] = useState([]);
  const [noteContent, setNoteContent] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const fetchExistingNotes = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/notes?userId=user_001`);
      const data = await res.json();
      setExistingNotes(data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (notesType === "From Existing") fetchExistingNotes();
  }, [notesType, category]);

  /* -------------------- IMAGE UPLOAD -------------------- */
  const handleClickUploadBox = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  /* -------------------- SAVE -------------------- */
  const handleSave = async () => {
    const title = text.trim();
    if (!title) {
      alert("Please enter a title or description first.");
      return;
    }

    // Save stub to backend
    const payload = {
      userId: "user_001",
      mediaType: category.toLowerCase(),
      title,
      date: "2023-01-01"
    };

    let stackId = null;

    try {
      const res = await fetch("http://127.0.0.1:5000/api/stubs", {
        // your backend may use /api/stubs or /api/stacks – adjust if needed
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Error saving stub:", data);
        return;
      }
      stackId = data.id;
    } catch (err) {
      console.error("Failed to save stub:", err);
      return;
    }

    // SAVE NEW NOTE
    if (notesType === "New" && noteContent.trim()) {
      await fetch("http://127.0.0.1:5000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user_001",
          stackId,
          content: noteContent,
          isPublic: true,
        }),
      });
    }

    const newItem = {
      id: stackId,
      title,
      img: imagePreview || null,
      type: category.toLowerCase(),
      hearted,
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* ROW: Category + Image Upload */}
        <div className="modal-top-row">
          {/* Category */}
          <div className="stack-category">
            <label className="modal-label">Add to Stubs:</label>
            <select
              className="modal-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Concerts</option>
              <option>Museums</option>
              <option>Theatre</option>
              <option>Other</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="stack-image">
            <label className="modal-label">Image:</label>
            <div className="image-upload-box" onClick={handleClickUploadBox}>
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="upload-preview" />
              ) : (
                <div className="placeholder-upload">
                  <ImageIcon size={28} />
                  <p>Click to upload</p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden-file-input"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <label className="modal-label">Title / Description:</label>
        <textarea
          className="modal-textarea"
          placeholder="Enter title or description..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Notes */}
        <label className="modal-label notes-label">Notes:</label>
        <select
          className="modal-select"
          value={notesType}
          onChange={(e) => setNotesType(e.target.value)}
        >
          <option>New</option>
          <option>From Existing</option>
          <option>None</option>
        </select>

        {/* New note */}
        {notesType === "New" && (
          <textarea
            className="modal-textarea"
            placeholder="Type your note here..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
        )}

        {/* Existing notes (scrollable) */}
        {notesType === "From Existing" && (
          <div className="notes-list-container">
            <div className="notes-list">
              {existingNotes.map((note) => (
                <div
                  key={note.id}
                  className={`search-result-vertical ${
                    selectedNoteId === note.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedNoteId(note.id)}
                >
                  <p>
                    {note.content.slice(0, 80)}
                    {note.content.length > 80 ? "..." : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className={`modal-heart ${hearted ? "hearted" : ""}`}
            onClick={() => setHearted(!hearted)}
          >
            <Heart size={22} />
          </button>

          <button type="button" className="modal-save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddModalStubs;