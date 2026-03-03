// Firebase Hosting's internal Turbopack build mangles package names to a hashed
// variant, e.g. "firebase-admin" → "firebase-admin-a14c8a5423a75469". The hash
// is baked into the Cloud Function bundle, so at runtime Node.js tries to
// require a package that doesn't exist → 500 on every firebase-admin call.
//
// This instrumentation hook fires at server startup (before any route loads)
// and patches Node's module resolver to redirect any require matching
// /^firebase-admin-[0-9a-f]{16}$/ back to the real "firebase-admin" package.
// Because it matches on the pattern rather than a specific hash, the fix
// survives firebase-admin version upgrades automatically.

type NodeModule = typeof import("module") & {
  _resolveFilename: (
    request: string,
    parent: unknown,
    isMain: boolean,
    options?: unknown
  ) => string;
};

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const Module = require("module") as NodeModule;
  const originalResolve = Module._resolveFilename;

  Module._resolveFilename = function (request, parent, isMain, options) {
    if (/^firebase-admin-[0-9a-f]{16}$/.test(request)) {
      request = "firebase-admin";
    }
    return originalResolve.call(this, request, parent, isMain, options);
  };
}
