import React, { useEffect, useState, useMemo } from "react";
import GalleryItem from "./GalleryItem";

const FALLBACK_IMG =
  "https://via.placeholder.com/400x400/DDD7C8/8B7E6A?text=No+Image";

export default function Gallery({
  items: providedItems,
  variant = "masonry",
  allowHeartToggle = true,
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

  const displayItems = useMemo(
    () =>
      (providedItems ?? fetchedItems)?.map((item) => ({
        ...item,
        coverUrl: item.coverUrl || item.img || FALLBACK_IMG,
      })) ?? [],
    [providedItems, fetchedItems]
  );

  if (variant === "collections") {
    return (
      <div className="grid gap-6 px-8 mt-8 sm:grid-cols-2 lg:grid-cols-3">
        {displayItems.map((collection) => (
          <div
            key={collection.id || collection.title}
            className="rounded-3xl bg-white shadow-md overflow-hidden border border-[#f1e9de]"
          >
            <div className="aspect-[4/3] bg-[#f4efe4]">
              <img
                src={collection.cover || collection.img || FALLBACK_IMG}
                alt={`${collection.title} cover art`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-1">
              <p className="text-base font-semibold text-gray-900">
                {collection.title}
              </p>
              {collection.subtitle && (
                <p className="text-sm text-gray-500">{collection.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
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
          />
        </div>
      ))}
    </div>
  );
}