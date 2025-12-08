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

export default function LoginModal({ open, onClose, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, firebaseError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!login || typeof login !== "function") {
      setError("Firebase not configured. Please check your Firebase settings.");
      return;
    }

    if (firebaseError) {
      setError(firebaseError);
      return;
    }

    setLoading(true);

    try {
      const { user, error: loginError } = await login(email, password);
      
      if (loginError) {
        setError(loginError);
        setLoading(false);
      } else if (user) {
        onClose();
        setEmail("");
        setPassword("");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "An error occurred during login");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#FBF5ED]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Login</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {(error || firebaseError) && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error || firebaseError}
              {firebaseError && (
                <div className="mt-2 text-xs">
                  Please update <code className="bg-red-100 px-1 rounded">src/lib/firebase.js</code> with your Firebase configuration.
                </div>
              )}
            </div>
          )}

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
              placeholder="Enter your password"
              className="bg-background"
              required
            />
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                onSwitchToSignup();
              }}
            >
              Don't have an account? Sign up
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
