import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { collections, mergedArticles, historicalEditions, panoramaSeriesSlugs } from '../book.mjs'
import { englishCollections, englishArticleSlugs } from '../book.en.mjs'

const collection = id => collections.find(c => c.id === id)
const slugs = c => c.chapters.flatMap(ch => ch.items.map(([slug]) => slug))
const text = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('six module reading keys preserve the canonical identities and bilingual order', () => {
  const modules = collection('modules')
  assert.deepEqual(modules.chapters.map(ch => ch.id), ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'])
  const all = collections.flatMap(slugs)
  assert.equal(new Set(all).size, all.length)
  for (const c of collections) {
    const en = englishCollections.find(e => e.id === c.id)
    assert.deepEqual(slugs(en), slugs(c))
    assert.deepEqual(en.chapters.map(ch => ch.id), c.chapters.map(ch => ch.id))
    for (const ch of en.chapters) assert.ok(ch.title && ch.desc)
  }
  assert.ok(slugs(collection('thinking')).includes('017-prompt-to-answer-six-layer-panorama-v3'))
  assert.ok(slugs(collection('thinking')).includes('025-agent-langfuse-from-trace-to-trustworthy-observability'))
  assert.ok(modules.chapters.find(ch => ch.id === 'l3').related.some(([s]) => s === '025-agent-langfuse-from-trace-to-trustworthy-observability'))
  for (const [old, current] of Object.entries({...mergedArticles, ...historicalEditions})) {
    assert.ok(!all.includes(old))
    assert.ok(all.includes(current))
  }
})

test('finance curation and topic headings stay bilingual without a second article index', () => {
  const selected = path => [...text(path).matchAll(/\/articles\/([a-z0-9-]+)/g)].map(m => m[1]).sort()
  assert.deepEqual(selected('fintech.md'), selected('en/fintech.md'))
  const all = new Set(collections.flatMap(slugs))
  for (const slug of selected('fintech.md')) assert.ok(all.has(slug), slug)
  const topic = text('open-etf-topic.mjs')
  assert.ok(topic.includes('(en ? englishCollections : collections)'))
  assert.ok(!topic.includes("['Research, reading & computation'"))
})


test('panorama tag curates three full-scope essays without a fourth primary class', () => {
  const selected = [
    '017-prompt-to-answer-six-layer-panorama-v3',
    'financial-agent-system-panorama',
    'one-report-nine-architecture-judgments'
  ]
  assert.deepEqual([...panoramaSeriesSlugs], selected)
  const all = collections.flatMap(slugs)
  assert.equal(collections.length, 3)
  assert.equal(new Set(all).size, all.length)
  assert.equal(new Set(panoramaSeriesSlugs).size, panoramaSeriesSlugs.length)
  for (const slug of selected) {
    assert.equal(all.filter(value => value === slug).length, 1, 'No duplicate canonical classification: ' + slug)
    assert.ok(englishArticleSlugs.includes(slug), 'Bilingual panorama essay missing: ' + slug)
    assert.ok(text('articles/' + slug + '.md').length > 1000, slug)
    assert.ok(text('en/articles/' + slug + '.md').length > 1000, slug)
  }
  for (const file of ['panorama.md', 'en/panorama.md']) {
    const page = text(file)
    assert.ok(page.includes('<PanoramaSeries />'), 'Tag cards must use the reviewed single tag registry: ' + file)
    assert.ok(page.length > 350, 'Tag landing should be a useful standalone guide: ' + file)
  }
  const config = text('.vitepress/config.mts')
  assert.ok(config.includes("{ text: '全景系列 · 标签', link: '/panorama' }"))
  assert.ok(config.includes("{ text: 'Panorama Series', link: '/en/panorama' }"))
  const home = text('.vitepress/theme/HomeOverview.vue')
  assert.ok(home.includes("{ label: '全景系列', href: '/panorama' }"))
  assert.ok(home.includes("{ label: 'Panorama series', href: '/en/panorama' }"))
  const theme = text('.vitepress/theme/index.ts')
  assert.ok(theme.includes("app.component('PanoramaSeries', PanoramaSeries)"))
  assert.ok(theme.includes('h(ArticleTopicTags)'))
  assert.ok(text('.vitepress/theme/ArticleTopicTags.vue').includes('panoramaSeriesSlugs'))
  assert.ok(text('.vitepress/theme/PanoramaSeries.vue').includes('panoramaSeriesSlugs'))
})
