import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "artsbook.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://artsbook-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "artsbook",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "artsbook.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// check if firebase is properly configured
const isConfigured = 
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.messagingSenderId !== "YOUR_MESSAGING_SENDER_ID" &&
  firebaseConfig.appId &&
  firebaseConfig.appId !== "YOUR_APP_ID";

let app = null;
let auth = null;
let database = null;

if (isConfigured) {
  try {
    // init firebase
    app = initializeApp(firebaseConfig);

    // init firebase auth and get a reference to the service
    auth = getAuth(app);

    // init realtime database and get a reference to the service
    database = getDatabase(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    console.error("Please update your Firebase configuration in .env file");
  }
} else {
  console.error("Firebase not configured!");
  console.error("Please create a .env file in frontend-vite/ with your Firebase config.");
  console.error("See .env.example for the required variables.");
  console.error("Get your config from: https://console.firebase.google.com/project/artsbook/settings/general");
}

export { auth, database };
export default app;
