import React, { useMemo, useState, useRef, useEffect } from "react";
import { X, Search, Image as ImageIcon, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const FALLBACK_IMG =
  "https://via.placeholder.com/400x400/DDD7C8/8B7E6A?text=No+Image";

export default function AddModalCollections({
  onClose,
  onSave,
  stackItems,
  stubItems,
  initialCollection,
}) {
  const [title, setTitle] = useState(initialCollection?.title ?? "");
  const [description, setDescription] = useState(
    initialCollection?.subtitle ?? ""
  );
  const [imagePreview, setImagePreview] = useState(
    initialCollection?.cover ?? null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState(
    () =>
      initialCollection?.itemIds?.map((id) => id?.toString()) ??
      initialCollection?.items?.map((item) => item.id?.toString()) ??
      []
  );

  const fileInputRef = useRef(null);
  const isEditMode = Boolean(initialCollection);

  const baseItems = useMemo(
    () =>
      [...stackItems, ...stubItems].map((item) => ({
        id: item.id?.toString(),
        title: item.title,
        coverUrl: item.coverUrl || item.img || FALLBACK_IMG,
        type: item.type || item.mediaType || "other",
      })),
    [stackItems, stubItems]
  );

  const allItems = useMemo(() => {
    const map = new Map(
      baseItems.map((item) => [item.id ?? item.title ?? Math.random().toString(), item])
    );

    (initialCollection?.items || []).forEach((item) => {
      const key = item.id?.toString();
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          title: item.title,
          coverUrl: item.coverUrl || item.img || FALLBACK_IMG,
          type: item.type || "other",
        });
      }
    });

    return Array.from(map.values());
  }, [baseItems, initialCollection]);

  useEffect(() => {
    if (!initialCollection) {
      setTitle("");
      setDescription("");
      setImagePreview(null);
      setSelectedIds([]);
      return;
    }

    setTitle(initialCollection.title || "");
    setDescription(initialCollection.subtitle || "");
    setImagePreview(initialCollection.cover || null);
    setSelectedIds(
      initialCollection.itemIds?.map((id) => id?.toString()) ||
        initialCollection.items?.map((item) => item.id?.toString()) ||
        []
    );
  }, [initialCollection]);

  const trimmedQuery = searchTerm.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    if (!trimmedQuery) return [];
    return allItems.filter((item) =>
      (item.title || "").toLowerCase().includes(trimmedQuery)
    );
  }, [allItems, trimmedQuery]);

  const selectedItems = useMemo(
    () =>
      allItems.filter((item) =>
        selectedIds.includes(item.id?.toString())
      ),
    [allItems, selectedIds]
  );

  const toggleSelection = (itemId) => {
    const key = itemId?.toString();
    if (!key) return;

    const isAlreadySelected = selectedIds.includes(key);

    setSelectedIds((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );

    if (!isAlreadySelected) {
      setSearchTerm("");
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    const payload = {
      ...(initialCollection?.id ? { id: initialCollection.id } : {}),
      title: title.trim(),
      subtitle: description.trim(),
      cover: imagePreview || initialCollection?.cover || FALLBACK_IMG,
      items: selectedItems,
      itemIds: selectedIds,
    };

    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-[#f8f3e9] shadow-xl p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Edit collection" : "Create collection"}
            </h2>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_200px]">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-gray-600">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cozy October Reads"
              className="rounded-lg border border-[#d8cfbf] bg-white"
            />

            <label className="text-xs font-semibold uppercase text-gray-600">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional context or mood..."
              className="min-h-[90px] rounded-lg border border-[#d8cfbf] bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-gray-600">
              Cover image
            </label>
            <button
              type="button"
              onClick={handleClickUpload}
              className="relative w-full h-32 rounded-2xl border border-dashed border-gray-300 bg-[#eee5d8] flex flex-col items-center justify-center text-xs text-gray-600 hover:border-gray-400 hover:bg-[#e7ddce] transition"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <>
                  <ImageIcon size={22} className="mb-1" />
                  <span>Upload image</span>
                </>
              )}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-gray-500" />
              <p className="text-xs font-semibold uppercase text-gray-600">
                Add items
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {selectedIds.length} selected
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your stack or stubs..."
              className="rounded-full border border-[#d8cfbf] bg-white"
            />
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </Button>
          </div>

          <div className="max-h-60 overflow-y-auto rounded-2xl border border-[#eadfcc] bg-white p-2 space-y-2">
            {!trimmedQuery ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Start typing to search your stack or stubs.
              </p>
            ) : filteredItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                No results. Try a different search.
              </p>
            ) : (
              filteredItems.map((item) => {
                const itemKey = item.id?.toString();
                const isSelected = selectedIds.includes(itemKey);
                return (
                  <button
                    type="button"
                    key={itemKey || item.title}
                    onClick={() => toggleSelection(itemKey)}
                    className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${
                      isSelected
                        ? "border-[#CAC444] bg-[#f8f3e0]"
        : "border-transparent hover:border-[#e2dac9]"
                    }`}
                  >
                    <img
                      src={item.coverUrl || FALLBACK_IMG}
                      alt={item.title}
                      className="w-12 h-14 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.title}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {item.type}
                      </p>
                    </div>

                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                        isSelected
                          ? "bg-[#CAC444] border-[#CAC444] text-black"
                          : "border-gray-300 text-gray-400"
                      }`}
                    >
                      {isSelected ? <Check size={14} /> : <Plus size={14} />}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedItems.map((item) => (
                <span
                  key={item.id || item.title}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d6cfbf] bg-white px-3 py-1 text-xs text-gray-700"
                >
                  {item.title}
                  <button
                    className="text-gray-400 hover:text-black"
                    onClick={() => toggleSelection(item.id)}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="rounded-lg">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-lg bg-[#CAC444] text-black hover:bg-[#b5b03f]"
          >
            {isEditMode ? "Save changes" : "Save collection"}
          </Button>
        </div>
      </div>
    </div>
  );
}