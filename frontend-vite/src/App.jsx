import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProfileHeader from "./components/ProfileHeader";
import FilterBar from "./components/FilterBar";
import Gallery from "./components/Gallery";
import AddModal from "./components/AddModal";
import AddModalStubs from "./components/AddModalStubs";
import AddNoteModal from "./components/AddNoteModal";
import AddModalCollections from "./components/AddModalCollections";

// pages
import ExplorePage from "./pages/ExplorePage";
import CollectionsPage from "./pages/CollectionsPage";
import NotesPage from "./pages/NotesPage";
import EmptyPage from "./pages/EmptyPage";
import CollectionDetail from "./pages/CollectionDetail";

import sushi from "./assets/sushi.png";
import { TooltipProvider } from "@/components/ui/tooltip";

const COLLECTION_FIXTURES = [
  {
    id: "col-1",
    title: "Comfort Cinema",
    cover: sushi,
    items: [],
    itemIds: [],
  },
  {
    id: "col-2",
    title: "Cozy Autumn Reads",
    cover: sushi,
    items: [],
    itemIds: [],
  },
  {
    id: "col-3",
    title: "Gallery Hopping",
    cover: sushi,
    items: [],
    itemIds: [],
  },
  {
    id: "col-4",
    title: "Sunlit Soundtracks",
    cover: sushi,
    items: [],
    itemIds: [],
  },
];

const STACK_FILTERS = ["music", "books", "movies", "other"];
const STUB_FILTERS = ["concerts", "museums", "theatre", "other"];
const ALL_FILTERS = [...new Set([...STACK_FILTERS, ...STUB_FILTERS])];
const USER_ID = "user_001";

function ProfileLayout() {
  return (
    <>
      <ProfileHeader />
      <Outlet />
    </>
  );
}

function ProfileCollectionsSection({ collections, onAddCollection }) {
  const navigate = useNavigate();
  const hasCollections = collections.length > 0;

  return (
    <section className="px-8 mt-6 space-y-5">

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onAddCollection}
          className="rounded-full bg-[#CAC444] text-black px-4 py-2 text-sm font-semibold shadow-sm hover:bg-[#b5b03f] transition"
        >
          + New collection
        </button>
      </div>

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
  const [collections, setCollections] = useState(COLLECTION_FIXTURES);
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
  const [searchQuery, setSearchQuery] = useState("");

  // --------------------------------------
  // MODAL
  // --------------------------------------
  const [showModal, setShowModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [notes, setNotes] = useState([
    {
      id: "1",
      title: "Notes on The Myth of Sisyphus",
      content: "Read for PHIL2200",
      createdAt: Date.now(),
      image: null,
    },
  ]);

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
          hearted: false,
          date: item.date,
        })) ?? [];

      setStubItems(normalized);
    } catch (err) {
      console.error("Failed to fetch stubs:", err);
    }
  }, []);

  useEffect(() => {
    loadStacks();
    loadStubs();
  }, [loadStacks, loadStubs]);

  const handleStackSaved = useCallback(
    (newItem) => {
      if (newItem) {
        setStackItems((prev) => [
          ...prev,
          {
            ...newItem,
            coverUrl: newItem.coverUrl || newItem.img || "",
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
          },
        ]);
      }
      loadStubs();
    },
    [loadStubs]
  );

  const normalizedQuery = searchQuery.toLowerCase();
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
    (collectionPayload) => {
      setCollections((prev) => {
        const exists = prev.some((collection) => collection.id === collectionPayload.id);
        if (exists) {
          return prev.map((collection) =>
            collection.id === collectionPayload.id ? collectionPayload : collection
          );
        }
        return [...prev, collectionPayload];
      });
      closeCollectionModal();
    },
    [closeCollectionModal]
  );

  const handleCollectionDelete = useCallback((collectionId) => {
    setCollections((prev) =>
      prev.filter((collection) => collection.id?.toString() !== collectionId?.toString())
    );
  }, []);

  const handleCollectionItemRemove = useCallback((collectionId, itemId) => {
    const normalizedItemId = itemId?.toString();
    setCollections((prev) =>
      prev.map((collection) => {
        if (collection.id !== collectionId) return collection;
        const nextItems = (collection.items || []).filter(
          (item) => item.id?.toString() !== normalizedItemId
        );
        const nextItemIds = (collection.itemIds || []).filter(
          (id) => id?.toString() !== normalizedItemId
        );
        return {
          ...collection,
          items: nextItems,
          itemIds: nextItemIds,
        };
      })
    );
  }, []);
  const filterAndSort = useCallback(
    (list, allowedTypes) => {
      let next = list.filter((item) => {
        const typeKey = (item.type || item.mediaType || "other").toLowerCase();
        if (!allowedTypes.includes(typeKey)) return false;
        if (filters[typeKey] === false) return false;
        return true;
      });

      if (normalizedQuery) {
        next = next.filter((item) =>
          (item.title || "").toLowerCase().includes(normalizedQuery)
        );
      }

      if (sortBy === "title") {
        next = [...next].sort((a, b) =>
          (a.title || "").localeCompare(b.title || "")
        );
      }

      return next;
    },
    [filters, normalizedQuery, sortBy]
  );

  const filteredStackItems = useMemo(
    () => filterAndSort(stackItems, STACK_FILTERS),
    [stackItems, filterAndSort]
  );

  const filteredStubItems = useMemo(
    () => filterAndSort(stubItems, STUB_FILTERS),
    [stubItems, filterAndSort]
  );

  // --------------------------------------
  // RENDER
  // --------------------------------------
  return (
    <Router>
      <TooltipProvider>
      <div className="min-h-screen bg-[#FBF5ED]">
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <Routes>
          {/* Public pages */}
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route
            path="/notes"
            element={
              <NotesPage
                notes={notes}
                onAddNote={() => setShowNoteModal(true)}
              />
            }
          />


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
                  />
                  <Gallery items={filteredStackItems} />
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
                  />
                  <Gallery
                    items={filteredStubItems}
                    allowHeartToggle={false}
                  />
                </>
              }
            />

            <Route
              path="collections"
              element={
                <ProfileCollectionsSection
                  collections={collections}
                  onAddCollection={() => openCollectionModal()}
                />
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
            <Route path="notes" element={<EmptyPage label="Notes" />} />
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

        {showNoteModal && (
          <AddNoteModal
            onClose={() => setShowNoteModal(false)}
            onSave={(newNote) => {
              setNotes((prev) => [...prev, newNote]);
              setShowNoteModal(false);
            }}
          />
        )}

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
