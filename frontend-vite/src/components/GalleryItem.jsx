import React, { useState } from "react";
import { Heart } from "lucide-react";

const FALLBACK_IMG =
  "https://via.placeholder.com/400x400/DDD7C8/8B7E6A?text=No+Image";

export default function GalleryItem({ item, refresh, allowHeart = true }) {
  const [hover, setHover] = useState(false);
  const [hearted, setHearted] = useState(item.hearted);

  const toggleHeart = async () => {
    if (!allowHeart || !item?.id) return;
    const newVal = !hearted;
    setHearted(newVal);

    try {
      await fetch(`http://127.0.0.1:5000/api/stacks/${item.id}/heart`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hearted: newVal }),
      });

      refresh?.();
    } catch (err) {
      console.error("Failed to toggle heart:", err);
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl shadow-md cursor-pointer group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* IMAGE */}
      <img
        src={item.coverUrl || item.img || FALLBACK_IMG}
        alt={item.title}
        className="
          w-full object-cover rounded-xl 
          transition-transform duration-300 
          group-hover:scale-105
        "
      />

      {/* HOVER OVERLAY */}
      <div
        className={`
          absolute inset-0 
          bg-black/60 
          flex flex-col justify-end p-4
          rounded-xl
          transition-opacity duration-300 
          ${hover ? "opacity-100" : "opacity-0"}
        `}
      >
        <h2
          className="
            text-white text-2xl font-bold 
            tracking-tight leading-tight
            transition-all duration-300
            translate-y-2 group-hover:translate-y-0
          "
        >
          {item.title}
        </h2>

        {item.creator && (
          <p
            className="
              text-white/80 italic text-sm 
              transition-all duration-300
              translate-y-2 group-hover:translate-y-0
            "
          >
            {item.creator}
          </p>
        )}
      </div>

      {/* HEART BUTTON */}
      {allowHeart && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleHeart();
          }}
          className="absolute top-2 right-2"
        >
          <Heart
            size={26}
            className={`
              drop-shadow 
              transition-all duration-300 
              ${hearted ? "fill-[#CAC444] text-[#CAC444]" : "text-white"}
              ${hover ? "scale-110" : "scale-100"}
            `}
          />
        </button>
      )}
    </div>
  );
}
