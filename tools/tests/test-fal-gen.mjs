// Tests tools/fal-gen.mjs's FILTERED guard and safety default in a throwaway copy (no network, no spend, and the real
// audit/generated-images.json ledger is never touched: PROJ resolves to the copy).
//   node tools/tests/test-fal-gen.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const REAL = path.resolve(here, '..', '..');
const preload = pathToFileURL(path.join(here, 'fake-fal-preload.mjs')).href;
let fails = 0;
const check = (name, cond, extra = '') => { console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  — ' + extra : '')); if (!cond) fails++; };

const ledgerBefore = fs.existsSync(path.join(REAL, 'audit', 'generated-images.json')) ? fs.readFileSync(path.join(REAL, 'audit', 'generated-images.json'), 'utf8') : null;
const keyFile = path.join(os.tmpdir(), 'fake-falgen-key-' + process.pid);
fs.writeFileSync(keyFile, 'fake:key');
const jpg = path.join(os.tmpdir(), 'fake-falgen-' + process.pid + '.jpg');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=1600x900', '-frames:v', '1', '-q:v', '2', jpg]);

function makeProj() {
  const p = fs.mkdtempSync(path.join(REAL, 'tmp', 'test-falgen-'));
  fs.mkdirSync(path.join(p, 'tools'), { recursive: true });
  for (const f of ['fal-gen.mjs', 'ai-label.mjs', 'ai-label.xmp']) fs.copyFileSync(path.join(REAL, 'tools', f), path.join(p, 'tools', f));
  fs.mkdirSync(path.join(p, 'audit'), { recursive: true });
  fs.writeFileSync(path.join(p, 'plan.json'), JSON.stringify({ defaults: { model: 'fal-ai/flux-pro/v1.1-ultra', input: { aspect_ratio: '16:9' } }, images: [{ id: 'T1', prompt: 'test', role: 'test', alt: '' }] }));
  return p;
}
function run(p, kase) {
  const log = path.join(p, kase + '.log.jsonl');
  const r = spawnSync(process.execPath, ['--import', preload, path.join(p, 'tools', 'fal-gen.mjs'), '--plan', 'plan.json', '--key-file', keyFile],
    { cwd: p, encoding: 'utf8', env: { ...process.env, FAKE_FAL_CASE: kase, FAKE_FAL_LOG: log, FAKE_FAL_BIG_FILE: jpg } });
  const sent = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n').map((l) => JSON.parse(l)) : [];
  const rec = fs.existsSync(path.join(p, 'audit', 'generated-images.json')) ? JSON.parse(fs.readFileSync(path.join(p, 'audit', 'generated-images.json'), 'utf8')) : null;
  return { out: (r.stdout || '') + (r.stderr || ''), sent, rec };
}

// 1. filtered result: slot recorded as FILTERED failure, call still booked, raw kept, nothing in assets/generated
const p1 = makeProj();
const r1 = run(p1, 'filtered');
check('filtered: failure recorded as FILTERED', !!(r1.rec && (r1.rec.failures || []).some((f) => f.id === 'T1' && /^FILTERED/.test(f.reason))), r1.out.trim().split('\n').slice(-2).join(' | ').slice(0, 220));
check('filtered: the call is still booked', !!(r1.rec && r1.rec.spend && r1.rec.spend.ultraCalls === 1));
check('filtered: raw kept as evidence', fs.existsSync(path.join(p1, 'tmp', 'img', 'raw')) && fs.readdirSync(path.join(p1, 'tmp', 'img', 'raw')).length === 1);
check('filtered: no generated file shipped', !fs.existsSync(path.join(p1, 'assets', 'generated', 't1.jpg')));
check('default safety_tolerance "5" sent', r1.sent[0] && r1.sent[0].body.safety_tolerance === '5', JSON.stringify(r1.sent[0] && r1.sent[0].body).slice(0, 160));

// 2. CONTROL ok: a full-size result is labelled and shipped
const p2 = makeProj();
const r2 = run(p2, 'ok');
check('CONTROL ok: generated file shipped', fs.existsSync(path.join(p2, 'assets', 'generated', 't1.jpg')), r2.out.trim().split('\n').slice(-2).join(' | ').slice(0, 220));
check('CONTROL ok: no failure recorded', !!(r2.rec && !(r2.rec.failures || []).length));

// 3. the real ledger is untouched
const ledgerAfter = fs.existsSync(path.join(REAL, 'audit', 'generated-images.json')) ? fs.readFileSync(path.join(REAL, 'audit', 'generated-images.json'), 'utf8') : null;
check('real ledger untouched', ledgerBefore === ledgerAfter);

for (const p of [p1, p2]) fs.rmSync(p, { recursive: true, force: true });
fs.rmSync(keyFile, { force: true }); fs.rmSync(jpg, { force: true });
console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exitCode = fails ? 1 : 0;
