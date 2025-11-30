import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";

export default function AddNoteModal({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("none");
  const [items, setItems] = useState([]);

  // NEED RTO CHANGE THIS: load from gallery (from localStorage for now)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("galleryItems")) || [];
    setItems(stored);
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    const attachedItem =
      selectedItemId !== "none"
        ? items.find((x) => x.id.toString() === selectedItemId)
        : null;

    const payload = {
      userId: "user_001",
      content: `${title}${subtitle ? " — " + subtitle : ""}`,
      stackId: attachedItem ? attachedItem.id.toString() : null,
      stubId: null,
      isPublic: true,
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Backend Error:", data);
        alert("Error saving note");
        return;
      }

      // add to ui immediately
      const newNote = {
        id: data.id,
        title,
        subtitle,
        date: new Date().toLocaleDateString(),
        mediaId: attachedItem?.id || null,
        mediaImg: attachedItem?.img || null,
      };

      onSave(newNote);
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add Note</DialogTitle>
        </DialogHeader>

        {/* Title */}
        <label className="block text-sm mb-1 text-gray-700">Title</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
          placeholder="What is this note about?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Subtitle */}
        <label className="block text-sm mb-1 text-gray-700">Subtitle</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
          placeholder="Optional details..."
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />

        {/* Attach to gallery item */}
        <label className="block text-sm mb-1 text-gray-700">Attach to an item</label>

        <Select onValueChange={setSelectedItemId} defaultValue="none">
          <SelectTrigger className="bg-white rounded-lg">
            <SelectValue placeholder="None" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="none" className="italic text-gray-500">
              None
            </SelectItem>

            {items.length === 0 ? (
              <div className="px-3 py-2 text-sm italic opacity-60">
                No items available
              </div>
            ) : (
              items.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.title}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {/* Image preview */}
        {selectedItemId !== "none" && (
          <div className="mt-4 flex justify-center">
            <img
              src={items.find((x) => x.id.toString() === selectedItemId)?.img}
              className="w-28 h-28 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#CAC444] text-black">
            Save Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
