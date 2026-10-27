import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { validateContract, verifyArticles, sameContract, commandFor, parseEnglishCatalog, checkArticles, checkCode } from './check-article-backlinks.mjs';
const pin = '2'.repeat(40), other = '3'.repeat(40);
const target = { kind: 'test', file: 'test/worker-cli.test.mjs', name: '9.1 original Run (same identity)' };
const manifest = { repository: 'hpoenixf/open-etf-agent', verifiedAt: pin, targets: { worker: target }, articles: [{ slug: 'worker-example', status: 'verified', target: 'worker' }, { slug: 'not-public', status: '无公开对应', target: null }] };
const receipt = { sourceCommit: pin, results: { worker: { exitCode: 0, target } } };
const source = { commit: pin };
const contract = () => validateContract(structuredClone(manifest), structuredClone(receipt), source);
const block = () => `<!-- open-etf-case:worker@${pin} -->\n[Exact case](https://github.com/hpoenixf/open-etf-agent/blob/${pin}/${target.file})\n\n\`\`\`bash\n${commandFor('worker', target)}\n\`\`\`\n<!-- /open-etf-case -->`;
const data = () => new Map([['articles/worker-example.md', block()], ['en/articles/worker-example.md', block()], ['articles/not-public.md', 'Not implemented.']]);
const options = (files = data()) => ({ contract: contract(), english: new Set(['worker-example']), paths: [...files.keys()], read: async path => { if (!files.has(path)) throw new Error('missing file ' + path); return files.get(path); } });
test('backlinks: checks both existing languages against the exact execution pin and selected case', async () => { const result = await verifyArticles(options()); assert.equal(result.checkedBodies, 2); assert.equal(result.verifiedArticles, 1); });
test('backlinks: missing block cannot pass on a bare repository link', async () => { const files = data(); files.set('articles/worker-example.md', 'https://github.com/hpoenixf/open-etf-agent'); await assert.rejects(verifyArticles(options(files)), /case block/i); });
test('backlinks: an introduction or old verification SHA is not the current execution pin', async () => { const files = data(); files.set('articles/worker-example.md', block().replaceAll(pin, other)); await assert.rejects(verifyArticles(options(files)), /pin|identity/i); });
test('backlinks: wrong target ID fails even if the source commit exists', async () => { const files = data(); files.set('articles/worker-example.md', block().replace('case:worker@', 'case:other@')); await assert.rejects(verifyArticles(options(files)), /target|identity/i); });
test('backlinks: a case link without the selected runnable command fails', async () => { const files = data(); files.set('articles/worker-example.md', block().replace(commandFor('worker', target), 'node --test test/other.test.mjs')); await assert.rejects(verifyArticles(options(files)), /command/i); });
test('backlinks: invisible comments do not satisfy the visible fixed-source link', async () => { const files = data(); files.set('articles/worker-example.md', block().replace('[Exact case](', '<!-- ').replace(`${target.file})`, `${target.file} -->`)); await assert.rejects(verifyArticles(options(files)), /visible|link/i); });
test('backlinks: wrong source file fails even with the right commit and command', async () => { const files = data(); files.set('articles/worker-example.md', block().replace(`/blob/${pin}/${target.file}`, `/blob/${pin}/test/wrong.test.mjs`)); await assert.rejects(verifyArticles(options(files)), /visible|link/i); });
test('backlinks: duplicate current-case blocks are refused', async () => { const files = data(); files.set('articles/worker-example.md', block() + '\n' + block()); await assert.rejects(verifyArticles(options(files)), /case block/i); });
test('backlinks: unverified articles cannot add a current verified-case claim', async () => { const files = data(); files.set('articles/not-public.md', block()); await assert.rejects(verifyArticles(options(files)), /unverified|unexpected/i); });
test('backlinks: registered English body deletion fails rather than shrinking coverage', async () => { const files = data(); files.delete('en/articles/worker-example.md'); await assert.rejects(verifyArticles(options(files)), /missing/i); });
test('backlinks: absent English edition is reported, not invented or counted', async () => { const files = data(); files.delete('en/articles/worker-example.md'); const result = await verifyArticles({ ...options(files), english: new Set() }); assert.equal(result.checkedBodies, 1); assert.deepEqual(result.missingEnglish, ['worker-example']); });
test('backlinks: mismatched or unsuccessful immutable receipts fail closed', () => { assert.throws(() => validateContract(manifest, { ...receipt, sourceCommit: other }, source), /receipt|source/i); assert.throws(() => validateContract(manifest, { ...receipt, results: { worker: { exitCode: 1, target } } }, source), /receipt/i); });
test('backlinks: code and article pins must describe the same verified target contract', () => { const changed = structuredClone(manifest); changed.targets.worker.name = 'Changed case'; const changedReceipt = { sourceCommit: pin, results: { worker: { exitCode: 0, target: changed.targets.worker } } }; assert.throws(() => sameContract(contract(), validateContract(changed, changedReceipt, source)), /contract/i); });
test('backlinks: parse the existing English catalog as data, never execute downloaded JavaScript', () => { assert.deepEqual([...parseEnglishCatalog('export const englishArticleSlugs = ["worker-example"] // known format')], ['worker-example']); assert.throws(() => parseEnglishCatalog('export const englishArticleSlugs = runRemoteCode()'), /catalog/i); });
test('backlinks: read failures remain failures, not an empty article list', async () => { await assert.rejects(verifyArticles({ ...options(), read: async () => { throw new Error('read denied'); } }), /read denied/); });
test('backlinks: a link displayed as code is not a clickable evidence link', async () => { const files = data(); files.set('articles/worker-example.md', block().replace('[Exact case](', '```text\n[Exact case](').replace(`${target.file})`, target.file + ')\n```')); await assert.rejects(verifyArticles(options(files)), /visible|link/i); });

async function localTree(entries) {
 await mkdir('test-output', { recursive: true }); const root = await mkdtemp(resolve('test-output/backlinks-'));
 for (const [path, text] of entries) { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), text); }
 return root;
}
const claim = { schemaVersion: 1, repository: 'hpoenixf/open-etf-agent', commit: '4'.repeat(40) };
const claimRead = async (repository, commit, path) => {
 assert.equal(repository, claim.repository); assert.equal(commit, claim.commit);
 const files = { 'docs/verification/article-coverage.json': manifest, 'docs/verification/article-coverage-receipts.json': receipt, 'docs/verification/article-coverage-source.json': source };
 assert.ok(files[path]); return JSON.stringify(files[path]);
};
test('backlinks: article CI rereads current working-tree edits while its code pin stays fixed', async () => {
 const files = data(); files.set('.github/open-etf-code-source.json', JSON.stringify(claim)); files.set('book.en.mjs', 'export const englishArticleSlugs = ["worker-example"]');
 const root = await localTree(files); assert.equal((await checkArticles(root, claimRead)).checkedBodies, 2);
 await writeFile(join(root, 'articles/worker-example.md'), 'Accidentally removed the current example.');
 await assert.rejects(checkArticles(root, claimRead), /case block/);
});
test('backlinks: code CI reads its fixed article source and compares the article code-claim contract', async () => {
 const m = { ...manifest, articleCatalog: { repository: 'hpoenixf/eff-agent-article', commit: '5'.repeat(40) } };
 const root = await localTree(new Map([['docs/verification/article-coverage.json', JSON.stringify(m)], ['docs/verification/article-coverage-receipts.json', JSON.stringify(receipt)], ['docs/verification/article-coverage-source.json', JSON.stringify(source)]]));
 const files = data(); files.set('.github/open-etf-code-source.json', JSON.stringify(claim)); files.set('book.en.mjs', 'export const englishArticleSlugs = ["worker-example"]');
 const remote = async (repository, commit, path) => { if (repository === claim.repository) return claimRead(repository, commit, path); assert.equal(repository, m.articleCatalog.repository); assert.equal(commit, m.articleCatalog.commit); assert.ok(files.has(path)); return files.get(path); };
 const result = await checkCode(root, remote); assert.equal(result.articleCommit, m.articleCatalog.commit); assert.equal(result.checkedBodies, 2);
});
test('backlinks: inline-code text is not a visible evidence link', async () => { const files = data(); files.set('articles/worker-example.md', block().replace('[Exact case](', '`[Exact case](').replace(`${target.file})`, `${target.file})` + '`')); await assert.rejects(verifyArticles(options(files)), /visible|link/i); });
test('backlinks: a complete case block hidden inside an outer-code fence is rejected', async () => { const files = data(); files.set('articles/worker-example.md', '````text\n' + block() + '\n````'); await assert.rejects(verifyArticles(options(files)), /case block|prose|fence/i); });
test('backlinks: an indented-code line is not a visible evidence link', async () => { const files = data(); files.set('articles/worker-example.md', block().replace('[Exact case](', '    [Exact case](')); await assert.rejects(verifyArticles(options(files)), /visible|link/i); });
test('backlinks: image notation cannot stand in for a clickable evidence link', async () => { const files = data(); files.set('articles/worker-example.md', block().replace('[Exact case](', '![Exact case](')); await assert.rejects(verifyArticles(options(files)), /visible|link/i); });
test('backlinks: an escaped opening bracket cannot stand in for a clickable evidence link', async () => { const files = data(); files.set('articles/worker-example.md', block().replace('[Exact case](', '\\[Exact case](')); await assert.rejects(verifyArticles(options(files)), /visible|link/i); });
