import React from "react";
import "./App.css";
import { Search, Heart, Plus, ChevronDown } from "lucide-react";
import sushi from "./assets/sushi.png";
import pfp from "./assets/pfp.png";

function Artsbook() {
  const items = [
    { title: "Nine Stories", img: sushi},
    { title: "One Battle After Another", img: sushi},
    { title: "The Concussion Diaries", img: sushi },
    { title: "On Beauty", img: sushi },
    { title: "The Royal Tenenbaums", img: sushi },
    { title: "Either/Or", img: sushi },
    { title: "Apocalypse Now", img: sushi },
    { title: "The Player", img: sushi },
    { title: "Conversations With Friends", img: sushi },
  ];

  return (
    <div className="app">
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
            <input type="text" placeholder="Search..." />
          </div>
          <div className="profile">M</div>
        </div>
      </nav>

      <section className="profile-header">
        <img src={pfp} alt="profile pic" className="avatar" />
        <div>
          <h2>Hello, world</h2>
          <p>6 followers · 7 following</p>
          <button className="edit-btn">edit profile</button>
        </div>
      </section>

      <div className="controls">
        <div className="tags">
          {["Films", "Books", "Other"].map((t) => (
            <button className="tag active" key={t}>✓ {t}</button>
          ))}
          {["TV", "Albums"].map((t) => (
            <button className="tag" key={t}>{t}</button>
          ))}
          <button className="tag"><Heart size={12} /> Hearted Only</button>
        </div>
        <div className="sort-controls">
          <button><ChevronDown size={12} /> Sort</button>
          <button><Plus size={14} /></button>
        </div>
      </div>

      <div className="gallery">
        {items.map((item, i) => (
          <img key={i} src={item.img} alt={item.title} />
        ))}
      </div>
    </div>
  );
}

export default Artsbook;
