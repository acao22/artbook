import React from "react";
import { NavLink } from "react-router-dom";
import { Search } from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import pfp from "@/assets/pfp.png";

export default function Navbar({ searchQuery, onSearchChange }) {
  return (
    <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* LEFT SIDE */}
        <div className="flex items-center gap-8">
          <h1 className="font-semibold text-xl tracking-tight">Artsbook</h1>

          {/* nav links */}
          <div className="flex gap-2">
            <NavItem to="/explore" label="Explore" />
            <NavItem to="/collections" label="Collections" />
            <NavItem to="/notes" label="Notes" />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          
          {/* SEARCH BAR */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="pl-10 w-48"
            />
          </div>

          <ProfileMenu />

        </div>
      </div>
    </nav>
  );
}

/* ----------------------------
   Animated Nav Item Component
-----------------------------*/
function NavItem({ to, label }) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <span
          className={cn(
            "relative px-3 py-2 text-sm font-medium cursor-pointer transition-all duration-300",
            isActive
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}

          {/* underline */}
          <span
            className={cn(
              "absolute left-0 -bottom-0.5 h-[2px] w-full bg-foreground rounded-full transition-all duration-300",
              isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-50"
            )}
          />
        </span>
      )}
    </NavLink>
  );
}
