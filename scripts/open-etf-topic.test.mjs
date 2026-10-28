import test from 'node:test'
import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { topicGroups, topicPath, versions, qualification, catalogCount } from '../open-etf-topic.mjs'
import { localizedSitePath } from '../language-routing.mjs'
const root = fileURLToPath(new URL('../',import.meta.url))
test('one module catalog, independent coverage qualification',()=>{
 const rows=topicGroups().flatMap(g=>g.articles)
 assert.equal(new Set(rows.map(r=>r.slug)).size,catalogCount)
 assert.equal(rows.filter(r=>r.status==='limited').length,16)
 const pdf=rows.find(r=>r.slug==='024-agent-pdf-from-text-to-evidence')
 assert.equal(pdf.status,'limited')
 assert.equal(pdf.since,'0.11')
 assert.match(pdf.scope,/local text-layer PDF/i)
 assert.match(pdf.scope,/no OCR/i)
 assert.match(pdf.scope,/active-parse recovery/i)
 assert.match(pdf.evidence,/\/blob\/[0-9a-f]{40}\/test\/pdf-cli\.test\.mjs$/)
 assert.equal(qualification.count,31)
 assert.equal(qualification.semanticStatus,'unreviewed')
 for(const row of rows) {
  assert.ok(existsSync(root+row.href+'.md'),row.href)
  if(row.status!=='limited') { assert.equal(row.evidence,null); assert.equal(row.since,undefined) }
 }
})
test('both locales route under the actual deployment base without redirect dependence',()=>{
 for(const language of ['en','zh']) {
  const route=topicPath(language)
  assert.ok(existsSync(root+route+'.md'))
  assert.equal(localizedSitePath('open-etf-agent',language,[]),route)
  for(const row of topicGroups(language).flatMap(g=>g.articles)) assert.ok(existsSync(root+row.href+'.md'),row.href)
 }
 const component=readFileSync(root+'.vitepress/theme/OpenEtfTopic.vue','utf8')
 assert.ok(component.includes('withBase(article.href)'))
 assert.ok(component.includes('withBase(topicPath(\'zh\'))'))
 assert.ok(component.includes('aria-current'))
 assert.ok(component.includes('focus-visible'))
 assert.ok(component.includes('@media(max-width:760px)'))
})
test('fixed version identity is not promoted into a release registry',()=>{
 const lineage=JSON.parse(readFileSync(root+'data/open-etf-agent/versions.json','utf8'))
 assert.equal(lineage.kind,'public-code-lineage-not-release-registry')
 const expected=Object.keys(lineage.versions).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))
 assert.deepEqual(versions.map(v=>v.version),expected)
 for(const v of versions) {
  assert.equal(v.commit,lineage.versions[v.version].commit)
  assert.equal(v.tree,lineage.versions[v.version].tree)
  assert.match(v.href,/\/tree\/[0-9a-f]{40}$/)
  assert.equal(v.href,`https://github.com/${lineage.repository}/tree/${lineage.versions[v.version].commit}`)
 }
 assert.equal(versions.find(v=>v.version==='0.12').href,'https://github.com/hpoenixf/open-etf-agent/tree/46c2822be9865b99696bb70fb9e0ff1b5257ff35')
 assert.equal(versions.find(v=>v.version==='0.13').href,'https://github.com/hpoenixf/open-etf-agent/tree/300f78f7066ab76fcc4e9efb54137ff021ecc278')
})
test('homepage discoverability is bilingual and English first',()=>{
 for(const file of ['index.md','en/index.md']) assert.ok(readFileSync(root+file,'utf8').includes('<OpenEtfTopicEntry />'))
 const entry=readFileSync(root+'.vitepress/theme/OpenEtfTopicEntry.vue','utf8')
 assert.ok(entry.indexOf("withBase('/en/open-etf-agent')")<entry.indexOf("withBase('/open-etf-agent')"))
})

test('offline snapshot validation is explicitly not a publication readback',()=>{
 const result=JSON.parse(execFileSync(process.execPath,[root+'scripts/sync-open-etf-topic.mjs','--check-local'],{encoding:'utf8'}))
 assert.equal(result.mode,'--check-local')
 assert.equal(result.publicationBytesVerified,false)
 assert.equal(result.snapshots,4)
 assert.equal(result.qualificationCommit,qualification.commit)
})
