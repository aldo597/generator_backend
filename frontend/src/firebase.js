// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAoG9QUFC8GFdsJj_nBrydrWaZp1xsGWUo",
  authDomain: "auth-test-e0565.firebaseapp.com",
  projectId: "auth-test-e0565",
  storageBucket: "auth-test-e0565.appspot.com", // ✅ hier der Fix
  messagingSenderId: "423098759617",
  appId: "1:423098759617:web:2427802251bd080c41d740"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
