import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import pfp from "@/assets/pfp.png";

export default function EditProfileModal({ open, onClose, user }) {
  const { currentUser, loadUserProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
      setAvatarPreview(user.avatar || pfp);
    } else {
      // Initialize with empty values if user is not available
      setUsername("");
      setBio("");
      setAvatar("");
      setAvatarPreview(pfp);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      setAvatarPreview(result);
      setAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!username.trim()) {
      alert("Username is required");
      return;
    }

    if (!currentUser) {
      alert("You must be logged in to edit your profile");
      return;
    }

    setIsSaving(true);
    try {
      const profileData = {
        username: username.trim(),
        bio: bio.trim(),
        avatar: avatar || "",
      };

      // Save to local storage
      const userId = currentUser.uid;
      const storedProfile = JSON.parse(
        localStorage.getItem("userProfile") || "{}"
      );
      storedProfile[userId] = profileData;
      localStorage.setItem("userProfile", JSON.stringify(storedProfile));

      // Try to save to backend
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(
          `http://127.0.0.1:5000/api/users/${userId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
          }
        );

        if (!res.ok) {
          console.warn("Failed to update profile on backend, using local storage only");
        }
      } catch (err) {
        console.warn("Backend update failed, using local storage only:", err);
      }

      // Reload user profile
      await loadUserProfile(userId);
      // Reload page to update profile display
      window.location.reload();
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#FBF5ED]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={avatarPreview || pfp}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground text-center">
              Click the icon to change your profile picture
            </p>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="bg-background"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="bg-background resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !username.trim()}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
