import React, { useState, useEffect } from "react";
import pfp from "@/assets/pfp.png";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import EditProfileModal from "./EditProfileModal";

const TABS = [
  { label: "Stack", path: "stack" },
  { label: "Stubs", path: "stubs" },
  { label: "Collections", path: "collections" },
  { label: "Notes", path: "notes" },
];

const DEFAULT_PATH_BUILDER = (subPath = "") =>
  `/profile/${subPath}`.replace(/\/+$/, "") || "/profile";

export default function ProfileHeader({
  user,
  isOwnProfile = false,
  buildProfilePath = DEFAULT_PATH_BUILDER,
}) {
  const { currentUser } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const username = user?.username ? `@${user.username}` : "@unknown";
  const followerCount =
    typeof user?.followers === "number" ? user.followers : "–";
  const followingCount =
    typeof user?.following === "number" ? user.following : "–";
  const avatarSrc = user?.avatar || pfp;

  // check follow status
  useEffect(() => {
    if (!currentUser || isOwnProfile || !user?.id) {
      setCheckingStatus(false);
      return;
    }

    async function checkFollowStatus() {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(
          `http://127.0.0.1:5000/api/users/${user.id}/follow/status?token=${token}`
        );
        if (res.ok) {
          const data = await res.json();
          setFollowing(data.following || false);
        }
      } catch (err) {
        console.error("Failed to check follow status:", err);
      } finally {
        setCheckingStatus(false);
      }
    }

    checkFollowStatus();
  }, [currentUser, user?.id, isOwnProfile]);

  // listen for edit profile event 
  useEffect(() => {
    if (!isOwnProfile) return;

    const handleOpenEditProfile = () => {
      setShowEditModal(true);
    };

    window.addEventListener("openEditProfile", handleOpenEditProfile);
    return () => {
      window.removeEventListener("openEditProfile", handleOpenEditProfile);
    };
  }, [isOwnProfile]);

  const handleFollow = async () => {
    if (!currentUser || !user?.id) return;

    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const method = following ? "DELETE" : "POST";
      const res = await fetch(
        `http://127.0.0.1:5000/api/users/${user.id}/follow`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      if (res.ok) {
        setFollowing(!following);
        // need to reload to update follower counts!
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to follow/unfollow:", err);
    } finally {
      setLoading(false);
    }
  };

  const actionLabel = isOwnProfile
    ? "Edit profile"
    : following
    ? "Unfollow"
    : "Follow";

  return (
    <div className="max-w-6xl mx-auto px-6 py-4">
      {/* Profile Row */}
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <Avatar className="w-28 h-28 rounded-full shadow-md ring-2 ring-primary/20">
          <AvatarImage src={avatarSrc} alt="Profile" />
          <AvatarFallback>
            {user?.username?.[0]?.toUpperCase() ?? "A"}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-3xl font-extrabold tracking-tight">{username}</p>

          <div className="text-base text-muted-foreground flex gap-5 mt-2">
            <span>
              <span className="font-semibold">{followerCount}</span> followers
            </span>
            <span>
              <span className="font-semibold">{followingCount}</span> following
            </span>
          </div>

          {user?.bio && (
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
              {user.bio}
            </p>
          )}

          {!isOwnProfile && currentUser && (
            <Button
              variant="outline"
              className="mt-3 h-9 rounded-full px-5 text-sm shadow-sm"
              onClick={handleFollow}
              disabled={loading || checkingStatus}
            >
              {loading ? "..." : actionLabel}
            </Button>
          )}
          {isOwnProfile && (
            <Button
              variant="outline"
              className="mt-3 h-9 rounded-full px-5 text-sm shadow-sm"
              onClick={() => setShowEditModal(true)}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && isOwnProfile && (
        <EditProfileModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={user}
        />
      )}

      {/* Tabs */}
      <div className="mt-8">
        <Tabs defaultValue="stack" className="w-full">
          <TabsList className="bg-transparent p-0 gap-6">
            {TABS.map((tab) => (
              <NavLink to={buildProfilePath(tab.path)} key={tab.path}>
                {({ isActive }) => (
                  <TabsTrigger
                    value={tab.path}
                    className={
                      isActive
                        ? "font-semibold border-b-2 border-primary rounded-none text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {tab.label}
                  </TabsTrigger>
                )}
              </NavLink>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
