// ============================================================
// Gig Service — Create, Read, Deactivate gigs from Firestore
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

// ---- Get all active gigs (newest first) — for public browse ----
export async function getAllGigs(): Promise<Gig[]> {
  const snapshot = await getDocs(collection(db, "gigs"));
  const gigs = snapshot.docs
    .map((d) => ({ id: d.id, active: true, ...d.data() } as Gig))
    .filter((g) => g.active !== false); // hide deactivated
  return gigs.sort((a, b) => {
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
