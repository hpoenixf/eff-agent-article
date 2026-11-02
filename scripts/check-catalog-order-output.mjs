import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

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
    assert.ok(html.includes('class="collection-block"'), 'Default grouped catalogue must remain SSR-visible')
    assert.ok(!html.includes('class="catalog-chronological-list"'), 'Date sorting is opt-in, not a changed default')
  } else assert.ok(!html.includes('id="catalog-sort-order"'), 'Date control must not leak onto home or category pages')
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
  console.log('Catalogue sorting controls and six homepage topic cards verified in both languages; category defaults preserved.')
}
