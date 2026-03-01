import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, confirm } = body;

  if (!code || typeof code !== "string" || code.length !== 6) {
    return NextResponse.json(
      { error: "A valid 6-character student code is required" },
      { status: 400 },
    );
  }

  const normalizedCode = code.toUpperCase().trim();

  const snap = await adminDb
    .collection("users")
    .where("studentCode", "==", normalizedCode)
    .where("role", "==", "student")
    .limit(1)
    .get();

  if (snap.empty) {
    return NextResponse.json(
      { error: "No student found with this code. Check with your teacher." },
      { status: 404 },
    );
  }

  const studentDoc = snap.docs[0];
  const studentData = studentDoc.data();
  const uid = studentDoc.id;

  // Fetch school name for display
  let schoolName = "School";
  if (studentData.schoolId) {
    const schoolDoc = await adminDb
      .collection("schools")
      .doc(studentData.schoolId)
      .get();
    if (schoolDoc.exists) {
      schoolName = schoolDoc.data()?.name || "School";
    }
  }

  // Step 1: preview only (no auth token)
  if (!confirm) {
    return NextResponse.json({
      found: true,
      student: {
        displayName: studentData.displayName,
        grade: studentData.grade || null,
        schoolName,
      },
    });
  }

  // Step 2: generate custom token for authentication
  try {
    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json({
      found: true,
      customToken,
      student: {
        displayName: studentData.displayName,
        grade: studentData.grade || null,
        schoolName,
      },
    });
  } catch (err) {
    console.error("Error creating custom token:", err);
    return NextResponse.json(
      { error: "Failed to authenticate. Please try again." },
      { status: 500 },
    );
  }
}
