import React from "react";

function Gallery({ items }) {
  return (
    <div className="gallery">
      {items.map((item) => (
        <img
        src={item.img || "https://via.placeholder.com/300x400?text=No+Image"}
        alt={item.title}
        className="gallery-img"
        />
      ))}
    </div>
  );
}

export default Gallery;
