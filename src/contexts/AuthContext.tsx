"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { AppUser, UserRole } from "@/lib/types";
import { decodeJWTPayload } from "@/lib/jwt";
import type { Permission } from "@/lib/permissions";
import { resolvePermissions } from "@/lib/permissions";

interface AuthContextType {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  error: string | null;
  role: UserRole | null;
  permissions: Permission[];
  hasPermission: (p: Permission) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  appUser: null,
  loading: true,
  error: null,
  role: null,
  permissions: [],
  hasPermission: () => false,
  refreshUser: async () => {},
});

const AUTH_TIMEOUT_MS = 10_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppUser = async (user: User) => {
    const timeoutId = setTimeout(() => {
      setError("Connection timeout — could not load your profile");
      setLoading(false);
    }, AUTH_TIMEOUT_MS);

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      clearTimeout(timeoutId);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setAppUser({
          uid: user.uid,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          schoolId: data.schoolId ?? null,
          requiresPasswordChange: data.requiresPasswordChange ?? false,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
          permissions: data.permissions,
          schoolIds: data.schoolIds,
          studentCode: data.studentCode,
          age: data.age,
          grade: data.grade,
          classroomIds: data.classroomIds,
          xp: data.xp,
          level: data.level,
          badges: data.badges,
          skills: data.skills,
          subjects: data.subjects,
          department: data.department,
        });
        setError(null);
      } else {
        // Handle the case where the user document doesn't exist.
        console.error(`Authentication error: No Firestore document for user ${user.uid}.`);
        setError("Your user profile is missing or corrupt. Please contact support for assistance.");
        setAppUser(null);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load user profile");
    }
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      await fetchAppUser(firebaseUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchAppUser(user);
      } else {
        setAppUser(null);
        setError(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Silent session refresh: check once on auth state change, then hourly.
  // If the session cookie expires within 24 hours, re-mint it silently so
  // the user is never kicked out mid-session.
  useEffect(() => {
    if (!firebaseUser) return;

    const refresh = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const payload = decodeJWTPayload(token);
        if (!payload) return;
        const expMs = (payload.exp as number) * 1000;
        const hoursLeft = (expMs - Date.now()) / 3_600_000;
        if (hoursLeft > 0 && hoursLeft < 24) {
          const freshToken = await firebaseUser.getIdToken(true);
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: freshToken }),
          });
        }
      } catch {
        // Non-fatal — the user will be redirected to login when the cookie expires.
      }
    };

    refresh();
    const id = setInterval(refresh, 60 * 60 * 1000); // check every hour
    return () => clearInterval(id);
  }, [firebaseUser]);

  const effectivePermissions = appUser ? resolvePermissions(appUser.role, appUser.permissions) : [];

  const checkPermission = (p: Permission): boolean => {
    if (!appUser) return false;
    if (appUser.role === "super_admin") return true;
    return effectivePermissions.includes(p);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        appUser,
        loading,
        error,
        role: appUser?.role ?? null,
        permissions: effectivePermissions,
        hasPermission: checkPermission,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
