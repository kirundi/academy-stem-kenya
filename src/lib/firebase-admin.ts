import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getCredential() {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    return cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }
  return applicationDefault();
}

const adminApp =
  getApps().length === 0 ? initializeApp({ credential: getCredential() }) : getApps()[0];

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

/** Set role & schoolId as Firebase custom claims on the user's token. */
export async function setUserClaims(
  uid: string,
  claims: { role: string; schoolId: string | null }
) {
  await adminAuth.setCustomUserClaims(uid, claims);
}

export { adminApp, adminAuth, adminDb };
