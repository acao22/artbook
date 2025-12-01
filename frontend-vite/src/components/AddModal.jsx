import React, { useState, useRef, useEffect } from "react";
import { X, Heart, Image as ImageIcon, Search as SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

import { Separator } from "@/components/ui/separator";

function normalizeResult(category, raw, idx) {
  const lower = category.toLowerCase();
  const fallbackId =
    raw.id ||
    raw.externalId ||
    raw.key ||
    raw.cover_edition_key ||
    `${lower}-${raw.title || raw.name || idx}`;

  if (lower === "music") {
    return {
      id: fallbackId,
      title: raw.title || raw.name || "Untitled album",
      creator: raw.artist || raw.artist_name || "",
      year: raw.releaseYear || (raw.release_date ? parseInt(raw.release_date.slice(0, 4)) : null),
      thumbnail: raw.thumbnail || raw.image || null,
    };
  }

  if (lower === "books") {
    return {
      id: fallbackId,
      title: raw.title || "Untitled book",
      creator: raw.author || raw.authors?.[0] || "",
      year:
        raw.first_publish_year ||
        (raw.publishedDate ? parseInt(raw.publishedDate.slice(0, 4)) : null),
      thumbnail: raw.thumbnail || raw.cover || null,
    };
  }

  if (lower === "tv") {
    return {
      id: fallbackId,
      title: raw.title || raw.name || "Untitled series",
      creator: raw.creator || raw.network || "",
      year: raw.first_air_date
        ? parseInt(raw.first_air_date.slice(0, 4))
        : null,
      thumbnail: raw.thumbnail || raw.poster || null,
    };
  }

  return {
    id: fallbackId,
    title: raw.title || raw.name || "Untitled movie",
    creator: raw.director || "",
    year: raw.year || (raw.release_date ? parseInt(raw.release_date.slice(0, 4)) : null),
    thumbnail: raw.thumbnail || raw.poster || null,
  };
}

async function searchExternal(category, query) {
  if (!query.trim()) return [];

  const base = "http://127.0.0.1:5000";

  let url = "";
  const lower = category.toLowerCase();

  if (lower === "music") {
    url = `${base}/api/albums?query=${encodeURIComponent(query)}`;
  } else if (lower === "books") {
    url = `${base}/api/books?query=${encodeURIComponent(query)}`;
  } else if (lower === "movies") {
    url = `${base}/api/movies?query=${encodeURIComponent(query)}`;
  } else if (lower === "tv") {
    url = `${base}/api/tv?query=${encodeURIComponent(query)}`;
  } else {
    return [];
  }

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Search error", res.status, await res.text());
    return [];
  }
  const data = await res.json();
  const rawResults = data.results || data.items || [];

  return rawResults.map((item, idx) => normalizeResult(category, item, idx));
}

function AddModal({ onClose, onSave }) {
  const [category, setCategory] = useState("Music");
  const [hearted, setHearted] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [titleOverride, setTitleOverride] = useState("");
  const [notesType, setNotesType] = useState("New");
  const [noteContent, setNoteContent] = useState("");
  const [existingNotes, setExistingNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const isManualCategory = category === "Other";
  const isExternalCategory = !isManualCategory;

  useEffect(() => {
    setSearchTerm("");
    setResults([]);
    setSelectedItem(null);
    setTitleOverride("");
  }, [category]);

  useEffect(() => {
    if (notesType !== "From Existing") {
      setSelectedNoteId(null);
      if (notesType !== "New") {
        setNoteContent("");
      }
      return;
    }

    let isMounted = true;
    const fetchNotes = async () => {
      try {
        setNotesLoading(true);
        const res = await fetch(
          "http://127.0.0.1:5000/api/notes?userId=user_001"
        );
        if (!res.ok) {
          throw new Error(`Failed to load notes (${res.status})`);
        }
        const data = await res.json();
        if (isMounted) {
          setExistingNotes(data.results || []);
        }
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        if (isMounted) {
          setExistingNotes([]);
        }
      } finally {
        if (isMounted) {
          setNotesLoading(false);
        }
      }
    };

    fetchNotes();
    return () => {
      isMounted = false;
    };
  }, [notesType]);

  // HANDLERS

  const handleClickUploadBox = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSearch = async () => {
    if (!isExternalCategory || !searchTerm.trim()) return;
    try {
      setSearching(true);
      setResults([]);
      setSelectedItem(null);
      const data = await searchExternal(category, searchTerm);
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (item) => {
    setSelectedItem(item);
    setTitleOverride(item.title || "");
    if (item.thumbnail) {
      setImagePreview(item.thumbnail);
    }
    setResults([]);
  };

  const handleSave = async () => {
    const mediaType = category.toLowerCase();
    const fallbackTitle = isManualCategory ? "Untitled item" : "";
    const title = titleOverride.trim() || selectedItem?.title || fallbackTitle;

    if (!title) {
      alert("Please enter or select a title first.");
      return;
    }

    const payload = {
      userId: "user_001",
      mediaType,
      externalId: selectedItem?.id || null,
      title,
      creator: selectedItem?.creator || "",
      year: selectedItem?.year ?? null,
      coverUrl: selectedItem?.thumbnail || imagePreview || null,
    };


    try {
      const stackRes = await fetch("http://127.0.0.1:5000/api/stacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const stackData = await stackRes.json();
      if (!stackRes.ok) {
        console.error("Error saving stack:", stackData);
        alert("Something went wrong saving this item.");
        return;
      }

      const stackId = stackData.id;

      if (notesType === "New" && noteContent.trim()) {
        const noteTitle = title ? `Notes on ${title}` : "Notes on this item";
        const noteBody = noteContent.trim();
        await fetch("http://127.0.0.1:5000/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "user_001",
            stackId,
            title: noteTitle,
            body: noteBody,
            isPublic: true,
          }),
        });
      }

      if (notesType === "From Existing" && selectedNoteId) {
        await fetch(`http://127.0.0.1:5000/api/notes/${selectedNoteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stackId,
          }),
        });
      }

      const newItem = {
        id: stackId,
        title,
        img: selectedItem?.thumbnail || imagePreview || null,
        coverUrl: selectedItem?.thumbnail || imagePreview || null,
        type: mediaType,
        hearted,
        year: payload.year,
      };

      onSave(newItem);
      onClose();
    } catch (err) {
      console.error("Failed to save stack:", err);
      alert("Failed to save. Check console for details.");
    }
  };

  // RENDER

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[#f8f3e9] shadow-lg p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Add to stack</h2>
            <p className="text-xs text-gray-500 mt-1">
              {isManualCategory
                ? "Upload an image or describe anything that doesn't fit the other categories."
                : `Search and select a ${category.toLowerCase()} from an external source, then add your own note.`}
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

        {/* category + image row */}
        <div className="flex gap-4 items-start flex-wrap">
          {/*  category dropdown */}
          <div className="flex-1 min-w-[180px] space-y-1.5">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Category
            </p>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between rounded-md border bg-white px-3 py-2 text-left text-sm shadow-sm hover:bg-neutral-50 transition">
                {category}
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-40 bg-white">
              <DropdownMenuItem onClick={() => setCategory("Music")}>
                Music
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setCategory("Movies")}>
                Movies
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setCategory("TV")}>
                TV
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setCategory("Books")}>
                Books
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setCategory("Other")}>
                Other
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

          {/* image upload */}
          <div className="w-40 space-y-1.5">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Cover image
            </p>

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

        <Separator className="bg-[#e0d6c8]" />

        {/* search / and or manual title */}
        {isExternalCategory ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Search {category.toLowerCase()}
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={`Search ${category.toLowerCase()}...`}
                    className="pl-8 rounded-lg bg-white border-gray-300"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching || !searchTerm.trim()}
                  className="rounded-lg bg-[#CAC444] hover:bg-[#b5b03f] text-black"
                >
                  {searching ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            {results.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-[#e0d6c8] bg-white">
                {results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-start gap-2 hover:bg-[#f4efe4] ${
                      selectedItem?.id === item.id ? "bg-[#e9e2cf]" : ""
                    }`}
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="w-8 h-10 object-cover rounded-sm flex-shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-800 line-clamp-2">
                        {item.title}
                      </p>
                      {(item.creator || item.year) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.creator}
                          {item.creator && item.year ? " • " : ""}
                          {item.year}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* title override */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Title
              </p>
              <Input
                value={titleOverride}
                onChange={(e) => setTitleOverride(e.target.value)}
                placeholder={
                  selectedItem?.title || "Optionally customize the title..."
                }
                className="rounded-lg bg-white border-gray-300"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Title / description
            </p>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CAC444]/60 focus:border-transparent"
              placeholder="Give this entry a title or describe it..."
              value={titleOverride}
              onChange={(e) => setTitleOverride(e.target.value)}
            />
          </div>
        )}

        {/* notes */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Notes
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {["New", "From Existing", "None"].map((option) => {
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
              placeholder="What did this make you feel? Any favorite lines, scenes, or moments?"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          )}

          {notesType === "From Existing" && (
            <div className="space-y-2">
              <div className="rounded-lg border border-[#e0d6c8] bg-white max-h-40 overflow-y-auto">
                {notesLoading ? (
                  <div className="p-3 text-sm text-gray-500">Loading your notes...</div>
                ) : existingNotes.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">
                    No notes found. Create one first from the Notes page.
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
                      {note.content?.length > 0
                        ? `${note.content.slice(0, 120)}${
                            note.content.length > 120 ? "..." : ""
                          }`
                        : "Untitled note"}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className={`flex items-center gap-1 text-sm transition ${
              hearted ? "text-[#c08c00]" : "text-gray-500"
            }`}
            onClick={() => setHearted((h) => !h)}
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
              Save to stack
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddModal;