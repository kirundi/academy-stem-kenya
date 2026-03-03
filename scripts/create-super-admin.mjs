/**
 * Creates (or resets) the super admin account directly via Firebase Admin SDK.
 * Run: node scripts/create-super-admin.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

// ── Load .env.local ──────────────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env.local");
const envLines = readFileSync(envPath, "utf8").split("\n");
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed
    .slice(eq + 1)
    .trim()
    .replace(/^"|"$/g, "");
  if (!process.env[key]) process.env[key] = val;
}

// ── Firebase Admin init ──────────────────────────────────────────────────────
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

// ── Create super admin ───────────────────────────────────────────────────────
const email = "magu@stemimpactcenterkenya.org";
const displayName = "Alex Magu";
const tempPassword = crypto.randomBytes(6).toString("base64url");

let uid;

try {
  const existing = await auth.getUserByEmail(email);
  uid = existing.uid;
  await auth.updateUser(uid, { password: tempPassword, displayName });
  console.log("Existing Firebase Auth user found — password reset.");
} catch {
  const user = await auth.createUser({ email, password: tempPassword, displayName });
  uid = user.uid;
  console.log("New Firebase Auth user created.");
}

await db.collection("users").doc(uid).set({
  email,
  displayName,
  role: "super_admin",
  schoolId: null,
  requiresPasswordChange: true,
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
});

await auth.setCustomUserClaims(uid, { role: "super_admin", schoolId: null });

console.log("\n✓ Super admin ready.");
console.log("  Email:    ", email);
console.log("  Password: ", tempPassword);
console.log("\nLog in at: https://academy.stemimpactcenterkenya.org/login?mode=email");
console.log("You will be prompted to change your password on first login.\n");
