'use strict';

// Reads Firebase Admin credentials from .env.local and sets them as
// Firebase Secret Manager secrets. Values are piped directly to the
// Firebase CLI — they never appear in shell history or terminal output.
//
// Usage: node scripts/set-firebase-secrets.js

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ENV_PATH = path.resolve(__dirname, '../.env.local');

if (!fs.existsSync(ENV_PATH)) {
  console.error('✗ .env.local not found — run from the project root');
  process.exit(1);
}

const lines = fs.readFileSync(ENV_PATH, 'utf8').split('\n');

function parseValue(key) {
  const line = lines.find((l) => l.startsWith(key + '='));
  if (!line) return null;
  let value = line.slice(key.length + 1).trim();
  // Strip surrounding quotes
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value || null;
}

const SECRETS = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];

let allOk = true;

for (const secret of SECRETS) {
  const value = parseValue(secret);

  if (!value) {
    console.error(`✗ ${secret} not found in .env.local — skipping`);
    allOk = false;
    continue;
  }

  process.stdout.write(`  Setting ${secret}... `);

  const result = spawnSync('firebase', ['functions:secrets:set', secret], {
    input: value + '\n', // newline signals EOF to the CLI
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (result.status === 0) {
    console.log('✓');
  } else {
    console.log('✗');
    console.error(`  Error: ${(result.stderr || result.stdout || '').trim()}`);
    allOk = false;
  }
}

if (allOk) {
  console.log('\n✓ All secrets set. Deploy with: firebase deploy --only hosting');
} else {
  console.error('\n✗ Some secrets failed. Check errors above.');
  process.exit(1);
}
