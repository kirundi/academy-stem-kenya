import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function logActivity(
  userId: string,
  type: string,
  description: string,
  courseId?: string
) {
  await addDoc(collection(db, "activities"), {
    userId,
    type,
    description,
    courseId: courseId || null,
    timestamp: serverTimestamp(),
  });
}
