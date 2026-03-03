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

import type { Permission } from "@/lib/permissions";
import { resolvePermissions } from "@/lib/permissions";

/** Set role, schoolId, permissions, and schoolIds as Firebase custom claims. */
export async function setUserClaims(
  uid: string,
  claims: {
    role: string;
    schoolId: string | null;
    permissions?: Permission[];
    schoolIds?: string[] | null;
  }
) {
  const customClaims: Record<string, unknown> = {
    role: claims.role,
    schoolId: claims.schoolId,
    permissions: resolvePermissions(claims.role, claims.permissions),
  };
  if (claims.schoolIds != null) {
    customClaims.schoolIds = claims.schoolIds;
  }
  await adminAuth.setCustomUserClaims(uid, customClaims);
}

export { adminApp, adminAuth, adminDb };
