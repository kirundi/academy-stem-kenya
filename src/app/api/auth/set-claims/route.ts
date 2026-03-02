import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, setUserClaims } from "@/lib/firebase-admin";

/**
 * Sets Firebase custom claims (role, schoolId) on the calling user.
 * Called by client-side registration flows (registerTeacher, onboardSchool, signInWithGoogle)
 * after the Firestore user doc is created.
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);

    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const data = userDoc.data()!;
    await setUserClaims(decoded.uid, {
      role: data.role,
      schoolId: data.schoolId ?? null,
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Set claims error:", error);
    return NextResponse.json({ error: "Failed to set claims" }, { status: 500 });
  }
}
