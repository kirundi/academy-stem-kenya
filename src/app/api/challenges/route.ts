import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getAuthUser } from "@/lib/api-auth";
import { validateCsrf } from "@/lib/csrf";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await adminDb
    .collection("challenges")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const challenges = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(challenges);
}

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["admin", "super_admin", "editor"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const startsAt = body.startDate
    ? new Date(`${body.startDate}T${body.startTime || "00:00"}`)
    : new Date();
  const endsAt = new Date(startsAt.getTime() + (Number(body.duration) || 48) * 60 * 60 * 1000);

  const docRef = await adminDb.collection("challenges").add({
    title: body.title.trim(),
    description: body.brief || "",
    theme: body.theme?.trim() || "",
    icon: "🏆",
    scope: body.scope || "global",
    schoolId: body.scope === "school" ? body.schoolId || null : null,
    schoolIds: body.scope === "school" ? body.selectedSchools || [] : [],
    lateSubmissions: body.lateSubmissions ?? false,
    status: body.status || "published",
    createdBy: user.uid,
    startsAt,
    endsAt,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
