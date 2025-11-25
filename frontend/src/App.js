import React, { useState } from "react";
import "./App.css";
import {BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation} from "react-router-dom";
import Navbar from "./components/Navbar";
import ProfileHeader from "./components/ProfileHeader";
import FilterBar from "./components/FilterBar";
import Gallery from "./components/Gallery";
import AddModal from "./components/AddModal";
import sushi from "./assets/sushi.png";

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

function EmptyPage({ label }) {
  return (
    <div style={{ padding: "40px", color: "#777" }}>
      <h2>{label}</h2>
    </div>
  );
}

function Artsbook() {
  // ----------------------------
  //  DUMMY DATA
  // ----------------------------
  const [items, setItems] = useState([
    { id: 1, title: "Nine Stories", img: sushi, type: "books", hearted: true },
    { id: 2, title: "One Battle After Another", img: sushi, type: "films", hearted: false },
    { id: 3, title: "The Concussion Diaries", img: sushi, type: "films", hearted: true },
    { id: 4, title: "On Beauty", img: sushi, type: "books", hearted: false },
    { id: 5, title: "The Royal Tenenbaums", img: sushi, type: "films", hearted: true },
    { id: 6, title: "Either/Or", img: sushi, type: "books", hearted: true },
    { id: 7, title: "Apocalypse Now", img: sushi, type: "films", hearted: false },
    { id: 8, title: "The Player", img: sushi, type: "films", hearted: false },
    { id: 9, title: "Conversations With Friends", img: sushi, type: "books", hearted: true },
  ]);

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
  const openModal = () => setShowModal(true);
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

  const handleAddItem = (newItem) => {
    setItems((prev) => [...prev, newItem]);
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

        {/* PROFILE HEADER — SAME ON ALL PAGES */}
        <ProfileHeader />

        <Routes>
          {/* redirect /profile → /profile/stack */}
          <Route path="/profile" element={<Navigate to="/profile/stack" replace />} />

          {/* STACK PAGE — keeps using filters, gallery, modal */}
          <Route
            path="/profile/stack"
            element={
              <StackPage
                filteredItems={filteredItems}
                filters={filters}
                sortBy={sortBy}
                handleToggleTag={handleToggleTag}
                handleToggleHearted={handleToggleHearted}
                handleToggleSort={handleToggleSort}
                openModal={openModal}
                mode = "stack"
              />
            }
          />

          {/* other pages just placeholders for now */}
          <Route
            path="/profile/stubs"
              element={
                <StubsPage
                filteredItems={filteredItems}
                filters={filters}
                sortBy={sortBy}
                handleToggleTag={handleToggleTag}
                handleToggleHearted={handleToggleHearted}
                handleToggleSort={handleToggleSort}
                openModal={openModal}
                mode = "stubs"
              />
            }
          />
          <Route path="/profile/collections" element={<EmptyPage label="Collections" />} />
          <Route path="/profile/notes" element={<EmptyPage label="Notes" />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/profile/stack" replace />} />
        </Routes>

        {/* MODAL always works */}
        {showModal && (
          <AddModal onClose={closeModal} onSave={handleAddItem} />
        )}
      </div>
    </Router>
  );
}

export default Artsbook;
