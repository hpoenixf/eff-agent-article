import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { englishArticleSlugs } from '../book.en.mjs'

const site = 'https://hpoenixf.com/eff-agent-article/'
const root = 'visuals/017-prompt-to-answer-six-layer-panorama/diagrams/'
const articles = JSON.parse(readFileSync('visuals/owner-architecture/owner-articles.json', 'utf8'))
const english = new Set(englishArticleSlugs)
const owners = [
  ...Array.from({ length: 37 }, (_, i) => 'A' + String(i + 1).padStart(2, '0')),
  ...Array.from({ length: 5 }, (_, i) => 'B' + String(i + 1).padStart(2, '0')),
  'E04'
]

function target(id, language, absolute) {
  const primary = articles.owners[id]?.primary
  if (!primary) return site + 'visuals/owner-architecture/index.html#owner=' + id
  const prefix = language === 'en' && english.has(primary) ? 'en/' : ''
  return (absolute ? site : '/') + prefix + 'articles/' + primary
}

for (const id of owners) {
  const primary = articles.owners[id]?.primary
  if (primary) {
    assert(existsSync('articles/' + primary + '.md'), 'missing owner article ' + id)
    if (english.has(primary)) {
      assert(existsSync('en/articles/' + primary + '.md'), 'missing English owner article ' + id)
    }
  }
}

for (const lang of ['zh', 'en']) {
  const svgPath = root + 'v3-owner-map-' + lang + '.svg'
  const markdownPath = (lang === 'en' ? 'en/' : '') + 'articles/017-prompt-to-answer-six-layer-panorama-v3.md'
  const svg = readFileSync(svgPath, 'utf8')
  const doc = readFileSync(markdownPath, 'utf8')
  const matches = [...svg.matchAll(/<a class="owner-chip-link" href="([^"]+)" target="_top"[^>]*>[\s\S]*?<\/a>/g)]
  const discovered = new Set()

  for (const [, href] of matches) {
    const snippet = matches[discovered.size][0]
    const id = snippet.match(/>([ABE]\d{2})<\/text><\/a>$/)?.[1]
    assert(id && owners.includes(id), 'invalid owner link in ' + svgPath)
    assert(!discovered.has(id), 'duplicate owner ' + id + ' in ' + svgPath)
    assert.equal(href, target(id, lang, true), 'SVG link mismatch ' + lang + ':' + id)
    discovered.add(id)
  }
  assert.equal(matches.length, 43, 'SVG chips count ' + lang)
  assert.equal(discovered.size, owners.length, 'SVG owner coverage ' + lang)
  assert(doc.includes('<object class="v3-owner-map"'), 'SVG must be interactive object in ' + markdownPath)
  assert(doc.includes('data="/eff-agent-article/' + svgPath + '"'), 'incorrect SVG object source')
  assert(doc.includes('{#capability-owner-links}'), 'owner index anchor missing')

  const rows = [...doc.matchAll(/^\| ([ABE]\d{2}) \| (.+) \| (.+) \|$/gm)]
  assert.equal(rows.length, 43, 'module index row count ' + lang)
  for (const [, id, cell] of rows) {
    assert(discovered.has(id), 'appendix owner not on SVG: ' + id)
    assert(cell.includes('](' + target(id, lang, false) + ')'), 'appendix link mismatch ' + lang + ':' + id)
  }
}
console.log('V3: 43 interactive owner chips and matching Chinese/English article links validated.')
