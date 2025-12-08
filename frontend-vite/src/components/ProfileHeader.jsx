import pfp from "@/assets/pfp.png";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavLink } from "react-router-dom";

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
  const username = user?.username ? `@${user.username}` : "@unknown";
  const followerCount =
    typeof user?.followers === "number" ? user.followers : "–";
  const followingCount =
    typeof user?.following === "number" ? user.following : "–";
  const avatarSrc = user?.avatar || pfp;
  const actionLabel = isOwnProfile ? "Edit profile" : "Follow";

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

          <Button
            variant="outline"
            className="mt-3 h-9 rounded-full px-5 text-sm shadow-sm"
          >
            {actionLabel}
          </Button>
        </div>
      </div>

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
