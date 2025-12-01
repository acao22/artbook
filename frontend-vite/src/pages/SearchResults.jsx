import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ENDPOINTS = {
  profiles: "http://127.0.0.1:5000/api/search/profiles",
  collections: "http://127.0.0.1:5000/api/search/collections",
  notes: "http://127.0.0.1:5000/api/search/notes",
};

const LABELS = {
  profiles: "Profiles",
  collections: "Collections",
  notes: "Notes",
};

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const type = (searchParams.get("type") || "").toLowerCase();

  const [state, setState] = useState({
    loading: false,
    error: "",
    results: [],
  });

  const endpoint = ENDPOINTS[type];
  const label = LABELS[type] || "Results";

  useEffect(() => {
    if (!endpoint || !query) {
      setState({ loading: false, error: "", results: [] });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    fetch(`${endpoint}?query=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Search failed");
        }
        return res.json();
      })
      .then((data) => {
        setState({ loading: false, error: "", results: data.results || [] });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Search failed:", err);
        setState({ loading: false, error: "Unable to load search results.", results: [] });
      });

    return () => controller.abort();
  }, [endpoint, query]);

  const heading = useMemo(() => {
    if (!query) return "Search";
    return `Results for "${query}"`;
  }, [query]);

  const handleBack = () => navigate(-1);

  const renderEmptyState = () => (
    <div className="rounded-3xl border border-dashed border-gray-300 px-6 py-16 text-center text-gray-500 space-y-3">
      <p>No {label.toLowerCase()} found for this search.</p>
      <Button variant="outline" className="rounded-full" onClick={handleBack}>
        Go back
      </Button>
    </div>
  );

  const renderProfiles = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {state.results.map((profile) => (
        <div key={profile.id} className="rounded-3xl border border-[#eadfcc] bg-white p-5 space-y-2 shadow-sm">
          <p className="text-lg font-semibold text-gray-900">@{profile.username}</p>
          <div className="text-sm text-gray-600 flex gap-4">
            <span>{profile.followers} followers</span>
            <span>{profile.following} following</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCollections = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {state.results.map((collection) => (
        <div key={collection.id} className="rounded-3xl border border-[#eadfcc] bg-white shadow-sm overflow-hidden">
          {collection.cover ? (
            <div className="aspect-video bg-[#f4efe4]">
              <img src={collection.cover} alt={collection.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-video bg-[#f4efe4] flex items-center justify-center text-sm text-gray-500">
              No cover
            </div>
          )}
          <div className="p-4 space-y-1">
            <p className="text-base font-semibold text-gray-900">{collection.title}</p>
            {collection.subtitle && (
              <p className="text-sm text-gray-600 line-clamp-2">{collection.subtitle}</p>
            )}
            <p className="text-xs uppercase tracking-wide text-gray-500">
              by {collection.username || collection.userId || "Unknown"}
            </p>
            <p className="text-xs text-gray-500">{collection.itemCount} items</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-4">
      {state.results.map((note) => (
        <article key={note.id} className="rounded-3xl border border-[#eadfcc] bg-white p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">by {note.username || note.userId || "Unknown"}</p>
              <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
            </div>
            {note.createdAt && (
              <p className="text-xs text-gray-500">
                {new Date(note.createdAt * 1000).toLocaleDateString()}
              </p>
            )}
          </div>
          {note.body ? (
            <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">{note.body}</p>
          ) : (
            <p className="text-sm text-gray-500">No additional content.</p>
          )}
        </article>
      ))}
    </div>
  );

  const renderResults = () => {
    if (!state.results.length) {
      return renderEmptyState();
    }

    if (type === "profiles") return renderProfiles();
    if (type === "collections") return renderCollections();
    if (type === "notes") return renderNotes();

    return renderEmptyState();
  };

  if (!endpoint || !query) {
    return (
      <div className="px-8 py-10 space-y-4">
        <h1 className="text-3xl font-semibold text-gray-900">Search</h1>
        <p className="text-gray-600">Choose what you want to search for in the top bar.</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">{label}</p>
          <h1 className="text-3xl font-semibold text-gray-900">{heading}</h1>
        </div>
        <Button variant="outline" className="rounded-full" onClick={handleBack}>
          Go back
        </Button>
      </div>

      {state.loading ? (
        <div className="rounded-3xl border border-dashed border-gray-300 px-6 py-16 text-center text-gray-500">
          Searching {label.toLowerCase()}...
        </div>
      ) : state.error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-red-600">
          {state.error}
        </div>
      ) : (
        renderResults()
      )}
    </div>
  );
}