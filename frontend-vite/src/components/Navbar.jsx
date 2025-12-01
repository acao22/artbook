import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

const SEARCH_OPTIONS = [
  { value: "profiles", label: "Profiles" },
  { value: "collections", label: "Collections" },
  { value: "notes", label: "Notes" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!searchType) {
      setError("Choose what to search.");
      return;
    }
    if (!searchTerm.trim()) {
      setError("Enter a search term.");
      return;
    }
    setError("");
    navigate(
      `/search?type=${searchType}&q=${encodeURIComponent(searchTerm.trim())}`
    );
  };

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
        <div className="flex items-start gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Select
                value={searchType}
                onValueChange={(value) => {
                  setSearchType(value);
                  setError("");
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Search for..." />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    searchType
                      ? `Search ${searchType}...`
                      : "Choose category first"
                  }
                  className="pl-10 w-52"
                  disabled={!searchType}
                />
              </div>

              <Button
                type="submit"
                className="rounded-full"
                disabled={!searchType}
              >
                Search
              </Button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </form>

          <ProfileMenu />
        </div>
      </div>
    </nav>
  );
}

/* nav item component */
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