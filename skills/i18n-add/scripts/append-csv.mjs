#!/usr/bin/env node
// Usage: node append-csv.mjs <output-dir> <run-stamp> <rows.json>
// rows.json: [{ id, zh_CN, status?: "create", sourceFile?: string, appName?: string, group?: string }, ...]
// Appends create rows to .i18n-output/i18n-new-<run-stamp>.csv (UTF-8 BOM, RFC 4180 quoting).
// Also writes a JSON manifest beside the CSV.
// Duplicate id+zh_CN rows are skipped. Duplicate id with different zh_CN fails.
// Prints resulting CSV file path to stdout.

import { mkdirSync, existsSync, writeFileSync, appendFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

process.on('uncaughtException', (e) => {
  console.error(`error: ${e.message}`);
  process.exit(1);
});

const [, , outDir, stamp, rowsPath] = process.argv;
if (!outDir || !stamp || !rowsPath) {
  console.error('usage: append-csv.mjs <output-dir> <run-stamp> <rows.json>');
  process.exit(2);
}

const rows = JSON.parse(readFileSync(rowsPath, 'utf8'));
const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillDir = resolve(scriptDir, '..');
const config = JSON.parse(readFileSync(resolve(skillDir, 'config.json'), 'utf8'));
const defaultAppName = config.csv?.appName ?? 'crmweb';
const defaultGroup = config.csv?.group ?? 'authcenter';
mkdirSync(outDir, { recursive: true });
const file = resolve(outDir, `i18n-new-${stamp}.csv`);
const manifestFile = resolve(outDir, `i18n-new-${stamp}.json`);
const header = ['AppName', 'Key', 'Simplified Chinese', 'Group'];

function esc(v) {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
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

function readExistingRows() {
  if (!existsSync(file)) return [];
  const src = readFileSync(file, 'utf8');
  if (!src) return [];
  const [header, ...dataRows] = parseCsv(src);
  if (
    !header ||
    header.length !== 4 ||
    header[0] !== 'AppName' ||
    header[1] !== 'Key' ||
    header[2] !== 'Simplified Chinese' ||
    header[3] !== 'Group'
  ) {
    throw new Error(`unexpected CSV header in ${file}: ${header?.join(',')}`);
  }
  return dataRows.map(([appName, id, zh_CN, group]) => {
    return { appName, id, zh_CN, group };
  });
}

function normalizeRow(row) {
  const id = String(row.id ?? '').trim();
  const zh_CN = String(row.zh_CN ?? '').trim();
  const appName = String(row.appName ?? defaultAppName).trim();
  const group = String(row.group ?? defaultGroup).trim();
  const status = row.status ?? 'create';
  if (status !== 'create') {
    throw new Error(`only create rows can be exported to CSV: ${JSON.stringify(row)}`);
  }
  if (!appName || !id || !zh_CN || !group) {
    throw new Error(`row requires non-empty appName, id, zh_CN, and group: ${JSON.stringify(row)}`);
  }
  return { ...row, appName, id, zh_CN, group, status };
}

const existingRows = readExistingRows();
const byId = new Map(existingRows.map((row) => [row.id, row]));
const uniqueRows = [];

for (const rawRow of rows.map(normalizeRow)) {
  const existingRow = byId.get(rawRow.id);
  if (existingRow != null) {
    if (
      existingRow.zh_CN !== rawRow.zh_CN ||
      existingRow.appName !== rawRow.appName ||
      existingRow.group !== rawRow.group
    ) {
      throw new Error(
        `id conflict: ${rawRow.id} already maps to ${JSON.stringify(existingRow)}, got ${JSON.stringify({
          appName: rawRow.appName,
          id: rawRow.id,
          zh_CN: rawRow.zh_CN,
          group: rawRow.group,
        })}`,
      );
    }
    continue;
  }
  byId.set(rawRow.id, rawRow);
  uniqueRows.push(rawRow);
}

if (!existsSync(file)) {
  writeFileSync(file, `﻿${header.join(',')}\n`, 'utf8');
}
const body =
  uniqueRows
    .map((r) => `${esc(r.appName)},${esc(r.id)},${esc(r.zh_CN)},${esc(r.group)}`)
    .join('\n') + (uniqueRows.length ? '\n' : '');
if (body) appendFileSync(file, body, 'utf8');

let manifest = {
  createdAt: new Date().toISOString(),
  csvFile: file,
  rows: [],
};

if (existsSync(manifestFile)) {
  manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
}

const manifestById = new Map((manifest.rows ?? []).map((row) => [row.id, row]));
for (const row of uniqueRows) {
  manifestById.set(row.id, {
    appName: row.appName,
    id: row.id,
    zh_CN: row.zh_CN,
    group: row.group,
    status: 'create',
    sourceFile: row.sourceFile,
  });
}
manifest.csvFile = file;
manifest.updatedAt = new Date().toISOString();
manifest.rows = Array.from(manifestById.values());
writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

process.stdout.write(file);
