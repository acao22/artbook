// src/pages/ExplorePage.jsx
import React, { useEffect, useMemo, useState } from "react";
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

const FALLBACK_RECENT_NOTES = [
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

const DEFAULT_USER_ID = "user_001";

function formatRelativeLabel(timestamp) {
  if (!timestamp) return "";
  const nowSeconds = Date.now() / 1000;
  const diff = Math.max(0, nowSeconds - timestamp);
  if (diff < 3600) {
    const minutes = Math.max(1, Math.floor(diff / 60));
    return `${minutes}m ago`;
  }
  if (diff < 86400) {
    const hours = Math.max(1, Math.floor(diff / 3600));
    return `${hours}h ago`;
  }
  const days = Math.max(1, Math.floor(diff / 86400));
  return `${days}d ago`;
}

export default function ExplorePage() {
  const [recentNotes, setRecentNotes] = useState(FALLBACK_RECENT_NOTES);
  const [notesLoading, setNotesLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setNotesLoading(true);
    fetch("http://127.0.0.1:5000/api/notes")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load notes");
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const normalized = (data.results || [])
          .filter((note) => note?.isPublic !== false)
          .sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
          )
          .slice(0, 5)
          .map((note) => {
            const title = note.title || "Untitled note";
            const [fallbackTitle, ...rest] = (note.content || "").split("\n");
            const body = note.body || rest.join("\n").trim();
            const author =
              note.username || note.userId
                ? `@${(note.username || note.userId || "unknown")
                    .toString()
                    .replace("@", "")}`
                : "Unknown";
            const userId = note.userId;
            const path =
              userId && userId !== DEFAULT_USER_ID
                ? `/profiles/${userId}/notes/${note.id}`
                : `/profile/notes/${note.id}`;

            return {
              id: note.id,
              title: title || fallbackTitle || "Untitled note",
              body:
                body ||
                rest.join("\n").trim() ||
                "Tap to read the full note.",
              author,
              mediaType: (note.mediaType || "note").toLowerCase(),
              createdAt: formatRelativeLabel(note.createdAt),
              link: path,
            };
          });

        if (normalized.length) {
          setRecentNotes(normalized);
        }
      })
      .catch((err) => {
        console.error("Failed to load recent notes:", err);
      })
      .finally(() => {
        if (isMounted) setNotesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
          {notesLoading && (
            <div className="rounded-3xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
              Loading recent notes…
            </div>
          )}
          {!notesLoading &&
            recentNotes.map((note) => (
              <Link
                key={note.id}
                to={note.link}
                className="block rounded-3xl bg-[#AEC7E0]/40 border border-[#e0edf7] shadow-sm p-6 text-[#1F2A37] transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#CAC444]/60"
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
                <p className="mt-3 text-sm leading-relaxed line-clamp-3">
                  {note.body}
                </p>
              </Link>
            ))}
        </div>
      </section>
    </section>
  );
}