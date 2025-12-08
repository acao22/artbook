import React, { useEffect, useState, useMemo } from "react";
import GalleryItem from "./GalleryItem";
import { Heart, Pencil } from "lucide-react";
import StackStubDetailModal from "./StackStubDetailModal";

const FALLBACK_IMG =
  "https://via.placeholder.com/400x400/DDD7C8/8B7E6A?text=No+Image";

export default function Gallery({
  items: providedItems,
  variant = "masonry",
  allowHeartToggle = true,
  onCollectionClick,
  onHeartToggle,
  onEditItem,
}) {
  const [fetchedItems, setFetchedItems] = useState([]);

  const shouldFetch = !providedItems;

  useEffect(() => {
    if (!shouldFetch) return;

    async function fetchStacks() {
      try {
        const res = await fetch(
          "http://127.0.0.1:5000/api/stacks?userId=user_001"
        );
        const data = await res.json();

        if (!data.results) return;

        const mapped = data.results.map((item) => ({
          id: item.id,
          title: item.title,
          creator: item.creator,
          coverUrl: item.coverUrl || item.img || FALLBACK_IMG,
          mediaType: item.mediaType,
          hearted: item.hearted || false,
          year: item.year || null,
        }));

        setFetchedItems(mapped);
      } catch (err) {
        console.error("Failed to load stacks:", err);
      }
    }

    fetchStacks();
  }, [shouldFetch]);

  const refreshGallery = async () => {
    if (!shouldFetch) return;
    try {
      const res = await fetch(
        "http://127.0.0.1:5000/api/stacks?userId=user_001"
      );
      const data = await res.json();

      if (!data.results) return;

      const mapped = data.results.map((item) => ({
        id: item.id,
        title: item.title,
        creator: item.creator,
        coverUrl: item.coverUrl || item.img || FALLBACK_IMG,
        mediaType: item.mediaType,
        hearted: item.hearted || false,
        year: item.year || null,
      }));

      setFetchedItems(mapped);
    } catch (err) {
      console.error("Failed to reload stacks:", err);
    }
  };

  const displayItems = useMemo(() => {
    const source = providedItems ?? fetchedItems ?? [];
    return source.map((item) => ({
      ...item,
      coverUrl:
        variant === "collections"
          ? item.coverUrl || item.img || FALLBACK_IMG
          : item.coverUrl || item.img || "",
    }));
  }, [providedItems, fetchedItems, variant]);

  if (variant === "collections") {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid gap-6 px-4 mt-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {displayItems.map((collection) => (
            <button
              key={collection.id || collection.title}
              type="button"
              onClick={() => onCollectionClick?.(collection)}
              className="text-left space-y-3 transition hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#CAC444]/60"
            >
              <div className="h-56 rounded-3xl overflow-hidden border border-[#f1e9de] bg-[#f4efe4] shadow-md">
                <img
                  src={collection.cover || collection.img || FALLBACK_IMG}
                  alt={`${collection.title} cover art`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-gray-900 line-clamp-2">
                  {collection.title}
                </p>
                {collection.subtitle && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {collection.subtitle}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "stubs") {
    return (
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item) => (
            <StubGridItem
              key={item.id || item.title}
              item={item}
              allowHeart={allowHeartToggle}
              onHeartToggle={onHeartToggle}
              onEdit={() => onEditItem?.(item)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-6">
    <div
      className="
        columns-2 sm:columns-3 md:columns-4 lg:columns-5
        gap-6 px-8 mt-6
      "
    >
      {displayItems.map((item) => (
        <div key={item.id || item.title} className="mb-6 break-inside-avoid">
          <GalleryItem
            item={item}
            refresh={shouldFetch ? refreshGallery : undefined}
            allowHeart={allowHeartToggle}
            onHeartToggle={onHeartToggle}
            onEdit={onEditItem ? () => onEditItem(item) : undefined}
          />
        </div>
      ))}
    </div>
    </div>
  );
}

function StubGridItem({ item, allowHeart, onHeartToggle, onEdit }) {
  const [hearted, setHearted] = useState(Boolean(item.hearted));
  const [showDetailModal, setShowDetailModal] = useState(false);
  const hasImage = Boolean(item.coverUrl || item.img);

  const toggleHeart = async () => {
    if (!allowHeart || !item?.id) return;
    const next = !hearted;
    setHearted(next);

    try {
      await fetch(`http://127.0.0.1:5000/api/stubs/${item.id}/heart`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hearted: next }),
      });
      onHeartToggle?.(item.id, next);
    } catch (err) {
      console.error("Failed to toggle stub heart:", err);
      setHearted(!next);
    }
  };

  const handleItemClick = (e) => {
    // heart button case
    if (e.target.closest('button')) {
      return;
    }
    setShowDetailModal(true);
  };

  return (
    <>
      <div
        className="group relative flex gap-4 p-4 rounded-3xl border border-[#eadfcc] bg-[#AEC7E0]/40 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleItemClick}
      >
      {hasImage && (
        <div className="w-28 h-full rounded-2xl overflow-hidden flex-shrink-0 bg-[#f4efe4] flex items-center justify-center">
          <img
            src={item.coverUrl || item.img}
            alt={item.title}
            className="w-full h-full object-cover block"
          />
        </div>
      )}

      <div className="flex-1 space-y-2 text-left pr-8">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {(item.type || item.category || item.mediaType || "event").toUpperCase()}
        </p>
        <h3 className="text-lg font-semibold text-gray-900 leading-snug whitespace-pre-line">
          {item.title}
        </h3>
      </div>

      {allowHeart && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleHeart();
          }}
          className="absolute top-3 right-3"
        >
          <Heart
            size={22}
            className={
              hearted
                ? "fill-[#CAC444] text-[#CAC444]"
                : "text-[#1f2a37]/30 transition-colors"
            }
          />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
          onEdit();
          }}
          className="absolute bottom-3 right-3 rounded-full bg-white/80 p-2 text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition"
        >
          <Pencil size={16} />
        </button>
      )}
    </div>

    {showDetailModal && (
      <StackStubDetailModal
        item={item}
        onClose={() => setShowDetailModal(false)}
        isStub={true}
      />
    )}
    </>
  );
}