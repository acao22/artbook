import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  music1,
  music2,
  music3,
  book1,
  book2,
  movie1,
  movie2,
  movie3,
} from "./assets";

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


// -----------------------------
// Profile Layout Component
// -----------------------------
function ProfileLayout() {
  return (
    <>
      <ProfileHeader />
      <Outlet />
    </>
  );
}

export default function App() {
  // --------------------------------------
  // SAMPLE DATA
  // --------------------------------------
const [items, setItems] = useState([
  // ----------------------
  //     BOOKS (Tall)
  // ----------------------
  {
    id: 1,
    title: "Wonder",
    img: book1,
    type: "books",
    hearted: true,
  },
  {
    id: 2,
    title: "Sunrise on the Reaping",
    img: book2,
    type: "books",
    hearted: false,
  },

  // ----------------------
  //     MOVIES (Medium-wide)
  // ----------------------
  {
    id: 4,
    title: "Past Lives",
    img: movie1,
    type: "movies",
    hearted: true,
  },
  {
    id: 5,
    title: "Avatar",
    img: movie2,
    type: "movies",
    hearted: false,
  },
  {
    id: 6,
    title: "Spirited Away",
    img: movie3,
    type: "movies",
    hearted: true,
  },

  // ----------------------
  //     MUSIC (square)
  // ----------------------
  {
    id: 7,
    title: "Not for Radio",
    img: music1,
    type: "music",
    hearted: true,
  },
  {
    id: 8,
    title: "Touch",
    img: music2,
    type: "music",
    hearted: false,
  },
  {
    id: 9,
    title: "Submarine",
    img: music3,
    type: "music",
    hearted: true,
  },

  // ----------------------
  //     ARTWORK (varied aspect ratios)
  // ----------------------
  {
    id: 10,
    title: "Starry Night – Van Gogh",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/640px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    type: "artwork",
    hearted: true,
  },
  {
    id: 11,
    title: "Sushi",
    img: "./assets/sushi.jpg",
    type: "artwork",
    hearted: false,
  },
  {
    id: 12,
    title: "Girl with a Pearl Earring – Vermeer",
    img: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Meisje_met_de_parel.jpg",
    type: "artwork",
    hearted: true,
  },
]);


  // --------------------------------------
  // FILTER STATE
  // --------------------------------------
  const [filters, setFilters] = useState({
    artwork: true,
    music: true,
    books: true,
    movies: true,
  });

  const [sortBy, setSortBy] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");

  // --------------------------------------
  // MODAL
  // --------------------------------------
  const [showModal, setShowModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [notes, setNotes] = useState([
    // temporary sample notes:
    {
      id: "1",
      title: "Notes on The Myth of Sisyphus",
      content: "Read for PHIL2200",
      createdAt: Date.now(),
      image: null, // optionally attach gallery image
    },
  ]);

  const [currentMode, setCurrentMode] = useState("stack");

  const openModal = (mode) => {
    setCurrentMode(mode);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // --------------------------------------
  // FILTER LOGIC
  // --------------------------------------
  let filteredItems = items
    .filter((item) => filters[item.type] === true)
    .filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (sortBy === "title") {
    filteredItems = [...filteredItems].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }

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
                    onToggleFilter={(updated) => setFilters(updated)}

                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    openModal={() => openModal("stack")}
                  />
                  <Gallery items={filteredItems} />
                </>
              }
            />

            <Route
              path="stubs"
              element={
                <>
                  <FilterBar
                    activeFilters={filters}
                    onToggleFilter={(updated) => setFilters(updated)}

                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    openModal={() => openModal("stubs")}
                  />
                  <Gallery items={filteredItems} />
                </>
              }
            />

            <Route path="collections" element={<EmptyPage label="Collections" />} />
            <Route path="notes" element={<EmptyPage label="Notes" />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/profile/stack" replace />} />
        </Routes>

        {/* MODALS */}
        {showModal &&
          (currentMode === "stubs" ? (
            <AddModalStubs onClose={closeModal} onSave={(i) => setItems([...items, i])} />
          ) : (
            <AddModal onClose={closeModal} onSave={(i) => setItems([...items, i])} />
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
