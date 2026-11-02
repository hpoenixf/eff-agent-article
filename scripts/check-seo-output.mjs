import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chapters, mergedArticles, historicalEditions } from '../book.mjs'
import { SITE_URL, canonicalUrl } from '../seo-routes.mjs'
import { createContentLoader, resolveConfig } from 'vitepress'
import { articleStructuredData } from '../seo-content.mjs'

const output = resolve('.vitepress/dist')
const sitemap = readFileSync(resolve(output, 'sitemap.xml'), 'utf8')
const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]))
const legacy = [...Object.keys(mergedArticles), ...Object.keys(historicalEditions)]
let preserved = 0

for (const route of ['README', 'MAINTENANCE', 'en/README', 'en/MAINTENANCE']) {
  if (!existsSync(route + '.md')) continue
  assert.ok(!listed.has(SITE_URL + route) && !listed.has(SITE_URL + route + '.html'),
    'Contributor documentation must not enter reader sitemap: ' + route)
  const html = readFileSync(resolve(output, route + '.html'), 'utf8')
  assert.match(html, /<meta\b[^>]*name="robots"[^>]*content="noindex,\s*follow"/,
    'Contributor documentation must remain accessible but noindex: ' + route)
}

for (const slug of legacy) {
  for (const language of ['', 'en/']) {
    const route = language + 'articles/' + slug
    const source = route + '.md'
    if (!existsSync(source)) continue
    const publicUrl = SITE_URL + route
    assert.ok(!listed.has(publicUrl) && !listed.has(publicUrl + '.html'),
      'Legacy URL in sitemap: ' + route)

    const htmlPath = resolve(output, route + '.html')
    assert.ok(existsSync(htmlPath), 'Legacy link must remain accessible: ' + route)
    const html = readFileSync(htmlPath, 'utf8')
    const canonicals = html.match(/<link\b[^>]*\brel="canonical"[^>]*>/g) ?? []
    assert.equal(canonicals.length, 1, 'Expected one canonical link: ' + route)
    assert.ok(canonicals[0].includes('href="' + canonicalUrl(source) + '"'),
      'Wrong canonical destination: ' + route)

    const robots = html.match(/<meta\b[^>]*\bname="robots"[^>]*>/g) ?? []
    assert.equal(robots.length, 1, 'Expected one robots meta tag: ' + route)
    assert.match(robots[0], /content="noindex,\s*follow"/, 'Legacy page should be noindex: ' + route)
    preserved++
  }
}

for (const chapter of chapters) {
  for (const [slug] of chapter.items) {
    const url = SITE_URL + 'articles/' + slug
    assert.ok(listed.has(url), 'Current Chinese essay missing from sitemap: ' + url)
  }
}
console.log('SEO build verified:', preserved, 'legacy URLs accessible but noindex, current essays listed')


const socialPages = [
  'index.html',
  'en/index.html',
  'glossary.html',
  'en/glossary.html',
  ...chapters.flatMap(chapter => chapter.items.map(([slug]) => 'articles/' + slug + '.html'))
]
const descriptions = new Map()
for (const htmlName of socialPages) {
  const rendered = readFileSync(resolve(output, htmlName), 'utf8')
  const descriptionsFound = rendered.match(/<meta\b[^>]*\bname="description"[^>]*>/g) ?? []
  assert.equal(descriptionsFound.length, 1, 'Exactly one SEO description required: ' + htmlName)
  const descriptionValue = /content="([^"]*)"/.exec(descriptionsFound[0])?.[1]
  assert.ok(descriptionValue && descriptionValue.length > 20, 'Meaningful description required: ' + htmlName)
  const metaUrl = rendered.match(/<meta\b[^>]*\bproperty="og:url"[^>]*>/g) ?? []
  const metaTitle = rendered.match(/<meta\b[^>]*\bproperty="og:title"[^>]*>/g) ?? []
  const twitter = rendered.match(/<meta\b[^>]*\bname="twitter:card"[^>]*>/g) ?? []
  assert.equal(metaUrl.length, 1, 'One OG canonical URL required: ' + htmlName)
  assert.equal(metaTitle.length, 1, 'One OG title required: ' + htmlName)
  assert.equal(twitter.length, 1, 'Twitter summary card missing: ' + htmlName)
  assert.ok(metaUrl[0].includes('https://hpoenixf.com/eff-agent-article/'), 'Wrong social canonical: ' + htmlName)
  const previous = descriptions.get(descriptionValue)
  // All current articles need distinct substantive descriptions; duplicates
  // mean the site-level fallback leaked back into the search index.
  assert.ok(!previous, 'Duplicate SEO description: ' + previous + ' and ' + htmlName)
  descriptions.set(descriptionValue, htmlName)
}
for (const filename of ['feed.xml', 'en/feed.xml']) {
  const rss = readFileSync(resolve(output, filename), 'utf8')
  assert.ok(rss.includes('<rss version="2.0">') && rss.includes('<item>'), 'Empty feed: ' + filename)
  assert.ok(rss.includes('https://hpoenixf.com/eff-agent-article/'), 'Wrong RSS host: ' + filename)
}
for (const home of ['index.html', 'en/index.html']) {
  const html = readFileSync(resolve(output, home), 'utf8')
  assert.ok(html.includes('github.com/hpoenixf/open-etf-agent'),
    'Runnable source entry must be visible in SSR homepage: ' + home)
}
console.log('Social / discovery build verified:', descriptions.size, 'unique descriptions, RSS and source links')

const mermaidManifest = JSON.parse(readFileSync(resolve(output, 'generated/mermaid/manifest.json'), 'utf8'))
assert.ok(mermaidManifest.diagramCount > 0 && mermaidManifest.occurrences >= mermaidManifest.diagramCount)
for (const id of Object.keys(mermaidManifest.diagrams)) {
  const filepath = resolve(output, 'generated/mermaid/' + id + '.svg')
  assert.ok(existsSync(filepath), 'Missing build-time Mermaid asset: ' + id)
  const svg = readFileSync(filepath, 'utf8')
  assert.match(svg, /<svg[\s>]/, 'Invalid Mermaid SVG: ' + id)
  assert.ok(!/<script[\s>]/i.test(svg), 'Unsafe executable SVG: ' + id)
}
for (const htmlName of socialPages) {
  const html = readFileSync(resolve(output, htmlName), 'utf8')
  assert.ok(!html.includes('diagram-static-fallback'),
    'Diagram source fallback leaked into built HTML: ' + htmlName)
  const diagramIds = [...html.matchAll(/generated\/mermaid\/([a-f0-9]{24})\.svg/g)]
    .map(m => m[1])
  for (const id of diagramIds) {
    assert.ok(mermaidManifest.diagrams[id], 'SSR references an unknown SVG: ' + htmlName + ':' + id)
  }
}
console.log('Static Mermaid verified:', mermaidManifest.diagramCount,
  'SVG assets for', mermaidManifest.occurrences, 'fences')

// Verify actual rendered heads in the normal postdocs:build pipeline.
const { englishArticleSlugs } = await import('../book.en.mjs')
const { languageAlternates } = await import('../seo-routes.mjs')
let articleSchemas = 0
let authoredSchemas = 0
let illustratedSchemas = 0
// Reuse VitePress's content loader and YAML parser, without rendering body code.
globalThis.VITEPRESS_CONFIG = await resolveConfig(process.cwd())
const editorialPages = await createContentLoader(['articles/*.md', 'en/articles/*.md']).load()
const editorialFrontmatter = new Map(editorialPages.map(page => [
  page.url.replace(/^\//, '').replace(/\.html$/, ''), page.frontmatter
]))
for (const chapter of chapters) {
  for (const [slug] of chapter.items) {
    for (const locale of ['', 'en/']) {
      if (locale && !englishArticleSlugs.includes(slug)) continue
      const source = locale + 'articles/' + slug + '.md'
      const html = readFileSync(resolve(output, source.replace(/\.md$/, '.html')), 'utf8')
      const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
        .map(match => JSON.parse(match[1])).filter(data => data['@type'] === 'Article')
      assert.equal(schemas.length, 1, 'Exactly one Article schema: ' + source)
      assert.equal(schemas[0].url, canonicalUrl(source))
      assert.equal(schemas[0].mainEntityOfPage['@id'], canonicalUrl(source))
      assert.equal(schemas[0].inLanguage, locale ? 'en-US' : 'zh-CN')
      assert.ok(schemas[0].headline && schemas[0].description)
      const frontmatter = editorialFrontmatter.get(source.replace(/\.md$/, ''))
      assert.ok(frontmatter, 'Content loader missed canonical source: ' + source)
      const expectedMetadata = articleStructuredData({ metadata: frontmatter.articleMetadata })
      for (const key of ['author', 'datePublished', 'dateModified', 'image']) {
        assert.equal(Object.hasOwn(schemas[0], key), Object.hasOwn(expectedMetadata, key),
          'Missing or invented Article ' + key + ': ' + source)
        if (Object.hasOwn(expectedMetadata, key)) {
          assert.deepEqual(schemas[0][key], expectedMetadata[key],
            'Rendered Article ' + key + ' differs from editorial frontmatter: ' + source)
        }
      }
      if (expectedMetadata.author) authoredSchemas++
      if (expectedMetadata.image) illustratedSchemas++
      for (const [, attrs] of languageAlternates(source, existsSync)) {
        const alternates = html.match(/<link\b[^>]*rel="alternate"[^>]*>/g) ?? []
        assert.equal(alternates.filter(tag => tag.includes('hreflang="' + attrs.hreflang + '"') && tag.includes('href="' + attrs.href + '"')).length, 1, 'Reciprocal alternate: ' + source)
      }
      articleSchemas++
    }
  }
}
console.log('Article discovery verified:', articleSchemas, 'canonical schemas and accepted translations')
console.log('Article provenance verified:', authoredSchemas, 'explicit authors,', illustratedSchemas,
  'explicit article images; dates and absent fields match source frontmatter')


// Panorama tag pages and article badges must be real, crawlable built pages.
const panoramaIds = [
  '017-prompt-to-answer-six-layer-panorama-v3',
  'financial-agent-system-panorama',
  'one-report-nine-architecture-judgments',
  'rag-end-to-end-system-panorama'
]
for (const prefix of ['', 'en/']) {
  const route = prefix + 'panorama'
  const url = SITE_URL + route
  assert.ok(listed.has(url), 'Panorama tag page must appear in sitemap: ' + url)
  const htmlPath = resolve(output, route + '.html')
  assert.ok(existsSync(htmlPath), 'Panorama page missing from build: ' + htmlPath)
  const html = readFileSync(htmlPath, 'utf8')
  assert.match(html, /panorama-series-card/, 'Panorama landing cards missing from SSR: ' + route)
  assert.match(html, /Panorama Series|全景系列/, 'Panorama heading missing: ' + route)
  const canonical = html.match(/<link\b[^>]*\brel="canonical"[^>]*>/g) || []
  assert.equal(canonical.length, 1, 'Panorama page requires one canonical: ' + route)
  assert.ok(canonical[0].includes('href="' + url + '"'), 'Panorama canonical mismatch: ' + route)
  assert.ok(html.includes('hreflang="en"') && html.includes('hreflang="zh-CN"'),
    'Panorama localization alternates missing: ' + route)
  assert.ok(html.includes('CollectionPage'), 'Panorama page must declare collection semantics: ' + route)
  for (const slug of panoramaIds) {
    assert.ok(html.includes('articles/' + slug), 'Panorama card missing canonical essay: ' + route + ':' + slug)
    const article = readFileSync(resolve(output, prefix + 'articles/' + slug + '.html'), 'utf8')
    assert.ok(article.includes('article-topic-tags') && article.includes('panorama'),
      'Tagged article should link back to its topic: ' + prefix + slug)
  }
}
console.log('Panorama tag: bilingual pages, canonical/hreflang/SSR cards and article badges verified.')
