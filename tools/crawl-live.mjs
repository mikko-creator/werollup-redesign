#!/usr/bin/env node
// Launches the patched local crawler (tools/sr-local/sr-crawl.mjs) against werollup.com.
// Derived from capecodcannabis-reforge/tools/crawl-live.mjs (2026-10-12). The patterns live here, in a file, because a
// shell can collapse their backslashes. Extra args pass through (e.g. --checkpoint 25, --max N).
//
// EXCLUDE — never requested, counted as counts.excludedByPattern with a sample in discovery:
//   ?s= is site search; ?replytocom= duplicates a post; /feed is RSS; /wp-json, xmlrpc.php, wp-login.php and
//   /wp-admin are endpoints (robots.txt also disallows /wp-admin/). normalizeUrl strips trailing slashes, so no
//   pattern may require one.
// No DEFER: the product catalogue is Jane's partner-hosted embed on iheartjane.com (store 4281), not pages on this host.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const EXCLUDE = '[?&](s|replytocom|share|print)=|/feed(/|$|\\?)|/wp-json(/|$|\\?)|xmlrpc\\.php|/wp-login\\.php|/wp-admin(/|$|\\?)';

// Spawn ONLY when executed directly; importing this file to read EXCLUDE must stay side-effect free.
const IS_MAIN = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
// Breakers ON by default (capecodcannabis lockout, 2026-10-12): stop at the first 403 (and ledger the host), stop on a
// burst of 8 x 404 in 5 minutes, never re-request a URL already recorded as 404/410. --no-sitemap-guess: only the
// sitemaps robots.txt declares. The project ledger (audit/scan-blocked-hosts.json) is enforced through SR_BLOCK_LEDGER.
export const BREAKERS = ['--stop-on-403', '--max-404', '8', '--window-min', '5', '--skip-known-404', '--no-sitemap-guess'];
if (IS_MAIN) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const proj = path.resolve(here, '..');
  const crawler = path.join(here, 'sr-local', 'sr-crawl.mjs');
  const args = [crawler, '--project', proj, '--exclude', EXCLUDE, ...BREAKERS, ...process.argv.slice(2)];
  const env = { ...process.env, SR_BLOCK_LEDGER: path.join(proj, 'audit', 'scan-blocked-hosts.json') };
  const child = spawn(process.execPath, args, { stdio: 'inherit', env });
  child.on('exit', (code) => process.exit(code ?? 1));
}
