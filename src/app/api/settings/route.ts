import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { requirePermission } from "@/lib/api-auth";

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
  const caller = await requirePermission("manage_settings");
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const doc = await adminDb.doc(SETTINGS_DOC).get();
  if (!doc.exists) {
    return NextResponse.json(DEFAULT_SETTINGS);
  }

  return NextResponse.json({ ...DEFAULT_SETTINGS, ...doc.data() });
}

export async function PUT(request: NextRequest) {
  const caller = await requirePermission("manage_settings");
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();

  await adminDb.doc(SETTINGS_DOC).set(
    {
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: caller.uid,
    },
    { merge: true }
  );

  return NextResponse.json({ status: "updated" });
}
