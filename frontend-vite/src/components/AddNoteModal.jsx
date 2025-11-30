import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";

const USER_ID = "user_001";
const FALLBACK_COLOR = "#AEC7E0";

export default function AddNoteModal({ onClose, onSave }) {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [linkMode, setLinkMode] = useState("none");
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [stackItems, setStackItems] = useState([]);
  const [stubItems, setStubItems] = useState([]);
  const [thumbnail, setThumbnail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadItems() {
      try {
        const [stackRes, stubRes] = await Promise.all([
          fetch(`http://127.0.0.1:5000/api/stacks?userId=${USER_ID}`),
          fetch(`http://127.0.0.1:5000/api/stubs?userId=${USER_ID}`),
        ]);
        if (stackRes.ok) {
          const data = await stackRes.json();
          setStackItems(
            (data.results || []).map((item) => ({
              id: item.id,
              title: item.title,
              coverUrl: item.coverUrl || item.img || "",
              type: item.mediaType || item.type || "other",
            }))
          );
        }
        if (stubRes.ok) {
          const data = await stubRes.json();
          setStubItems(
            (data.results || []).map((item) => ({
              id: item.id,
              title: item.title,
              coverUrl: item.coverUrl || "",
              type: item.category || item.mediaType || "stub",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load items for linking:", err);
      }
    }
    loadItems();
  }, []);

  const linkedItem = useMemo(() => {
    if (linkMode === "stack") {
      return stackItems.find((item) => item.id?.toString() === selectedLinkId);
    }
    if (linkMode === "stub") {
      return stubItems.find((item) => item.id?.toString() === selectedLinkId);
    }
    return null;
  }, [linkMode, selectedLinkId, stackItems, stubItems]);

  const handleThumbnailUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setThumbnail(reader.result.toString());
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!headline.trim()) {
      alert("Please add a title for this note.");
      return;
    }
    const combined = [headline.trim(), body.trim()]
      .filter(Boolean)
      .join("\n");

    let stackId = null;
    let stubId = null;
    let mediaTitle = "";
    let mediaType = "";
    let coverUrl = thumbnail;

    if (linkMode === "stack" && linkedItem) {
      stackId = linkedItem.id;
      mediaTitle = linkedItem.title;
      mediaType = linkedItem.type;
      coverUrl = coverUrl || linkedItem.coverUrl;
    }
    if (linkMode === "stub" && linkedItem) {
      stubId = linkedItem.id;
      mediaTitle = linkedItem.title;
      mediaType = linkedItem.type;
      coverUrl = coverUrl || linkedItem.coverUrl;
    }

    const payload = {
      userId: USER_ID,
      content: combined,
      stackId,
      stubId,
      mediaTitle,
      mediaType,
      coverUrl,
      isPublic: true,
    };

    try {
      setSaving(true);
      const res = await fetch("http://127.0.0.1:5000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.text();
        console.error("Failed to save note:", errBody);
        alert("Unable to save note. Please try again.");
        return;
      }
      onSave();
    } catch (err) {
      console.error("Save note failed:", err);
      alert("Unable to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderLinkList = (items) => {
    if (!items.length) {
      return (
        <div className="p-3 text-sm text-gray-500 text-center">
          No items available for linking.
        </div>
      );
    }
    return (
      <div className="divide-y divide-[#f1eadf]">
        {items.map((item) => {
          const isActive = selectedLinkId === item.id?.toString();
          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setSelectedLinkId(isActive ? null : item.id?.toString())
              }
              className={`w-full px-4 py-3 text-left transition ${
                isActive
                  ? "bg-[#f8f3e3] text-gray-900"
                  : "hover:bg-[#fbf7ed] text-gray-700"
              }`}
            >
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs uppercase tracking-wide text-gray-500 mt-0.5">
                {item.type}
              </p>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl bg-[#f8f3e9] shadow-xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Journal
            </p>
            <h2 className="text-xl font-semibold text-gray-900">New note</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-transparent hover:border-gray-300 p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide text-gray-500">
                Title
              </label>
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AEC7E0]"
                placeholder="Give this note a title..."
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide text-gray-500">
                Body
              </label>
              <textarea
                className="w-full rounded-2xl border border-gray-200 px-3 py-3 min-h-[220px] focus:outline-none focus:ring-2 focus:ring-[#AEC7E0]"
                placeholder="Write your thoughts..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-gray-500">
                Thumbnail
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#f4f4f4] border border-dashed border-gray-300 flex items-center justify-center">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  ) : linkedItem?.coverUrl ? (
                    <img
                      src={linkedItem.coverUrl}
                      alt="Linked preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-gray-500 text-center px-2">
                      No thumbnail
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="note-thumbnail-input"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                  />
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() =>
                      document.getElementById("note-thumbnail-input")?.click()
                    }
                  >
                    Upload square image
                  </Button>
                  {thumbnail && (
                    <button
                      type="button"
                      className="text-xs text-red-500 underline"
                      onClick={() => setThumbnail("")}
                    >
                      Remove upload
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Link to stack or stub
              </p>
              <div className="text-xs text-gray-400">Optional</div>
            </div>

            <Tabs
              value={linkMode}
              onValueChange={(val) => {
                setLinkMode(val);
                setSelectedLinkId(null);
              }}
            >
              <TabsList className="grid grid-cols-3 bg-white rounded-full border border-[#e6dfd3] p-1">
                <TabsTrigger value="none" className="rounded-full text-xs">
                  No link
                </TabsTrigger>
                <TabsTrigger value="stack" className="rounded-full text-xs">
                  Stack items
                </TabsTrigger>
                <TabsTrigger value="stub" className="rounded-full text-xs">
                  Stub items
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {linkMode !== "none" && (
              <div className="rounded-2xl border border-[#e6dfd3] bg-white max-h-60 overflow-y-auto">
                {renderLinkList(
                  linkMode === "stack" ? stackItems : stubItems
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#CAC444] text-black"
          >
            {saving ? "Saving..." : "Save note"}
          </Button>
        </div>
      </div>
    </div>
  );
}
