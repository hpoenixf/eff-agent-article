import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { catalogView, chronologicalCatalog } from '../.vitepress/theme/catalog-view.mjs'
import { collections } from '../book.mjs'
import { englishCollections } from '../book.en.mjs'

test('category view counts only its canonical articles and preserves source ordering', () => {
  for (const source of [collections, englishCollections]) {
    const before = JSON.stringify(source)
    for (const collection of source) {
      const view = catalogView(source, { category: collection.id })
      assert.equal(JSON.stringify(view.collections), JSON.stringify([collection]))
      assert.equal(view.articleCount, new Set(collection.chapters.flatMap(chapter => chapter.items.map(([slug]) => slug))).size)
    }
    assert.equal(JSON.stringify(source), before)
  }
})

test('all-selected tag intersection and empty state keep related links out of primary count', () => {
  const source = [{ id: 'one', chapters: [{ title: 'A', items: [['a', 'A'], ['b', 'B']], related: [['c', 'C']] }] }]
  const articles = { a: [{ id: 'finance' }, { id: 'panorama' }], b: [{ id: 'finance' }], c: [{ id: 'finance' }, { id: 'panorama' }] }
  const view = catalogView(source, { category: 'one', selectedTags: ['finance', 'panorama'], articles })
  assert.equal(view.articleCount, 1)
  assert.deepEqual(view.collections[0].chapters[0].items, [['a', 'A']])
  assert.deepEqual(view.collections[0].chapters[0].related, [['c', 'C']])
  assert.deepEqual(catalogView(source, { selectedTags: ['missing'], articles }), { collections: [], articleCount: 0 })
  assert.deepEqual(catalogView(source, { category: 'absent' }), { collections: [], articleCount: 0 })
})

test('category component suppresses redundant self-link header without changing full catalog or filter controls', () => {
  const component = readFileSync(new URL('../.vitepress/theme/ChapterCatalog.vue', import.meta.url), 'utf8')
  assert.match(component, /v-if="!category" class="collection-header"/)
  assert.match(component, /view\.articleCount/)
  assert.ok(component.includes(`:is="category ? 'h2' : 'h3'"`))
  assert.match(component, /:aria-pressed="selectedTags\.includes\(tag\.id\)"/)
  assert.match(component, /role="status"/)
  assert.match(component, /\.reader-catalog \.chapter-card:hover \{ transform: none; \}/)
  assert.match(component, /min-height: 44px/)
  assert.match(component, /a:focus-visible/)
})

test('companion source promotion remains on mapped articles, not directory pages', () => {
  const component = readFileSync(new URL('../.vitepress/theme/OpenSourceBridge.vue', import.meta.url), 'utf8')
  assert.ok(component.includes("current.value.startsWith('articles/') && Boolean(example.value)"))
  assert.ok(!component.includes('landing.has'))
  for (const slug of ['019-agent-answer-publication','020-agent-extension-host-smartphone','026-agent-memory-forget-durable-effects','mcp-host-from-discovery-to-consumption','agent-subagent-context-specialization','agent-main-run-context-compaction','agent-model-runtime-mcp-skill-boundaries','open-etf-agent-v01-first-readable-report']) assert.ok(component.includes(slug))
})

test('all four date orders sort globally, preserve stable ties, and keep unknown dates last', () => {
  const source = [
    { id: 'first', title: 'First', chapters: [{ items: [['a', 'A'], ['unknown', 'Unknown'], ['b', 'B']], related: [['other', 'Other']] }] },
    { id: 'second', title: 'Second', chapters: [{ items: [['c', 'C'], ['invalid', 'Invalid']] }] }
  ]
  const event = timestamp => ({ timestamp, date: timestamp.slice(0, 10) })
  const chronology = {
    'articles/a.md': { created: event('2026-10-01T09:00:00+09:00'), updated: event('2026-10-04T00:00:00Z') },
    'articles/b.md': { created: event('2026-10-03T00:00:00Z'), updated: event('2026-10-02T00:00:00Z') },
    'articles/c.md': { created: event('2026-10-01T00:00:00Z'), updated: event('2026-10-03T00:00:00Z') },
    'articles/invalid.md': { created: event('invalid'), updated: event('invalid') }
  }
  const before = JSON.stringify({ source, chronology })
  const slugs = order => chronologicalCatalog(source, { order, chronology }).map(entry => entry.slug)
  assert.deepEqual(slugs('created-asc'), ['a', 'c', 'b', 'unknown', 'invalid'])
  assert.deepEqual(slugs('created-desc'), ['b', 'a', 'c', 'unknown', 'invalid'])
  assert.deepEqual(slugs('updated-asc'), ['b', 'c', 'a', 'unknown', 'invalid'])
  assert.deepEqual(slugs('updated-desc'), ['a', 'c', 'b', 'unknown', 'invalid'])
  assert.equal(JSON.stringify({ source, chronology }), before)
  assert.deepEqual(chronologicalCatalog(source, { order: 'updated-desc' }).map(entry => entry.slug), ['a', 'unknown', 'b', 'c', 'invalid'])
  assert.throws(() => chronologicalCatalog(source, { order: 'random' }), /Unknown/)
})

test('chronology consumes actual language targets after tag intersection, without adding related articles', () => {
  const source = [{ id: 'one', chapters: [{ items: [['a', 'A'], ['b', 'B'], ['c', 'C']], related: [['other', 'Other']] }] }]
  const tags = { a: [{ id: 'finance' }, { id: 'open' }], b: [{ id: 'finance' }, { id: 'open' }], c: [{ id: 'finance' }] }
  const visible = catalogView(source, { selectedTags: ['finance', 'open'], articles: tags })
  const chronology = { 'articles/a.md': { created: { timestamp: '2026-01-01' } }, 'en/articles/a.md': { created: { timestamp: '2026-03-01' } }, 'articles/b.md': { created: { timestamp: '2026-02-01' } } }
  const actual = chronologicalCatalog(visible.collections, { order: 'created-desc', chronology, sourcePath: slug => (slug === 'a' ? 'en/' : '') + 'articles/' + slug + '.md' })
  assert.deepEqual(actual.map(entry => entry.slug), ['a', 'b'])
  assert.equal(actual.length, visible.articleCount)
  assert.deepEqual(chronologicalCatalog([], { order: 'created-asc' }), [])
})
