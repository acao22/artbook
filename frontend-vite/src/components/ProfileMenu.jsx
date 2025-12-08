import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import pfp from "@/assets/pfp.png";

export function ProfileMenu() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const avatarSrc = userProfile?.avatar || pfp;
  const initials = userProfile?.username?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar
          className="cursor-pointer border border-border hover:ring-2 hover:ring-ring transition"
        >
          <AvatarImage src={avatarSrc} alt="profile" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="
          w-40 bg-[#FBF5ED] text-popover-foreground 
          rounded-md border shadow-md p-1
          data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
          data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
        "
      >
        <DropdownMenuItem asChild>
          <NavLink to="/profile/stack">Profile</NavLink>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            navigate("/profile/stack");
            window.dispatchEvent(new CustomEvent("openEditProfile"));
          }}
        >
          Settings
        </DropdownMenuItem>

        <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
