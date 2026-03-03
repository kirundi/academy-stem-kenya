/**
 * Deletes ALL Firebase Auth users and clears the Firestore `users` collection.
 * Run: node scripts/delete-all-users.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local manually (no dotenv dependency needed) ──────────────────
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

// ── Firebase Admin init ─────────────────────────────────────────────────────
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

// ── Delete all Auth users in batches of 1000 ────────────────────────────────
async function deleteAllAuthUsers() {
  let total = 0;
  let pageToken;

  do {
    const result = await auth.listUsers(1000, pageToken);
    const uids = result.users.map((u) => u.uid);

    if (uids.length > 0) {
      const { successCount, failureCount, errors } = await auth.deleteUsers(uids);
      total += successCount;
      if (failureCount > 0) {
        console.warn(
          `  ⚠ ${failureCount} failed:`,
          errors.map((e) => e.error.message)
        );
      }
      console.log(`  Deleted ${successCount} auth users (running total: ${total})`);
    }

    pageToken = result.pageToken;
  } while (pageToken);

  return total;
}

// ── Delete all docs in a Firestore collection ────────────────────────────────
async function deleteCollection(collectionPath) {
  let deleted = 0;
  let snapshot;

  do {
    snapshot = await db.collection(collectionPath).limit(100).get();
    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += snapshot.size;
    console.log(`  Deleted ${snapshot.size} docs from ${collectionPath} (total: ${deleted})`);
  } while (!snapshot.empty);

  return deleted;
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log("⚠  Deleting ALL Firebase Auth users…");
const authCount = await deleteAllAuthUsers();
console.log(`✓ Auth: ${authCount} users deleted.\n`);

console.log("⚠  Clearing Firestore `users` collection…");
const fsCount = await deleteCollection("users");
console.log(`✓ Firestore: ${fsCount} user docs deleted.\n`);

console.log("Done. Re-run /admin/setup to recreate the super admin account.");
process.exit(0);
