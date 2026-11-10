import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { catalogView, chronologicalCatalog, primaryCatalogEntries, paginateCatalogEntries } from '../.vitepress/theme/catalog-view.mjs'
import { collections } from '../book.mjs'
import { englishCollections } from '../book.en.mjs'
import { DEFAULT_CATALOG_SORT, CATALOG_SORT_ORDERS, readCatalogLocation, writeCatalogLocation } from '../.vitepress/theme/catalog-location.mjs'

test('catalogue URL codec defaults newest-created, validates fields and preserves unrelated query/hash', () => {
  const tags = ['finance', 'panorama', 'open-source']
  assert.equal(DEFAULT_CATALOG_SORT, 'created-desc')
  assert.deepEqual(readCatalogLocation('/catalog', tags), { sort: 'created-desc', page: 1, tags: [] })
  for (const sort of CATALOG_SORT_ORDERS) {
    const state = { sort, page: 3, tags: ['finance', 'open-source'] }
    const url = writeCatalogLocation('/en/catalog?campaign=a%20b&campaign=c#catalog-results', state, tags)
    assert.deepEqual(readCatalogLocation(url, tags), state)
    assert.equal(new URL(url, 'https://example.invalid').pathname, '/en/catalog')
    assert.deepEqual(new URL(url, 'https://example.invalid').searchParams.getAll('campaign'), ['a b', 'c'])
    assert.ok(url.endsWith('#catalog-results'))
    assert.equal(writeCatalogLocation(url, state, tags), url, 'Canonical URL is idempotent')
  }
  for (const page of ['-1', '0', '1.5', '2e1', 'Infinity', '9007199254740992', 'abc', '']) {
    assert.equal(readCatalogLocation('/catalog?page=' + page, tags).page, 1)
  }
  assert.deepEqual(readCatalogLocation('/catalog?sort=wrong&page=999&tags=panorama,unknown,finance&tags=finance', tags),
    { sort: 'created-desc', page: 999, tags: ['finance', 'panorama'] })
  assert.deepEqual(readCatalogLocation('/catalog?tags=%3Cscript%3E', tags).tags, [])
  const clamped = paginateCatalogEntries(Array(21).fill({}), { page: 999 }).page
  assert.equal(writeCatalogLocation('/catalog?sort=wrong&page=999&tags=bad#keep', { sort: DEFAULT_CATALOG_SORT, page: clamped, tags: [] }, tags), '/catalog?page=2#keep')
  assert.equal(writeCatalogLocation('/catalog?sort=category&page=9&tags=finance&lang=zh#keep', { sort: DEFAULT_CATALOG_SORT, page: 1, tags: [] }, tags), '/catalog?lang=zh#keep')
})

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
  assert.ok(component.includes('openSourceExample(page.value.relativePath)'))
  const projection = readFileSync(new URL('../.vitepress/theme/article-context.mjs', import.meta.url), 'utf8')
  assert.ok(!component.includes('landing.has'))
  for (const slug of ['019-agent-answer-publication','020-agent-extension-host-smartphone','026-agent-memory-forget-durable-effects','mcp-host-from-discovery-to-consumption','agent-subagent-context-specialization','agent-main-run-context-compaction','agent-model-runtime-mcp-skill-boundaries','open-etf-agent-v01-first-readable-report']) assert.ok(projection.includes(slug))
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

test('pagination covers empty, single, exact-size, overflow and multi-page lists without mutation', () => {
  for (const count of [0, 1, 12, 13, 20, 21, 49]) {
    const entries = Array.from({ length: count }, (_, index) => ({ slug: String(index) }))
    const before = JSON.stringify(entries), pages = Math.ceil(count / 20)
    const first = paginateCatalogEntries(entries)
    assert.equal(first.page, 1); assert.equal(first.pageCount, pages)
    assert.equal(first.start, count ? 1 : 0); assert.equal(first.end, Math.min(20, count))
    const last = paginateCatalogEntries(entries, { page: 999 })
    assert.equal(last.page, Math.max(1, pages)); assert.equal(last.end, count)
    const traversed = Array.from({ length: pages }, (_, index) => paginateCatalogEntries(entries, { page: index + 1 }).items).flat()
    assert.deepEqual(traversed, entries)
    for (const page of [-1, 0, NaN, Infinity, 1.5]) assert.equal(paginateCatalogEntries(entries, { page }).page, 1)
    assert.equal(JSON.stringify(entries), before)
  }
  for (const pageSize of [0, -1, Infinity, 1.5]) assert.throws(() => paginateCatalogEntries([], { pageSize }), /positive integer/)
})

test('filter then global sort then paginate keeps ties and language dates while clamping shrunken lists', () => {
  const source = [{ id: 'one', title: 'One', chapters: [{ title: 'Chapter', items: Array.from({ length: 45 }, (_, i) => ['a' + i, 'Article ' + i]), related: [['other', 'Related']] }] }]
  const tags = Object.fromEntries(source[0].chapters[0].items.map(([slug], i) => [slug, i < 21 ? [{ id: 'selected' }] : []]))
  tags.other = [{ id: 'selected' }]
  const filtered = catalogView(source, { selectedTags: ['selected'], articles: tags })
  const chronology = Object.fromEntries(source[0].chapters[0].items.map(([slug], i) => ['en/articles/' + slug + '.md', { created: { timestamp: i === 0 ? '2026-03-01' : '2026-02-01' } }]))
  const sorted = chronologicalCatalog(filtered.collections, { order: 'created-desc', chronology, sourcePath: slug => 'en/articles/' + slug + '.md' })
  assert.deepEqual(sorted.map(x => x.slug), Array.from({ length: 21 }, (_, i) => 'a' + i))
  const page = paginateCatalogEntries(sorted, { page: 3 })
  assert.equal(page.page, 2); assert.deepEqual(page.items.map(x => x.slug), ['a20'])
  assert.equal(primaryCatalogEntries(source).length, 45)
  assert.ok(!primaryCatalogEntries(filtered.collections).some(entry => entry.slug === 'other'))
  assert.equal(paginateCatalogEntries(sorted.slice(0, 1), { page: 3 }).page, 1)
  assert.equal(paginateCatalogEntries([], { page: 3 }).pageCount, 0)
})

test('related-only chapters survive AND filters without entering canonical totals or date ordering', () => {
  for (const source of [collections, englishCollections]) {
    const before = JSON.stringify(source)
    const articles = { 'agent-subagent-context-specialization': [{ id: 'panorama' }, { id: 'research' }] }
    const view = catalogView(source, { category: 'modules', selectedTags: ['panorama', 'research'], articles })
    assert.equal(view.articleCount, 0)
    assert.equal(view.collections.length, 1)
    assert.equal(view.collections[0].chapters.length, 1)
    const chapter = view.collections[0].chapters[0]
    assert.equal(chapter.id, 'l3')
    assert.deepEqual(chapter.items, [])
    assert.deepEqual(chapter.related.map(([slug]) => slug), ['agent-subagent-context-specialization'])
    assert.deepEqual(chronologicalCatalog(view.collections, { order: 'created-desc' }), [])
    assert.equal(paginateCatalogEntries(primaryCatalogEntries(view.collections)).total, 0)
    assert.equal(catalogView(source, { category: 'modules', selectedTags: ['panorama', 'missing'], articles }).collections.length, 0)
    assert.equal(JSON.stringify(source), before)
  }
})
