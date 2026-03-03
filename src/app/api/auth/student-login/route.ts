import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, confirm, firstName } = body;

  if (!code || typeof code !== "string" || code.length !== 6) {
    return NextResponse.json(
      { error: "A valid 6-character student code is required" },
      { status: 400 }
    );
  }

  // Rate limit: 10 attempts per IP per 15 minutes.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimitKey = `slr_${ip}`;
  const limit = await checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    const retryAfterSec = Math.ceil((limit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many attempts. Please wait before trying again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Reset": String(limit.resetAt),
        },
      }
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
      { status: 404 }
    );
  }

  const studentDoc = snap.docs[0];
  const studentData = studentDoc.data();
  const uid = studentDoc.id;

  // Fetch school name for display.
  let schoolName = "School";
  if (studentData.schoolId) {
    const schoolDoc = await adminDb.collection("schools").doc(studentData.schoolId).get();
    if (schoolDoc.exists) {
      schoolName = schoolDoc.data()?.name || "School";
    }
  }

  // Shared name verification.
  const storedFirstName = (studentData.displayName || "").split(" ")[0].toLowerCase();
  const providedFirstName = (firstName || "").trim().toLowerCase();
  const nameProvided = firstName && typeof firstName === "string" && firstName.trim();
  const nameMatches = nameProvided && storedFirstName === providedFirstName;

  // Step 1: verify code + firstName → return student profile (no auth token).
  if (!confirm) {
    if (!nameProvided) {
      return NextResponse.json({ error: "First name is required." }, { status: 400 });
    }
    if (!nameMatches) {
      return NextResponse.json(
        { error: "That name doesn't match this code. Try again or ask your teacher." },
        { status: 403 }
      );
    }
    return NextResponse.json({
      found: true,
      student: {
        displayName: studentData.displayName,
        grade: studentData.grade || null,
        schoolName,
      },
    });
  }

  // Step 2: verify first name and issue custom token.
  if (!nameProvided) {
    return NextResponse.json({ error: "First name is required to log in." }, { status: 400 });
  }
  if (!nameMatches) {
    return NextResponse.json(
      { error: "That name doesn't match this code. Try again or ask your teacher." },
      { status: 403 }
    );
  }

  try {
    const customToken = await adminAuth.createCustomToken(uid);

    // Successful login — reset the rate limit bucket for this IP.
    await resetRateLimit(rateLimitKey);

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
      { status: 500 }
    );
  }
}
