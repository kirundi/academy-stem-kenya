import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { sendDraftReminderEmail } from "@/lib/email";
import { requirePermission } from "@/lib/api-auth";
import crypto from "crypto";

const PLATFORM_URL =
  process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://academy.stemimpactcenterkenya.org";

const REMINDER_DELAY_MS = 24 * 60 * 60 * 1000; // send reminder 24h after draft creation

/**
 * POST /api/admin/send-draft-reminders
 *
 * Finds all draft school applications that:
 *   - Were created more than 24 hours ago
 *   - Have not yet received a reminder email (reminderSent: false)
 *   - Have not yet expired (expiresAt > now)
 *
 * Sends each one a reminder email and marks reminderSent: true.
 *
 * Intended to be called by an admin manually from the dashboard, or wired up
 * to a Cloud Functions cron job (e.g. Cloud Scheduler → Pub/Sub → this route).
 *
 * Requires manage_schools permission.
 */
export async function POST() {
  const caller = await requirePermission("manage_schools");
  if (!caller) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const cutoff = new Date(now.getTime() - REMINDER_DELAY_MS);

  // Firestore can't easily filter on "createdAt < cutoff AND expiresAt > now" in a single
  // compound query without a composite index, so we filter on createdAt and handle expiresAt
  // in memory (the collection will stay small).
  const snap = await adminDb
    .collection("school_application_drafts")
    .where("reminderSent", "==", false)
    .where("createdAt", "<", Timestamp.fromDate(cutoff))
    .get();

  if (snap.empty) {
    return NextResponse.json({ sent: 0, message: "No drafts eligible for a reminder." });
  }

  let sent = 0;
  const errors: string[] = [];

  await Promise.all(
    snap.docs.map(async (docSnap) => {
      const draft = docSnap.data();

      // Skip expired drafts (mark them expired rather than sending a reminder).
      const expiresAt: Date =
        draft.expiresAt instanceof Date ? draft.expiresAt : draft.expiresAt.toDate();
      if (expiresAt < now) {
        await docSnap.ref.update({ reminderSent: true, expiredWithoutReminder: true });
        return;
      }

      // Build a fresh resume link using the document ID (which IS the token hash).
      // We can't recover the plaintext token, so we issue a one-time redirect token
      // stored alongside the draft and keyed by a new plaintext token pointing to the
      // same draft data.
      //
      // Strategy: generate a new plaintext token, hash it, and store it as a sibling
      // doc in the same collection that references the original draft's email so GET
      // can return the same data. Simpler alternative: store the plaintext token
      // at draft creation. We chose not to for security, so instead we create a new
      // "alias" draft with fresh data and invalidate the old one.
      const newToken = crypto.randomBytes(32).toString("hex");
      const newHash = crypto.createHash("sha256").update(newToken).digest("hex");
      const newExpiry = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48h from now

      const batch = adminDb.batch();

      // Delete the old draft doc (old resume link becomes invalid).
      batch.delete(docSnap.ref);

      // Create a new draft doc under the new hash with refreshed expiry.
      batch.set(adminDb.collection("school_application_drafts").doc(newHash), {
        email: draft.email,
        schoolName: draft.schoolName,
        schoolType: draft.schoolType,
        location: draft.location,
        studentCount: draft.studentCount,
        fullName: draft.fullName,
        roleDesignation: draft.roleDesignation,
        contactNumber: draft.contactNumber,
        createdAt: draft.createdAt, // preserve original creation time
        expiresAt: newExpiry,
        reminderSent: true,
        reminderSentAt: FieldValue.serverTimestamp(),
      });

      await batch.commit();

      const resumeLink = `${PLATFORM_URL}/onboarding?resume=${newToken}`;

      try {
        await sendDraftReminderEmail({
          to: draft.email,
          name: draft.fullName ?? "Administrator",
          schoolName: draft.schoolName ?? "your school",
          resumeLink,
        });
        sent++;
      } catch (err) {
        console.error(`Reminder email failed for ${draft.email}:`, err);
        errors.push(draft.email);
      }
    })
  );

  return NextResponse.json({
    sent,
    errors: errors.length > 0 ? errors : undefined,
    message: `Sent ${sent} reminder email(s).`,
  });
}
