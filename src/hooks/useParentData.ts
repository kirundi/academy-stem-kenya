"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

export interface ChildSubmission {
  id: string;
  courseId: string;
  lessonId: string;
  status: "pending" | "graded" | "draft";
  grade: string | null;
  score: number | null;
  feedback: string | null;
  submittedAt: { seconds: number; nanoseconds: number } | null;
}

export interface ChildEnrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  completedLessons: number;
  startedAt: { seconds: number; nanoseconds: number } | null;
}

export interface ChildStudent {
  uid: string;
  displayName: string;
  grade: string | null;
  schoolId: string | null;
  xp: number;
  level: number;
  badges: string[];
}

export interface ChildProgress {
  student: ChildStudent;
  enrollments: ChildEnrollment[];
  submissions: ChildSubmission[];
}

export function useParentData() {
  const { appUser } = useAuthContext();
  const [children, setChildren] = useState<ChildProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appUser) {
      setLoading(false);
      return;
    }

    fetch("/api/parent/children")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch children data");
        return res.json() as Promise<ChildProgress[]>;
      })
      .then((data) => {
        setChildren(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [appUser]);

  return { children, loading, error };
}
