import React from "react";
import { NavLink } from "react-router-dom";
import { Search } from "lucide-react";
import "../styles/Navbar.css";


function Navbar({ searchQuery, onSearchChange }) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1 className="logo">Artsbook</h1>

        <div className="nav-links">
          <NavLink
            to="/explore"
            className="nav-btn"
          >
            Explore
          </NavLink>

          <NavLink
            to="/collections"
            className="nav-btn"
          >
            Collections
          </NavLink>

          <NavLink
            to="/notes"
            className="nav-btn"
          >
            Notes
          </NavLink>
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

        <div className="profile">
          <NavLink to="/profile" className="profile-link">
            M
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;