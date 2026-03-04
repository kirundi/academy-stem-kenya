"use client";

import { useEffect, useState } from "react";
import { useCollection } from "./useFirestore";
import { useAuthContext } from "@/contexts/AuthContext";
import { where, orderBy, limit } from "firebase/firestore";
import type { School, Activity } from "@/lib/types";
import type { AppUser, Classroom, Course } from "@/lib/types";

export function useSchoolAdminData() {
  const { appUser } = useAuthContext();
  const schoolId = appUser?.schoolId ?? null;

  const { data: teachers, loading: teachersLoading } = useCollection<AppUser>(
    "users",
    schoolId ? [where("schoolId", "==", schoolId), where("role", "==", "teacher")] : [],
    !!schoolId
  );

  const { data: students, loading: studentsLoading } = useCollection<AppUser>(
    "users",
    schoolId ? [where("schoolId", "==", schoolId), where("role", "==", "student")] : [],
    !!schoolId
  );

  const { data: classrooms, loading: classroomsLoading } = useCollection<Classroom>(
    "classrooms",
    schoolId ? [where("schoolId", "==", schoolId)] : [],
    !!schoolId
  );

  const { data: activities, loading: activitiesLoading } = useCollection<Activity>(
    "activities",
    schoolId ? [where("schoolId", "==", schoolId), orderBy("timestamp", "desc"), limit(20)] : [],
    !!schoolId
  );

  const { data: schoolCourses, loading: schoolCoursesLoading } = useCollection<Course>(
    "courses",
    schoolId ? [where("schoolId", "==", schoolId)] : [],
    !!schoolId
  );

  const { data: platformCourses, loading: platformCoursesLoading } = useCollection<Course>(
    "courses",
    schoolId ? [where("schoolId", "==", null)] : [],
    !!schoolId
  );

  const courses = [...schoolCourses, ...platformCourses];

  return {
    teachers,
    students,
    classrooms,
    activities,
    courses,
    loading:
      teachersLoading ||
      studentsLoading ||
      classroomsLoading ||
      activitiesLoading ||
      schoolCoursesLoading ||
      platformCoursesLoading,
  };
}

export function useGlobalAdminData() {
  const [schools, setSchools] = useState<(School & { id: string })[]>([]);
  const [allUsers, setAllUsers] = useState<(AppUser & { id: string })[]>([]);
  const [allCourses, setAllCourses] = useState<(Course & { id: string })[]>([]);
  const [activities, setActivities] = useState<(Activity & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load dashboard data");
        }
        const data = await res.json();
        if (cancelled) return;
        setSchools(data.schools);
        setAllUsers(data.users);
        setAllCourses(data.courses);
        setActivities(data.activities);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const teachers = allUsers.filter((u) => u.role === "teacher");
  const students = allUsers.filter((u) => u.role === "student");

  return {
    schools,
    allUsers,
    allCourses,
    activities,
    teachers,
    students,
    loading,
    error,
  };
}
