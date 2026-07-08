#!/usr/bin/env node
// Computes the app-weight metrics row for docs/APP_WEIGHT_LOG.md.
// Usage:  npm run build && node scripts/app-metrics.mjs [--append]
//   --append  writes the row into docs/APP_WEIGHT_LOG.md under the metrics table
import { readFileSync, readdirSync, statSync, appendFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function walk(dir, filter) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, filter));
    else if (filter(p)) out.push(p);
  }
  return out;
}

const pages = walk(join(root, 'src/pages'), p => p.endsWith('.jsx')).length;
const components = walk(join(root, 'src/components'), p => p.endsWith('.jsx')).length;
const entities = walk(join(root, 'base44/entities'), p => p.endsWith('.jsonc')).length;
const functions = walk(join(root, 'base44/functions'), p => /entry\.(ts|js)$/.test(p)).length;

const srcFiles = walk(join(root, 'src'), p => ['.jsx', '.js', '.css'].includes(extname(p)));
const loc = srcFiles.reduce((n, f) => n + readFileSync(f, 'utf8').split('\n').length, 0);

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const deps = Object.keys(pkg.dependencies || {}).length;

const assets = walk(join(root, 'dist/assets'), () => true);
const jsBytes = assets.filter(p => p.endsWith('.js')).reduce((n, f) => n + statSync(f).size, 0);
const cssBytes = assets.filter(p => p.endsWith('.css')).reduce((n, f) => n + statSync(f).size, 0);
const bundleNote = assets.length ? '' : ' (run `npm run build` first for bundle sizes)';

let commit = 'n/a';
try { commit = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim(); } catch {}

const date = new Date().toISOString().slice(0, 10);
const kb = b => b ? `${(b / 1024).toFixed(0)} KB` : 'n/a';
const row = `| ${date} | ${commit} | ${pages} | ${components} | ${entities} | ${functions} | ${loc.toLocaleString('en-US')} | ${deps} | ${kb(jsBytes)} | ${kb(cssBytes)} |`;

console.log(`\nApp weight @ ${commit}${bundleNote}`);
console.log('| Date | Commit | Pages | Components | Entities | Functions | src LOC | Deps | JS bundle | CSS |');
console.log(row);

if (process.argv.includes('--append')) {
  const logPath = join(root, 'docs/APP_WEIGHT_LOG.md');
  appendFileSync(logPath, row + '\n');
  console.log(`\nAppended to ${logPath}`);
}
