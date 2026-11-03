import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile, readFile } from 'node:fs/promises';
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

test('backlinks: revocable RAG needs each successful bounded stage, not merely a local hash', () => {
 const t={kind:'scenario',name:'revocable-rag'};
 const m={schemaVersion:3,repository:manifest.repository,verifiedAt:pin,targets:{'revocable-rag':t},targetEvidence:{'revocable-rag':'v16'},qualifications:{v16:{kind:'independent-scenario',scenario:'revocable-rag',commit:other}},articles:[{slug:'027-rag-revocation-publish-replay',status:'verified',target:'revocable-rag',articleCommit:other}]};
 const stages=['independent-install','independent-build','independent-init','independent-start','independent-publication','independent-artifact-read','independent-revoke'];
 const evidence={kind:'revocable-rag-provider-free-code-qualification',version:'0.16.0',modelCalls:0,independent:{modelCalls:0,runId:'synthetic-run',documentId:'atlas-a',originalReportBytesRetained:true,beforeSha256:'a'.repeat(64),afterSha256:'a'.repeat(64),observations:[...stages.map(stage=>({stage,exitCode:0,...(stage==='independent-artifact-read'?{httpStatus:200,stdoutSha256:'a'.repeat(64)}:{})})),{stage:'independent-revoked-read',exitCode:2,expectedRefusal:true,readerHttpStatus:404}],report:{sha256:'a'.repeat(64),protection:{profile:'document-revocation@1',runId:'synthetic-run'}}}};
 const validate=e=>validateContract(m,{sourceCommit:pin,results:{}},source,{'revocable-rag':e});
 assert.equal(validate(evidence).pins['revocable-rag'],other);
 for(const stage of stages){const e=structuredClone(evidence);e.independent.observations=e.independent.observations.filter(o=>o.stage!==stage);assert.throws(()=>validate(e),/receipt/);}
 for(const mutate of [e=>e.independent.observations.pop(),e=>e.independent.observations.at(-1).exitCode=0,e=>e.independent.observations.at(-1).readerHttpStatus=200,e=>e.independent.report.protection.runId='other',e=>e.independent.afterSha256='b'.repeat(64)]){const e=structuredClone(evidence);mutate(e);assert.throws(()=>validate(e),/refusal|identity|bytes/);}
 const paid=structuredClone(evidence);paid.modelCalls=1;assert.throws(()=>validate(paid),/receipt/);
});

test('backlinks: revocable RAG requires visible exact source and both original CLI commands in each language', async () => {
 const c={verifiedAt:pin,pins:{rag:other},targets:{rag:{kind:'scenario',name:'revocable-rag'}},articles:[{slug:'rag-example',target:'rag',articleCommit:pin}]};
 const body=`[Original command owner](https://github.com/hpoenixf/open-etf-agent/blob/${other}/src/session-cli.mjs)\n\n\`\`\`bash\nnode src/session-cli.mjs init-documents --session ./test-output/revocable-demo --profile document-revocation@1\nnode src/session-cli.mjs start --session ./test-output/revocable-demo --profile document-revocation@1 --case revocable-rag\nnode src/session-cli.mjs publication --session ./test-output/revocable-demo --profile document-revocation@1 --run RUN_ID\nnode src/session-cli.mjs revoke-document --session ./test-output/revocable-demo --profile document-revocation@1 --document atlas-a --expected-revision 1\nnode src/session-cli.mjs publication --session ./test-output/revocable-demo --profile document-revocation@1 --run RUN_ID\n\`\`\``;
 const verify=text=>verifyArticles({contract:c,english:new Set(['rag-example']),paths:[],read:async()=>text});
 assert.equal((await verify(body)).checkedBodies,2);
 assert.equal((await verify(body.replace('[Original command owner]', '[`session-cli.mjs`]'))).checkedBodies,2);
 await assert.rejects(verify(body.replace('--case revocable-rag','--case unrelated')),/sequence/);
 await assert.rejects(verify(body.replace(other,pin)),/source/);
 const publication='node src/session-cli.mjs publication --session ./test-output/revocable-demo --profile document-revocation@1 --run RUN_ID';
 await assert.rejects(verify(body.replace(publication,'')),/sequence/);
 await assert.rejects(verify(body.replace('[Original command owner](', '`[Original command owner](').replace('/src/session-cli.mjs)', '/src/session-cli.mjs)`')),/source/);
 await assert.rejects(verify('<pre>'+body+'</pre>'),/non-prose/);
});

// A code-formatted filename is a visible clickable label, unlike an entire code-hidden link.
test('backlinks: legacy temporal source filename labels stay clickable', async () => {
 const pin='46c2822be9865b99696bb70fb9e0ff1b5257ff35',slug='temporal-example';
 const body='[`temporal.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/'+pin+'/src/temporal.mjs)\n\n```sh\n'+[
  'npm run temporal -- submit --session runs/article-time --run fixed '+String.fromCharCode(92),
  '--time-zone America/Los_Angeles --anchor 2026-10-28T00:30:00.000Z',
  'npm run temporal -- work --session runs/article-time --run fixed',
  'npm run temporal -- read --session runs/article-time --run fixed'
 ].join('\n')+'\n```';
 const result=await verifyArticles({contract:{verifiedAt:pin,articles:[{slug,target:'temporal'}],targets:{temporal:{kind:'scenario',name:'temporal'}}},english:new Set([slug]),paths:[],read:async()=>body});
 assert.equal(result.checkedBodies,2);
});

const tenReceipt=async name=>JSON.parse(await readFile(new URL(`../data/open-etf-agent/${name}`,import.meta.url),'utf8'));
const tenContract=(scenario,evidence)=>{
 const q={kind:'independent-scenario',scenario,commit:pin,evidenceCommit:other};
 const m={schemaVersion:3,repository:manifest.repository,verifiedAt:pin,targets:{[scenario]:{kind:'scenario',name:scenario}},targetEvidence:{[scenario]:'new-scenario'},qualifications:{'new-scenario':q},articles:[{slug:'real-ten-example',status:'verified',target:scenario,articleCommit:other}]};
 return validateContract(m,{sourceCommit:pin},source,{[scenario]:evidence});
};
test('backlinks: fixed real-ten scenarios retain separate source and evidence publication pins',async()=>{
 for(const [scenario,name] of [['shared-admission','v017-real-ten.safe.json'],['schedule-occurrence','v018-real-ten.safe.json']]) {
  const evidence=await tenReceipt(name),c=tenContract(scenario,evidence);
  assert.equal(c.pins[scenario],pin);assert.equal(c.evidencePins[scenario],other);
  for(const mutate of [r=>r.normalGate.planned=5,r=>r.normalGate.successes=8,r=>r.normalGate.tasks.pop(),r=>r.normalGate.tasks[1]=r.normalGate.tasks[0],r=>r.physicalRequests++]){const bad=structuredClone(evidence);mutate(bad);assert.throws(()=>tenContract(scenario,bad));}
 }
});
const scheduleCommands=[`INSTANT="$(node -e 'console.log(new Date(Date.now()+60000).toISOString())')"`,'node src/session-cli.mjs schedule-confirm --session runs/schedule-demo --schedule one-shot --revision 1 --instant "$INSTANT" --zone Asia/Shanghai --lateness 60000','node src/session-cli.mjs schedule-wake --session runs/schedule-demo --schedule one-shot --hash CONFIRMATION_HASH','node src/session-cli.mjs schedule-inspect --session runs/schedule-demo --schedule one-shot --hash CONFIRMATION_HASH','node src/session-cli.mjs schedule-publication --session runs/schedule-demo --schedule one-shot --hash CONFIRMATION_HASH'];
const admissionCommands=['node src/admission-demo.mjs normal output/admission-demo','node src/admission-demo.mjs unknown output/admission-demo'];
const tenBody=(scenario,commands)=>{
 const admission=scenario==='shared-admission',receipts=admission?['v017-real-ten.safe.json','v017-admission-offline.safe.json']:['v018-real-ten.safe.json','v018-schedule.safe.json'];
 return `[Original source](https://github.com/hpoenixf/open-etf-agent/blob/${pin}/src/${admission?'admission':'schedule'}.mjs)\n${receipts.map(name=>`[Separate evidence](https://github.com/hpoenixf/open-etf-agent/blob/${other}/docs/verification/${name})`).join('\n')}\n\n\`\`\`sh\n${commands.join('\n')}\n\`\`\``;
};
test('backlinks: Admission requires both original demos and independently pinned real-ten/offline receipts',async()=>{
 const scenario='shared-admission',c=tenContract(scenario,await tenReceipt('v017-real-ten.safe.json')),body=tenBody(scenario,admissionCommands);
 const verify=text=>verifyArticles({contract:c,english:new Set(['real-ten-example']),paths:[],read:async()=>text});
 assert.equal((await verify(body)).checkedBodies,2);
 for(const text of [body.replace(admissionCommands[0],''),body.replace(admissionCommands[1],''),body.replace('v017-real-ten.safe.json','v017-release.safe.json'),body.replace('v017-admission-offline.safe.json','other.json'),body.replaceAll(`/blob/${other}/`,`/blob/${pin}/`)])await assert.rejects(verify(text),/sequence|receipt/);
 await assert.rejects(verify(body.replace('/src/admission.mjs','/src/cli.mjs')),/source/);
});
test('backlinks: Schedule preserves ordered provider-free CLI separately from actual API qualification',async()=>{
 const scenario='schedule-occurrence',c=tenContract(scenario,await tenReceipt('v018-real-ten.safe.json')),body=tenBody(scenario,scheduleCommands);
 const verify=text=>verifyArticles({contract:c,english:new Set(['real-ten-example']),paths:[],read:async()=>text});
 assert.equal((await verify(body)).checkedBodies,2);
 for(const text of [body.replace(scheduleCommands[1],''),body.replace(scheduleCommands[1]+'\n'+scheduleCommands[2],scheduleCommands[2]+'\n'+scheduleCommands[1]),body.replace('CONFIRMATION_HASH','WRONG_HASH'),body.replace('v018-schedule.safe.json','v018-release.safe.json'),body.replace('v018-real-ten.safe.json','v018-release.safe.json')])await assert.rejects(verify(text),/sequence|receipt/);
 await assert.rejects(verify(body.replace('/src/schedule.mjs','/src/session-cli.mjs')),/source/);
});
