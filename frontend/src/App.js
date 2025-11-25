import React, { useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import ProfileHeader from "./components/ProfileHeader";
import FilterBar from "./components/FilterBar";
import Gallery from "./components/Gallery";
import AddModal from "./components/AddModal";

import sushi from "./assets/sushi.png";

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
    <div className="app">
      {/* NAVBAR */}
      <Navbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      {/* STYLE PREVIEW (optional) */}
      <div className="style-preview">
        <h2>Hello Styles</h2>
        <p className="font-light">Hello Styles — Light</p>
        <p className="font-medium">Hello Styles — Medium</p>
        <p className="font-bold">Hello Styles — Bold</p>
        <div className="color-palette">
          <div className="color-swatch color1"></div>
          <div className="color-swatch color2"></div>
          <div className="color-swatch color3"></div>
        </div>
      </div>

      {/* PROFILE HEADER */}
      <ProfileHeader />

      {/* FILTER BAR */}
      <FilterBar
        filters={filters}
        sortBy={sortBy}
        onToggleTag={handleToggleTag}
        onToggleHearted={handleToggleHearted}
        onToggleSort={handleToggleSort}
        onAdd={openModal}
      />

      {/* GALLERY */}
      <Gallery items={filteredItems} />

      {/* ADD MODAL */}
      {showModal && (
        <AddModal
          onClose={closeModal}
          onSave={handleAddItem}   // <-- NEW
        />
      )}

    </div>
  );
}

export default Artsbook;
