import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chapters, mergedArticles, historicalEditions } from '../book.mjs'
import { SITE_URL, canonicalUrl } from '../seo-routes.mjs'

const output = resolve('.vitepress/dist')
const sitemap = readFileSync(resolve(output, 'sitemap.xml'), 'utf8')
const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]))
const legacy = [...Object.keys(mergedArticles), ...Object.keys(historicalEditions)]
let preserved = 0

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
