"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
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

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/classroom.courses.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.rosters.readonly");

async function setSessionCookie(idToken: string) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

async function clearSessionCookie() {
  await fetch("/api/auth/session", { method: "DELETE" });
}

export function useAuth() {
  async function signIn(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    await setSessionCookie(idToken);
    return cred.user;
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

    await updateProfile(user, {
      displayName: `${data.firstName} ${data.lastName}`,
    });

    // Find or reference the school
    let schoolId: string | null = null;
    const schoolQuery = query(
      collection(db, "schools"),
      where("name", "==", data.school)
    );
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
    await setSessionCookie(idToken);
    return user;
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
    // Create admin user in Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = cred.user;

    await updateProfile(user, { displayName: data.fullName });

    // Create school document
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

    // Create admin user document
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
    await setSessionCookie(idToken);
    return { user, schoolId: schoolRef.id };
  }

  async function joinClassroom(code: string, studentName?: string) {
    // Look up the classroom by join code
    const q = query(
      collection(db, "classrooms"),
      where("joinCode", "==", code.toUpperCase())
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return null;
    }

    const classroomDoc = snap.docs[0];
    const classroom = { id: classroomDoc.id, ...classroomDoc.data() };

    // If user is already logged in, create enrollment
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Create enrollment for each course in the classroom
      const courseIds = classroomDoc.data().courseIds || [];
      for (const courseId of courseIds) {
        await addDoc(collection(db, "enrollments"), {
          studentId: currentUser.uid,
          classroomId: classroomDoc.id,
          courseId,
          progress: 0,
          completedLessons: 0,
          startedAt: serverTimestamp(),
        });
      }
    }

    return classroom;
  }

  async function signInWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;

    // Check if user document exists, create if not
    const userDocRef = doc(db, "users", user.uid);
    const { getDoc } = await import("firebase/firestore");
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName,
        role: "teacher" as UserRole,
        schoolId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const idToken = await user.getIdToken();
    await setSessionCookie(idToken);
    return cred;
  }

  async function signOut() {
    await clearSessionCookie();
    await firebaseSignOut(auth);
  }

  return {
    signIn,
    registerTeacher,
    onboardSchool,
    joinClassroom,
    signInWithGoogle,
    signOut,
  };
}
