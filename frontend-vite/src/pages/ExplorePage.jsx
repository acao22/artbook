// src/pages/ExplorePage.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

const RECENTLY_ADDED = [
  {
    id: "ra-1",
    title: "Yankee Hotel Foxtrot",
    creator: "Added by @jane",
    cover:
      "https://upload.wikimedia.org/wikipedia/en/1/1c/Yankee_Hotel_Foxtrot_%28Front_Cover%29.png",
  },
  {
    id: "ra-2",
    title: "My Brilliant Friend",
    creator: "Added by @john",
    cover:
      "https://m.media-amazon.com/images/I/81p2bM1JNcL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    id: "ra-3",
    title: "Do the Right Thing",
    creator: "Added by @sloane",
    cover:
      "http://m.media-amazon.com/images/M/MV5BODA2MjU1NTI1MV5BMl5BanBnXkFtZTgwOTU4ODIwMjE@._V1_.jpg",
  },
  {
    id: "ra-4",
    title: "good kid, m.A.A.d city",
    creator: "Added by @devon",
    cover:
      "https://i.scdn.co/image/ab67616d0000b27378de8b28de36a74afc0348b5",
  },
  {
    id: "ra-5",
    title: "Dog Day Afternoon",
    creator: "Added by @nori",
    cover:
      "https://a.ltrbxd.com/resized/film-poster/5/1/1/9/5/51195-dog-day-afternoon-0-230-0-345-crop.jpg?v=dcce1e7cbb",
  },
  {
    id: "ra-5",
    title: "Submarine",
    creator: "Added by @jan",
    cover:
      "https://upload.wikimedia.org/wikipedia/en/thumb/4/44/The_Mar%C3%ADas_-_Submarine.jpg/250px-The_Mar%C3%ADas_-_Submarine.jpg",
  },
];

const RECENT_NOTES = [
  {
    id: "note-1",
    title: "Recent trip to MoMA",
    body: "Special exhibitions and highlights.",
    author: "@milo",
    mediaType: "museums",
    createdAt: "2h ago",
  },
  {
    id: "note-2",
    title: "On my favorite album of the 21st century",
    body: "Track by track notes are as follows.",
    author: "@adrian",
    mediaType: "music",
    createdAt: "Yesterday",
  },
  {
    id: "note-3",
    title: "War and Peace brain dump",
    body: "Notes for my final paper.",
    author: "@lola",
    mediaType: "books",
    createdAt: "3 days ago",
  },
];

export default function ExplorePage() {
  return (
    <section className="px-8 py-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold text-[#1F2A37] flex flex-wrap items-baseline gap-2">
          <span>Hi,</span>
          <Link
            to="/profile/stack"
            className="text-[#1F2A37] underline decoration-[3px] decoration-[#CAC444] underline-offset-6 hover:text-[#CAC444] transition-colors"
          >
            Jin!
          </Link>
        </h1>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#1F2A37]">
              Recently added by users
            </h2>
          </div>
        </div>

        <div className="relative">
          <div
            className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {RECENTLY_ADDED.map((item) => (
              <article
                key={item.id}
                className="flex-shrink-0 snap-start space-y-3 max-w-[260px]"
              >
                <div className="h-64 rounded-3xl overflow-hidden bg-[#f5efe6] shadow-lg flex items-center justify-center">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="h-full w-auto max-w-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[#1F2A37]">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600">{item.creator}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#FBF5ED] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#FBF5ED] to-transparent" />
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#1F2A37]">
            Recently published notes
          </h2>
        </div>

        <div className="space-y-4">
          {RECENT_NOTES.map((note) => (
            <article
              key={note.id}
              className="rounded-3xl bg-[#AEC7E0]/40 border border-[#e0edf7] shadow-sm p-6 text-[#1F2A37]"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#1f2a37]/70">
                    {note.mediaType}
                  </p>
                  <h3 className="text-xl font-semibold leading-tight">
                    {note.title}
                  </h3>
                </div>
                <div className="text-xs text-[#1f2a37]/70 text-right">
                  <p>{note.author}</p>
                  <p>{note.createdAt}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{note.body}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}