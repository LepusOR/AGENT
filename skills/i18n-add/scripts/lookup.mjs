#!/usr/bin/env node
// Usage: node lookup.mjs <cache-dir> <config.json> <input.json> [--include-keys]
// input.json: { texts: string[], lang?: "zh_CN" | "en_US" }  (default zh_CN)
// stdout default: { results: [{ text, hits: [{ns,id}], status: "reuse"|"ambiguous"|"miss" }] }
// stdout with --include-keys: { results, allKeys: {ns: string[]} }
//
// Deterministic JSONP parse + cross-namespace exact-match reuse lookup.
// Filters namespaces by matchLang so en_US cache skipped for zh_CN input (and vice versa).

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [, , cacheDir, configPath, inputPath, ...flags] = process.argv;
if (!cacheDir || !configPath || !inputPath) {
  console.error('usage: lookup.mjs <cache-dir> <config.json> <input.json> [--include-keys]');
  process.exit(2);
}
const includeKeys = flags.includes('--include-keys');

const config = JSON.parse(readFileSync(configPath, 'utf8'));
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
const lang = input.lang ?? 'zh_CN';
const texts = (input.texts ?? []).map((t) => String(t));

// 兼容两种缓存格式：
//   1. 真 JSON（fetch-cache.sh 已剥壳，默认落盘格式）
//   2. 原始 JSONP `window['...']={...};`（历史缓存或手工拉取）
function parseJsonp(src) {
  const trimmed = src.trimStart();
  if (trimmed.startsWith('{')) {
    return JSON.parse(src);
  }
  const stripped = src
    .replace(/^\s*window\[[^\]]+\]\s*=\s*/, '')
    .replace(/;?\s*$/, '');
  try {
    return JSON.parse(stripped);
  } catch {
    // eslint-disable-next-line no-new-func
    return new Function('return ' + stripped)();
  }
}

const maps = {};
for (const [ns, meta] of Object.entries(config.namespaces)) {
  const file = resolve(cacheDir, `${ns}.json`);
  try {
    maps[ns] = { matchLang: meta.matchLang, writable: !!meta.writable, data: parseJsonp(readFileSync(file, 'utf8')) };
  } catch (e) {
    console.error(`[warn] cannot load ${ns}: ${e.message}`);
    maps[ns] = { matchLang: meta.matchLang, writable: !!meta.writable, data: {} };
  }
}

const results = texts.map((text) => {
  const needle = text.trim();
  const hits = [];
  for (const [ns, m] of Object.entries(maps)) {
    if (m.matchLang !== lang) continue;
    for (const [id, value] of Object.entries(m.data)) {
      if (typeof value === 'string' && value.trim() === needle) hits.push({ ns, id });
    }
  }
  let status = 'miss';
  if (hits.length === 1) status = 'reuse';
  else if (hits.length > 1) status = 'ambiguous';
  return { text, hits, status };
});

const output = { results };

if (includeKeys) {
  output.allKeys = Object.fromEntries(Object.entries(maps).map(([ns, m]) => [ns, Object.keys(m.data)]));
}

process.stdout.write(JSON.stringify(output, null, 2));
