#!/usr/bin/env node
// Usage:
//   node plan.mjs <cache-dir> <config.json> <input.json> [--source-dir <dir>] [--prefix <id-prefix>] [--out <file>] [--include-occurrences]
//
// input.json:
//   { "texts": ["提交"], "lang": "zh_CN" }
//   { "items": [{ "text": "提交", "element": "btn.submit", "sourceFile": "src/..." }], "lang": "zh_CN" }
//
// Outputs a compact plan for user confirmation:
//   - reuse / ambiguous / create decisions
//   - inferred id prefix from source-dir existing i18n ids
//   - suggested create ids when element is known
//   - id conflicts for suggested ids
// Occurrences are compact by default. Use --include-occurrences for the full list.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

const [, , cacheDir, configPath, inputPath, ...args] = process.argv;
if (!cacheDir || !configPath || !inputPath) {
  console.error('usage: plan.mjs <cache-dir> <config.json> <input.json> [--source-dir <dir>] [--prefix <id-prefix>] [--out <file>] [--include-occurrences]');
  process.exit(2);
}

function readFlagValue(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

const sourceDir = readFlagValue('--source-dir');
const explicitPrefix = readFlagValue('--prefix')?.replace(/\.$/, '');
const outFile = readFlagValue('--out');
const includeOccurrences = args.includes('--include-occurrences');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
const lang = input.lang ?? 'zh_CN';
const items = normalizeItems(input);
const maps = loadMaps(cacheDir, config);
const idPrefix = explicitPrefix ?? inferPrefix(sourceDir);
const allKeys = Object.fromEntries(Object.entries(maps).map(([ns, m]) => [ns, Object.keys(m.data)]));
const allKeySet = new Set(Object.values(allKeys).flat());

const planItems = items.map((item) => {
  const hits = lookupHits(item.text);
  const occurrences = findOccurrences(item.text, sourceDir);
  const base = {
    text: item.text,
    sourceFile: item.sourceFile,
    element: item.element,
    occurrenceCount: occurrences.length,
    firstOccurrences: occurrences.slice(0, 3),
    ...(includeOccurrences ? { occurrences } : {}),
    hits,
  };

  if (hits.length === 1) {
    return {
      ...base,
      status: 'reuse',
      reuse: hits[0],
      csv: false,
      codeMode: base.occurrenceCount ? 'code-linked-candidate' : 'text-only',
    };
  }

  if (hits.length > 1) {
    return {
      ...base,
      status: 'ambiguous',
      candidates: hits,
      csv: false,
      codeMode: base.occurrenceCount ? 'code-linked-candidate' : 'text-only',
    };
  }

  const suggestedId = idPrefix && item.element ? `${idPrefix}.${item.element}` : undefined;
  const conflicts = suggestedId && allKeySet.has(suggestedId) ? findKeyNamespaces(suggestedId) : [];
  return {
    ...base,
    status: 'create',
    suggestedId,
    conflicts,
    csv: true,
    codeMode: base.occurrenceCount ? 'code-linked-candidate' : 'text-only',
    needs: [
      ...(idPrefix ? [] : ['idPrefix']),
      ...(item.element ? [] : ['element']),
      ...(conflicts.length ? ['conflictResolution'] : []),
    ],
  };
});

const output = {
  lang,
  idPrefix: idPrefix
    ? {
        value: idPrefix,
        source: explicitPrefix ? 'explicit' : 'source-dir',
      }
    : undefined,
  sourceDir,
  items: planItems,
  summary: {
    reuse: planItems.filter((item) => item.status === 'reuse').length,
    create: planItems.filter((item) => item.status === 'create').length,
    ambiguous: planItems.filter((item) => item.status === 'ambiguous').length,
    needsInput: planItems.filter((item) => item.needs?.length).length,
  },
};

const json = `${JSON.stringify(output, null, 2)}\n`;
if (outFile) {
  mkdirSync(dirname(resolve(outFile)), { recursive: true });
  writeFileSync(outFile, json, 'utf8');
  process.stdout.write(resolve(outFile));
} else {
  process.stdout.write(json);
}

function normalizeItems(src) {
  if (Array.isArray(src.items)) {
    return src.items.map((item) => ({
      text: String(item.text ?? ''),
      element: item.element ? String(item.element).replace(/^\.+|\.+$/g, '') : undefined,
      sourceFile: item.sourceFile,
    })).filter((item) => item.text);
  }
  return (src.texts ?? []).map((text) => ({ text: String(text) })).filter((item) => item.text);
}

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
    return new Function(`return ${stripped}`)();
  }
}

function loadMaps(dir, cfg) {
  const loaded = {};
  for (const [ns, meta] of Object.entries(cfg.namespaces)) {
    const file = resolve(dir, `${ns}.json`);
    try {
      loaded[ns] = {
        matchLang: meta.matchLang,
        writable: !!meta.writable,
        data: parseJsonp(readFileSync(file, 'utf8')),
      };
    } catch (e) {
      console.error(`[warn] cannot load ${ns}: ${e.message}`);
      loaded[ns] = { matchLang: meta.matchLang, writable: !!meta.writable, data: {} };
    }
  }
  return loaded;
}

function lookupHits(text) {
  const needle = text.trim();
  const hits = [];
  for (const [ns, m] of Object.entries(maps)) {
    if (m.matchLang !== lang) continue;
    for (const [id, value] of Object.entries(m.data)) {
      if (typeof value === 'string' && value.trim() === needle) {
        hits.push({ ns, id });
      }
    }
  }
  return hits;
}

function findKeyNamespaces(id) {
  return Object.entries(allKeys)
    .filter(([, keys]) => keys.includes(id))
    .map(([ns]) => ns);
}

function inferPrefix(dir) {
  if (!dir || !existsSync(dir)) return undefined;
  const files = listSourceFiles(dir);
  const counts = new Map();

  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const re = /\bid\s*:\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = re.exec(src))) {
      const id = match[1];
      const parts = id.split('.');
      if (parts[0] !== 'crmweb' || parts.length < 4) continue;
      const prefix = parts.slice(0, 3).join('.');
      counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
}

function listSourceFiles(dir) {
  const out = [];
  const allowed = new Set(['.ts', '.tsx', '.js', '.jsx']);

  function walk(current) {
    for (const name of readdirSync(current)) {
      const file = join(current, name);
      const st = statSync(file);
      if (st.isDirectory()) {
        if (name === 'node_modules' || name === '.git') continue;
        walk(file);
      } else if (allowed.has(extname(file))) {
        out.push(file);
      }
    }
  }

  walk(dir);
  return out;
}

function findOccurrences(text, dir) {
  if (!dir || !existsSync(dir)) return [];
  const files = listSourceFiles(dir);
  const occurrences = [];
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      if (line.includes(text)) {
        occurrences.push({ file, line: index + 1 });
      }
    });
  }
  return occurrences;
}
