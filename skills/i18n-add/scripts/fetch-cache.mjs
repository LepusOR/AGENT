#!/usr/bin/env node
// Usage: fetch-cache.mjs [--force]
// Fetches namespace JSONP files, strips the JSONP wrapper, and writes real JSON cache files.

import { existsSync, mkdirSync, readFileSync, rmSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillDir = resolve(scriptDir, '..');
const root = resolve(skillDir, '../../..');
const configPath = resolve(skillDir, 'config.json');
const cacheDir = resolve(root, '.i18n-cache');
const force = process.argv.includes('--force');

function parseJsonp(src) {
  const stripped = src
    .replace(/^\s*window\[[^\]]+\]\s*=\s*/, '')
    .replace(/;?\s*$/, '');
  try {
    return JSON.parse(stripped);
  } catch {
    // eslint-disable-next-line no-new-func
    return new Function(`return ${stripped}`)();
  }
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.text();
}

async function main() {
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const ttlSec = Number(config.cacheTtlHours ?? 24) * 3600;
  const now = Date.now() / 1000;
  mkdirSync(cacheDir, { recursive: true });

  for (const [ns, meta] of Object.entries(config.namespaces ?? {})) {
    const dst = resolve(cacheDir, `${ns}.json`);
    const tmp = `${dst}.tmp`;
    let stale = true;

    if (existsSync(dst) && !force) {
      const mtime = readMtimeSec(dst);
      stale = now - mtime >= ttlSec;
    }

    if (!stale && !force) {
      console.log(`skip  ${ns} (fresh)`);
      continue;
    }

    console.log(`fetch ${ns} <- ${meta.url}`);
    try {
      const src = await fetchText(meta.url);
      const obj = parseJsonp(src);
      writeFileSync(tmp, JSON.stringify(obj, null, 2));
      renameSync(tmp, dst);
    } catch (e) {
      rmSync(tmp, { force: true });
      throw new Error(`fetch ${ns} failed: ${e.message}`);
    }
  }

  console.log(`cache ready: ${cacheDir}`);
}

function readMtimeSec(file) {
  const { mtimeMs } = statSync(file);
  return mtimeMs / 1000;
}

main().catch((e) => {
  console.error(`error: ${e.message}`);
  process.exit(1);
});
