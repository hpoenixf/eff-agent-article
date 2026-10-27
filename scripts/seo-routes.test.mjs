import test from 'node:test'
import assert from 'node:assert/strict'
import { chapters, mergedArticles, historicalEditions } from '../book.mjs'
import { SITE_URL, canonicalUrl, isLegacyArticleRoute, filterSitemapItems } from '../seo-routes.mjs'

const legacy = { ...mergedArticles, ...historicalEditions }

test('merged and historical article URLs stay canonicalized but never enter sitemap', () => {
  for (const [slug, target] of Object.entries(legacy)) {
    for (const language of ['', 'en/']) {
      const path = language + 'articles/' + slug
      const expected = SITE_URL + language + 'articles/' + target
      assert.equal(canonicalUrl(path + '.md'), expected)
      for (const route of [
        path + '.md',
        '/' + path,
        '/eff-agent-article/' + path,
        SITE_URL + path,
        SITE_URL + path + '.html',
        SITE_URL + path + '/'
      ]) {
        assert.ok(isLegacyArticleRoute(route), 'Not marked legacy: ' + route)
      }
      assert.equal(isLegacyArticleRoute(expected), false, 'Current target excluded: ' + expected)
    }
  }
})

test('current articles and regular site pages remain eligible for search', () => {
  const pages = ['index.md', 'en/index.md', 'principles.md', 'en/catalog.md']
  for (const chapter of chapters) {
    for (const [slug] of chapter.items) {
      pages.push('articles/' + slug + '.md')
      pages.push('en/articles/' + slug + '.md')
    }
  }
  for (const path of pages) {
    assert.equal(isLegacyArticleRoute(path), false, 'Canonical route excluded: ' + path)
  }
  assert.equal(canonicalUrl('index.md'), SITE_URL)
  assert.equal(canonicalUrl('en/index.md'), SITE_URL + 'en/')
})

test('sitemap hook filters only compatibility and historical entries, preserving other metadata', () => {
  const entries = [
    { url: '/eff-agent-article/articles/010-agent-first-brakes', lastmod: '2026-10-22' },
    { url: SITE_URL + 'en/articles/green-tests-can-lie.html' },
    { url: SITE_URL + 'articles/017-prompt-to-answer-six-layer-panorama-v1' },
    { url: SITE_URL + 'articles/011-model-understands-code-authorizes', priority: 0.8 },
    { url: SITE_URL + 'en/principles' }
  ]
  assert.deepEqual(filterSitemapItems(entries), entries.slice(3))
  assert.equal(entries.length, 5, 'Do not mutate the sitemap provider input')
})
