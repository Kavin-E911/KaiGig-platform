// ============================================================
// Notification Service — Create & Read notifications
// ============================================================
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Notification {
  id: string;
  userId: string;          // who receives the notification
  type: "new_application" | "application_accepted" | "application_rejected" | "deliverable_submitted" | "task_completed";
  title: string;
  message: string;
  gigId: string;
  gigTitle: string;
  fromName: string;
  read: boolean;
  createdAt: Timestamp | null;
}

// ---- Create a notification ----
export async function createNotification(data: {
  userId: string;
  type: Notification["type"];
  title: string;
  message: string;
  gigId: string;
  gigTitle: string;
  fromName: string;
}) {
  await addDoc(collection(db, "notifications"), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

// ---- Get all notifications for a user ----
export async function getNotifications(uid: string): Promise<Notification[]> {
  const q = query(collection(db, "notifications"), where("userId", "==", uid));
  const snapshot = await getDocs(q);
  const notifs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
  return notifs.sort((a, b) => {
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return bTime - aTime;
  });
}

// ---- Get unread count ----
export async function getUnreadCount(uid: string): Promise<number> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", uid),
    where("read", "==", false)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

// ---- Mark a notification as read ----
export async function markAsRead(notifId: string) {
  await updateDoc(doc(db, "notifications", notifId), { read: true });
}

// ---- Mark all notifications as read ----
export async function markAllAsRead(uid: string) {
  const notifs = await getNotifications(uid);
  const unread = notifs.filter((n) => !n.read);
  await Promise.all(unread.map((n) => updateDoc(doc(db, "notifications", n.id), { read: true })));
}
