import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { topicGroups, recentModuleArticles, versions, recentVersions, qualification } from '../open-etf-topic.mjs'
const coverage = JSON.parse(readFileSync(new URL('../data/open-etf-agent/article-coverage.json', import.meta.url),'utf8'))
const receipts = JSON.parse(readFileSync(new URL('../data/open-etf-agent/article-coverage-receipts.json', import.meta.url),'utf8'))
const lineage = JSON.parse(readFileSync(new URL('../data/open-etf-agent/versions.json', import.meta.url),'utf8'))
const component = readFileSync(new URL('../.vitepress/theme/OpenEtfTopic.vue', import.meta.url), 'utf8')
test('recent modules join existing catalog fields in both languages, without new qualification', () => {
  const expected = ['agent-durable-human-interaction-response-adoption', 'agent-temporal-semantics-market-calendar', '024-agent-pdf-from-text-to-evidence']
  for (const language of ['en', 'zh']) {
    const rows = recentModuleArticles(language)
    const all = topicGroups(language).flatMap(g => g.articles)
    assert.equal(rows.length, 3)
    assert.deepEqual(rows.map(r => r.slug), expected)
    for (const row of rows) {
      assert.deepEqual(row, all.find(a => a.slug === row.slug))
      assert.ok(row.href.startsWith(language === 'en' ? '/en/articles/' : '/articles/'))
    }
    for (const row of rows) {
      const record=coverage.articles.find(a=>a.slug===row.slug)
      const q=coverage.qualifications?.[coverage.targetEvidence?.[record.target]]
      if(record.status==='verified') {
        assert.equal(row.status,'limited')
        assert.equal(row.evidence,`https://github.com/${coverage.repository}/blob/${q?.commit || receipts.sourceCommit}/${lineage.targets[record.target].evidencePath}`)
      } else assert.equal(row.evidence,null)
    }
    assert.deepEqual(all.filter(r=>r.status==='limited').map(r=>r.slug).sort(),coverage.articles.filter(a=>a.status==='verified').map(a=>a.slug).sort())
  }
  assert.equal(qualification.semanticStatus, 'unreviewed')
})
test('three recent versions use numeric descending order without losing history', () => {
  const descending = [...versions].sort((a,b) => b.version.localeCompare(a.version, undefined, { numeric:true }))
  assert.deepEqual(recentVersions, descending.slice(0,3))
  assert.equal(recentVersions.length, Math.min(3, versions.length))
  assert.ok(versions.findIndex(v => v.version === '0.9') < versions.findIndex(v => v.version === '0.10'))
})
test('importance order and primary actions precede full historical evidence', () => {
  const positions = ['oet-hero', 'id="reading"', 'id="quickstart"', 'id="versions"', 'id="mechanisms-title"', 'id="coverage-reading"', 'oet-footer'].map(s => component.indexOf(s))
  assert.ok(positions.every((p,i) => p >= 0 && (i === 0 || p > positions[i-1])))
  for(const fragment of ['href="#reading"','href="#quickstart"',"'/en/catalog' : '/catalog'", "repo + '/releases'",'v-for="version in versions"','v-for="article in group.articles"','v-for="article in recentArticles"']) assert.ok(component.includes(fragment), fragment)
  assert.equal((component.match(/<details\b/g)||[]).length,2)
  assert.equal((component.match(/<summary>/g)||[]).length,2)
  assert.doesNotMatch(component, /<details[^>]*\bopen(?:\s|=|>)/)
})
test('keyboard, clipboard fallback, responsive and evidence affordances remain explicit', () => {
  for(const fragment of ['summary:focus-visible','button:focus-visible','@media(max-width:760px)','role="status"','navigator.clipboard.writeText(quickstart)',"copyState.value = 'select'",'tabindex="0"','XERJ contributor badge','qualification.commit','qualification.sourceCommit','withBase(topicPath(\'zh\'))']) assert.ok(component.includes(fragment), fragment)
  assert.match(component,/not article publication date/)
  assert.match(component,/not a formal release, production readiness or model quality/)
})


test('legacy target identities and original receipt bytes are retained, not upgraded in place',()=>{
 const bytes=readFileSync(new URL('../data/open-etf-agent/article-coverage-receipts.json',import.meta.url))
 const blob=createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex')
 assert.equal(blob,'b1e01448648c46def63880b263e2dac057bacc51')
 for(const [id,result] of Object.entries(receipts.results)) {
  assert.deepEqual(coverage.targets[id],result.target)
  assert.equal(coverage.qualifications[coverage.targetEvidence[id]].commit,receipts.sourceCommit)
 }
 const legacyIds=Object.keys(coverage.targets).filter(id=>coverage.qualifications[coverage.targetEvidence[id]].kind==='legacy-runtime')
 assert.deepEqual(legacyIds.sort(),Object.keys(receipts.results).sort())
})
