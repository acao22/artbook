import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext({
  currentUser: null,
  userProfile: null,
  signup: async () => ({ user: null, error: "Firebase not initialized" }),
  login: async () => ({ user: null, error: "Firebase not initialized" }),
  logout: async () => ({ error: "Firebase not initialized" }),
  loadUserProfile: async () => null,
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [firebaseError, setFirebaseError] = useState(null);

  // Check if Firebase is initialized
  useEffect(() => {
    if (!auth) {
      setFirebaseError("Firebase not initialized. Please check your Firebase configuration.");
      setLoading(false);
    }
  }, []);

  async function signup(email, password, username) {
    if (!auth) {
      return { user: null, error: "Firebase not initialized. Please configure Firebase." };
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create user profile in backend
      const token = await user.getIdToken();
      const res = await fetch("http://127.0.0.1:5000/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update username if provided
        if (username) {
          await fetch(`http://127.0.0.1:5000/api/users/${user.uid}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
          });
        }
      }

      return { user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }

  async function login(email, password) {
    if (!auth) {
      return { user: null, error: "Firebase not initialized. Please configure Firebase." };
    }
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setUserProfile(null);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  async function loadUserProfile(uid) {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users/${uid}`);
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
        return data;
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    }
    return null;
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Auth state change error:", error);
      setFirebaseError(error.message);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    loadUserProfile,
    firebaseError,
  };

  return (
    <AuthContext.Provider value={value}>
      {firebaseError && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-50">
          Firebase Error: {firebaseError}. Please check your Firebase configuration in src/lib/firebase.js
        </div>
      )}
      {!loading && children}
    </AuthContext.Provider>
  );
}
