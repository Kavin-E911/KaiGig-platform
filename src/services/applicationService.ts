// ============================================================
// Application Service — Apply to gigs, fetch applications
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
import { createNotification } from "@/services/notificationService";

// ---- Status flow ----
// pending → accepted → delivered → completed
//                    ↘ rejected (at any stage)

export type AppStatus = "pending" | "accepted" | "delivered" | "completed" | "rejected";

export interface Application {
  id: string;
  gigId: string;
  gigTitle: string;
  applicantId: string;
  applicantName: string;
  pitch: string;
  portfolioLink: string;
  estimatedTime: string;
  status: AppStatus;
  budget: number;
  appliedAt: Timestamp | null;
  // Deliverable fields (filled when applicant uploads result)
  deliverableType?: "image" | "link" | "notes";
  deliverableUrl?: string;
  deliverableNotes?: string;
  deliveredAt?: Timestamp | null;
  // Completion fields (filled when poster accepts deliverable)
  completedAt?: Timestamp | null;
}

// ---- Submit an application ----
export async function applyToGig(data: {
  gigId: string;
  gigTitle: string;
  applicantId: string;
  applicantName: string;
  pitch: string;
  portfolioLink: string;
  estimatedTime: string;
  budget: number;
  gigPosterId: string;
}) {
  const docRef = await addDoc(collection(db, "applications"), {
    gigId: data.gigId,
    gigTitle: data.gigTitle,
    applicantId: data.applicantId,
    applicantName: data.applicantName,
    pitch: data.pitch,
    portfolioLink: data.portfolioLink,
    estimatedTime: data.estimatedTime,
    budget: data.budget,
    status: "pending",
    appliedAt: serverTimestamp(),
  });

  // Notify the gig poster
  await createNotification({
    userId: data.gigPosterId,
    type: "new_application",
    title: "New Application!",
    message: `${data.applicantName} applied for your gig "${data.gigTitle}"`,
    gigId: data.gigId,
    gigTitle: data.gigTitle,
    fromName: data.applicantName,
  });

  return docRef.id;
}

// ---- Accept an application (poster accepts the applicant — awaiting deliverable) ----
export async function acceptApplication(application: Application) {
  await updateDoc(doc(db, "applications", application.id), { status: "accepted" });

  // Notify the applicant — tell them to upload their work
  await createNotification({
    userId: application.applicantId,
    type: "application_accepted",
    title: "Application Accepted!",
    message: `Your application for "${application.gigTitle}" has been accepted! Please submit your deliverable.`,
    gigId: application.gigId,
    gigTitle: application.gigTitle,
    fromName: "Gig Poster",
  });
}

// ---- Submit deliverable (applicant uploads their result) ----
export async function submitDeliverable(
  applicationId: string,
  data: {
    deliverableType: "image" | "link" | "notes";
    deliverableUrl: string;
    deliverableNotes: string;
  },
  application: Application,
  gigPosterId: string,
) {
  await updateDoc(doc(db, "applications", applicationId), {
    status: "delivered",
    deliverableType: data.deliverableType,
    deliverableUrl: data.deliverableUrl,
    deliverableNotes: data.deliverableNotes,
    deliveredAt: serverTimestamp(),
  });

  // Notify the gig poster to review
  await createNotification({
    userId: gigPosterId,
    type: "deliverable_submitted",
    title: "Deliverable Submitted!",
    message: `${application.applicantName} submitted their work for "${application.gigTitle}". Review and approve it.`,
    gigId: application.gigId,
    gigTitle: application.gigTitle,
    fromName: application.applicantName,
  });
}

// ---- Accept deliverable (poster approves work — marks completed + earnings) ----
export async function acceptDeliverable(application: Application) {
  await updateDoc(doc(db, "applications", application.id), {
    status: "completed",
    completedAt: serverTimestamp(),
  });

  // Notify the applicant — task completed, money earned
  await createNotification({
    userId: application.applicantId,
    type: "task_completed",
    title: "Task Completed! 🎉",
    message: `Your work on "${application.gigTitle}" has been approved! You earned ₹${application.budget}.`,
    gigId: application.gigId,
    gigTitle: application.gigTitle,
    fromName: "Gig Poster",
  });
}

// ---- Reject an application ----
export async function rejectApplication(application: Application) {
  await updateDoc(doc(db, "applications", application.id), { status: "rejected" });

  await createNotification({
    userId: application.applicantId,
    type: "application_rejected",
    title: "Application Update",
    message: `Your application for "${application.gigTitle}" was not selected this time.`,
    gigId: application.gigId,
    gigTitle: application.gigTitle,
    fromName: "Gig Poster",
  });
}

// ---- Reject deliverable (poster rejects the work) ----
export async function rejectDeliverable(application: Application) {
  await updateDoc(doc(db, "applications", application.id), { status: "rejected" });

  await createNotification({
    userId: application.applicantId,
    type: "application_rejected",
    title: "Deliverable Rejected",
    message: `Your submitted work for "${application.gigTitle}" was not approved.`,
    gigId: application.gigId,
    gigTitle: application.gigTitle,
    fromName: "Gig Poster",
  });
}

// ---- Get all applications by a specific user ----
export async function getMyApplications(uid: string): Promise<Application[]> {
  const q = query(
    collection(db, "applications"),
    where("applicantId", "==", uid)
  );
  const snapshot = await getDocs(q);
  const apps = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Application));
  return apps.sort((a, b) => {
    const aTime = a.appliedAt?.seconds ?? 0;
    const bTime = b.appliedAt?.seconds ?? 0;
    return bTime - aTime;
  });
}

// ---- Get all applications for a specific gig ----
export async function getApplicationsForGig(gigId: string): Promise<Application[]> {
  const q = query(
    collection(db, "applications"),
    where("gigId", "==", gigId)
  );
  const snapshot = await getDocs(q);
  const apps = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Application));
  return apps.sort((a, b) => {
    const aTime = a.appliedAt?.seconds ?? 0;
    const bTime = b.appliedAt?.seconds ?? 0;
    return bTime - aTime;
  });
}
