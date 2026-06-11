#!/usr/bin/env node
// Usage: node rows-from-plan.mjs <plan.json> [--out <rows.json>]
// Converts a confirmed plan into append-csv rows.
// Only create items with suggestedId and no unresolved needs/conflicts are exported.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [, , planPath, ...args] = process.argv;
if (!planPath) {
  console.error('usage: rows-from-plan.mjs <plan.json> [--out <rows.json>]');
  process.exit(2);
}

function readFlagValue(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

const outFile = readFlagValue('--out');
const plan = JSON.parse(readFileSync(planPath, 'utf8'));
const errors = [];
const rows = [];

for (const item of plan.items ?? []) {
  if (item.status !== 'create') continue;
  if (item.needs?.length) {
    errors.push(`${item.text}: unresolved needs ${item.needs.join(', ')}`);
    continue;
  }
  if (item.conflicts?.length) {
    errors.push(`${item.text}: id conflict ${item.suggestedId} in ${item.conflicts.join(', ')}`);
    continue;
  }
  if (!item.suggestedId) {
    errors.push(`${item.text}: missing suggestedId`);
    continue;
  }
  rows.push({
    id: item.suggestedId,
    zh_CN: item.text,
    status: 'create',
    sourceFile: item.sourceFile,
  });
}

if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exit(1);
}

const json = `${JSON.stringify(rows, null, 2)}\n`;
if (outFile) {
  mkdirSync(dirname(resolve(outFile)), { recursive: true });
  writeFileSync(outFile, json, 'utf8');
  process.stdout.write(resolve(outFile));
} else {
  process.stdout.write(json);
}
