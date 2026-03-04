import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";
import { sendRegistrationDraftEmail } from "@/lib/email";

const PLATFORM_URL =
  process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://academy.stemimpactcenterkenya.org";

const DRAFT_TTL_MS = 72 * 60 * 60 * 1000; // 72 hours

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * GET /api/schools/apply/draft?token=<plaintext-token>
 * Returns saved draft form data so the resume link can pre-fill the form.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || token.length !== 64) {
    return NextResponse.json({ error: "Invalid resume link." }, { status: 400 });
  }

  const docRef = adminDb.collection("school_application_drafts").doc(hashToken(token));
  const snap = await docRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "This resume link has already been used or does not exist." }, { status: 404 });
  }

  const draft = snap.data()!;
  const expiresAt: Date =
    draft.expiresAt instanceof Date ? draft.expiresAt : draft.expiresAt.toDate();

  if (expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This resume link has expired. Please start a new registration." },
      { status: 410 }
    );
  }

  return NextResponse.json({
    schoolName: draft.schoolName,
    schoolType: draft.schoolType,
    location: draft.location,
    studentCount: draft.studentCount,
    fullName: draft.fullName,
    roleDesignation: draft.roleDesignation,
    contactNumber: draft.contactNumber,
    email: draft.email,
  });
}

/**
 * POST /api/schools/apply/draft
 * Called on step 2 → 3 transition. Saves (or replaces) a draft and sends the
 * "complete your registration" email. Returns the plaintext resume token.
 *
 * Idempotent: if a draft already exists for this email it is replaced so the
 * resume link stays fresh and the user always gets the most recent data.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    schoolName, schoolType, location, studentCount,
    fullName, roleDesignation, contactNumber, email,
  } = body;

  if (!email?.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // If a draft already exists for this email, remove it so we replace with fresh data + token.
  const existingSnap = await adminDb
    .collection("school_application_drafts")
    .where("email", "==", normalizedEmail)
    .limit(1)
    .get();

  const batch = adminDb.batch();
  existingSnap.docs.forEach((d) => batch.delete(d.ref));

  // Generate a new token.
  const token = crypto.randomBytes(32).toString("hex"); // 64 hex chars
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + DRAFT_TTL_MS);

  const draftRef = adminDb.collection("school_application_drafts").doc(tokenHash);
  batch.set(draftRef, {
    email: normalizedEmail,
    schoolName: schoolName?.trim() ?? "",
    schoolType: schoolType ?? "",
    location: location?.trim() ?? "",
    studentCount: studentCount ?? "",
    fullName: fullName?.trim() ?? "",
    roleDesignation: roleDesignation?.trim() ?? "",
    contactNumber: contactNumber?.trim() ?? "",
    createdAt: FieldValue.serverTimestamp(),
    expiresAt,
    reminderSent: false,
  });

  await batch.commit();

  const resumeLink = `${PLATFORM_URL}/onboarding?resume=${token}`;

  // Fire-and-forget: send the "complete your registration" email.
  sendRegistrationDraftEmail({
    to: normalizedEmail,
    name: fullName?.trim() ?? "Administrator",
    schoolName: schoolName?.trim() ?? "your school",
    resumeLink,
  }).catch((err) => console.error("Draft email failed:", err));

  return NextResponse.json({ token }, { status: 201 });
}
