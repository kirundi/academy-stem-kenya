import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { getStorage } from "firebase-admin/storage";

async function getAuthUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) return null;
  try {
    return await adminAuth.verifySessionCookie(session, true);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const path = formData.get("path") as string;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bucket = getStorage().bucket();
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = path || `uploads/${user.uid}/${Date.now()}-${file.name}`;

  const fileRef = bucket.file(fileName);
  await fileRef.save(buffer, {
    metadata: {
      contentType: file.type,
    },
  });

  await fileRef.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

  return NextResponse.json({ url: publicUrl, path: fileName });
}
