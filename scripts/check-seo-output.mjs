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
