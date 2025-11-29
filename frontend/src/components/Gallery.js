import React from "react";

/*function Gallery({ items }) {
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

export default Gallery;*/

const FALLBACK_IMG =
  "https://via.placeholder.com/400x400/DDD7C8/8B7E6A?text=No+Image";

function Gallery({ items = [], variant = "masonry" }) {
  if (variant === "collections") {
    return (
      <div className="collections-grid">
        {items.map((collection) => (
          <div
            className="collection-card"
            key={collection.id || collection.title}
          >
            <div className="collection-thumb">
              <img
                src={collection.cover || collection.img || FALLBACK_IMG}
                alt={`${collection.title} cover art`}
              />
            </div>
            <div className="collection-meta">
              <p className="collection-title">{collection.title}</p>
              {collection.subtitle && (
                <p className="collection-subtitle">{collection.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="gallery">
      {items.map((item) => (
        <div className="gallery-item" key={item.id || item.title}>
          <img
            src={item.img || FALLBACK_IMG}
            alt={item.title}
            className="gallery-img"
          />
          <div className="gallery-overlay">
            <div className="overlay-top">
              {item.hearted && <span className="overlay-heart">♥</span>}
            </div>
            <div className="overlay-bottom">
              <p className="overlay-title">{item.title}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Gallery;
