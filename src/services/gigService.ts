// ============================================================
// Gig Service — Create, Read, Deactivate gigs from Firestore
// + Fetch from Render backend API
// ============================================================
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";

export interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  skillsRequired: string;
  postedBy: string;
  postedByName: string;
  active: boolean;
  createdAt: Timestamp | null;
}

// ---- Create a new gig ----
export async function createGig(data: {
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  skillsRequired: string;
  postedBy: string;
  postedByName: string;
}) {
  const docRef = await addDoc(collection(db, "gigs"), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ---- Fetch gigs from Render backend API ----
async function fetchBackendGigs(): Promise<Gig[]> {
  try {
    const data = await apiFetch<{ title: string; budget: number }[]>("/gigs");
    return data.map((g, i) => ({
      id: `backend-${i}`,
      title: g.title,
      description: "",
      category: "Other",
      budget: g.budget,
      deadline: "",
      skillsRequired: "",
      postedBy: "",
      postedByName: "KaiGig Backend",
      active: true,
      createdAt: null,
    }));
  } catch (err) {
    console.warn("Backend API unreachable, using Firebase only:", err);
    return [];
  }
}

// ---- Get all active gigs (newest first) — for public browse ----
// Merges Firebase gigs with backend API gigs
export async function getAllGigs(): Promise<Gig[]> {
  const [firebaseGigs, backendGigs] = await Promise.all([
    getDocs(collection(db, "gigs")).then((snapshot) =>
      snapshot.docs
        .map((d) => ({ id: d.id, active: true, ...d.data() } as Gig))
        .filter((g) => g.active !== false)
    ),
    fetchBackendGigs(),
  ]);

  const allGigs = [...firebaseGigs, ...backendGigs];
  return allGigs.sort((a, b) => {
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return bTime - aTime;
  });
}

// ---- Get gigs posted by a specific user (includes deactivated) ----
export async function getGigsByUser(uid: string): Promise<Gig[]> {
  const q = query(collection(db, "gigs"), where("postedBy", "==", uid));
  const snapshot = await getDocs(q);
  const gigs = snapshot.docs.map((d) => ({ id: d.id, active: true, ...d.data() } as Gig));
  return gigs.sort((a, b) => {
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return bTime - aTime;
  });
}

// ---- Get a single gig by ID ----
export async function getGigById(gigId: string): Promise<Gig | null> {
  const snap = await getDoc(doc(db, "gigs", gigId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Gig;
}

// ---- Deactivate a gig (soft-delete — preserves all data) ----
export async function deactivateGig(gigId: string) {
  await updateDoc(doc(db, "gigs", gigId), { active: false });
}

// ---- Reactivate a previously deactivated gig ----
export async function reactivateGig(gigId: string) {
  await updateDoc(doc(db, "gigs", gigId), { active: true });
}
