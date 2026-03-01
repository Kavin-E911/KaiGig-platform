// ============================================================
// Firebase Configuration & Initialization
// ============================================================
// HOW TO SET UP:
// 1. Go to https://console.firebase.google.com/
// 2. Click "Create a project" → name it "kai-marketplace" → Continue
// 3. Disable Google Analytics (optional for hackathon) → Create Project
// 4. In the project dashboard, click the Web icon (</>) to add a web app
// 5. Register app name as "kai-marketplace" → click "Register app"
// 6. Copy the firebaseConfig object and paste below replacing the placeholders
// 7. Enable Authentication:
//    - Go to Build → Authentication → Get Started
//    - Click "Email/Password" under Sign-in providers → Enable → Save
// 8. Enable Firestore:
//    - Go to Build → Firestore Database → Create database
//    - Choose "Start in test mode" → select a region → Enable
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBD9i1rX62TbD8p5o_awtv4cj1Rfb_8MNs",
  authDomain: "kai-marketplace.firebaseapp.com",
  projectId: "kai-marketplace",
  storageBucket: "kai-marketplace.firebasestorage.app",
  messagingSenderId: "552361418149",
  appId: "1:552361418149:web:757d4c07f9405b9d49dc4c",
  measurementId: "G-3J84J8NGDV",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
