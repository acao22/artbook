import React, { useState } from "react";
import "./App.css";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Navbar from "./components/Navbar";
import ProfileHeader from "./components/ProfileHeader";
import FilterBar from "./components/FilterBar";
import Gallery from "./components/Gallery";
import AddModal from "./components/AddModal";
import AddModalStubs from "./components/AddModalStubs"
import sushi from "./assets/sushi.png";

import { useStackItems } from "./useStackItems";

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

function ExplorePage() {
  return <div style={{ padding: 40 }}><h2>Explore</h2></div>;
}

function CollectionsPage() {
  return <div style={{ padding: 40 }}><h2>Collections</h2></div>;
}

function NotesPage() {
  return <div style={{ padding: 40 }}><h2>Notes</h2></div>;
}

function ProfileLanding() {
  return <Navigate to="/profile/stack" replace />;
}

function ProfileLayout({ children }) {
  return (
    <>
      <ProfileHeader />
      {children}
    </>
  );
}

function StackPage({
  filteredItems,
  filters,
  sortBy,
  handleToggleTag,
  handleToggleHearted,
  handleToggleSort,
  openModal,
}) {
  return (
    <>
      {/* FILTER BAR */}
      <FilterBar
        filters={filters}
        sortBy={sortBy}
        onToggleTag={handleToggleTag}
        onToggleHearted={handleToggleHearted}
        onToggleSort={handleToggleSort}
        onAdd={openModal}
        mode="stack"
      />

      {/* GALLERY */}
      <Gallery items={filteredItems} />
    </>
  );
}

function StubsPage({
  filteredItems,
  filters,
  sortBy,
  handleToggleTag,
  handleToggleHearted,
  handleToggleSort,
  openModal,
}) {
  return (
    <>
      {/* FILTER BAR */}
      <FilterBar
        filters={filters}
        sortBy={sortBy}
        onToggleTag={handleToggleTag}
        onToggleHearted={handleToggleHearted}
        onToggleSort={handleToggleSort}
        onAdd={openModal}
        mode="stubs"
      />

      {/* GALLERY */}
      <Gallery items={filteredItems} />
    </>
  );
}

function ProfCollectionsPage({
  collections,
  filteredItems,
  filters,
  sortBy,
  handleToggleTag,
  handleToggleHearted,
  handleToggleSort,
  openModal, }) {
  if (!collections.length) {
    return <EmptyPage label="Collections" />;
  }

  return (
    <section className="profile-collections">
      <FilterBar
        filters={filters}
        sortBy={sortBy}
        onToggleTag={handleToggleTag}
        onToggleHearted={handleToggleHearted}
        onToggleSort={handleToggleSort}
        onAdd={openModal}
        mode="collections"
      />
      <Gallery items={collections} variant="collections" />
    </section>
  );
}

function EmptyPage({ label }) {
  return (
    <div style={{ padding: "40px", color: "#777" }}>
      <h2>{label}</h2>
    </div>
  );
}

 const collections = COLLECTION_FIXTURES;

function Artsbook() {
  const userId = "user_001";
  const { items, status, addItem } = useStackItems(userId);
  console.log("[Artsbook] status:", status);
  console.log("[Artsbook] items:", items);
  // ----------------------------
  //  DUMMY DATA
  // ----------------------------
  /*const [items, setItems] = useState([
    { id: 1, title: "Nine Stories", img: sushi, type: "books", hearted: true },
    { id: 2, title: "One Battle After Another", img: sushi, type: "films", hearted: false },
    { id: 3, title: "The Concussion Diaries", img: sushi, type: "films", hearted: true },
    { id: 4, title: "On Beauty", img: sushi, type: "books", hearted: false },
    { id: 5, title: "The Royal Tenenbaums", img: sushi, type: "films", hearted: true },
    { id: 6, title: "Either/Or", img: sushi, type: "books", hearted: true },
    { id: 7, title: "Apocalypse Now", img: sushi, type: "films", hearted: false },
    { id: 8, title: "The Player", img: sushi, type: "films", hearted: false },
    { id: 9, title: "Conversations With Friends", img: sushi, type: "books", hearted: true },
  ]);*/

  // ----------------------------
  //  FILTER STATE
  // ----------------------------
  const [filters, setFilters] = useState({
    films: true,
    books: true,
    other: true,
    tv: false,
    albums: false,
    hearted: false,

    concerts: true,
    museums: true,
    theatre: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // ----------------------------
  //  MODAL STATE
  // ----------------------------
  const [showModal, setShowModal] = useState(false);
  const [currentMode, setCurrentMode] = useState("stack");
  const openModal = (mode) => {
    setCurrentMode(mode);
    setShowModal(true);
  }
  const closeModal = () => setShowModal(false);

  // ----------------------------
  //  FILTER HANDLERS
  // ----------------------------
  const handleToggleTag = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleHearted = () => {
    setFilters((prev) => ({ ...prev, hearted: !prev.hearted }));
  };

  const handleToggleSort = () => {
    setSortBy((prev) => (prev === "default" ? "title" : "default"));
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  /*const handleAddItem = (newItem) => {
    setItems((prev) => [...prev, newItem]);
  };*/

  const handleAddItem = async (payload) => {
    await addItem(payload);
    // optional: close modal optimistically, errors surface via toast
  };

  // ----------------------------
  //  APPLY FILTERS / SEARCH / SORT
  // ----------------------------
  let filteredItems = items
    .filter((item) => filters[item.type]) // category filter
    .filter((item) => (filters.hearted ? item.hearted : true)) // hearted only
    .filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ); // search filter

  if (sortBy === "title") {
    filteredItems = [...filteredItems].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }

  // ----------------------------
  //  RENDER
  // ----------------------------
  return (
    <Router>
      <div className="app">

        {/* NAVBAR */}
        <Navbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        
        <Routes>

          {/* Public pages (NO ProfileHeader) */}
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/notes" element={<NotesPage />} />

          {/* Profile pages (WITH ProfileHeader) */}
          <Route
            path="/profile/*"
            element={
              <ProfileLayout>
                <Routes>
                  <Route path="" element={<Navigate to="stack" replace />} />
                  <Route
                    path="stack"
                    element={
                      <StackPage
                        filteredItems={filteredItems}
                        filters={filters}
                        sortBy={sortBy}
                        handleToggleTag={handleToggleTag}
                        handleToggleHearted={handleToggleHearted}
                        handleToggleSort={handleToggleSort}
                        openModal={() => openModal("stack")}
                      />
                    }
                  />
                  <Route
                    path="stubs"
                    element={
                      <StubsPage
                        filteredItems={filteredItems}
                        filters={filters}
                        sortBy={sortBy}
                        handleToggleTag={handleToggleTag}
                        handleToggleHearted={handleToggleHearted}
                        handleToggleSort={handleToggleSort}
                        openModal={() => openModal("stubs")}
                      />
                    }
                  />
                  <Route
                    path="collections"
                    element={
                      <ProfCollectionsPage
                        collections={collections}
                        filteredItems={filteredItems}
                        filters={filters}
                        sortBy={sortBy}
                        handleToggleTag={handleToggleTag}
                        handleToggleHearted={handleToggleHearted}
                        handleToggleSort={handleToggleSort}
                        openModal={() => openModal("stubs")} />
                    }
                  />
                  <Route path="notes" element={<EmptyPage label="Notes" />} />
                </Routes>
              </ProfileLayout>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/profile/stack" replace />} />

        </Routes>

        {/* -------------------- */}
        {/* ADD MODAL (STACK/STUBS) */}
        {/* -------------------- */}
        {showModal && (
          currentMode === "stubs" ? (
            <AddModalStubs onClose={closeModal} onSave={handleAddItem} />
          ) : (
            <AddModal onClose={closeModal} onSave={handleAddItem} />
          )
        )}
        
      </div>
    </Router>
  );
}

export default Artsbook;
