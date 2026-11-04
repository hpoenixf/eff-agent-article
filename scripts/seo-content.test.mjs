import test from 'node:test'
import assert from 'node:assert/strict'
import { seoDescription, socialHead } from '../seo-content.mjs'

test('editorial description takes precedence in its language', () => {
  assert.equal(seoDescription({ title: 'T', frontmatter: { description: 'An authored summary.' } }), 'An authored summary.')
})

test('missing summaries are topic-specific, not a site-wide duplicate', () => {
  const x = seoDescription({ title: 'Agent publication', headers: [{ level: 2, title: 'Effect receipts' }], english: true })
  const y = seoDescription({ title: 'Agent memory', headers: [{ level: 2, title: 'Deletion' }], english: true })
  assert.notEqual(x, y)
  assert.match(x, /Effect receipts/)
  assert.match(y, /Deletion/)
  assert.match(seoDescription({ title: '恢复', headers: [{ level: 2, title: '冷恢复' }] }), /冷恢复/)
})

test('all social links use the public canonical host', () => {
  const meta = socialHead({ title: 'Example', description: 'Text', canonical: 'https://hpoenixf.com/eff-agent-article/articles/example', image: 'https://hpoenixf.com/static/images/twitter-card.png', article: true })
  assert.equal(meta.find(([tag, props]) => props.property === 'og:url')[1].content, 'https://hpoenixf.com/eff-agent-article/articles/example')
  assert.equal(meta.find(([tag, props]) => props.property === 'og:type')[1].content, 'article')
  assert.ok(meta.some(([tag, props]) => props.name === 'twitter:card'))
})

import { articleStructuredData, structuredDataHead, landingStructuredData, setLandingStructuredData } from '../seo-content.mjs'
import { SITE_URL, canonicalUrl } from '../seo-routes.mjs'

test('both language homes describe one bilingual website, not invented provenance or search features', () => {
  for (const relativePath of ['index.md', 'en/index.md']) {
    const english = relativePath.startsWith('en/')
    const data = landingStructuredData({ relativePath, title: 'Page headline', description: 'Visible introduction.', canonical: canonicalUrl(relativePath) })
    assert.equal(data['@type'], 'WebSite')
    assert.equal(data['@id'], SITE_URL + '#website')
    assert.equal(data.url, SITE_URL)
    assert.equal(data.name, english ? 'ETF Agent · Engineering Notes' : 'ETF Agent · 工程手记')
    assert.equal(data.alternateName, english ? 'ETF Agent · 工程手记' : 'ETF Agent · Engineering Notes')
    assert.deepEqual(data.inLanguage, ['zh-CN', 'en'])
    assert.equal(data.description, 'Visible introduction.')
    for (const key of ['author', 'publisher', 'datePublished', 'dateModified', 'image', 'aggregateRating', 'potentialAction']) assert.ok(!(key in data))
  }
})

test('catalogue and existing curated topics share localized collection semantics', () => {
  for (const page of ['catalog', 'principles', 'open-etf-agent', 'panorama']) for (const prefix of ['', 'en/']) {
    const relativePath = prefix + page + '.md', canonical = canonicalUrl(relativePath)
    const data = landingStructuredData({ relativePath, title: 'Visible title', description: 'Visible description.', canonical })
    assert.deepEqual(data, {
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: 'Visible title', description: 'Visible description.', url: canonical,
      inLanguage: prefix ? 'en' : 'zh-CN',
      isPartOf: { '@type': 'WebSite', name: 'ETF Agent · Engineering Notes', url: SITE_URL }
    })
  }
})

test('landing semantics never leak to articles, categories, compatibility or contributor routes', () => {
  for (const page of ['articles/example.md', 'articles/017-prompt-to-answer-six-layer-panorama.md', 'modules.md', 'thinking.md', 'engineering.md', 'fintech.md', 'roadmap.md', 'README.md', 'MAINTENANCE.md', '404.md', 'nested/index.md', 'catalogue.md']) {
    for (const prefix of ['', 'en/']) assert.equal(landingStructuredData({ relativePath: prefix + page }), null)
  }
})

test('landing head generation is idempotent and preserves unrelated authored schemas', () => {
  const custom = structuredDataHead({ '@type': 'Person', name: 'An explicitly authored identity' })
  const heads = [custom, ['meta', { name: 'example', content: 'keep' }]]
  const data = landingStructuredData({ relativePath: 'index.md', description: '</script><script>not executable</script>' })
  setLandingStructuredData(heads, data)
  setLandingStructuredData(heads, data)
  assert.equal(heads.length, 3)
  assert.equal(heads.filter(([tag, attrs]) => attrs.id === 'reader-landing-schema').length, 1)
  assert.strictEqual(heads[0], custom)
  assert.ok(!heads[2][2].includes('<'))
  assert.deepEqual(JSON.parse(heads[2][2]), data)
  setLandingStructuredData(heads, null)
  assert.equal(heads.length, 2)
  assert.strictEqual(heads[0], custom)
})

test('article schema describes the canonical page without invented provenance', () => {
  const canonical = 'https://hpoenixf.com/eff-agent-article/en/articles/example'
  const data = articleStructuredData({ title: 'Example', description: 'Evidence boundaries.', canonical, english: true })
  assert.equal(data['@type'], 'Article')
  assert.equal(data.url, canonical)
  assert.equal(data.mainEntityOfPage['@id'], canonical)
  assert.equal(data.inLanguage, 'en')
  assert.equal(data.headline, 'Example')
  for (const key of ['author', 'datePublished', 'dateModified', 'image', 'aggregateRating']) assert.ok(!(key in data))
})

test('JSON-LD cannot break out of its script element', () => {
  const data = { description: '</script><script>alert(1)</script>' }
  const head = structuredDataHead(data)
  assert.equal(head[1].type, 'application/ld+json')
  assert.ok(!head[2].includes('<'))
  assert.deepEqual(JSON.parse(head[2]), data)
})

test('verified editorial facts are opt-in and cannot override canonical identity', () => {
  const canonical = 'https://hpoenixf.com/eff-agent-article/articles/example'
  const metadata = {
    author: { name: 'hpoenixf', url: 'https://hpoenixf.com/about' },
    datePublished: '2026-10-31', dateModified: '2026-11-01',
    image: 'https://hpoenixf.com/eff-agent-article/visuals/example/diagram.png',
    url: 'https://example.com/wrong', aggregateRating: { ratingValue: 5 }
  }
  const data = articleStructuredData({ title: 'Example', canonical, metadata })
  assert.deepEqual(data.author, { '@type': 'Person', name: 'hpoenixf', url: 'https://hpoenixf.com/about' })
  assert.equal(data.datePublished, metadata.datePublished)
  assert.equal(data.dateModified, metadata.dateModified)
  assert.equal(data.image, metadata.image)
  assert.equal(data.url, canonical)
  assert.ok(!('aggregateRating' in data))
  assert.equal(metadata.author['@type'], undefined, 'does not mutate frontmatter')
})

test('partial provenance never invents dates, image, or author', () => {
  const data = articleStructuredData({ metadata: { author: { name: 'hpoenixf', url: 'https://hpoenixf.com/about' } } })
  for (const key of ['datePublished', 'dateModified', 'image']) assert.ok(!(key in data))
  const imageOnly = articleStructuredData({ metadata: { image: 'https://hpoenixf.com/diagram.png' } })
  assert.ok(!('author' in imageOnly))
})

test('invalid explicit provenance fails instead of silently publishing invented metadata', () => {
  for (const metadata of [
    [], 'not metadata',
    { author: 'hpoenixf' }, { author: { name: '', url: 'https://hpoenixf.com/about' } },
    { author: { name: 'hpoenixf' } },
    { image: '/diagram.png' }, { image: 'javascript:alert(1)' },
    { image: 'https://user:password@example.com/image.png' },
    { datePublished: '2026-02-30' }, { datePublished: '11/01/2026' },
    { datePublished: '2026-11-01T00:00:00Z' },
    { datePublished: '2026-11-01', dateModified: '2026-10-31' }
  ]) assert.throws(() => articleStructuredData({ metadata }), TypeError)
  assert.equal(articleStructuredData({ metadata: { datePublished: '2024-02-29' } }).datePublished, '2024-02-29')
})


test('social previews use the reading-site brand asset rather than the starter blog image', async () => {
 const { readFileSync } = await import('node:fs')
 const config = readFileSync(new URL('../.vitepress/config.mts', import.meta.url), 'utf8')
 assert.ok(config.includes("image: SITE_URL + 'social-card.png'"))
 assert.ok(!config.includes('static/images/twitter-card.png'))
 const png = readFileSync(new URL('../public/social-card.png', import.meta.url))
 assert.equal(png.subarray(1, 4).toString(), 'PNG')
 assert.equal(png.readUInt32BE(16), 1200)
 assert.equal(png.readUInt32BE(20), 630)
})

import { articleBreadcrumbs, breadcrumbStructuredData } from '../seo-content.mjs'
import { READER_LANGUAGES, languageAlternates } from '../seo-routes.mjs'

test('article breadcrumbs share real localized navigation with JSON-LD', () => {
  for (const prefix of ['', 'en/']) {
    const options = { relativePath: prefix + 'articles/agent-in-15-minutes.md', title: 'A <b>clear</b> title' }
    const items = articleBreadcrumbs(options)
    assert.deepEqual(items.map(item => item.url), [canonicalUrl(prefix + 'index.md'), canonicalUrl(prefix + 'catalog.md'), canonicalUrl(options.relativePath)])
    assert.equal(items[2].name, 'A clear title')
    assert.deepEqual(breadcrumbStructuredData(options).itemListElement,
      items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: item.url })))
  }
  for (const relativePath of ['index.md', 'about.md', 'README.md', 'roadmap.md', 'articles/010-agent-first-brakes.md']) {
    assert.deepEqual(articleBreadcrumbs({ relativePath }), [])
    assert.equal(breadcrumbStructuredData({ relativePath }), null)
  }
})

test('HTML, sitemap locale configuration and schemas share language codes', async () => {
  const { readFileSync } = await import('node:fs')
  const config = readFileSync(new URL('../.vitepress/config.mts', import.meta.url), 'utf8')
  assert.match(config, /lang: READER_LANGUAGES\.en/)
  assert.match(config, /lang: READER_LANGUAGES\.zh/)
  assert.equal(READER_LANGUAGES.en, 'en')
  assert.deepEqual(languageAlternates('index.md', () => true).map(([, a]) => a.hreflang), Object.values(READER_LANGUAGES))
  assert.equal(articleStructuredData({ english: true }).inLanguage, READER_LANGUAGES.en)
})

test('SSR bylines render only verified metadata, including date-only and legacy cases', async () => {
  const { readFileSync } = await import('node:fs')
  const { parse, compileScript } = await import('@vue/compiler-sfc')
  const { transform } = await import('esbuild')
  const { createSSRApp } = await import('vue')
  const { renderToString } = await import('vue/server-renderer')
  const source = readFileSync(new URL('../.vitepress/theme/ArticleProvenance.vue', import.meta.url), 'utf8')
  const render = async (metadata, english = false, relativePath = 'articles/agent-in-15-minutes.md') => {
    const { descriptor } = parse(source)
    let script = compileScript(descriptor, { id: 'provenance-fixture', inlineTemplate: true }).content
    const fixture = { page: { relativePath, title: 'Visible article title' }, frontmatter: { articleMetadata: metadata }, lang: english ? 'en' : 'zh-CN' }
    script = script.replace("import { useData } from 'vitepress'", `import { ref } from 'vue'; const useData = () => Object.fromEntries(Object.entries(${JSON.stringify(fixture)}).map(([key, value]) => [key, ref(value)]))`)
      .replaceAll("'../../seo-content.mjs'", JSON.stringify(new URL('../seo-content.mjs', import.meta.url).href))
      .replaceAll(/(['"])vue\1/g, JSON.stringify(import.meta.resolve('vue')))
    const { code } = await transform(script, { loader: 'ts', format: 'esm' })
    const component = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))
    return renderToString(createSSRApp(component.default))
  }
  const metadata = { author: { name: 'hpoenixf', url: 'https://hpoenixf.com/about' }, datePublished: '2026-10-31', dateModified: '2026-11-01' }
  for (const english of [false, true]) {
    const rendered = await render(metadata, english, (english ? 'en/' : '') + 'articles/agent-in-15-minutes.md')
    assert.match(rendered, /rel="author"[^>]*>hpoenixf<\/a>/)
    assert.ok(rendered.includes(english ? 'Author: ' : '作者：'))
    assert.ok(rendered.includes(english ? 'Published: ' : '发布于：'))
    assert.match(rendered, /datetime="2026-10-31">2026-10-31<\/time>/)
    assert.match(rendered, /datetime="2026-11-01">2026-11-01<\/time>/)
    assert.match(rendered, /aria-current="page">Visible article title<\/span>/)
  }
  const absent = await render(undefined)
  assert.ok(!absent.includes('article-byline') && !absent.includes('<time'))
  const updateOnly = await render({ dateModified: '2026-11-01' }, true)
  assert.ok(updateOnly.includes('Updated: ') && !updateOnly.includes('Published: ') && !updateOnly.includes('Author: '))
  const legacy = await render(metadata, false, 'articles/010-agent-first-brakes.md')
  assert.ok(!legacy.includes('article-provenance') && !legacy.includes('hpoenixf'))
})
