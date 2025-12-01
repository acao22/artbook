// src/pages/CollectionsPage.jsx
import React from "react";
import c_cover1 from "../assets/c_cover1.jpg";
import c_cover2 from "../assets/c_cover2.jpg";

const POPULAR_COLLECTIONS = [
  {
    id: "pop-1",
    title: "Works about war",
    creator: "@marco",
    cover:
      c_cover1,
  },
  {
    id: "pop-2",
    title: "The 2000s",
    creator: "@han",
    cover:
      "https://akns-images.eonline.com/eol_images/Entire_Site/20141111/rs_1024x759-141211152131-1024-left-handed-ipod.jw.121114.jpg?fit=around%7C1024:759&output-quality=90&crop=1024:759;center,top",
  },
  {
    id: "pop-3",
    title: "Feminist works",
    creator: "@kei",
    cover:
      "https://www.paintgarden.com/cdn/shop/products/CAE8F3.png?v=1658180369",
  },
  {
    id: "pop-4",
    title: "On labor",
    creator: "@naya",
    cover:
      "https://i.pinimg.com/736x/67/a1/ba/67a1bacca4ad4b3c0e8ad17385da3206.jpg",
  },
  {
    id: "pop-5",
    title: "Favs of the 2010s",
    creator: "@carlos",
    cover:
      "https://img.freepik.com/free-photo/pastel-pink-vignette-concrete-textured-background_53876-129734.jpg?semt=ais_hybrid&w=740&q=80",
  },
];

const RECENT_COLLECTIONS = [
  {
    id: "rec-1",
    title: "Recent Favorites",
    creator: "@aoife",
    cover:
      "https://i.pinimg.com/236x/3d/0b/0a/3d0b0a5b6408372e8be3b5925bf2171a.jpg",
  },
  {
    id: "rec-2",
    title: "Coming of age",
    creator: "@mina",
    cover:
      c_cover2,
  },
  {
    id: "rec-3",
    title: "Random",
    creator: "@len",
    cover:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS08-htGYvF2MtY7nJ1QZJdRFsuMq0PTOrRTg&s",
  },
  {
    id: "rec-4",
    title: "Art about art",
    creator: "@nikki",
    cover:
      "https://i.pinimg.com/736x/5b/d4/32/5bd4320f6979022d369bb5bf815d6ea4.jpg",
  },
    {
    id: "rec-5",
    title: "Happy",
    creator: "@niki",
    cover:
      "https://c.stocksy.com/a/JC7200/z9/504327.jpg",
  },
];

const Section = ({ label, title, description, items }) => (
  <section className="space-y-4">
    <div className="flex flex-col gap-1">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <h2 className="text-2xl font-semibold text-[#1F2A37]">{title}</h2>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
    <div className="relative">
      <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex-shrink-0 snap-start space-y-3 max-w-[230px]"
          >
            <div className="h-56 rounded-3xl overflow-hidden border border-[#efe7db] bg-[#f5efe6] shadow-md">
              <img
                src={item.cover}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-[#1F2A37] line-clamp-2">
                {item.title}
              </p>
              <p className="text-sm text-gray-600">{item.creator}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default function CollectionsPage() {
  return (
    <section className="px-8 py-10 space-y-10">
      <Section
        title="Popular collections"
        items={POPULAR_COLLECTIONS}
      />

      <Section
        title="Recent collections"
        items={RECENT_COLLECTIONS}
      />
    </section>
  );
}