import React from "react";
import { Heart, Plus, ChevronDown } from "lucide-react";

const TAGS = [
  { key: "films", label: "Films" },
  { key: "books", label: "Books" },
  { key: "other", label: "Other" },
  { key: "tv", label: "TV" },
  { key: "albums", label: "Albums" },
];

function FilterBar({
  filters,
  sortBy,
  onToggleTag,
  onToggleHearted,
  onToggleSort,
  onAdd    // <-- REQUIRED FIX
}) {
  const sortLabel = sortBy === "default" ? "Sort" : "Title A–Z";

  return (
    <div className="controls">
      <div className="tags">
        {TAGS.map((t) => (
          <button
            key={t.key}
            className={`tag ${filters[t.key] ? "active" : ""}`}
            onClick={() => onToggleTag(t.key)}
          >
            {filters[t.key] ? "✓ " : ""}
            {t.label}
          </button>
        ))}

        <button
          className={`tag ${filters.hearted ? "active" : ""}`}
          onClick={onToggleHearted}
        >
          <Heart size={12} style={{ marginRight: 4 }} />
          Hearted Only
        </button>
      </div>

      <div className="sort-controls">
        <button onClick={onToggleSort}>
          <ChevronDown size={12} /> {sortLabel}
        </button>

        {/* PLUS BUTTON OPENS MODAL */}
        <button onClick={onAdd}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default FilterBar;
