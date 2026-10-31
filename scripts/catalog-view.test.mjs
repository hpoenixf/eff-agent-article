import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { catalogView } from '../.vitepress/theme/catalog-view.mjs'
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
