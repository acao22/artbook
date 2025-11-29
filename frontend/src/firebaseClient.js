import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCK6lzo7Ne0xXiFnNtoE3238iayFXWE0Jw",
  authDomain: "artsbook.firebaseapp.com",
  databaseURL: "https://artsbook-default-rtdb.firebaseio.com",
  projectId: "artsbook",
  storageBucket: "artsbook.firebasestorage.app",
  messagingSenderId: "487703068167",
  appId: "1:487703068167:web:84958b188d0defbc8e74a2"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);