import React, { useState, useRef } from "react";
import { X, Heart, Image as ImageIcon } from "lucide-react";

function AddModal({ onClose, onSave }) {
  const [category, setCategory] = useState("Other");
  const [notesType, setNotesType] = useState("From Existing");
  const [hearted, setHearted] = useState(false);
  const [text, setText] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // open native file picker when clicking the box
  const handleClickUploadBox = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // when user chooses a file
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // base64 string
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const title = text.trim();
    if (!title) {
      // you can add a nicer validation UI later
      alert("Please enter a title or description first.");
      return;
    }

    const newItem = {
      id: Date.now(),
      title,
      img: imagePreview || null,           // <--- uploaded image OR null
      type: category.toLowerCase(),        // "films", "books", etc.
      hearted: hearted,
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

        {/* Add to Stack */}
        <label className="modal-label">Add to Stack:</label>

        {/* Category dropdown */}
        <select
          className="modal-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Films</option>
          <option>Books</option>
          <option>Other</option>
          <option>TV</option>
          <option>Albums</option>
        </select>

        {/* IMAGE UPLOAD */}
        <label className="modal-label" style={{ marginTop: 8 }}>
          Image:
        </label>
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

        {/* TITLE / DESCRIPTION */}
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

        <div className="modal-footer">
          {/* Heart icon */}
          <button
            type="button"
            className={`modal-heart ${hearted ? "hearted" : ""}`}
            onClick={() => setHearted(!hearted)}
          >
            <Heart size={22} />
          </button>

          {/* Save */}
          <button type="button" className="modal-save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddModal;
