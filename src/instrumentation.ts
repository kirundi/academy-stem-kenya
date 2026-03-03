// Firebase Hosting's internal Turbopack build mangles package names to a hashed
// variant at bundle time, e.g. "firebase-admin" → "firebase-admin-a14c8a5423a75469".
// The mangled require() fires during Cloud Function startup — before Next.js runs
// any instrumentation hook — so runtime patching cannot intercept it.
//
// The actual fix is the npm alias in package.json:
//   "firebase-admin-a14c8a5423a75469": "npm:firebase-admin@13.7.0"
// This makes the mangled name resolve to the real package at the filesystem level,
// which works regardless of when the require() call is evaluated.
//
// If firebase-admin is upgraded and the hash changes, find the new hash in the
// Cloud Function error logs, then update the alias key in package.json and
// run npm install.

export async function register() {
  // Intentionally empty — kept so Next.js server hooks remain available
  // if needed in the future.
}
