import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, setUserClaims } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";
import { sendInviteEmail } from "@/lib/email";

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

async function requireAdmin() {
  const user = await getAuthUser();
  if (!user) return null;

  const userDoc = await adminDb.collection("users").doc(user.uid).get();
  const userData = userDoc.data();
  if (!userData || (userData.role !== "super_admin" && userData.role !== "admin")) return null;

  return { ...user, appUser: userData };
}

export async function POST(request: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized — admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { email, displayName, role, schoolId } = body;

  if (!email || !displayName || !role) {
    return NextResponse.json(
      { error: "email, displayName, and role are required" },
      { status: 400 }
    );
  }

  // Permission tiers: super_admin can invite anyone, admin can only invite teacher/school_admin
  const callerRole = caller.appUser.role;
  const superAdminRoles = ["admin", "school_admin", "teacher"];
  const adminRoles = ["school_admin", "teacher"];

  const allowedRoles = callerRole === "super_admin" ? superAdminRoles : adminRoles;

  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: `You don't have permission to create ${role} accounts` },
      { status: 403 }
    );
  }

  const tempPassword = crypto.randomBytes(6).toString("base64url");

  try {
    const userRecord = await adminAuth.createUser({
      email,
      password: tempPassword,
      displayName,
    });

    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set({
        email,
        displayName,
        role,
        schoolId: schoolId || null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    // Embed role + schoolId in the Firebase Auth token as custom claims
    await setUserClaims(userRecord.uid, { role, schoolId: schoolId || null });

    await adminDb.collection("activities").add({
      userId: caller.uid,
      type: "admin_invite",
      description: `Invited ${displayName} (${email}) as ${role}`,
      timestamp: FieldValue.serverTimestamp(),
    });

    // Send invite email via Resend
    try {
      await sendInviteEmail({ to: email, name: displayName, role, tempPassword });
    } catch (emailErr) {
      console.error("Failed to send invite email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      email,
      tempPassword,
      role,
      message: `${role} account created for ${email}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const caller = await requireAdmin();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized — admin access required" }, { status: 403 });
  }

  const snap = await adminDb
    .collection("users")
    .where("role", "in", ["super_admin", "admin", "school_admin"])
    .get();

  const admins = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    password: undefined,
  }));

  return NextResponse.json(admins);
}
