import React, { useEffect, useState } from "react";
import GalleryItem from "./GalleryItem";

export default function Gallery() {
  const [items, setItems] = useState([]);

  // load stacks from backend
  useEffect(() => {
    async function fetchStacks() {
      try {
        const res = await fetch(
          "http://127.0.0.1:5000/api/stacks?userId=user_001"
        );
        const data = await res.json();

        if (!data.results) return;

        // map backend structure
        const mapped = data.results.map((item) => ({
          id: item.id,
          title: item.title,
          creator: item.creator,
          coverUrl: item.coverUrl || "", // fallback
          mediaType: item.mediaType,
          hearted: item.hearted || false,
          year: item.year || null,
        }));

        setItems(mapped);
      } catch (err) {
        console.error("Failed to load stacks:", err);
      }
    }

    fetchStacks();
  }, []);

  // pass refresh callback -> tro child
  const refreshGallery = async () => {
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
        coverUrl: item.coverUrl || "",
        mediaType: item.mediaType,
        hearted: item.hearted || false,
        year: item.year || null,
      }));

      setItems(mapped);
    } catch (err) {
      console.error("Failed to reload stacks:", err);
    }
  };

  return (
    <div
      className="
        columns-2 sm:columns-3 md:columns-4 lg:columns-5
        gap-6 px-8 mt-6
      "
    >
      {items.map((item) => (
        <div key={item.id} className="mb-6 break-inside-avoid">
          <GalleryItem
            item={item}
            refresh={refreshGallery}  // no page reload
          />
        </div>
      ))}
    </div>
  );
}
