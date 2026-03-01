import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function logActivity(
  userId: string,
  type: string,
  description: string,
  courseIdOrExtra?: string | { courseId?: string; schoolId?: string }
) {
  const extra =
    typeof courseIdOrExtra === "string"
      ? { courseId: courseIdOrExtra }
      : courseIdOrExtra;

  await addDoc(collection(db, "activities"), {
    userId,
    type,
    description,
    courseId: extra?.courseId || null,
    schoolId: extra?.schoolId || null,
    timestamp: serverTimestamp(),
  });
}
