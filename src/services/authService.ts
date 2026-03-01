// ============================================================
// Authentication Service — Sign Up, Login, Logout, Session
// ============================================================
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// ---- Sign Up (creates auth user + Firestore profile) ----
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  college: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  // Store profile document in "users" collection keyed by uid
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    firstName,
    lastName,
    college,
    skills: [],
    bio: "",
    createdAt: serverTimestamp(),
  });

  return user;
}

// ---- Login ----
export async function logIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// ---- Logout ----
export async function logOut() {
  await signOut(auth);
}

// ---- Auth state listener (session persistence) ----
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
