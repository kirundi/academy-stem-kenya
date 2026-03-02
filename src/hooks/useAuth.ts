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
  getDoc,
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

/**
 * Creates the server-side session cookie from a Firebase ID token.
 * Retries once with a fresh token if the first attempt fails, to handle
 * transient network errors or token edge cases.
 */
async function setSessionCookie(idToken: string): Promise<void> {
  const attempt = async (token: string) => {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to create session");
    }
  };

  try {
    await attempt(idToken);
  } catch (firstError) {
    // Retry once with a force-refreshed token
    try {
      const user = auth.currentUser;
      if (!user) throw firstError;
      const freshToken = await user.getIdToken(true);
      await attempt(freshToken);
    } catch {
      throw firstError; // surface the original error
    }
  }
}

async function clearSessionCookie() {
  await fetch("/api/auth/session", { method: "DELETE" });
}

interface ClaimsResult {
  role: string | null;
  requiresPasswordChange: boolean;
}

/**
 * Asks the server to set custom claims from the user's Firestore profile.
 * Returns the role and whether a password change is required.
 * @throws Will throw an error if the API call fails.
 */
async function setClaimsFromProfile(idToken: string): Promise<ClaimsResult> {
  const res = await fetch("/api/auth/set-claims", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const errorMessage = data.error || "Failed to set custom claims";
    console.error("set-claims API call failed:", errorMessage);
    throw new Error(errorMessage);
  }

  const data = await res.json();
  return {
    role: (data.role as string) ?? null,
    requiresPasswordChange: (data.requiresPasswordChange as boolean) ?? false,
  };
}

export function useAuth() {
  /**
   * Email + password sign-in for staff and admins.
   * Returns the user's role so the caller can redirect immediately
   * without waiting for an additional Firestore read.
   */
  async function signIn(email: string, password: string): Promise<ClaimsResult> {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    try {
      // Set custom claims on the Auth user from the Firestore profile.
      const idToken = await cred.user.getIdToken();
      const claims = await setClaimsFromProfile(idToken);

      // Force-refresh so the new token carries the freshly written claims,
      // then create the server session cookie with that token.
      const freshToken = await cred.user.getIdToken(true);
      await setSessionCookie(freshToken);

      return claims;
    } catch (error) {
      // If setting claims or session fails, sign out to prevent inconsistent state.
      await firebaseSignOut(auth);
      // Ensure the client-side session is also cleared.
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

      // Find or reference the school
      let schoolId: string | null = null;
      const schoolQuery = query(collection(db, "schools"), where("name", "==", data.school));
      const schoolSnap = await getDocs(schoolQuery);
      if (!schoolSnap.empty) {
        schoolId = schoolSnap.docs[0].id;
      }

      // Create user document
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

      const idToken = await user.getIdToken();
      await setClaimsFromProfile(idToken);
      const freshToken = await user.getIdToken(true);
      await setSessionCookie(freshToken);
      return user;
    } catch (error) {
      // If any step after user creation fails, sign out to prevent inconsistent state.
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
      // If any step after user creation fails, sign out to prevent inconsistent state.
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
    await setSessionCookie(idToken);
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
