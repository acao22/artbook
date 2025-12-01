import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProfileHeader from "./components/ProfileHeader";
import FilterBar from "./components/FilterBar";
import Gallery from "./components/Gallery";
import AddModal from "./components/AddModal";
import AddModalStubs from "./components/AddModalStubs";
import AddModalCollections from "./components/AddModalCollections";

// pages
import ExplorePage from "./pages/ExplorePage";
import CollectionsPage from "./pages/CollectionsPage";
import NotesPage from "./pages/NotesPage";
import NoteDetail from "./pages/NoteDetail";
import CollectionDetail from "./pages/CollectionDetail";
import SearchResults from "./pages/SearchResults";

import { TooltipProvider } from "@/components/ui/tooltip";

const STACK_FILTERS = ["music", "movies", "tv", "books", "other"];
const STUB_FILTERS = ["concerts", "museums", "theatre", "other"];
const ALL_FILTERS = [...new Set([...STACK_FILTERS, ...STUB_FILTERS])];
const USER_ID = "user_001";

function ProfileLayout() {
  const location = useLocation();
  const hideHeader =
    typeof location.pathname === "string" &&
    /\/profile\/collections\/[^/]+/.test(location.pathname);

  return (
    <>
      {!hideHeader && <ProfileHeader />}
      <Outlet />
    </>
  );
}

function ProfileCollectionsSection({ collections, onAddCollection }) {
  const navigate = useNavigate();
  const hasCollections = collections.length > 0;

  return (
    <section className="px-8 mt-6 space-y-5">
      {hasCollections ? (
        <Gallery
          items={collections}
          variant="collections"
          onCollectionClick={(collection) =>
            navigate(`/profile/collections/${collection.id}`)
          }
        />
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white/60 px-6 py-16 text-center text-sm text-gray-500">
          No collections yet. Click "+ New collection" to start curating.
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [stackItems, setStackItems] = useState([]);
  const [stubItems, setStubItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionModalState, setCollectionModalState] = useState({
    open: false,
    collection: null,
  });

  const [filters, setFilters] = useState(() =>
    ALL_FILTERS.reduce(
      (acc, key) => ({
        ...acc,
        [key]: true,
      }),
      {}
    )
  );

  const [sortBy, setSortBy] = useState("default");
  const [stackHeartedOnly, setStackHeartedOnly] = useState(false);
  const [stubHeartedOnly, setStubHeartedOnly] = useState(false);

  // --------------------------------------
  // MODAL
  // --------------------------------------
  const [showModal, setShowModal] = useState(false);
  const [currentMode, setCurrentMode] = useState("stack");

  const openModal = (mode) => {
    setCurrentMode(mode);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const loadStacks = useCallback(async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/stacks?userId=${USER_ID}`
      );
      if (!res.ok) {
        console.error("Failed to fetch stacks:", res.status);
        return;
      }
      const data = await res.json();
      const normalized =
        (data.results || []).map((item) => ({
          id:
            item.id?.toString() ||
            item.externalId?.toString() ||
            `stack-${Math.random().toString(36).slice(2)}`,
          title: item.title,
          coverUrl: item.coverUrl || item.img || "",
          img: item.coverUrl || item.img || "",
          type: (item.mediaType || item.type || "other").toLowerCase(),
          hearted: Boolean(item.hearted),
          creator: item.creator || "",
          year: item.year || null,
          displayMode: "stack",
        })) ?? [];

      setStackItems(normalized);
    } catch (err) {
      console.error("Failed to fetch stacks:", err);
    }
  }, []);

  const loadStubs = useCallback(async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/stubs?userId=${USER_ID}`
      );
      if (!res.ok) {
        console.error("Failed to fetch stubs:", res.status);
        return;
      }
      const data = await res.json();
      const normalized =
        (data.results || []).map((item) => ({
          id:
            item.id?.toString() ||
            `stub-${Math.random().toString(36).slice(2)}`,
          title: item.title,
          coverUrl: item.coverUrl || "",
          img: item.coverUrl || "",
          type: (item.category || item.mediaType || "other").toLowerCase(),
          hearted: Boolean(item.hearted),
          date: item.date,
          displayMode: "stub",
        })) ?? [];

      setStubItems(normalized);
    } catch (err) {
      console.error("Failed to fetch stubs:", err);
    }
  }, []);

  const loadCollections = useCallback(async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/collections?userId=${USER_ID}`
      );
      if (!res.ok) {
        console.error("Failed to fetch collections:", res.status);
        return;
      }
      const data = await res.json();
      const normalized =
        (data.results || []).map((collection) => {
          const rawItems = Array.isArray(collection.items)
            ? collection.items
            : collection.items && typeof collection.items === "object"
            ? Object.values(collection.items)
            : [];
          const rawItemIds = Array.isArray(collection.itemIds)
            ? collection.itemIds
            : collection.itemIds && typeof collection.itemIds === "object"
            ? Object.values(collection.itemIds)
            : collection.itemIds;

          return {
            id:
              collection.id?.toString() ||
              `collection-${Math.random().toString(36).slice(2)}`,
            title: collection.title || "Untitled collection",
            subtitle: collection.subtitle || "",
            cover: collection.cover || "",
            items: rawItems.map((item) => ({
              ...item,
              id: item.id?.toString() || `col-item-${Math.random().toString(36).slice(2)}`,
              coverUrl: item.coverUrl || item.img || "",
              img: item.coverUrl || item.img || "",
              type: (item.type || item.mediaType || "other").toLowerCase(),
            })),
            itemIds: (rawItemIds || []).map((id) => id?.toString?.() ?? id?.toString()),
            createdAt: collection.createdAt || null,
          };
        }) ?? [];

      setCollections(normalized);
    } catch (err) {
      console.error("Failed to fetch collections:", err);
    }
  }, []);

  useEffect(() => {
    loadStacks();
    loadStubs();
    loadCollections();
  }, [loadStacks, loadStubs, loadCollections]);

  const handleStackSaved = useCallback(
    (newItem) => {
      if (newItem) {
        setStackItems((prev) => [
          ...prev,
          {
            ...newItem,
            coverUrl: newItem.coverUrl || newItem.img || "",
            displayMode: "stack",
          },
        ]);
      }
      loadStacks();
    },
    [loadStacks]
  );

  const handleStubSaved = useCallback(
    (newItem) => {
      if (newItem) {
        setStubItems((prev) => [
          ...prev,
          {
            ...newItem,
            coverUrl: newItem.coverUrl || newItem.img || "",
            hearted: Boolean(newItem.hearted),
            displayMode: "stub",
          },
        ]);
      }
      loadStubs();
    },
    [loadStubs]
  );

  const openCollectionModal = useCallback(
    (collection = null) => {
      setCollectionModalState({ open: true, collection });
    },
    []
  );

  const closeCollectionModal = useCallback(() => {
    setCollectionModalState({ open: false, collection: null });
  }, []);

  const handleCollectionSave = useCallback(
    async (collectionPayload) => {
      const isEdit = Boolean(collectionPayload.id);
      const url = isEdit
        ? `http://127.0.0.1:5000/api/collections/${collectionPayload.id}`
        : "http://127.0.0.1:5000/api/collections";
      const method = isEdit ? "PATCH" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: USER_ID,
            title: collectionPayload.title,
            subtitle: collectionPayload.subtitle,
            cover: collectionPayload.cover,
            items: collectionPayload.items,
            itemIds: collectionPayload.itemIds,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to save collection:", res.status, errorText);
          alert("Unable to save collection. Please try again.");
          return;
        }

        await loadCollections();
        closeCollectionModal();
      } catch (err) {
        console.error("Failed to save collection:", err);
        alert("Unable to save collection. Please try again.");
      }
    },
    [closeCollectionModal, loadCollections]
  );

  const handleCollectionDelete = useCallback(
    async (collectionId) => {
      if (!collectionId) return;
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/collections/${collectionId}`,
          {
            method: "DELETE",
          }
        );
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to delete collection:", res.status, errorText);
          alert("Unable to delete this collection right now.");
          return;
        }
        await loadCollections();
      } catch (err) {
        console.error("Failed to delete collection:", err);
        alert("Unable to delete this collection right now.");
      }
    },
    [loadCollections]
  );

  const handleCollectionItemRemove = useCallback(
    async (collectionId, itemId) => {
      const normalizedItemId = itemId?.toString();
      const collection = collections.find(
        (entry) => entry.id?.toString() === collectionId?.toString()
      );
      if (!collection) return;

      const nextItems = (collection.items || []).filter(
        (item) => item.id?.toString() !== normalizedItemId
      );
      const nextItemIds = (collection.itemIds || []).filter(
        (id) => id?.toString() !== normalizedItemId
      );

      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/collections/${collectionId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: nextItems,
              itemIds: nextItemIds,
            }),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to update collection:", res.status, errorText);
          alert("Unable to update this collection right now.");
          return;
        }

        await loadCollections();
      } catch (err) {
        console.error("Failed to update collection:", err);
        alert("Unable to update this collection right now.");
      }
    },
    [collections, loadCollections]
  );
  const filterAndSort = useCallback(
    (list, allowedTypes, options = {}) => {
      const { heartedOnly = false } = options;
      let next = list.filter((item) => {
        const typeKey = (item.type || item.mediaType || "other").toLowerCase();
        if (!allowedTypes.includes(typeKey)) return false;
        if (filters[typeKey] === false) return false;
        return true;
      });

      if (heartedOnly) {
        next = next.filter((item) => Boolean(item.hearted));
      }

      if (sortBy === "title") {
        next = [...next].sort((a, b) =>
          (a.title || "").localeCompare(b.title || "")
        );
      }

      return next;
    },
    [filters, sortBy]
  );

  const filteredStackItems = useMemo(
    () => filterAndSort(stackItems, STACK_FILTERS, { heartedOnly: stackHeartedOnly }),
    [stackItems, filterAndSort, stackHeartedOnly]
  );

  const filteredStubItems = useMemo(
    () => filterAndSort(stubItems, STUB_FILTERS, { heartedOnly: stubHeartedOnly }),
    [stubItems, filterAndSort, stubHeartedOnly]
  );

  const handleStackHeartUpdate = useCallback((itemId, value) => {
    setStackItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, hearted: value } : item
      )
    );
  }, []);

  const handleStubHeartUpdate = useCallback((itemId, value) => {
    setStubItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, hearted: value } : item
      )
    );
  }, []);

  const sortedCollections = useMemo(() => {
    if (sortBy === "title") {
      return [...collections].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    }
    if (sortBy === "recent") {
      return [...collections].sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );
    }
    return collections;
  }, [collections, sortBy]);

  // --------------------------------------
  // RENDER
  // --------------------------------------
  return (
    <Router>
      <TooltipProvider>
      <div className="min-h-screen bg-[#FBF5ED]">
        <Navbar />

        <Routes>
          {/* Public pages */}
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/notes" element={<CollectionsPage />} />
          <Route path="/search" element={<SearchResults />} />


          {/* PROFILE ROUTES */}
          <Route path="/profile" element={<ProfileLayout />}>
            <Route index element={<Navigate to="stack" replace />} />

            <Route
              path="stack"
              element={
                <>
                  <FilterBar
                    activeFilters={filters}
                    onToggleFilter={setFilters}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    openModal={() => openModal("stack")}
                    visibleFilters={STACK_FILTERS}
                    heartedOnlyActive={stackHeartedOnly}
                    onHeartedToggle={(next) => setStackHeartedOnly(next)}
                  />
                  <Gallery
                    items={filteredStackItems}
                    onHeartToggle={handleStackHeartUpdate}
                  />
                </>
              }
            />

            <Route
              path="stubs"
              element={
                <>
                  <FilterBar
                    activeFilters={filters}
                    onToggleFilter={setFilters}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    openModal={() => openModal("stubs")}
                    visibleFilters={STUB_FILTERS}
                    heartedOnlyActive={stubHeartedOnly}
                    onHeartedToggle={(next) => setStubHeartedOnly(next)}
                  />
                  <Gallery
                    items={filteredStubItems}
                    variant="stubs"
                    onHeartToggle={handleStubHeartUpdate}
                  />
                </>
              }
            />

            <Route
              path="collections"
              element={
                <>
                  <FilterBar
                    activeFilters={{}}
                    onToggleFilter={() => {}}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    openModal={() => openCollectionModal()}
                    visibleFilters={[]}
                    heartedOnlyActive={undefined}
                    onHeartedToggle={undefined}
                    hideFilters
                  />
                  <ProfileCollectionsSection
                    collections={sortedCollections}
                    onAddCollection={() => openCollectionModal()}
                  />
                </>
              }
            />
            <Route
              path="collections/:collectionId"
              element={
                <CollectionDetail
                  collections={collections}
                  onRemoveItem={handleCollectionItemRemove}
                  onEditCollection={(collection) => openCollectionModal(collection)}
                  onDeleteCollection={handleCollectionDelete}
                />
              }
            />
            <Route path="notes" element={<NotesPage />} />
            <Route path="notes/:noteId" element={<NoteDetail />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/profile/stack" replace />} />
        </Routes>

        {/* MODALS */}
        {showModal &&
          (currentMode === "stubs" ? (
            <AddModalStubs onClose={closeModal} onSave={handleStubSaved} />
          ) : (
            <AddModal onClose={closeModal} onSave={handleStackSaved} />
          ))}

        {collectionModalState.open && (
          <AddModalCollections
            onClose={closeCollectionModal}
            onSave={handleCollectionSave}
            stackItems={stackItems}
            stubItems={stubItems}
            initialCollection={collectionModalState.collection}
          />
        )}

      </div>
      </TooltipProvider>
    </Router>
  );
}
