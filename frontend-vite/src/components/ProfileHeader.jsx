import pfp from "@/assets/pfp.png";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavLink } from "react-router-dom";

export default function ProfileHeader() {
  const user = {
    username: "jinrainbows",
    followers: 7,
    following: 7,
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-4">

      {/* Profile Row */}
      <div className="flex items-center gap-6">
        
        {/* Avatar */}
        <Avatar className="w-28 h-28 rounded-full shadow-md ring-2 ring-primary/20">
          <AvatarImage src={pfp} alt="Profile" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex flex-col">
          {/* BIG Username */}
          <p className="text-3xl font-extrabold tracking-tight">
            {user.username}
          </p>

          {/* Followers */}
          <div className="text-base text-muted-foreground flex gap-5 mt-2">
            <button className="transition hover:text-primary">
              <span className="font-semibold">{user.followers}</span> followers
            </button>
            <button className="transition hover:text-primary">
              <span className="font-semibold">{user.following}</span> following
            </button>
          </div>

          {/* Edit */}
          <Button
            variant="outline"
            className="mt-3 h-9 rounded-full px-5 text-sm shadow-sm"
          >
            Edit profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <Tabs defaultValue="stack" className="w-full">
          <TabsList className="bg-transparent p-0 gap-6">
            
            {[
              { label: "Stack", path: "stack" },
              { label: "Stubs", path: "stubs" },
              { label: "Collections", path: "collections" },
              { label: "Notes", path: "notes" },
            ].map((tab) => (
              <NavLink to={`/profile/${tab.path}`} key={tab.path}>
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
