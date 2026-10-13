// Tests tools/fal-one.mjs's filter guard and safety default with a fake fal queue (no network, no spend).
//   node tools/tests/test-fal-one.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const PROJ = path.resolve(here, '..', '..');
const tool = path.join(PROJ, 'tools', 'fal-one.mjs');
const preload = pathToFileURL(path.join(here, 'fake-fal-preload.mjs')).href;
const work = fs.mkdtempSync(path.join(PROJ, 'tmp', 'test-fal-'));
const keyFile = path.join(os.tmpdir(), 'fake-fal-key-' + process.pid);
fs.writeFileSync(keyFile, 'fake:key');
let fails = 0;
const check = (name, cond, extra = '') => { console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  — ' + extra : '')); if (!cond) fails++; };

function run(kase, out, extraArgs = []) {
  const log = path.join(work, kase + '.' + path.basename(out) + '.log.jsonl');   // one log per run: runs share case names
  const r = spawnSync(process.execPath, ['--import', preload, tool, '--key-file', keyFile, '--out', out, '--prompt', 'test prompt', ...extraArgs],
    { cwd: PROJ, encoding: 'utf8', env: { ...process.env, FAKE_FAL_CASE: kase, FAKE_FAL_LOG: log } });
  const sent = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n').map((l) => JSON.parse(l)) : [];
  return { code: r.status, out: (r.stdout || '') + (r.stderr || ''), sent };
}
const rel = (f) => path.relative(PROJ, f).split(path.sep).join('/');

// 1. filtered: tiny 1024x768 result -> exit 3, evidence kept as .filtered.jpg with a FILTERED sidecar, no ok file
const f1 = path.join(work, 'a.jpg');
const r1 = run('filtered', rel(f1));
check('filtered: exit code 3', r1.code === 3, 'code ' + r1.code + ' ' + r1.out.trim().slice(0, 160));
check('filtered: evidence file kept', fs.existsSync(path.join(work, 'a.filtered.jpg')));
check('filtered: no ok output left', !fs.existsSync(f1));
const sc1 = path.join(work, 'a.filtered.jpg.json');
check('filtered: sidecar status FILTERED, billed', fs.existsSync(sc1) && JSON.parse(fs.readFileSync(sc1, 'utf8')).status === 'FILTERED' && JSON.parse(fs.readFileSync(sc1, 'utf8')).billed === true);
check('default safety_tolerance "5" sent', r1.sent[0] && r1.sent[0].body.safety_tolerance === '5', JSON.stringify(r1.sent[0] && r1.sent[0].body));

// 2. CONTROL ok: full-size result -> exit 0, file present, sidecar status ok
const f2 = path.join(work, 'b.jpg');
const r2 = run('ok', rel(f2));
check('CONTROL ok: exit code 0', r2.code === 0, 'code ' + r2.code + ' ' + r2.out.trim().slice(0, 160));
check('CONTROL ok: output present', fs.existsSync(f2));
check('CONTROL ok: sidecar status ok', fs.existsSync(f2 + '.json') && JSON.parse(fs.readFileSync(f2 + '.json', 'utf8')).status === 'ok');

// 3. nsfw flag on a full-size file -> filtered
const f3 = path.join(work, 'c.jpg');
const r3 = run('nsfw', rel(f3));
check('nsfw flag: exit code 3', r3.code === 3, 'code ' + r3.code);

// 4. caller's safety_tolerance is never overridden
const f4 = path.join(work, 'd.jpg');
const r4 = run('ok', rel(f4), ['--input', '{"safety_tolerance":"2","aspect_ratio":"16:9"}']);
check('caller safety_tolerance kept', r4.sent[0] && r4.sent[0].body.safety_tolerance === '2', JSON.stringify(r4.sent[0] && r4.sent[0].body));

fs.rmSync(keyFile, { force: true });
fs.rmSync(work, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exitCode = fails ? 1 : 0;
