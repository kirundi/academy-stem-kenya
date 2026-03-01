"use client";

import { useMemo } from "react";
import { useCollection } from "./useFirestore";
import { useAuthContext } from "@/contexts/AuthContext";
import { where, orderBy, limit } from "firebase/firestore";
import type { Classroom, Submission, Course } from "@/lib/types";

export function useTeacherData() {
  const { appUser } = useAuthContext();
  const uid = appUser?.uid ?? null;
  const schoolId = appUser?.schoolId ?? null;

  const { data: classrooms, loading: classroomsLoading } =
    useCollection<Classroom>(
      "classrooms",
      uid ? [where("teacherId", "==", uid)] : [],
      !!uid
    );

  // Get classroom IDs for scoping submissions (Firestore "in" supports up to 30)
  const classroomIds = useMemo(
    () => classrooms.map((c) => c.id).slice(0, 30),
    [classrooms]
  );

  const { data: pendingSubmissions, loading: submissionsLoading } =
    useCollection<Submission>(
      "submissions",
      classroomIds.length > 0
        ? [
            where("classroomId", "in", classroomIds),
            where("status", "==", "pending"),
            orderBy("submittedAt", "desc"),
            limit(20),
          ]
        : [],
      classroomIds.length > 0
    );

  // Scope courses to teacher's school (platform-wide courses have schoolId=null)
  const { data: allCourses, loading: coursesLoading } =
    useCollection<Course>(
      "courses",
      schoolId ? [where("schoolId", "in", [schoolId, null])] : [],
      !!schoolId
    );

  return {
    classrooms,
    pendingSubmissions,
    allCourses,
    loading: classroomsLoading || submissionsLoading || coursesLoading,
  };
}
