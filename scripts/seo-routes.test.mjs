import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { englishArticleSlugs, englishTitles } from '../book.en.mjs'
import { chapters, mergedArticles, historicalEditions } from '../book.mjs'
import { SITE_URL, canonicalUrl, isLegacyArticleRoute, isNonReaderRoute, filterSitemapItems } from '../seo-routes.mjs'
import { createMarkdownRenderer } from 'vitepress'

const legacy = { ...mergedArticles, ...historicalEditions }

test('consolidated notices preserve old section fragments and link to actual receiving sections', async () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/retired-heading-links.json', import.meta.url), 'utf8'))
  const md = await createMarkdownRenderer(process.cwd(), { highlight: code => code })
  const rendered = new Map()
  const htmlFor = url => {
    if (!rendered.has(url.href)) rendered.set(url.href, md.render(readFileSync(url, 'utf8')))
    return rendered.get(url.href)
  }
  for (const item of fixture.cases) {
    const sourceUrl = new URL('../' + item.path, import.meta.url)
    const source = readFileSync(sourceUrl, 'utf8'), html = htmlFor(sourceUrl)
    const slug = item.path.split('/').at(-1).replace(/\.md$/, '')
    assert.ok(mergedArticles[slug], 'Compatibility links do not create another canonical essay')
    assert.equal(html.split('id="' + item.titleId + '"').length - 1, 1, item.path + ': original title anchor')
    assert.ok(source.includes('https://github.com/hpoenixf/eff-agent-article/blob/' + fixture.sourceCommit + '/' + item.path))
    const links = [...html.matchAll(/href="([^"]+)"/g)].map(match => decodeURIComponent(match[1]).replace(/^\.\//, '').replace(/\.html(?=#|$)/, '.md'))
    for (const section of item.sections) {
      for (const id of section.ids) assert.equal(html.split('id="' + id + '"').length - 1, 1, item.path + '#' + id)
      assert.ok(links.includes(section.target), item.path + ': receiving link ' + section.target)
      const [path, fragment] = section.target.split('#')
      assert.ok(!path.includes('/'), 'Receiving links retain the same language directory')
      assert.ok(!legacy[path.replace(/\.md$/, '')], 'Receiving essay is current, not another merge notice')
      const target = htmlFor(new URL(path, sourceUrl))
      assert.equal(target.split('id="' + fragment + '"').length - 1, 1, section.target)
    }
  }
})

test('contributor documentation is excluded without hiding reader pages', () => {
  for (const route of ['README.md', 'MAINTENANCE', '/eff-agent-article/MAINTENANCE.html', SITE_URL + 'en/README']) {
    assert.equal(isNonReaderRoute(route), true)
    assert.deepEqual(filterSitemapItems([{ url: route }]), [])
  }
  for (const route of ['index.md', 'fintech', 'catalog', 'articles/agent-in-15-minutes']) {
    assert.equal(isNonReaderRoute(route), false)
    assert.deepEqual(filterSitemapItems([{ url: route }]), [{ url: route }])
  }
})

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
  const pages = ['index.md', 'en/index.md', 'principles.md', 'en/catalog.md', 'panorama.md', 'en/panorama.md']
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


test('renamed origin essay has one canonical bilingual body and redirect-only old routes', () => {
  const oldSlug = '001-one-week-4-billion-tokens-etf-investment-agent'
  const slug = 'etf-assistant-engineering-origins'
  const indexed = chapters.flatMap(chapter => chapter.items.map(([id]) => id))
  assert.equal(indexed.filter(id => id === slug).length, 1)
  assert.equal(indexed.includes(oldSlug), false)
  assert.equal(mergedArticles[oldSlug], slug)
  assert.equal(englishArticleSlugs.filter(id => id === slug).length, 1)
  assert.equal(englishArticleSlugs.includes(oldSlug), false)
  assert.equal(englishTitles[slug], 'Why a Small ETF Investment Assistant Became an Engineering Problem')
  for (const language of ['', 'en/']) {
    const oldPath = language + 'articles/' + oldSlug + '.md'
    const target = SITE_URL + language + 'articles/' + slug
    const pointer = readFileSync(new URL('../' + oldPath, import.meta.url), 'utf8')
    assert.equal(canonicalUrl(oldPath), target)
    assert.equal(isLegacyArticleRoute(oldPath), true)
    assert.ok(pointer.includes('search: false'))
    assert.ok(pointer.includes('http-equiv: refresh'))
    assert.ok(pointer.includes('content: "0;url=' + target + '"'))
    assert.ok(pointer.includes('href: ' + target))
    assert.ok(pointer.includes('](' + slug + '.md)'))
    assert.ok(pointer.length < 1000, 'The old route must not retain a second full essay')
    const body = readFileSync(new URL('../' + language + 'articles/' + slug + '.md', import.meta.url), 'utf8')
    assert.ok(body.includes(language ? '# Why a Small ETF Investment Assistant Became an Engineering Problem' : '# 一个 ETF 投资助手，为什么先变成了工程问题'))
    assert.equal(/billing|计费|4[ -]*billion|40\s*亿/i.test(body), false)
  }
})

import { languageAlternates } from '../seo-routes.mjs'
import { existsSync } from 'node:fs'
const sourceExists = path => existsSync(new URL('../' + path, import.meta.url))

test('accepted bilingual pages have identical reciprocal alternates, including home', () => {
  for (const path of ['index.md', 'glossary.md', 'principles.md', 'open-etf-agent.md', 'panorama.md', ...englishArticleSlugs.map(slug => 'articles/' + slug + '.md')]) {
    if (isLegacyArticleRoute(path)) continue
    const links = languageAlternates(path, sourceExists)
    assert.equal(links.length, 2, path)
    assert.deepEqual(links, languageAlternates('en/' + path, sourceExists))
    assert.equal(links[0][1].href, canonicalUrl(path))
    assert.equal(links[1][1].href, canonicalUrl('en/' + path))
  }
})

test('missing, unreviewed and legacy translations never acquire hreflang', () => {
  assert.deepEqual(languageAlternates('principles.md', () => false), [])
  assert.deepEqual(languageAlternates('articles/not-reviewed.md', () => true), [])
  for (const slug of Object.keys(legacy)) {
    assert.deepEqual(languageAlternates('articles/' + slug + '.md', () => true), [])
  }
  assert.deepEqual(languageAlternates('README.md', () => true), [])
})


test('retired architecture guides preserve bilingual old links but are not reader destinations', () => {
  for (const language of ['', 'en/']) {
    const path = language + 'architecture'
    const target = SITE_URL + language + 'articles/017-prompt-to-answer-six-layer-panorama-v3'
    assert.equal(canonicalUrl(path + '.md'), target)
    for (const route of [path, path + '.md', SITE_URL + path, SITE_URL + path + '.html']) {
      assert.equal(isLegacyArticleRoute(route), true)
      assert.deepEqual(filterSitemapItems([{ url: route }]), [])
    }
    assert.deepEqual(languageAlternates(path + '.md', () => true), [])
    const stub = readFileSync(new URL('../' + path + '.md', import.meta.url), 'utf8')
    assert.ok(stub.includes('search: false'))
    assert.ok(stub.includes('0;url=' + target))
    assert.ok(stub.includes('](/' + language + 'articles/017-prompt-to-answer-six-layer-panorama-v3)'))
    assert.ok(stub.length < 700)
    assert.ok(!readFileSync(new URL('../.vitepress/config.mts', import.meta.url), 'utf8').includes("link: '/" + path + "'"))
  }
})
