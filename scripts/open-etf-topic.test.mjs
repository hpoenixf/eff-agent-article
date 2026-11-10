import './project-listings-render.test.mjs'
import './project-layout.test.mjs'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { topicGroups, topicPath, versions, qualification, catalogCount } from '../open-etf-topic.mjs'
import { localizedSitePath } from '../language-routing.mjs'
const coverage=JSON.parse(readFileSync(new URL('../data/open-etf-agent/article-coverage.json',import.meta.url),'utf8'))
const root = fileURLToPath(new URL('../',import.meta.url))
test('one module catalog, independent coverage qualification',()=>{
 const rows=topicGroups().flatMap(g=>g.articles)
 assert.equal(new Set(rows.map(r=>r.slug)).size,catalogCount)
 assert.deepEqual(rows.filter(r=>r.status==='limited').map(r=>r.slug).sort(),coverage.articles.filter(a=>[a,...(a.additionalTargets || [])].some(slice=>slice.status==='verified')).map(a=>a.slug).sort())
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
})
test('Open ETF topic stays discoverable in the directory, without homepage promotional blocks',()=>{
 const config=readFileSync(root+'.vitepress/config.mts','utf8')
 for(const route of ['/open-etf-agent','/en/open-etf-agent']) assert.ok(config.includes("link: '"+route+"'"))
 for(const file of ['index.md','en/index.md']) {
  const home=readFileSync(root+file,'utf8')
  for(const component of ['OpenEtfTopicEntry','FlagshipEntry','HomeOverview','WeChatFollow','OpenSourceBridge']) assert.ok(!home.includes('<'+component),component)
  assert.ok(!/^> /m.test(home),'No stacked editorial callouts')
  assert.ok(home.includes('<RecentArticles />'))
  assert.ok(home.includes('<ContinueReading />'))
  assert.ok(home.includes('agent-in-15-minutes'))
  assert.ok(!home.includes('10 年开发经验') && !home.includes('10 years of software'))
 }
 const about=readFileSync(root+'about.md','utf8')
 assert.ok(about.includes('10 年开发经验，5 年金融业务系统研发经验'))
 assert.ok(about.includes('10 years of software development experience'))
 assert.ok(about.includes('<WeChatFollow />'))
 assert.ok(about.includes('https://hpoenixf.com/about'))
 const qr=readFileSync(root+'.vitepress/theme/WeChatFollow.vue','utf8')
 assert.ok(qr.includes("withBase('/images/wechat-public-account.jpg')"))
 assert.ok(existsSync(root+'public/images/wechat-public-account.jpg'))
})

test('offline snapshot validation is explicitly not a publication readback',()=>{
 const result=JSON.parse(execFileSync(process.execPath,[root+'scripts/sync-open-etf-topic.mjs','--check-local'],{encoding:'utf8'}))
 assert.equal(result.mode,'--check-local')
 assert.equal(result.publicationBytesVerified,false)
 assert.equal(result.snapshots,4 + Object.values(coverage.qualifications || {}).filter(q=>q.kind==='independent-scenario').length)
 assert.equal(result.qualificationCommit,qualification.commit)
})


test('new real-task slices retain independent evidence and old worker/revocation identities',()=>{
 for(const language of ['zh','en']) {
  const rows=topicGroups(language).flatMap(g=>g.articles)
  const rag=rows.find(r=>r.slug==='027-rag-revocation-publish-replay')
  assert.equal(rag.status,'limited')
  assert.equal(rag.since,'0.16')
  assert.equal(rag.evidence,'https://github.com/hpoenixf/open-etf-agent/blob/35f244f2e06da447c110325d2ac5a5c39f36e842/src/session-cli.mjs')
  const admission=rows.find(r=>r.slug==='agent-provider-admission-capacity-lease')
  assert.equal(admission.status,'limited')
  assert.equal(admission.since,'0.17')
  assert.equal(admission.evidence,'https://github.com/hpoenixf/open-etf-agent/blob/187c942b2c43c6da77011bcb2cbab1bfde1bdead/docs/verification/v017-real-ten.safe.json')
  const schedule=rows.find(r=>r.slug==='agent-autonomous-scheduled-research')
  assert.equal(schedule.since,'0.9')
  const occurrence=schedule.additionalTargets.find(slice=>slice.since==='0.18')
  assert.equal(occurrence.status,'limited')
  assert.equal(occurrence.evidence,'https://github.com/hpoenixf/open-etf-agent/blob/b1d2431a6b86bd0120f2fe5acb531ef928e92de2/docs/verification/v018-real-ten.safe.json')
 }
 assert.deepEqual(versions.filter(v=>['0.16','0.17','0.18'].includes(v.version)).map(v=>v.version),['0.16','0.17','0.18'])
})

test('v0.19 composition source does not invent another verified article slice',()=>{
 const lineage=JSON.parse(readFileSync(new URL('../data/open-etf-agent/versions.json',import.meta.url),'utf8'))
 const latest=Object.keys(lineage.versions).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).slice(-3)
 assert.deepEqual(versions.slice(-3).map(v=>v.version),latest)
 const composition=versions.find(v=>v.version==='0.19')
 assert.equal(composition.commit,'9b6ae0adf1df7efd4fd138b8d2957103b8fd9132')
 assert.equal(composition.tree,'13739de4e3062df5674710e5a1709dbf28a07f9f')
 for(const language of ['zh','en']) {
  const slices=topicGroups(language).flatMap(g=>g.articles).flatMap(row=>[row,...row.additionalTargets])
  assert.equal(slices.some(slice=>slice.since==='0.19'),false)
 }
})
test('README recent modules are generated from the same bilingual topic source',async()=>{
 const {updateRecentModules,renderRecentModuleLinks}=await import('./sync-readme-modules.mjs')
 const text=readFileSync(new URL('../README.md',import.meta.url),'utf8')
 assert.equal(updateRecentModules(text),text)
 assert.equal(renderRecentModuleLinks([],[]),'')
 assert.equal(renderRecentModuleLinks([{slug:'x',title:'中',href:'/articles/x'}],[{slug:'x',title:'English',href:'/en/articles/x'}]),'- [中](articles/x.md) · [English](en/articles/x.md)')
 assert.throws(()=>renderRecentModuleLinks([{slug:'x'}],[]),/Missing English/)
 assert.throws(()=>updateRecentModules('no markers'),/Expected one/)
})


test('v0.20 project source preserves historical qualification without inventing a verified slice',()=>{
 const project=versions.find(v=>v.version==='0.20')
 assert.equal(project.title,'Run your own research project')
 assert.equal(project.zh,'运行自己的研究项目')
 assert.equal(project.module,'Local sources · same-Run recovery · layered evidence')
 assert.equal(project.commit,'a5cef6d5cf1a4597f0f1271025cd6cc16be151e5')
 assert.equal(project.tree,'2754193800cea4ed5865d34e986e582444a2528e')
 for(const language of ['zh','en']) {
  const slices=topicGroups(language).flatMap(g=>g.articles).flatMap(row=>[row,...row.additionalTargets])
  assert.equal(slices.some(slice=>slice.since==='0.20'),false)
 }
})


test('v0.21 interaction has editorial captions without inventing a verified slice',()=>{
 const interaction=versions.find(v=>v.version==='0.21')
 assert.equal(interaction.commit,'427315b5554b1c9af8fa50b8ab622747045e691a')
 assert.equal(interaction.tree,'8e0649c2fa6c7d1610cd680fe4b4362988a48cff')
 assert.equal(interaction.title,'Return answers to the same task')
 assert.equal(interaction.zh,'让回答回到原任务')
 assert.equal(interaction.module,'Sequential questions · durable receipt · explicit adoption')
 for(const language of ['zh','en']) {
  const slices=topicGroups(language).flatMap(g=>g.articles).flatMap(row=>[row,...row.additionalTargets])
  assert.equal(slices.some(slice=>slice.since==='0.21'),false)
 }
})


test('v0.22 Child entry keeps execution lineage and historical article evidence distinct',()=>{
 const childVersion=versions.find(v=>v.version==='0.22')
 assert.equal(childVersion.commit,'fed2c5f886200d4c04281c6293d5eb1ee7c2eab9')
 assert.equal(childVersion.tree,'b42e1b0dfa2d1c8a21248e654255d91524f11ba2')
 assert.equal(childVersion.title,'Delegate bounded read-only work')
 assert.equal(childVersion.zh,'有界委派只读研究')
 assert.equal(childVersion.module,'Serial Child · scoped sources · original Main')
 for(const language of ['zh','en']) {
  const rows=topicGroups(language).flatMap(g=>g.articles)
  const child=rows.find(row=>row.slug==='agent-subagent-context-specialization')
  assert.equal(child.since,'0.3')
  assert.equal(child.evidence,'https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/src/cli.mjs')
  assert.equal(rows.flatMap(row=>[row,...row.additionalTargets]).some(slice=>slice.since==='0.22'),false)
 }
})


test('v0.23/v0.24 navigation preserves exact lineage without upgrading old article qualification',()=>{
 const expected = {
  '0.23': ['4e893ead9ebe8cdd13146ddc96fe1d56a1e56365','4531111e641200ab046f28b618f3ffda5a1b2a87','Retrieve admitted evidence','检索已准入原文'],
  '0.24': ['0d47e318e0f5fb36d45d8be274324a06bdd20d5c','aa59d9c8ba735ff05a881134d665cc64edaee6d7','Keep project capacity across revisions','修订之间保留项目容量']
 }
 for(const [version,[commit,tree,title,zh]] of Object.entries(expected)) {
  const row=versions.find(v=>v.version===version)
  assert.deepEqual([row.commit,row.tree,row.title,row.zh],[commit,tree,title,zh])
 }
 assert.deepEqual(versions.slice(-3).reverse().map(v=>v.version),['0.24','0.23','0.22'])
 for(const language of ['zh','en']) {
  const slices=topicGroups(language).flatMap(g=>g.articles).flatMap(r=>[r,...r.additionalTargets])
  assert.equal(slices.some(s=>['0.23','0.24'].includes(s.since)),false)
 }
})
