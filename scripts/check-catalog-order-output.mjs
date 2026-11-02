import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chapters } from '../book.mjs'
import { englishArticlePath } from '../book.en.mjs'

export function checkCatalogOrderHtml(html, { language, kind }) {
  const english = language === 'en'
  if (kind === 'catalog') {
    const controls = [...html.matchAll(/<select\b[^>]*id="catalog-sort-order"[^>]*>([\s\S]*?)<\/select>/g)]
    assert.equal(controls.length, 1, 'Independent catalogue needs one native sort control')
    assert.match(html, /<label\b[^>]*for="catalog-sort-order"/)
    assert.match(controls[0][0], /aria-describedby="catalog-date-note"/)
    const orders = [...controls[0][1].matchAll(/<option\b[^>]*value="([^"]+)"/g)].map(match => match[1])
    assert.deepEqual(orders, ['category', 'created-desc', 'created-asc', 'updated-desc', 'updated-asc'])
    assert.match(html, /id="catalog-date-note"/)
    assert.ok(html.includes(english ? 'not the original writing date' : '不是原稿创作日期'))
    assert.ok(html.includes(english ? 'Created: newest first' : '创建时间：从新到旧'))
    assert.ok(html.includes('class="catalog-article-list"'), 'Dense article cards must remain SSR-visible in original catalogue order')
    assert.ok(!html.includes('class="collection-block"'))
    assert.equal((html.match(/<h1\b/g) || []).length, 1, 'One catalogue title')
    assert.match(html, /<header class="catalog-page-heading"/)
    assert.equal((html.match(/class="catalog-entry-meta"/g) || []).length, 20)
    assert.equal((html.match(/class="catalog-dates"/g) || []).length, 20)
    assert.ok(html.includes(english ? 'Articles in catalogue order' : '按目录顺序排列的文章'), 'Date sorting remains opt-in')
    assert.match(html, /class="catalog-toolbar"/)
    assert.match(html, /class="catalog-select-shell"/)
    assert.match(html, /<details class="catalog-help"/)
    assert.match(html, /id="catalog-results"[^>]*role="region"[^>]*tabindex="-1"/)
    const slugs = chapters.flatMap(chapter => chapter.items.map(([slug]) => slug))
    const displayed = [...html.matchAll(/data-article="([^"]+)"/g)].map(match => match[1])
    assert.deepEqual(displayed, slugs.slice(0, 20), 'First SSR page contains exactly the first 20 primary articles')
    const allLinks = /<details class="catalog-all-links"[^>]*>([\s\S]*?)<\/details>/.exec(html)?.[1]
    assert.ok(allLinks, 'All matching links remain discoverable without JavaScript pagination')
    const links = [...allLinks.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(match => match[1])
    assert.deepEqual(links, slugs.map(slug => '/eff-agent-article' + (english ? englishArticlePath(slug) : '/articles/' + slug)))
    assert.match(html, /aria-current="page"/)
    assert.ok(html.includes(english ? 'Page 1 of ' : '第 1 / '))
  } else {
    assert.ok(!html.includes('id="catalog-sort-order"'), 'Date control must not leak onto home or category pages')
    assert.ok(!html.includes('class="catalog-pagination"'), 'Pagination must not affect home/category pages')
    assert.ok(!html.includes('class="catalog-all-links"'), 'All-links index is specific to the independent catalogue')
  }
  if (kind === 'home') {
    const links = [...html.matchAll(/<a\b([^>]*)>/g)].filter(match => /class="[^"]*\bVPFeature\b/.test(match[1]))
      .map(match => /href="([^"]+)"/.exec(match[1])?.[1])
    assert.deepEqual(links, ['modules', 'thinking', 'engineering', 'panorama', 'fintech', 'open-etf-agent'].map(route => '/eff-agent-article/' + (english ? 'en/' : '') + route))
    assert.ok(html.includes(english ? 'Explore open source' : '探索开源'))
  }
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) {
  for (const language of ['zh', 'en']) {
    const prefix = language === 'en' ? 'en/' : ''
    for (const [page, kind] of [['catalog', 'catalog'], ['index', 'home'], ['modules', 'category'], ['thinking', 'category'], ['engineering', 'category']]) {
      checkCatalogOrderHtml(readFileSync(resolve('.vitepress/dist', prefix + page + '.html'), 'utf8'), { language, kind })
    }
  }
  console.log('Bilingual catalogue toolbar, first page and complete crawlable link index verified; six homepage cards and category defaults preserved.')
}
