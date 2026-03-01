"use client";

import { useCollection } from "./useFirestore";
import { useAuthContext } from "@/contexts/AuthContext";
import { where, orderBy, limit } from "firebase/firestore";
import type { Classroom, Submission, Course } from "@/lib/types";

export function useTeacherData() {
  const { appUser } = useAuthContext();
  const uid = appUser?.uid ?? null;

  const { data: classrooms, loading: classroomsLoading } =
    useCollection<Classroom>(
      "classrooms",
      uid ? [where("teacherId", "==", uid)] : [],
      !!uid
    );

  const { data: pendingSubmissions, loading: submissionsLoading } =
    useCollection<Submission>(
      "submissions",
      [where("status", "==", "pending"), orderBy("submittedAt", "desc"), limit(20)]
    );

  const { data: allCourses, loading: coursesLoading } =
    useCollection<Course>("courses");

  return {
    classrooms,
    pendingSubmissions,
    allCourses,
    loading: classroomsLoading || submissionsLoading || coursesLoading,
  };
}
