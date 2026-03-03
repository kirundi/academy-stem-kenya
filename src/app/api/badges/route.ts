import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthUser } from "@/lib/api-auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await adminDb.collection("badges").get();
  const badges = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json(badges);
}
