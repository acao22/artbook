import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupModal({ open, onClose, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setLoading(true);

    const { user, error: signupError } = await signup(email, password, username.trim());
    
    if (signupError) {
      setError(signupError);
      setLoading(false);
    } else if (user) {
      onClose();
      setEmail("");
      setPassword("");
      setUsername("");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#FBF5ED]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Sign Up</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="bg-background"
              required
              minLength={6}
            />
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                onSwitchToLogin();
              }}
            >
              Already have an account? Login
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
