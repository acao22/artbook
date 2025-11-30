import pfp from "@/assets/pfp.png";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { NavLink } from "react-router-dom";

export default function ProfileHeader() {
  // PPLACEBHOLDER: LATER NEED TO CONNECT TO FIREBASEHNJI
  const user = {
    username: "jinrainbows",
    followers: 7,
    following: 7,
  };

  return (
    <div className="w-full px-8 pt-6 pb-4 bg-background border-b border-border">
      <div className="flex items-center gap-6">
        
        {/* Avatar */}
        <Avatar className="w-20 h-20 ring-1 ring-border">
          <AvatarImage src={pfp} alt="Profile" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>

        {/* Right Side Info */}
        <div className="flex flex-col">
          <p className="text-lg font-semibold">{user.username}</p>

          {/* Followers */}
          <div className="text-sm text-muted-foreground flex gap-3 mt-1">
            <button className="hover:underline">
              {user.followers} followers
            </button>
            <button className="hover:underline">
              {user.following} following
            </button>
          </div>

          {/* Edit profile */}
          <Button
            variant="ghost"
            className="h-auto p-0 text-sm text-muted-foreground underline mt-1"
          >
            edit profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="stack" className="w-full">
          <TabsList className="bg-transparent gap-4 p-0">
            <NavLink to="/profile/stack">
              {({ isActive }) => (
                <TabsTrigger
                  value="stack"
                  className={
                    isActive
                      ? "font-semibold border-b-2 border-primary rounded-none"
                      : "text-muted-foreground"
                  }
                >
                  Stack
                </TabsTrigger>
              )}
            </NavLink>

            <NavLink to="/profile/stubs">
              {({ isActive }) => (
                <TabsTrigger
                  value="stubs"
                  className={
                    isActive
                      ? "font-semibold border-b-2 border-primary rounded-none"
                      : "text-muted-foreground"
                  }
                >
                  Stubs
                </TabsTrigger>
              )}
            </NavLink>

            <NavLink to="/profile/collections">
              {({ isActive }) => (
                <TabsTrigger
                  value="collections"
                  className={
                    isActive
                      ? "font-semibold border-b-2 border-primary rounded-none"
                      : "text-muted-foreground"
                  }
                >
                  Collections
                </TabsTrigger>
              )}
            </NavLink>

            <NavLink to="/profile/notes">
              {({ isActive }) => (
                <TabsTrigger
                  value="notes"
                  className={
                    isActive
                      ? "font-semibold border-b-2 border-primary rounded-none"
                      : "text-muted-foreground"
                  }
                >
                  Notes
                </TabsTrigger>
              )}
            </NavLink>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
