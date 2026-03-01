"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useDocument<T = DocumentData>(
  collectionName: string,
  docId: string | null
) {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) return;

    const docRef = doc(db, collectionName, docId);
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          setData({ id: snap.id, ...snap.data() } as T & { id: string });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, docId]);

  if (!docId) return { data: null, loading: false, error: null };
  return { data, loading, error };
}

export function useCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  enabled = true
) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize constraints to a stable string for deps
  const constraintKey = JSON.stringify(
    constraints.map((c) => c.type + String(c))
  );

  useEffect(() => {
    if (!enabled) return;

    const q = query(collection(db, collectionName), ...constraints);
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as T & { id: string }
        );
        setData(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, constraintKey, enabled]);

  if (!enabled) return { data: [] as (T & { id: string })[], loading: false, error: null };
  return { data, loading, error };
}

export function useCreateDoc(collectionName: string) {
  const [loading, setLoading] = useState(false);

  const create = useCallback(
    async (data: Record<string, unknown>) => {
      setLoading(true);
      try {
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return docRef.id;
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  return { create, loading };
}

export function useUpdateDoc(collectionName: string) {
  const [loading, setLoading] = useState(false);

  const update = useCallback(
    async (docId: string, data: Record<string, unknown>) => {
      setLoading(true);
      try {
        await updateDoc(doc(db, collectionName, docId), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  return { update, loading };
}

export function useDeleteDoc(collectionName: string) {
  const [loading, setLoading] = useState(false);

  const remove = useCallback(
    async (docId: string) => {
      setLoading(true);
      try {
        await deleteDoc(doc(db, collectionName, docId));
      } finally {
        setLoading(false);
      }
    },
    [collectionName]
  );

  return { remove, loading };
}

// One-time fetch helpers
export async function fetchDoc<T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  const snap = await getDoc(doc(db, collectionName, docId));
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as T & { id: string };
  }
  return null;
}

export async function fetchCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as T & { id: string }
  );
}

// Re-export Firestore query helpers for convenience
export { where, orderBy, limit, query, collection, doc, serverTimestamp };
