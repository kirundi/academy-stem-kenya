"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/contexts/AuthContext";
import type { Notification } from "@/lib/types";

export function useNotifications(maxCount = 20) {
  const { appUser } = useAuthContext();
  const [notifications, setNotifications] = useState<
    (Notification & { id: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appUser?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", appUser.uid),
      orderBy("createdAt", "desc"),
      limit(maxCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        })) as (Notification & { id: string })[];
        setNotifications(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [appUser?.uid, maxCount]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await updateDoc(doc(db, "notifications", notificationId), {
          read: true,
        });
      } catch (err) {
        if (process.env.NODE_ENV === "development") console.error("Failed to mark notification as read:", err);
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    const promises = unread.map((n) =>
      updateDoc(doc(db, "notifications", n.id), { read: true })
    );
    try {
      await Promise.all(promises);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("Failed to mark all notifications as read:", err);
    }
  }, [notifications]);

  if (!appUser?.uid) {
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      markAsRead,
      markAllAsRead,
    };
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  };
}
