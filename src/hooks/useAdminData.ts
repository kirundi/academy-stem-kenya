"use client";

import { useCollection } from "./useFirestore";
import { useAuthContext } from "@/contexts/AuthContext";
import { where, orderBy, limit } from "firebase/firestore";
import type { School, Activity } from "@/lib/types";
import type { AppUser, Classroom, Course } from "@/lib/types";

export function useSchoolAdminData() {
  const { appUser } = useAuthContext();
  const schoolId = appUser?.schoolId ?? null;

  const { data: teachers, loading: teachersLoading } =
    useCollection<AppUser>(
      "users",
      schoolId
        ? [where("schoolId", "==", schoolId), where("role", "==", "teacher")]
        : [],
      !!schoolId
    );

  const { data: students, loading: studentsLoading } =
    useCollection<AppUser>(
      "users",
      schoolId
        ? [where("schoolId", "==", schoolId), where("role", "==", "student")]
        : [],
      !!schoolId
    );

  const { data: classrooms, loading: classroomsLoading } =
    useCollection<Classroom>(
      "classrooms",
      schoolId ? [where("schoolId", "==", schoolId)] : [],
      !!schoolId
    );

  const { data: activities, loading: activitiesLoading } =
    useCollection<Activity>(
      "activities",
      schoolId
        ? [where("schoolId", "==", schoolId), orderBy("timestamp", "desc"), limit(20)]
        : [],
      !!schoolId
    );

  const { data: courses, loading: coursesLoading } =
    useCollection<Course>(
      "courses",
      schoolId ? [where("schoolId", "in", [schoolId, null])] : [],
      !!schoolId
    );

  return {
    teachers,
    students,
    classrooms,
    activities,
    courses,
    loading:
      teachersLoading || studentsLoading || classroomsLoading || activitiesLoading || coursesLoading,
  };
}

export function useGlobalAdminData() {
  const { data: schools, loading: schoolsLoading, error: schoolsError } =
    useCollection<School>("schools");

  const { data: allUsers, loading: usersLoading, error: usersError } =
    useCollection<AppUser>("users");

  const { data: allCourses, loading: coursesLoading, error: coursesError } =
    useCollection<Course>("courses");

  const { data: activities, loading: activitiesLoading, error: activitiesError } =
    useCollection<Activity>(
      "activities",
      [orderBy("timestamp", "desc"), limit(50)]
    );

  const teachers = allUsers.filter((u) => u.role === "teacher");
  const students = allUsers.filter((u) => u.role === "student");

  const error = schoolsError || usersError || coursesError || activitiesError;

  return {
    schools,
    allUsers,
    allCourses,
    activities,
    teachers,
    students,
    loading: schoolsLoading || usersLoading || coursesLoading || activitiesLoading,
    error,
  };
}
