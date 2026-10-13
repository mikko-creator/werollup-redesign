// font-woff2.mjs - convert an open-licence TTF/OTF into a Latin-subset WOFF2 for the build (BUILD-CONTRACT 4.11), and
// copy its licence text next to it. Wraps Python fontTools (py -3 -m fontTools.subset / fontTools.varLib.instancer),
// installed 2026-10-13 (fonttools 4.66.1 + brotli, user scope). Deterministic for the same input and fontTools version.
//   node tools/font-woff2.mjs --in <font.ttf> --out assets/fonts/<name>.woff2 --license <OFL.txt>
//        [--pin "wdth=100,opsz=48"]   (variable fonts: pin axes first; unpinned axes such as wght stay variable)
//        [--unicodes <range>]         (default: the Google Fonts "latin" range)
// Refuses: a font whose name table names Helvetica or Agrandir (A3), and a missing licence file.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const a = {};
for (let i = 2; i < process.argv.length; i++) { const k = process.argv[i]; if (k.startsWith('--')) { const v = process.argv[i + 1]; if (v && !v.startsWith('--')) { a[k.slice(2)] = v; i++; } else a[k.slice(2)] = true; } }
if (!a.in || !a.out || !a.license) { console.error('need --in, --out and --license'); process.exit(2); }
if (!fs.existsSync(a.in)) { console.error('no such font: ' + a.in); process.exit(2); }
if (!fs.existsSync(a.license)) { console.error('no licence file: ' + a.license); process.exit(2); }
const lic = fs.readFileSync(a.license, 'utf8');
if (!/SIL Open Font License|Apache License/i.test(lic)) { console.error('licence file is neither SIL OFL nor Apache: refusing'); process.exit(2); }
const py = (args) => execFileSync('py', ['-3', ...args], { encoding: 'utf8' });
// name-table guard (A3): never ship Helvetica Neue Condensed or Agrandir, whatever the file is called
const names = py(['-c', 'import sys; from fontTools.ttLib import TTFont; f=TTFont(sys.argv[1]); print("|".join(str(r) for r in f["name"].names if r.nameID in (1,4,6)))', a.in]);
if (/helvetica|agrandir/i.test(names)) { console.error('refused (A3): the name table names ' + names.slice(0, 120)); process.exit(2); }
let src = a.in;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fontw2-'));
try {
  if (a.pin) {
    const pinned = path.join(tmp, 'pinned.ttf');
    py(['-m', 'fontTools.varLib.instancer', src, ...String(a.pin).split(',').map((s) => s.trim()).filter(Boolean), '-o', pinned]);
    src = pinned;
  }
  fs.mkdirSync(path.dirname(path.resolve(a.out)), { recursive: true });
  py(['-m', 'fontTools.subset', src, '--unicodes=' + (a.unicodes || LATIN), '--flavor=woff2', '--layout-features=*', '--output-file=' + path.resolve(a.out)]);
  const licOut = path.resolve(a.out).replace(/\.woff2$/i, '') + '.LICENSE.txt';
  fs.copyFileSync(a.license, licOut);
  const inB = fs.statSync(a.in).size, outB = fs.statSync(path.resolve(a.out)).size;
  console.log('ok ' + a.out + ' ' + outB + ' B (from ' + inB + ' B' + (a.pin ? ', pinned ' + a.pin : '') + '); licence -> ' + path.relative(process.cwd(), licOut));
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
