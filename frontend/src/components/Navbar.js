import React from "react";
import { Search } from "lucide-react";

function Navbar({ searchQuery, onSearchChange }) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1 className="logo">Artsbook</h1>
        <div className="nav-links">
          <button>Explore</button>
          <button>Collections</button>
          <button>Notes</button>
        </div>
      </div>

      <div className="nav-right">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="profile">M</div>
      </div>
    </nav>
  );
}

export default Navbar;
