#!/usr/bin/env node
// Usage: node validate-output.mjs <csv-file>
// Validates i18n-add CSV output before handoff to the translation platform.

import { existsSync, readFileSync } from 'node:fs';

const [, , csvFile] = process.argv;
if (!csvFile) {
  console.error('usage: validate-output.mjs <csv-file>');
  process.exit(2);
}

if (!existsSync(csvFile)) {
  console.error(`error: file not found: ${csvFile}`);
  process.exit(1);
}

const src = readFileSync(csvFile, 'utf8');
if (!src.startsWith('\uFEFF')) {
  console.error('error: CSV must start with UTF-8 BOM');
  process.exit(1);
}

function parseCsv(input) {
  const rows = [];
  let row = [];
  let cur = '';
  let quoted = false;
  const body = input.replace(/^\uFEFF/, '');

  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (quoted) {
      if (ch === '"' && body[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cur += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(cur);
      cur = '';
    } else if (ch === '\n') {
      row.push(cur.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      cur = '';
    } else {
      cur += ch;
    }
  }

  if (quoted) throw new Error('unterminated quoted field');
  if (cur || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || r[0] !== '');
}

let rows;
try {
  rows = parseCsv(src);
} catch (e) {
  console.error(`error: invalid CSV: ${e.message}`);
  process.exit(1);
}

const [header, ...dataRows] = rows;
if (
  !header ||
  header.length !== 4 ||
  header[0] !== 'AppName' ||
  header[1] !== 'Key' ||
  header[2] !== 'Simplified Chinese' ||
  header[3] !== 'Group'
) {
  console.error(`error: header must be exactly "AppName,Key,Simplified Chinese,Group"`);
  process.exit(1);
}

const seen = new Map();
const errors = [];

dataRows.forEach(([appName, id, zh_CN, group], index) => {
  const line = index + 2;
  if (!appName || !id || !zh_CN || !group) {
    errors.push(`line ${line}: AppName, Key, Simplified Chinese, and Group are required`);
  }
  if (appName !== 'crmweb') {
    errors.push(`line ${line}: AppName must be crmweb`);
  }
  if (group !== 'authcenter') {
    errors.push(`line ${line}: Group must be authcenter`);
  }
  if (!/^crmweb\.[A-Za-z0-9_.-]+$/.test(id)) {
    errors.push(`line ${line}: Key must start with crmweb. and contain only safe key chars`);
  }
  if (seen.has(id)) {
    errors.push(`line ${line}: duplicate Key ${id} (first seen line ${seen.get(id)})`);
  } else {
    seen.set(id, line);
  }
});

if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exit(1);
}

process.stdout.write(`ok: ${dataRows.length} rows validated\n`);
