// site.mjs - build constants and small shared helpers (PIPELINE). Node builtins only.
// The project root is derived from this file's location (never a hard-coded home path).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ORIGIN = 'https://werollup.com';
export const SITE_NAME = 'We Roll Up';
/** BUILD-CONTRACT 3.1: the build date is a constant, so two builds are byte-identical. It is the crawl date. */
export const BUILD_DATE = '2026-10-13';
/** the licence line printed in every footer (verbatim, audit/raw/*.html footer Quick Links, 91/91 pages) */
export const LICENCE = 'Cannabis License: C10-0000854-LIC';

export const rel = (...p) => path.join(ROOT, ...p);
export const readJSON = (r) => JSON.parse(fs.readFileSync(path.join(ROOT, r), 'utf8'));
export const readText = (r) => fs.readFileSync(path.join(ROOT, r), 'utf8');
export const exists = (r) => fs.existsSync(path.join(ROOT, r));

/** write only when the bytes differ (output is identical either way; mtimes stay quiet) */
export function writeIfChanged(abs, data) {
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
  if (fs.existsSync(abs) && fs.readFileSync(abs).equals(buf)) return false;
  fs.writeFileSync(abs, buf);
  return true;
}

/** deterministic JSON: keys in insertion order (callers build objects in a fixed order), undefined dropped */
export function json(obj, indent = 1) { return JSON.stringify(obj, (k, v) => (v === undefined ? undefined : v), indent) + '\n'; }

/** byte-wise string compare for sorts (locale-independent, deterministic) */
export const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
