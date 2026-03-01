// ============================================================
// Firestore Security Rules
// ============================================================
// Copy-paste these rules into Firebase Console:
//   Firestore Database → Rules → paste → Publish
// ============================================================
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//
//     // Users collection — authenticated users can read any profile,
//     // but can only write their own document
//     match /users/{userId} {
//       allow read: if request.auth != null;
//       allow create, update: if request.auth != null && request.auth.uid == userId;
//       allow delete: if false;
//     }
//
//     // Gigs collection — any authenticated user can read all gigs,
//     // only the poster can create (postedBy must match their uid)
//     match /gigs/{gigId} {
//       allow read: if request.auth != null;
//       allow create: if request.auth != null && request.resource.data.postedBy == request.auth.uid;
//       allow update, delete: if request.auth != null && resource.data.postedBy == request.auth.uid;
//     }
//
//     // Applications collection — authenticated users can read their own applications,
//     // and create new ones (applicantId must match their uid)
//     match /applications/{appId} {
//       allow read: if request.auth != null && (
//         resource.data.applicantId == request.auth.uid ||
//         resource.data.gigPosterId == request.auth.uid
//       );
//       allow create: if request.auth != null && request.resource.data.applicantId == request.auth.uid;
//       allow update, delete: if false;
//     }
//
//     // HACKATHON DEMO FALLBACK — if you want to allow all reads for demo:
//     // Uncomment the line below and comment out the rules above
//     // match /{document=**} {
//     //   allow read, write: if request.auth != null;
//     // }
//   }
// }
