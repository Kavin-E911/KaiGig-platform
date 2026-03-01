// ============================================================
// Clear all Firestore data — run once from browser console or
// import and call clearAllData() from any page temporarily.
// ============================================================
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTIONS = ["gigs", "applications", "notifications", "users"];

export async function clearAllData() {
  for (const col of COLLECTIONS) {
    const snapshot = await getDocs(collection(db, col));
    const deletes = snapshot.docs.map((d) => deleteDoc(doc(db, col, d.id)));
    await Promise.all(deletes);
    console.log(`Deleted ${snapshot.size} documents from "${col}"`);
  }
  console.log("All Firestore data cleared!");
}
