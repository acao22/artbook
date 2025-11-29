import React from "react";
import { Heart, Plus, ChevronDown } from "lucide-react";

const stackTags = [
  { key: "films", label: "Films" },
  { key: "books", label: "Books" },
  { key: "other", label: "Other" },
  { key: "tv", label: "TV" },
  { key: "albums", label: "Albums" },
];

const stubsTags = [
  { key: "concerts", label: "Concerts" },
  { key: "museums", label: "Museums" },
  { key: "theatre", label: "Theatre" },
  { key: "other", label: "Other" },
];

function FilterBar({
  filters,
  sortBy,
  onToggleTag,
  onToggleHearted,
  onToggleSort,
  onAdd,          // <-- keep Add button
  mode = "stack", // stack, stubs, collections
}) {
  const sortLabel = sortBy === "default" ? "Sort" : "Title A–Z";

  // Determine which tags to show
  let visibleTags = [];
  if (mode === "stack") visibleTags = stackTags;
  else if (mode === "stubs") visibleTags = stubsTags;
  // collections shows NO category tags, only hearted
  // so visibleTags stays empty for collections

  return (
    <div className="controls">
      <div className="tags">
        {visibleTags.map((t) => (
          <button
            key={t.key}
            className={filters[t.key] ? "tag active" : "tag"}
            onClick={() => onToggleTag(t.key)}
          >
            {filters[t.key] ? "✓ " : ""}
            {t.label}
          </button>
        ))}

        {/* Hearted filter always shown if present */}
        {filters.hearted !== undefined && (
          <button
            className={filters.hearted ? "tag active" : "tag"}
            onClick={onToggleHearted}
          >
            <Heart size={12} style={{ marginRight: 4 }} />
            Hearted Only
          </button>
        )}
      </div>

      <div className="sort-controls">
        <button onClick={onToggleSort}>
          <ChevronDown size={12} /> {sortLabel}
        </button>

        {/* PLUS BUTTON ALWAYS VISIBLE */}
        <button onClick={onAdd}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default FilterBar;
