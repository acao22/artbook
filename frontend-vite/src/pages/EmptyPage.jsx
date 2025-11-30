import React from "react";
import { Plus } from "lucide-react";

export default function EmptyPage({ label = "Nothing here yet", onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6 text-gray-600">
      
      {/* Soft background circle */}
      <div className="w-28 h-28 rounded-full bg-[#AEC7E0]/40 flex items-center justify-center mb-6">
        <Plus size={36} className="text-[#4A4A4A]" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold mb-2 text-[#4A4A4A]">
        {label}
      </h2>

      {/* Subtitle */}
      <p className="max-w-sm text-sm text-gray-500 mb-6">
        This section is empty for now — start adding items to fill it up.
      </p>

      {/* Optional button */}
      {onAdd && (
        <button
          className="px-5 py-2.5 rounded-full bg-[#CAC444] text-black font-medium hover:bg-[#b5b03f] transition"
          onClick={onAdd}
        >
          Add New
        </button>
      )}
    </div>
  );
}
