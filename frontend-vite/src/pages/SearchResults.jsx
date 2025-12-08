import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const ENDPOINTS = {
  profiles: "http://127.0.0.1:5000/api/search/profiles",
  collections: "http://127.0.0.1:5000/api/search/collections",
  notes: "http://127.0.0.1:5000/api/search/notes",
};

const LABELS = {
  profiles: "People",
  collections: "Collections",
  notes: "Notes",
};

export default function SearchResults() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const type = (searchParams.get("type") || "").toLowerCase();

  const [state, setState] = useState({
    loading: false,
    error: "",
    results: [],
  });

  const [followingStatus, setFollowingStatus] = useState({}); // { userId: boolean }

  const endpoint = ENDPOINTS[type];
  const label = LABELS[type] || "Results";

  // nee dto check follow status for profiles
  useEffect(() => {
    if (type !== "profiles" || !currentUser || !state.results.length) return;

    async function checkFollowStatuses() {
      const statuses = {};
      const token = await currentUser.getIdToken();

      for (const profile of state.results) {
        if (profile.id === currentUser.uid) continue;
        try {
          const res = await fetch(
            `http://127.0.0.1:5000/api/users/${profile.id}/follow/status?token=${token}`
          );
          if (res.ok) {
            const data = await res.json();
            statuses[profile.id] = data.following || false;
          }
        } catch (err) {
          console.error("Failed to check follow status:", err);
        }
      }
      setFollowingStatus(statuses);
    }

    checkFollowStatuses();
  }, [type, currentUser, state.results]);

  useEffect(() => {
    if (!endpoint) {
      setState({ loading: false, error: "", results: [] });
      return;
    }

    // for profiles, we shud allow empty query to show everyone
    // NOTE: this was placehodler for full profile search!!now its ok
    const searchQuery = type === "profiles" ? (query || "") : query;
    if (type !== "profiles" && !searchQuery) {
      setState({ loading: false, error: "", results: [] });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    const url = searchQuery
      ? `${endpoint}?query=${encodeURIComponent(searchQuery)}`
      : `${endpoint}?query=`;

    fetch(url, {
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
        // Filter out current user from profiles
        let filteredResults = data.results || [];
        if (type === "profiles" && currentUser) {
          filteredResults = filteredResults.filter(
            (profile) => profile.id !== currentUser.uid
          );
        }
        setState({ loading: false, error: "", results: filteredResults });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Search failed:", err);
        setState({ loading: false, error: "Unable to load search results.", results: [] });
      });

    return () => controller.abort();
  }, [endpoint, query, type]);

  const heading = useMemo(() => {
    if (type === "profiles" && !query) return "All People";
    if (!query) return "Search";
    return `Results for "${query}"`;
  }, [query, type]);

  const handleBack = () => navigate(-1);

  const renderEmptyState = () => (
    <div className="rounded-3xl border border-dashed border-gray-300 px-6 py-16 text-center text-gray-500 space-y-3">
      <p>No {label.toLowerCase()} found for this search.</p>
      <Button variant="outline" className="rounded-full" onClick={handleBack}>
        Go back
      </Button>
    </div>
  );

  const handleProfileNavigate = (profileId, e) => {
    if (e && e.target.closest("button[data-follow]")) {
      e.stopPropagation();
      return;
    }
    if (!profileId) return;
    navigate(`/profiles/${encodeURIComponent(profileId)}/stack`);
  };

  const handleFollow = async (profileId, e) => {
    e.stopPropagation();
    if (!currentUser || !profileId || profileId === currentUser.uid) return;

    const isFollowing = followingStatus[profileId] || false;
    const newStatus = !isFollowing;

    try {
      const token = await currentUser.getIdToken();
      const method = newStatus ? "POST" : "DELETE";
      const res = await fetch(
        `http://127.0.0.1:5000/api/users/${profileId}/follow`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      if (res.ok) {
        setFollowingStatus((prev) => ({
          ...prev,
          [profileId]: newStatus,
        }));
        setState((prev) => ({
          ...prev,
          results: prev.results.map((p) =>
            p.id === profileId
              ? {
                  ...p,
                  followers: newStatus
                    ? (p.followers || 0) + 1
                    : Math.max(0, (p.followers || 0) - 1),
                }
              : p
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to follow/unfollow:", err);
    }
  };

  const renderProfiles = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {state.results.map((profile) => {
        const isFollowing = followingStatus[profile.id] || false;
        const showFollowButton = currentUser && profile.id !== currentUser.uid;

        return (
          <div
            key={profile.id}
            onClick={(e) => handleProfileNavigate(profile.id, e)}
            className="text-left rounded-3xl border border-[#eadfcc] bg-[#AEC7E0]/40 p-5 space-y-3 shadow-sm transition hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900">
                  @{profile.username}
                </p>
                {profile.bio && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {profile.bio}
                  </p>
                )}
                <div className="text-sm text-gray-600 flex gap-4 mt-2">
                  <span>{profile.followers || 0} followers</span>
                  <span>{profile.following || 0} following</span>
                </div>
              </div>
              {showFollowButton && (
                <Button
                  data-follow
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  className="rounded-full text-xs flex-shrink-0"
                  onClick={(e) => handleFollow(profile.id, e)}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">View profile →</p>
          </div>
        );
      })}
    </div>
  );

  const renderCollections = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {state.results.map((collection) => (
        <div key={collection.id} className="rounded-3xl border border-[#eadfcc] bg-[#AEC7E0]/40 shadow-sm overflow-hidden">
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
        <article key={note.id} className="rounded-3xl border border-[#eadfcc] bg-[#AEC7E0]/40 p-5 space-y-2 shadow-sm">
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
            <p className="text-sm text-gray-500">See More</p>
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

  if (!endpoint) {
    return (
      <div className="px-8 py-10 space-y-4">
        <h1 className="text-3xl font-semibold text-gray-900">Search</h1>
        <p className="text-gray-600">Choose what you want to search for in the top bar.</p>
      </div>
    );
  }

  if (type !== "profiles" && !query) {
    return (
      <div className="px-8 py-10 space-y-4">
        <h1 className="text-3xl font-semibold text-gray-900">Search</h1>
        <p className="text-gray-600">Enter a search term to find {label.toLowerCase()}.</p>
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