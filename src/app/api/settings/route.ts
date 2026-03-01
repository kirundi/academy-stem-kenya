import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

async function requireGlobalAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) return null;

  try {
    const user = await adminAuth.verifySessionCookie(session, true);
    const userDoc = await adminDb.collection("users").doc(user.uid).get();
    const userData = userDoc.data();
    if (!userData || userData.role !== "super_admin") return null;
    return user;
  } catch {
    return null;
  }
}

const SETTINGS_DOC = "settings/platform";

const DEFAULT_SETTINGS = {
  siteName: "STEM Impact Academy",
  supportEmail: "support@stemimpactcenterkenya.org",
  platformUrl: "academy.stemimpactcenterkenya.org",
  features: {
    studentRegistration: true,
    googleClassroomSync: true,
    publicCourseLibrary: false,
  },
};

export async function GET() {
  const admin = await requireGlobalAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const doc = await adminDb.doc(SETTINGS_DOC).get();
  if (!doc.exists) {
    return NextResponse.json(DEFAULT_SETTINGS);
  }

  return NextResponse.json({ ...DEFAULT_SETTINGS, ...doc.data() });
}

export async function PUT(request: NextRequest) {
  const admin = await requireGlobalAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();

  await adminDb.doc(SETTINGS_DOC).set(
    {
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: admin.uid,
    },
    { merge: true }
  );

  return NextResponse.json({ status: "updated" });
}
