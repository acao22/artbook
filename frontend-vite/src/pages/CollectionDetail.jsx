import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const FALLBACK_IMG =
  "https://via.placeholder.com/400x400/DDD7C8/8B7E6A?text=No+Image";

export default function CollectionDetail({
  collections,
  onRemoveItem,
  onEditCollection,
  onDeleteCollection,
}) {
  const { collectionId } = useParams();
  const navigate = useNavigate();

  const collection = collections.find(
    (entry) => entry.id?.toString() === collectionId
  );

  if (!collection) {
    return (
      <div className="px-8 py-10 space-y-4">
        <p className="text-gray-600">Collection not found.</p>
        <Button onClick={() => navigate("/profile/collections")}>
          Back to collections
        </Button>
      </div>
    );
  }

  const handleRemove = (itemId) => {
    onRemoveItem?.(collection.id, itemId);
  };

  const handleDeleteCollection = () => {
    const confirm = window.confirm(
      "Delete this collection? This cannot be undone."
    );
    if (!confirm) return;
    onDeleteCollection?.(collection.id);
    navigate("/profile/collections");
  };

  return (
    <div className="px-8 py-8 space-y-8">
      <button
        type="button"
        onClick={() => navigate("/profile/collections")}
        className="text-sm text-gray-600 hover:text-black"
      >
        ← Back to collections
      </button>

      <div className="grid gap-6 md:grid-cols-[280px_1fr] items-start">
        <div className="rounded-3xl overflow-hidden border border-[#f1e9de] bg-[#f4efe4] aspect-square">
          <img
            src={collection.cover || FALLBACK_IMG}
            alt={collection.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">
              Collection
            </p>
            <h1 className="text-3xl font-semibold text-gray-900 mt-1">
              {collection.title}
            </h1>
            {collection.subtitle && (
              <p className="text-gray-600 mt-2">{collection.subtitle}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => onEditCollection?.(collection)}
            >
              Edit collection
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={handleDeleteCollection}
            >
              Delete collection
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Items</h3>
          <p className="text-sm text-gray-500">
            {(collection.items || []).length} total
          </p>
        </div>

        {collection.items && collection.items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collection.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-2xl border border-[#eadfcc] bg-white p-3"
              >
                <img
                  src={item.coverUrl || item.img || FALLBACK_IMG}
                  alt={item.title}
                  className="w-16 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {(item.type || item.mediaType || "other").toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            No items yet. Edit this collection to add some.
          </div>
        )}
      </div>
    </div>
  );
}