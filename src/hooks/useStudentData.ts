"use client";

import { useCollection } from "./useFirestore";
import { useAuthContext } from "@/contexts/AuthContext";
import { where, orderBy, limit } from "firebase/firestore";
import type { Enrollment, Submission, Activity, Badge } from "@/lib/types";

export function useStudentData() {
  const { appUser } = useAuthContext();
  const uid = appUser?.uid ?? null;

  const { data: enrollments, loading: enrollmentsLoading } = useCollection<Enrollment>(
    "enrollments",
    uid ? [where("studentId", "==", uid)] : [],
    !!uid
  );

  const { data: submissions, loading: submissionsLoading } = useCollection<Submission>(
    "submissions",
    uid ? [where("studentId", "==", uid), orderBy("submittedAt", "desc")] : [],
    !!uid
  );

  const { data: activities, loading: activitiesLoading } = useCollection<Activity>(
    "activities",
    uid ? [where("userId", "==", uid), orderBy("timestamp", "desc"), limit(10)] : [],
    !!uid
  );

  const { data: allBadges, loading: badgesLoading } = useCollection<Badge>("badges");

  const earnedBadgeIds = appUser?.badges ?? [];
  const earnedBadges = allBadges.filter((b) => earnedBadgeIds.includes(b.id));
  const lockedBadges = allBadges.filter((b) => !earnedBadgeIds.includes(b.id));

  return {
    enrollments,
    submissions,
    activities,
    earnedBadges,
    lockedBadges,
    allBadges,
    loading: enrollmentsLoading || submissionsLoading || activitiesLoading || badgesLoading,
  };
}
