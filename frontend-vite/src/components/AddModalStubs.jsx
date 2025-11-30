import React, { useState } from "react";

export default function AddModalStubs({ onClose, onSave }) {
  const [title, setTitle] = useState("");

  const handleSave = () => {
    onSave({
      id: Date.now(),
      title,
      type: "stubs",
      img: null,
      hearted: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-80 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4">Add Stub</h2>

        <input
          className="border rounded w-full px-3 py-2 mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Write your stub..."
        />

        <button
          onClick={handleSave}
          className="w-full bg-[#CAC444] text-black py-2 rounded-md font-semibold hover:bg-[#b5b03f]"
        >
          Save
        </button>
      </div>
    </div>
  );
}
