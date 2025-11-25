import React, { useState } from "react";
import pfp from "../assets/pfp.png";
import "../styles/ProfileHeader.css";
import { NavLink } from "react-router-dom";

function ProfileHeader() {
    const tabs = [
    { label: "Stack", path: "stack" },
    { label: "Stubs", path: "stubs" },
    { label: "Collections", path: "collections" },
    { label: "Notes", path: "notes" },
  ];

  return (
    <section className="profile-header">
      <div className="profile-info">
        <img src={pfp} alt="profile pic" className="avatar" />

        <div className="info-text">
          <h2 className="username">jinrainbows</h2>
          <p className="follows">7 followers · 7 following</p>
          <button className="edit-btn">edit profile</button>
        </div>
      </div>

      <div className="profile-tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={`/profile/${tab.path}`}
            className={({ isActive }) =>
              isActive
                ? "profile-tab active"
                : "profile-tab"
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </section>
  );
}

export default ProfileHeader;
