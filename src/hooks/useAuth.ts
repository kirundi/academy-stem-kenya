"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithCustomToken,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserRole } from "@/lib/types";
import { decodeJWTPayload } from "@/lib/jwt";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface SessionOptions {
  remember?: boolean;
  isStudent?: boolean;
}

interface ClaimsResult {
  role: string | null;
  requiresPasswordChange: boolean;
}

/**
 * Creates the server-side session cookie from a Firebase ID token.
 * Retries once with a fresh token on transient failures.
 * Returns requiresPasswordChange so callers can redirect without an extra call.
 */
async function setSessionCookie(
  idToken: string,
  options: SessionOptions = {}
): Promise<ClaimsResult> {
  const attempt = async (token: string): Promise<ClaimsResult> => {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token, ...options }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to create session");
    }
    const data = await res.json();
    return {
      role: null, // caller fills this from token claims
      requiresPasswordChange: (data.requiresPasswordChange as boolean) ?? false,
    };
  };

  try {
    return await attempt(idToken);
  } catch (firstError) {
    try {
      const user = auth.currentUser;
      if (!user) throw firstError;
      const freshToken = await user.getIdToken(true);
      return await attempt(freshToken);
    } catch {
      throw firstError;
    }
  }
}

async function clearSessionCookie() {
  await fetch("/api/auth/session", { method: "DELETE" });
}

/**
 * Sets Firebase custom claims from the user's Firestore profile.
 * Used as a fallback for legacy users whose claims were never written at creation.
 */
async function setClaimsFromProfile(idToken: string): Promise<ClaimsResult> {
  const res = await fetch("/api/auth/set-claims", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to set custom claims");
  }
  const data = await res.json();
  return {
    role: (data.role as string) ?? null,
    requiresPasswordChange: (data.requiresPasswordChange as boolean) ?? false,
  };
}

// ---------------------------------------------------------------------------
// Public hook
// ---------------------------------------------------------------------------

export function useAuth() {
  /**
   * Email + password sign-in for staff and admins.
   *
   * Fast path (new users): claims already embedded in token → 2 round trips.
   * Fallback path (legacy users): set-claims on first login → 3 round trips.
   */
  async function signIn(email: string, password: string, remember = false): Promise<ClaimsResult> {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    try {
      // Force-refresh to pick up any claims written at account creation.
      const idToken = await cred.user.getIdToken(true);
      const payload = decodeJWTPayload(idToken);
      const existingRole = payload?.role as string | undefined;

      let role: string | null;
      let requiresPasswordChange: boolean;

      if (existingRole) {
        // Claims already present — skip set-claims entirely.
        const sessionResult = await setSessionCookie(idToken, { remember });
        role = existingRole;
        requiresPasswordChange = sessionResult.requiresPasswordChange;
      } else {
        // Legacy user: set claims first, then force-refresh and create session.
        const claims = await setClaimsFromProfile(idToken);
        const freshToken = await cred.user.getIdToken(true);
        const sessionResult = await setSessionCookie(freshToken, { remember });
        role = claims.role;
        requiresPasswordChange = sessionResult.requiresPasswordChange;
      }

      return { role, requiresPasswordChange };
    } catch (error) {
      await firebaseSignOut(auth);
      await clearSessionCookie();
      throw error;
    }
  }

  async function registerTeacher(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    school: string;
    city: string;
    role: string;
    subjects: string[];
  }) {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = cred.user;

    try {
      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`,
      });

      let schoolId: string | null = null;
      const schoolQuery = query(collection(db, "schools"), where("name", "==", data.school));
      const schoolSnap = await getDocs(schoolQuery);
      if (!schoolSnap.empty) {
        schoolId = schoolSnap.docs[0].id;
      }

      await setDoc(doc(db, "users", user.uid), {
        email: data.email,
        displayName: `${data.firstName} ${data.lastName}`,
        role: "teacher" as UserRole,
        schoolId,
        schoolName: data.school,
        city: data.city,
        teacherRole: data.role,
        subjects: data.subjects,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Claims set server-side via set-claims (Firestore doc must exist first).
      const idToken = await user.getIdToken();
      await setClaimsFromProfile(idToken);
      const freshToken = await user.getIdToken(true);
      await setSessionCookie(freshToken);
      return user;
    } catch (error) {
      await firebaseSignOut(auth);
      await clearSessionCookie();
      throw error;
    }
  }

  async function onboardSchool(data: {
    schoolName: string;
    schoolType: string;
    location: string;
    studentCount: string;
    fullName: string;
    roleDesignation: string;
    contactNumber: string;
    email: string;
    password: string;
  }) {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = cred.user;

    try {
      await updateProfile(user, { displayName: data.fullName });

      const schoolRef = await addDoc(collection(db, "schools"), {
        name: data.schoolName,
        type: data.schoolType,
        location: data.location,
        studentCount: data.studentCount,
        status: "review",
        plan: "community",
        healthScore: 0,
        adminId: user.uid,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, "users", user.uid), {
        email: data.email,
        displayName: data.fullName,
        role: "school_admin" as UserRole,
        schoolId: schoolRef.id,
        roleDesignation: data.roleDesignation,
        contactNumber: data.contactNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const idToken = await user.getIdToken();
      await setClaimsFromProfile(idToken);
      const freshToken = await user.getIdToken(true);
      await setSessionCookie(freshToken);
      return { user, schoolId: schoolRef.id };
    } catch (error) {
      await firebaseSignOut(auth);
      await clearSessionCookie();
      throw error;
    }
  }

  async function studentVerify(code: string, firstName: string) {
    const res = await fetch("/api/auth/student-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.toUpperCase(), firstName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Student not found");
    return data.student as {
      displayName: string;
      grade: string | null;
      schoolName: string;
    };
  }

  async function studentLogin(code: string, firstName: string) {
    const res = await fetch("/api/auth/student-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.toUpperCase(), confirm: true, firstName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    const cred = await signInWithCustomToken(auth, data.customToken);
    const idToken = await cred.user.getIdToken();
    // Students always get a 7-day session.
    await setSessionCookie(idToken, { isStudent: true });
    return cred.user;
  }

  /** Re-mints the server session cookie from the current Firebase token. */
  async function refreshSession(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;
    try {
      const idToken = await user.getIdToken(true);
      await setSessionCookie(idToken);
      return true;
    } catch {
      return false;
    }
  }

  async function signOut() {
    await clearSessionCookie();
    await firebaseSignOut(auth);
  }

  return {
    signIn,
    studentVerify,
    studentLogin,
    registerTeacher,
    onboardSchool,
    refreshSession,
    signOut,
  };
}
