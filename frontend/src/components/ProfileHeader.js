import React, { useState } from "react";
import pfp from "../assets/pfp.png";
import "../styles/ProfileHeader.css";

function ProfileHeader() {
  const [activeTab, setActiveTab] = useState("stack");
  const tabs = ["Stack", "Stubs", "Collections", "Notes"];

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
          <button
            key={tab}
            className={
              activeTab.toLowerCase() === tab.toLowerCase()
                ? "profile-tab active"
                : "profile-tab"
            }
            onClick={() => setActiveTab(tab.toLowerCase())}
          >
            {tab}
          </button>
        ))}
      </div>
    </section>
  );
}

export default ProfileHeader;
