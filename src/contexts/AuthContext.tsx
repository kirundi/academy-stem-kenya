"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { AppUser, UserRole } from "@/lib/types";

interface AuthContextType {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  error: string | null;
  role: UserRole | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  appUser: null,
  loading: true,
  error: null,
  role: null,
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
        console.error(
          `Authentication error: No Firestore document for user ${user.uid}.`
        );
        setError(
          "Your user profile is missing or corrupt. Please contact support for assistance."
        );
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

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        appUser,
        loading,
        error,
        role: appUser?.role ?? null,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
