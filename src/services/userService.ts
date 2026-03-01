// ============================================================
// User / Profile Service — Read & Update Firestore user docs
// ============================================================
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  college: string;
  skills: string[];
  bio: string;
  createdAt: unknown;
}

// ---- Get profile by uid ----
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

// ---- Update profile fields ----
export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, "firstName" | "lastName" | "college" | "skills" | "bio">>
) {
  await updateDoc(doc(db, "users", uid), data);
}
