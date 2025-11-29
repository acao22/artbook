import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NavLink } from "react-router-dom";
import pfp from "@/assets/pfp.png";

export function ProfileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar
          className="cursor-pointer border border-border hover:ring-2 hover:ring-ring transition"
        >
          <AvatarImage src={pfp} alt="profile" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="
          w-40 bg-popover text-popover-foreground 
          rounded-md border shadow-md p-1
          data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
          data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
        "
      >
        <DropdownMenuItem asChild>
          <NavLink to="/profile/stack">Profile</NavLink>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <NavLink to="/profile/settings">Settings</NavLink>
        </DropdownMenuItem>

        <DropdownMenuItem className="text-destructive">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
