import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProfileHeader from "./components/ProfileHeader";
import FilterBar from "./components/FilterBar";
import Gallery from "./components/Gallery";
import AddModal from "./components/AddModal";
import AddModalStubs from "./components/AddModalStubs";
import AddNoteModal from "./components/AddNoteModal";

// pages
import ExplorePage from "./pages/ExplorePage";
import CollectionsPage from "./pages/CollectionsPage";
import NotesPage from "./pages/NotesPage";
import EmptyPage from "./pages/EmptyPage";

import sushi from "./assets/sushi.png";
import { TooltipProvider } from "@/components/ui/tooltip";

const COLLECTION_FIXTURES = [
  {
    id: "col-1",
    title: "Comfort Cinema",
    cover: sushi,
  },
  {
    id: "col-2",
    title: "Cozy Autumn Reads",
    cover: sushi,
  },
  {
    id: "col-3",
    title: "Gallery Hopping",
    cover: sushi,
  },
  {
    id: "col-4",
    title: "Sunlit Soundtracks",
    cover: sushi,
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

function ProfileCollectionsSection({ collections }) {
  if (!collections.length) {
    return <EmptyPage label="Collections" />;
  }

  return (
    <section className="px-8 mt-6 space-y-4">
      <Gallery items={collections} variant="collections" />
    </section>
  );
}

export default function App() {
  const [stackItems, setStackItems] = useState([]);
  const [stubItems, setStubItems] = useState([]);
  const [collections] = useState(COLLECTION_FIXTURES);

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
          id: item.id,
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
          id: item.id,
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
              element={<ProfileCollectionsSection collections={collections} />}
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

      </div>
      </TooltipProvider>
    </Router>
  );
}
