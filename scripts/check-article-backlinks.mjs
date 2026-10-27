// Shared, read-only article/case contract. No downloaded code or Runtime case is executed.
import { readFile, readdir, lstat, realpath } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const CODE = 'hpoenixf/open-etf-agent', ARTICLES = 'hpoenixf/eff-agent-article';
const SHA = /^[a-f0-9]{40}$/, SLUG = /^[a-z0-9-]+$/;
const MANIFEST = 'docs/verification/article-coverage.json';
const RECEIPT = 'docs/verification/article-coverage-receipts.json';
const SOURCE = 'docs/verification/article-coverage-source.json';
const PIN = '.github/open-etf-code-source.json';
const ensure = (value, message) => { if (!value) throw new Error(message); };
const stable = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v);
const quote = value => "'" + value.replaceAll("'", "'\"'\"'") + "'";
const regex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function commandFor(id, target) {
 if (target.kind === 'test') return `node --test --test-concurrency=1 --test-name-pattern=${quote('^' + regex(target.name) + '$')} ${target.file}`;
 const output = `runs/article-${id}`;
 return `node src/cli.mjs --case ${target.case} --output ${output}` + (target.case === 'explicit-memory' ? ` --memory-library ${output}/synthetic-memory` : '');
}
export function validateContract(m, receipt, source) {
 ensure(m?.repository === CODE && SHA.test(m.verifiedAt), 'Invalid code contract execution pin');
 ensure(Array.isArray(m.articles) && m.articles.length <= 256 && m.targets && Object.keys(m.targets).length <= 16, 'Invalid bounded code contract');
 ensure(receipt?.sourceCommit === m.verifiedAt && source?.commit === m.verifiedAt, 'Receipt/source execution pin mismatch');
 const articles = [], targets = {}, slugs = new Set();
 for (const row of m.articles) {
  ensure(SLUG.test(row.slug) && !slugs.has(row.slug), 'Duplicate/invalid article contract'); slugs.add(row.slug);
  if (row.status !== 'verified') continue;
  const t = m.targets[row.target]; ensure(/^[a-z][a-z0-9-]*$/.test(row.target) && t, 'Unknown verified target');
  if (t.kind === 'test') ensure(/^test\/[a-z0-9-]+\.test\.mjs$/.test(t.file) && typeof t.name === 'string' && t.name.length > 0 && t.name.length <= 200 && !/[\r\n\0]/.test(t.name), 'Invalid test case');
  else ensure(t.kind === 'cli' && ['fixture-child','retrieve-reread','compact-and-reread','explicit-memory','skill-mcp','batch-read'].includes(t.case), 'Invalid CLI case');
  const r = receipt.results?.[row.target]; ensure(r?.exitCode === 0 && stable(r.target) === stable(t), 'Missing or mismatched successful case receipt');
  articles.push({ slug: row.slug, target: row.target }); targets[row.target] = t;
 }
 ensure(articles.length > 0, 'No verified contract');
 return { verifiedAt: m.verifiedAt, articles: articles.sort((a,b) => a.slug.localeCompare(b.slug)), targets };
}
export function sameContract(left, right) { ensure(stable(left) === stable(right), 'Article/code verified contract mismatch'); }
export function parseEnglishCatalog(text) {
 const match = text.match(/export const englishArticleSlugs\s*=\s*(\[[\s\S]*?\])/);
 ensure(match, 'English catalog format unavailable');
 let values; try { values = JSON.parse(match[1]); } catch { throw new Error('English catalog must remain a literal data array'); }
 ensure(values.every(v => typeof v === 'string' && SLUG.test(v)) && new Set(values).size === values.length, 'Invalid English catalog');
 return new Set(values);
}
function prosePosition(prefix) {
 let fence = null, comment = false;
 for (const line of prefix.split('\n')) {
  const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
  if (fence) { if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null; continue; }
  if (!comment && marker) { fence = marker[1]; continue; }
  for (const token of line.matchAll(/<!--|-->/g)) comment = token[0] === '<!--';
 }
 return !fence && !comment;
}
function validateBlock(text, id, target, pin, path) {
 const start = [...text.matchAll(/^ {0,3}<!-- open-etf-case:([a-z0-9-]+)@([a-f0-9]{40}) -->[ \t]*$/gm)];
 ensure(start.length === 1 && (text.match(/<!--\s*open-etf-case:/g) || []).length === 1 && (text.match(/<!-- \/open-etf-case -->/g) || []).length === 1, `Exactly one current case block required: ${path}`);
 ensure(start[0][1] === id && start[0][2] === pin, `Case target/pin identity mismatch: ${path}`);
 ensure(prosePosition(text.slice(0, start[0].index)), `Current case block must be in prose, not an outer fence/comment: ${path}`);
 const begin = start[0].index + start[0][0].length, end = text.indexOf('<!-- /open-etf-case -->');
 ensure(end > begin, `Invalid case block order: ${path}`);
 const visible = text.slice(begin, end).replace(/<!--[\s\S]*?-->/g, '');
 const file = target.kind === 'test' ? target.file : 'src/cli.mjs';
 const url = `https://github.com/${CODE}/blob/${pin}/${file}`;
 let fence = null, commands = [], prose = []; 
 for (const line of visible.split('\n')) {
  const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
  if (!fence) { if (marker) fence = marker[1]; else if (!/^( {4}|\t)/.test(line)) prose.push(line); }
  else if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
  else commands.push(line.trim());
 }
 const linkProse = prose.join('\n').replace(/(`+)[\s\S]*?\1/g, '');
 ensure(!/<(?:pre|code|script|style|textarea)\b/i.test(linkProse), `Unsupported non-prose case link: ${path}`);
 const links = [...linkProse.matchAll(/(?<![!\\])\[[^\[\]\n]+\]\((https:\/\/github\.com\/[^\s)]+)\)/g)];
 ensure(links.some(match => match[1] === url), `Missing visible exact case link: ${path}`);
 ensure(commands.includes(commandFor(id, target)), `Missing selected runnable command: ${path}`);
}
export async function verifyArticles({ contract, english, paths, read }) {
 const expected = new Map(), missingEnglish = [];
 for (const row of contract.articles) {
  expected.set(`articles/${row.slug}.md`, row);
  if (english.has(row.slug)) expected.set(`en/articles/${row.slug}.md`, row); else missingEnglish.push(row.slug);
 }
 for (const [path, row] of expected) validateBlock(await read(path), row.target, contract.targets[row.target], contract.verifiedAt, path);
 // Article CI inspects the current working tree, including claims outside the expected set.
 for (const path of paths) if (!expected.has(path)) ensure(!/<!--\s*open-etf-case:/.test(await read(path)), `Unexpected verified claim in unverified article: ${path}`);
 return { verifiedArticles: contract.articles.length, checkedBodies: expected.size, missingEnglish, verifiedAt: contract.verifiedAt };
}
async function localReader(root, path) {
 const full = join(root, path), s = await lstat(full);
 ensure(s.isFile() && !s.isSymbolicLink() && relative(root, await realpath(full)) === path, `Unsafe local file: ${path}`);
 return readFile(full, 'utf8');
}
async function localArticles(root, dir) {
 const result = [];
 for (const item of await readdir(join(root, dir), { withFileTypes: true })) {
  ensure(!item.isSymbolicLink(), 'Article symlink refused'); const path = `${dir}/${item.name}`;
  if (item.isDirectory()) result.push(...await localArticles(root, path)); else if (item.isFile() && path.endsWith('.md')) result.push(path);
 }
 return result;
}
function publicReader() {
 const cache = new Map(); let bytes = 0;
 return async (repository, commit, path) => {
  ensure([CODE, ARTICLES].includes(repository) && SHA.test(commit) && /^[a-zA-Z0-9_.\/-]+$/.test(path) && !path.split('/').some(v => !v || v === '.' || v === '..'), 'Unsafe fixed public read');
  const url = `https://raw.githubusercontent.com/${repository}/${commit}/${path}`;
  if (!cache.has(url)) cache.set(url, (async () => {
   const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15000) }); ensure(response.ok, `Fixed public read failed: HTTP ${response.status} ${path}`);
   const text = await response.text(); bytes += Buffer.byteLength(text); ensure(Buffer.byteLength(text) <= 1048576 && bytes <= 16777216, 'Public data size limit'); return text;
  })());
  return cache.get(url);
 };
}
async function readContract(read) { return validateContract(JSON.parse(await read(MANIFEST)), JSON.parse(await read(RECEIPT)), JSON.parse(await read(SOURCE))); }
function codePin(value) { ensure(value?.schemaVersion === 1 && value.repository === CODE && SHA.test(value.commit) && Object.keys(value).sort().join(',') === 'commit,repository,schemaVersion', 'Invalid fixed code-claim pin'); return value.commit; }
export async function checkArticles(root, remote = publicReader()) {
 const local = path => localReader(root, path), pin = codePin(JSON.parse(await local(PIN)));
 const contract = await readContract(path => remote(CODE, pin, path));
 return { mode: 'article-working-tree', codeClaimCommit: pin, ...await verifyArticles({ contract, english: parseEnglishCatalog(await local('book.en.mjs')), paths: [...await localArticles(root, 'articles'), ...await localArticles(root, 'en/articles')], read: local }) };
}
export async function checkCode(root, remote = publicReader()) {
 const local = path => localReader(root, path), manifest = JSON.parse(await local(MANIFEST)), contract = await readContract(local);
 ensure(manifest.articleCatalog?.repository === ARTICLES && SHA.test(manifest.articleCatalog.commit), 'Missing fixed article source'); const articleCommit = manifest.articleCatalog.commit;
 const article = path => remote(ARTICLES, articleCommit, path), pin = codePin(JSON.parse(await article(PIN)));
 sameContract(contract, await readContract(path => remote(CODE, pin, path)));
 const english = parseEnglishCatalog(await article('book.en.mjs'));
 return { mode: 'fixed-article-snapshot', articleCommit, codeClaimCommit: pin, ...await verifyArticles({ contract, english, paths: [], read: article }), scope: 'Fixed published pair; later remote article edits are checked by that repository own working-tree CI.' };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
 try { ensure(process.argv.length === 3 && ['--article', '--code'].includes(process.argv[2]), 'Usage: node scripts/check-article-backlinks.mjs --article|--code'); const root = dirname(dirname(fileURLToPath(import.meta.url))); console.log(JSON.stringify(await (process.argv[2] === '--article' ? checkArticles(root) : checkCode(root)), null, 2)); }
 catch (error) { console.error(error.message); process.exitCode = 1; }
}
