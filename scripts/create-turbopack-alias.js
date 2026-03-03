'use strict';

// Firebase Hosting's internal Turbopack build mangles "firebase-admin" to
// "firebase-admin-a14c8a5423a75469". At runtime the Cloud Function tries to
// require that name, but it's not in /workspace/node_modules/ because the
// npm alias (npm:firebase-admin@x.y.z) stores name:"firebase-admin" inside
// the alias directory — so Firebase's file tracer deduplicates it away.
//
// This postinstall script creates a REAL wrapper package at
// node_modules/firebase-admin-a14c8a5423a75469/ whose package.json says
// name:"firebase-admin-a14c8a5423a75469". The file tracer sees it as a
// distinct package and includes it in the Cloud Function deployment.
//
// Export paths are remapped from "./lib/..." → "../firebase-admin/lib/..."
// so the actual code still lives in a single place (firebase-admin/).

const path = require('path');
const fs = require('fs');

const ALIAS = 'firebase-admin-a14c8a5423a75469';
const nodeModules = path.resolve(__dirname, '..', 'node_modules');
const aliasDir = path.join(nodeModules, ALIAS);
const targetPkg = JSON.parse(
  fs.readFileSync(path.join(nodeModules, 'firebase-admin', 'package.json'), 'utf8')
);

function remapPath(value) {
  if (typeof value === 'string') {
    return value.startsWith('./') ? `../firebase-admin/${value.slice(2)}` : value;
  }
  if (Array.isArray(value)) return value.map(remapPath);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, remapPath(v)]));
  }
  return value;
}

if (fs.existsSync(aliasDir)) {
  fs.rmSync(aliasDir, { recursive: true, force: true });
}
fs.mkdirSync(aliasDir, { recursive: true });

fs.writeFileSync(
  path.join(aliasDir, 'package.json'),
  JSON.stringify(
    {
      name: ALIAS, // distinct name → file tracer won't deduplicate with firebase-admin
      version: targetPkg.version,
      main: `../firebase-admin/${targetPkg.main || 'lib/index.js'}`,
      exports: remapPath(targetPkg.exports),
    },
    null,
    2
  ) + '\n'
);

console.log(`✓ Turbopack alias created: ${ALIAS} → firebase-admin@${targetPkg.version}`);
