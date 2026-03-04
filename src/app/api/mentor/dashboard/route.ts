import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthUser, hasRole } from "@/lib/api-auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasRole(user, ["mentor", "admin", "super_admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch mentor's user doc to get assignedChallengeIds
  const mentorDoc = await adminDb.collection("users").doc(user.uid).get();
  const assignedChallengeIds: string[] = mentorDoc.data()?.assignedChallengeIds ?? [];

  if (assignedChallengeIds.length === 0) {
    return NextResponse.json({ challenges: [], submissions: [] });
  }

  // Fetch assigned challenges (max 10 at a time per Firestore IN limit)
  const challengeIds = assignedChallengeIds.slice(0, 10);
  const challengesSnap = await adminDb
    .collection("challenges")
    .where("__name__", "in", challengeIds)
    .get();

  const challenges = challengesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Fetch pending (ungraded) submissions for these challenges
  const submissionsSnap = await adminDb
    .collection("submissions")
    .where("challengeId", "in", challengeIds)
    .where("status", "==", "submitted")
    .orderBy("submittedAt", "desc")
    .limit(50)
    .get();

  const submissions = submissionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Enrich challenges with their pending submission count
  const pendingCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    const cId = (s as Record<string, unknown>).challengeId as string;
    if (cId) pendingCounts[cId] = (pendingCounts[cId] ?? 0) + 1;
  });

  const enrichedChallenges = challenges.map((c) => ({
    ...c,
    pendingCount: pendingCounts[c.id] ?? 0,
  }));

  return NextResponse.json({ challenges: enrichedChallenges, submissions });
}
