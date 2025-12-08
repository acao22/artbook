import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useOutletContext,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProfileHeader from "./components/ProfileHeader";
import FilterBar from "./components/FilterBar";
import Gallery from "./components/Gallery";
import AddModal from "./components/AddModal";
import AddModalStubs from "./components/AddModalStubs";
import AddModalCollections from "./components/AddModalCollections";

import ExplorePage from "./pages/ExplorePage";
import CollectionsPage from "./pages/CollectionsPage";
import NotesPage from "./pages/NotesPage";
import NoteDetail from "./pages/NoteDetail";
import CollectionDetail from "./pages/CollectionDetail";
import SearchResults from "./pages/SearchResults";

import { TooltipProvider } from "@/components/ui/tooltip";

const STACK_FILTERS = ["music", "movies", "tv", "books", "other"];
const STUB_FILTERS = ["concerts", "museums", "theatre", "other"];
const ALL_FILTERS = [...new Set([...STACK_FILTERS, ...STUB_FILTERS])];
const USER_ID = "user_001";

export default function App() {
  return (
    <Router>
      <TooltipProvider>
        <div className="min-h-screen bg-[#FBF5ED]">
          <Navbar />

          <Routes>
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/notes" element={<CollectionsPage />} />
            <Route path="/search" element={<SearchResults />} />

            <Route
              path="/profile/*"
              element={<ProfileShell defaultUserId={USER_ID} />}
            >
              {renderProfileRoutes()}
            </Route>

            <Route path="/profiles/:profileId/*" element={<ProfileShell />}>
              {renderProfileRoutes()}
            </Route>

            <Route path="*" element={<Navigate to="/profile/stack" replace />} />
          </Routes>
        </div>
      </TooltipProvider>
    </Router>
  );
}

function renderProfileRoutes() {
  return (
    <>
      <Route index element={<Navigate to="stack" replace />} />
      <Route path="stack" element={<ProfileStackRoute />} />
      <Route path="stubs" element={<ProfileStubsRoute />} />
      <Route path="collections" element={<ProfileCollectionsRoute />} />
      <Route
        path="collections/:collectionId"
        element={<ProfileCollectionDetailRoute />}
      />
      <Route path="notes" element={<ProfileNotesRoute />} />
      <Route path="notes/:noteId" element={<ProfileNoteDetailRoute />} />
    </>
  );
}

function ProfileShell({ defaultUserId = USER_ID }) {
  const params = useParams();
  const location = useLocation();

  const resolvedUserId = params.profileId || defaultUserId || USER_ID;
  const isOwnProfile = resolvedUserId === USER_ID;

  const [stackItems, setStackItems] = useState([]);
  const [stubItems, setStubItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionModalState, setCollectionModalState] = useState({
    open: false,
    collection: null,
  });
  const [filters, setFilters] = useState(() =>
    ALL_FILTERS.reduce(
      (acc, key) => ({
        ...acc,
        [key]: true,
      }),
      {}
    )
  );
  const [sortBy, setSortBy] = useState("default");
  const [stackHeartedOnly, setStackHeartedOnly] = useState(false);
  const [stubHeartedOnly, setStubHeartedOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentMode, setCurrentMode] = useState("stack");
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    setStackItems([]);
    setStubItems([]);
    setCollections([]);
    setShowModal(false);
    setCollectionModalState({ open: false, collection: null });
  }, [resolvedUserId]);

  const hideHeader =
    typeof location.pathname === "string" &&
    /\/(profile|profiles\/[^/]+)\/collections\/[^/]+/.test(
      location.pathname
    );

  const buildProfilePath = useCallback(
    (subPath = "") => {
      const normalized = subPath.replace(/^\/+/, "");
      const suffix = normalized ? `/${normalized}` : "";
      if (!resolvedUserId || resolvedUserId === USER_ID) {
        return `/profile${suffix}`;
      }
      return `/profiles/${resolvedUserId}${suffix}`;
    },
    [resolvedUserId]
  );

  const openModal = useCallback((mode) => {
    setCurrentMode(mode);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => setShowModal(false), []);

  const loadProfileUser = useCallback(async () => {
    if (!resolvedUserId) return;
    setProfileLoading(true);
    setProfileError("");
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/users/${resolvedUserId}`
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load profile");
      }
      const data = await res.json();
      setProfileUser(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setProfileUser(null);
      setProfileError("Unable to load this profile.");
    } finally {
      setProfileLoading(false);
    }
  }, [resolvedUserId]);

  const loadStacks = useCallback(async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/stacks?userId=${resolvedUserId}`
      );
      if (!res.ok) {
        console.error("Failed to fetch stacks:", res.status);
        return;
      }
      const data = await res.json();
      const normalized =
        (data.results || []).map((item) => ({
          id:
            item.id?.toString() ||
            item.externalId?.toString() ||
            `stack-${Math.random().toString(36).slice(2)}`,
          title: item.title,
          coverUrl: item.coverUrl || item.img || "",
          img: item.coverUrl || item.img || "",
          type: (item.mediaType || item.type || "other").toLowerCase(),
          hearted: Boolean(item.hearted),
          creator: item.creator || "",
          year: item.year || null,
          displayMode: "stack",
        })) ?? [];

      setStackItems(normalized);
    } catch (err) {
      console.error("Failed to fetch stacks:", err);
    }
  }, [resolvedUserId]);

  const loadStubs = useCallback(async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/stubs?userId=${resolvedUserId}`
      );
      if (!res.ok) {
        console.error("Failed to fetch stubs:", res.status);
        return;
      }
      const data = await res.json();
      const normalized =
        (data.results || []).map((item) => ({
          id:
            item.id?.toString() ||
            `stub-${Math.random().toString(36).slice(2)}`,
          title: item.title,
          coverUrl: item.coverUrl || "",
          img: item.coverUrl || "",
          type: (item.category || item.mediaType || "other").toLowerCase(),
          hearted: Boolean(item.hearted),
          date: item.date,
          displayMode: "stub",
        })) ?? [];

      setStubItems(normalized);
    } catch (err) {
      console.error("Failed to fetch stubs:", err);
    }
  }, [resolvedUserId]);

  const loadCollections = useCallback(async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/collections?userId=${resolvedUserId}`
      );
      if (!res.ok) {
        console.error("Failed to fetch collections:", res.status);
        return;
      }
      const data = await res.json();
      const normalized =
        (data.results || []).map((collection) => {
          const rawItems = Array.isArray(collection.items)
            ? collection.items
            : collection.items && typeof collection.items === "object"
            ? Object.values(collection.items)
            : [];
          const rawItemIds = Array.isArray(collection.itemIds)
            ? collection.itemIds
            : collection.itemIds && typeof collection.itemIds === "object"
            ? Object.values(collection.itemIds)
            : collection.itemIds;

          return {
            id:
              collection.id?.toString() ||
              `collection-${Math.random().toString(36).slice(2)}`,
            title: collection.title || "Untitled collection",
            subtitle: collection.subtitle || "",
            cover: collection.cover || "",
            items: rawItems.map((item) => ({
              ...item,
              id:
                item.id?.toString() ||
                `col-item-${Math.random().toString(36).slice(2)}`,
              coverUrl: item.coverUrl || item.img || "",
              img: item.coverUrl || item.img || "",
              type: (item.type || item.mediaType || "other").toLowerCase(),
            })),
            itemIds: (rawItemIds || []).map((id) =>
              id?.toString?.() ?? id?.toString()
            ),
            createdAt: collection.createdAt || null,
          };
        }) ?? [];

      setCollections(normalized);
    } catch (err) {
      console.error("Failed to fetch collections:", err);
    }
  }, [resolvedUserId]);

  useEffect(() => {
    if (!resolvedUserId) return;
    loadProfileUser();
    loadStacks();
    loadStubs();
    loadCollections();
  }, [resolvedUserId, loadProfileUser, loadStacks, loadStubs, loadCollections]);

  const handleStackSaved = useCallback(
    (newItem) => {
      if (newItem) {
        setStackItems((prev) => [
          ...prev,
          {
            ...newItem,
            coverUrl: newItem.coverUrl || newItem.img || "",
            displayMode: "stack",
          },
        ]);
      }
      loadStacks();
    },
    [loadStacks]
  );

  const handleStubSaved = useCallback(
    (newItem) => {
      if (newItem) {
        setStubItems((prev) => [
          ...prev,
          {
            ...newItem,
            coverUrl: newItem.coverUrl || newItem.img || "",
            hearted: Boolean(newItem.hearted),
            displayMode: "stub",
          },
        ]);
      }
      loadStubs();
    },
    [loadStubs]
  );

  const openCollectionModal = useCallback((collection = null) => {
    setCollectionModalState({ open: true, collection });
  }, []);

  const closeCollectionModal = useCallback(() => {
    setCollectionModalState({ open: false, collection: null });
  }, []);

  const handleCollectionSave = useCallback(
    async (collectionPayload) => {
      const isEdit = Boolean(collectionPayload.id);
      const url = isEdit
        ? `http://127.0.0.1:5000/api/collections/${collectionPayload.id}`
        : "http://127.0.0.1:5000/api/collections";
      const method = isEdit ? "PATCH" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: resolvedUserId,
            title: collectionPayload.title,
            subtitle: collectionPayload.subtitle,
            cover: collectionPayload.cover,
            items: collectionPayload.items,
            itemIds: collectionPayload.itemIds,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to save collection:", res.status, errorText);
          alert("Unable to save collection. Please try again.");
          return;
        }

        await loadCollections();
        closeCollectionModal();
      } catch (err) {
        console.error("Failed to save collection:", err);
        alert("Unable to save collection. Please try again.");
      }
    },
    [closeCollectionModal, loadCollections, resolvedUserId]
  );

  const handleCollectionDelete = useCallback(
    async (collectionId) => {
      if (!collectionId) return;
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/collections/${collectionId}`,
          {
            method: "DELETE",
          }
        );
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to delete collection:", res.status, errorText);
          alert("Unable to delete this collection right now.");
          return;
        }
        await loadCollections();
      } catch (err) {
        console.error("Failed to delete collection:", err);
        alert("Unable to delete this collection right now.");
      }
    },
    [loadCollections]
  );

  const handleCollectionItemRemove = useCallback(
    async (collectionId, itemId) => {
      const normalizedItemId = itemId?.toString();
      const collection = collections.find(
        (entry) => entry.id?.toString() === collectionId?.toString()
      );
      if (!collection) return;

      const nextItems = (collection.items || []).filter(
        (item) => item.id?.toString() !== normalizedItemId
      );
      const nextItemIds = (collection.itemIds || []).filter(
        (id) => id?.toString() !== normalizedItemId
      );

      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/collections/${collectionId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: nextItems,
              itemIds: nextItemIds,
            }),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to update collection:", res.status, errorText);
          alert("Unable to update this collection right now.");
          return;
        }

        await loadCollections();
      } catch (err) {
        console.error("Failed to update collection:", err);
        alert("Unable to update this collection right now.");
      }
    },
    [collections, loadCollections]
  );

  const filterAndSort = useCallback(
    (list, allowedTypes, options = {}) => {
      const { heartedOnly = false } = options;
      let next = list.filter((item) => {
        const typeKey = (item.type || item.mediaType || "other").toLowerCase();
        if (!allowedTypes.includes(typeKey)) return false;
        if (filters[typeKey] === false) return false;
        return true;
      });

      if (heartedOnly) {
        next = next.filter((item) => Boolean(item.hearted));
      }

      if (sortBy === "title") {
        next = [...next].sort((a, b) =>
          (a.title || "").localeCompare(b.title || "")
        );
      }

      return next;
    },
    [filters, sortBy]
  );

  const filteredStackItems = useMemo(
    () =>
      filterAndSort(stackItems, STACK_FILTERS, {
        heartedOnly: stackHeartedOnly,
      }),
    [stackItems, filterAndSort, stackHeartedOnly]
  );

  const filteredStubItems = useMemo(
    () =>
      filterAndSort(stubItems, STUB_FILTERS, {
        heartedOnly: stubHeartedOnly,
      }),
    [stubItems, filterAndSort, stubHeartedOnly]
  );

  const handleStackHeartUpdate = useCallback((itemId, value) => {
    setStackItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, hearted: value } : item
      )
    );
  }, []);

  const handleStubHeartUpdate = useCallback((itemId, value) => {
    setStubItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, hearted: value } : item
      )
    );
  }, []);

  const sortedCollections = useMemo(() => {
    if (sortBy === "title") {
      return [...collections].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    }
    if (sortBy === "recent") {
      return [...collections].sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );
    }
    return collections;
  }, [collections, sortBy]);

  const contextValue = useMemo(
    () => ({
      filters,
      setFilters,
      sortBy,
      setSortBy,
      stackHeartedOnly,
      setStackHeartedOnly,
      stubHeartedOnly,
      setStubHeartedOnly,
      filteredStackItems,
      filteredStubItems,
      handleStackHeartUpdate,
      handleStubHeartUpdate,
      openStackModal: isOwnProfile ? () => openModal("stack") : null,
      openStubModal: isOwnProfile ? () => openModal("stubs") : null,
      openCollectionModal: isOwnProfile
        ? (collection) => openCollectionModal(collection)
        : null,
      sortedCollections,
      collections,
      handleCollectionItemRemove: isOwnProfile
        ? handleCollectionItemRemove
        : null,
      handleCollectionDelete: isOwnProfile ? handleCollectionDelete : null,
      buildProfilePath,
      userId: resolvedUserId,
      isOwnProfile,
      profileUser,
      profileLoading,
    }),
    [
      filters,
      sortBy,
      stackHeartedOnly,
      stubHeartedOnly,
      filteredStackItems,
      filteredStubItems,
      handleStackHeartUpdate,
      handleStubHeartUpdate,
      isOwnProfile,
      openModal,
      openCollectionModal,
      sortedCollections,
      collections,
      handleCollectionItemRemove,
      handleCollectionDelete,
      buildProfilePath,
      resolvedUserId,
      profileUser,
      profileLoading,
    ]
  );

  return (
    <>
      {!profileLoading && profileError && (
        <div className="max-w-4xl mx-auto mt-4 px-6 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl">
          {profileError}
        </div>
      )}

      {!hideHeader && (
        <ProfileHeader
          user={profileUser}
          isOwnProfile={isOwnProfile}
          buildProfilePath={buildProfilePath}
        />
      )}

      <Outlet context={contextValue} />

      {showModal && isOwnProfile && (
        currentMode === "stubs" ? (
          <AddModalStubs
            onClose={closeModal}
            onSave={handleStubSaved}
            userId={resolvedUserId}
          />
        ) : (
          <AddModal
            onClose={closeModal}
            onSave={handleStackSaved}
            userId={resolvedUserId}
          />
        )
      )}

      {collectionModalState.open && isOwnProfile && (
        <AddModalCollections
          onClose={closeCollectionModal}
          onSave={handleCollectionSave}
          stackItems={stackItems}
          stubItems={stubItems}
          initialCollection={collectionModalState.collection}
        />
      )}
    </>
  );
}

function useProfileContext() {
  return useOutletContext();
}

function ProfileStackRoute() {
  const ctx = useProfileContext();
  return (
    <>
      <FilterBar
        activeFilters={ctx.filters}
        onToggleFilter={ctx.setFilters}
        sortBy={ctx.sortBy}
        onSortChange={ctx.setSortBy}
        openModal={ctx.isOwnProfile ? ctx.openStackModal : undefined}
        visibleFilters={STACK_FILTERS}
        heartedOnlyActive={ctx.stackHeartedOnly}
        onHeartedToggle={ctx.setStackHeartedOnly}
      />
      <Gallery
        items={ctx.filteredStackItems}
        onHeartToggle={ctx.isOwnProfile ? ctx.handleStackHeartUpdate : undefined}
        allowHeartToggle={ctx.isOwnProfile}
      />
    </>
  );
}

function ProfileStubsRoute() {
  const ctx = useProfileContext();
  return (
    <>
      <FilterBar
        activeFilters={ctx.filters}
        onToggleFilter={ctx.setFilters}
        sortBy={ctx.sortBy}
        onSortChange={ctx.setSortBy}
        openModal={ctx.isOwnProfile ? ctx.openStubModal : undefined}
        visibleFilters={STUB_FILTERS}
        heartedOnlyActive={ctx.stubHeartedOnly}
        onHeartedToggle={ctx.setStubHeartedOnly}
      />
      <Gallery
        items={ctx.filteredStubItems}
        variant="stubs"
        onHeartToggle={ctx.isOwnProfile ? ctx.handleStubHeartUpdate : undefined}
        allowHeartToggle={ctx.isOwnProfile}
      />
    </>
  );
}

function ProfileCollectionsRoute() {
  const ctx = useProfileContext();
  return (
    <>
      <FilterBar
        activeFilters={{}}
        onToggleFilter={() => {}}
        sortBy={ctx.sortBy}
        onSortChange={ctx.setSortBy}
        openModal={ctx.isOwnProfile ? ctx.openCollectionModal : undefined}
        visibleFilters={[]}
        heartedOnlyActive={undefined}
        onHeartedToggle={undefined}
        hideFilters
      />
      <ProfileCollectionsSection
        collections={ctx.sortedCollections}
        onAddCollection={ctx.isOwnProfile ? ctx.openCollectionModal : undefined}
        buildProfilePath={ctx.buildProfilePath}
        canEdit={ctx.isOwnProfile}
      />
    </>
  );
}

function ProfileCollectionDetailRoute() {
  const ctx = useProfileContext();
  return (
    <CollectionDetail
      collections={ctx.collections}
      onRemoveItem={ctx.handleCollectionItemRemove}
      onEditCollection={ctx.openCollectionModal}
      onDeleteCollection={ctx.handleCollectionDelete}
      isOwnProfile={ctx.isOwnProfile}
      buildProfilePath={ctx.buildProfilePath}
    />
  );
}

function ProfileNotesRoute() {
  const ctx = useProfileContext();
  return (
    <NotesPage
      userId={ctx.userId}
      allowCreate={ctx.isOwnProfile}
      buildProfilePath={ctx.buildProfilePath}
    />
  );
}

function ProfileNoteDetailRoute() {
  const ctx = useProfileContext();
  return (
    <NoteDetail
      userId={ctx.userId}
      allowEdit={ctx.isOwnProfile}
      buildProfilePath={ctx.buildProfilePath}
    />
  );
}

function ProfileCollectionsSection({
  collections,
  onAddCollection,
  buildProfilePath,
  canEdit = true,
}) {
  const navigate = useNavigate();
  const hasCollections = collections.length > 0;

  const handleCollectionClick = (collection) => {
    navigate(buildProfilePath(`collections/${collection.id}`));
  };

  return (
    <section className="px-8 mt-6 space-y-5">
      {hasCollections ? (
        <Gallery
          items={collections}
          variant="collections"
          onCollectionClick={handleCollectionClick}
        />
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white/60 px-6 py-16 text-center text-sm text-gray-500 space-y-3">
          <p>
            {canEdit
              ? "No collections yet. Start curating your favorites."
              : "No collections to show yet."}
          </p>
          {canEdit && typeof onAddCollection === "function" && (
            <button
              type="button"
              onClick={onAddCollection}
              className="inline-flex items-center justify-center rounded-full border border-[#eadfcc] px-4 py-2 text-sm text-gray-700 transition hover:bg-white"
            >
              + New collection
            </button>
          )}
        </div>
      )}
    </section>
  );
}
