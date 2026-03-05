import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";
import { getAuthUser } from "@/lib/api-auth";

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

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only editors and admins can delete files
  const allowedRoles = ["editor", "admin", "super_admin"];
  if (!allowedRoles.includes(user.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { path } = await request.json();
  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "File path is required" }, { status: 400 });
  }

  try {
    const bucket = getStorage().bucket();
    await bucket.file(path).delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "File not found or already deleted" }, { status: 404 });
  }
}
