import React, { useState, useRef } from "react";
import { X, Heart, Image as ImageIcon } from "lucide-react";

function AddModal({ onClose, onSave }) {
  const [category, setCategory] = useState("Other");
  const [notesType, setNotesType] = useState("New");
  const [hearted, setHearted] = useState(false);
  const [text, setText] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

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

  const search = async () => {
    if (!searchTerm.trim()) return;

    let url = "";
    if (category.toLowerCase() === "books") {
      url = `http://127.0.0.1:5000/api/books?query=${searchTerm}`;
    } else if (category.toLowerCase() === "films" || category.toLowerCase() === "tv") {
      url = `http://127.0.0.1:5000/api/movies?query=${searchTerm}`;
    } else if (category.toLowerCase() === "albums") {
      url = `http://127.0.0.1:5000/api/albums?query=${searchTerm}`;
    } else {
      return;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error("HTTP error", res.status, await res.text());
        return;
      }
      const data = await res.json();

      const normalizedResults = (data.results || []).map((item) => ({
        id: item.id,
        title: item.title,
        author: category === "Books" ? item.author
                : category === "Albums" ? item.artist 
                : "", // TMDB movies/TV have no author
        thumbnail: item.thumbnail || null,
        releaseYear: item.first_publish_year || (item.release_date ? parseInt(item.release_date.split("-")[0]) : null),
      }));
      setResults(normalizedResults);
    } catch (err) {
      console.error(err);
    }
  };
 
  const handleSelectResult = (item) => {
    setSelectedItem(item);
    setImagePreview(item.thumbnail || null);
    setResults([]);
  };

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

  const handleSave =async () => {
    const title = selectedItem?.title || text.trim();
    if (!title) {
      alert("Please enter a title or description first.");
      return;
    }

    const payload = {
      userId: "user_001",
      mediaType: category.toLowerCase(),
      externalId: selectedItem?.id || null,
      title,
      creator: selectedItem?.author || "",
      year: selectedItem?.first_publish_year || null,
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/api/stacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const stackId = data.id;
      if (!res.ok) {
        console.error("Error saving stack:", data);
        return;
      }

      if (notesType === "New" && noteContent.trim()) {
        await fetch("http://127.0.0.1:5000/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "user_001",
            stackId,
            content: noteContent,
            isPublic: true
          })
        });
      }

      const newItem = {
        id: data.id,
        title,
        img: imagePreview || null,
        type: category.toLowerCase(),
        hearted,
        year: payload.year,
      };
      onSave(newItem);
      onClose();
    } catch (err) {
      console.error("Failed to save stack:", err);
  }
};

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Add to Stack + Image Upload Row */}
        <div className="modal-top-row">
          {/* Left: Category dropdown */}
          <div className="stack-category">
            <label className="modal-label">Add to Stack:</label>
            <select
              className="modal-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Films</option>
              <option>TV</option>
              <option>Books</option>
              <option>Albums</option>
              <option>Other</option>
            </select>
          </div>

          {/* Right: Image Upload */}
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

        {/* SEARCH */}
        {/* if category is not other */}
        {category.toLowerCase() === "books" || category.toLowerCase() === "films" || category.toLowerCase() === "tv"  || category.toLowerCase() === "albums" ? (
          <>
            <label className="modal-label" style={{ marginTop: 12 }}>
              Search {category}:
            </label>
            <div className="search-box">
              <input
                type="text"
                placeholder={`Search ${category}...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedItem(null);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") search(); }}
              />
              <button type="button" onClick={search}>
                Search
              </button>

              {results.length > 0 && !selectedItem && (
                <div className="search-results-vertical">
                  {results.map((item, idx) => (
                    <div
                      key={idx}
                      className={`search-result-vertical ${selectedItem === item ? "selected" : ""}`}
                      onClick={() => handleSelectResult(item)}
                    >
                      <p className="search-result-title">{item.title}</p>
                      <small className="search-result-author">{item.author}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
          {/* if category IS other, no search */}
            <label className="modal-label" style={{ marginTop: 12 }}>
              Title / Description:
            </label>
            <textarea
              className="modal-textarea"
              placeholder="Enter title or description..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </>
        )}

        {/* Notes section */}
        <label className="modal-label notes-label">Notes:</label>
        <select className="modal-select" value={notesType} onChange={(e) => setNotesType(e.target.value)}>
          <option>New</option>
          <option>From Existing</option>
          <option>None</option>
        </select>

        {notesType === "New" && (
          <textarea
            className="modal-textarea"
            placeholder="Type your notes here..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
        )}

        {notesType === "From Existing" && (
          <div className="notes-list-container">
            <div className="notes-list">
              {existingNotes.map((note) => (
                <div
                  key={note.id}
                  className={`search-result-vertical ${selectedNoteId === note.id ? "selected" : ""}`}
                  onClick={() => setSelectedNoteId(note.id)}
                >
                  <p>{note.content.slice(0, 80)}{note.content.length > 80 ? "..." : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}

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
