import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { englishArticleSlugs } from '../book.en.mjs'
import { pathToFileURL } from 'node:url'

const site = 'https://hpoenixf.com/eff-agent-article/'
const root = 'visuals/017-prompt-to-answer-six-layer-panorama/diagrams/'
const articles = JSON.parse(readFileSync('visuals/owner-architecture/owner-articles.json', 'utf8'))
const english = new Set(englishArticleSlugs)
const owners = [
  ...Array.from({ length: 41 }, (_, i) => 'A' + String(i + 1).padStart(2, '0')),
  ...Array.from({ length: 5 }, (_, i) => 'B' + String(i + 1).padStart(2, '0')),
  'E04'
]

function target(id, language, absolute) {
  const primary = articles.owners[id]?.primary
  if (!primary) return site + 'visuals/owner-architecture/index.html#owner=' + id
  const prefix = language === 'en' && english.has(primary) ? 'en/' : ''
  return (absolute ? site : '/') + prefix + 'articles/' + primary
}

// Parse this repository's native SVG rectangles, not arbitrary SVG/path geometry.
// Reject unhandled transforms rather than silently validating the wrong coordinates.
const attr = (tag, key) => new RegExp('(?:^|\\s)' + key + '="([^\"]*)"').exec(tag)?.[1]
const number = (tag, key) => {
  const value = Number(attr(tag, key))
  assert(attr(tag, key) !== undefined && Number.isFinite(value), 'missing numeric ' + key)
  return value
}
const rectangle = tag => Object.fromEntries(['x', 'y', 'width', 'height'].map(key => [key, number(tag, key)]))
const inside = (rect, band) => rect.y >= band.y && rect.y + rect.height <= band.y + band.height
const overlaps = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

export function validateOwnerLayout(svg, doc) {
  const rootTag = svg.match(/^<svg\b[^>]*>/)?.[0]
  assert(rootTag, 'native SVG root required')
  const width = number(rootTag, 'width'), height = number(rootTag, 'height')
  assert.equal(attr(rootTag, 'viewBox'), `0 0 ${width} ${height}`, 'SVG dimensions/viewBox differ')
  const rectTags = [...svg.matchAll(/<rect\b[^>]*\/>/g)].map(match => match[0])
  const bands = rectTags.map(rectangle).filter(rect => rect.x === 30 && rect.width === width - 60)
  assert.equal(bands.length, 6, 'six layer bands required')
  bands.forEach((band, index) => {
    assert(band.height > 0 && band.y + band.height < height, 'layer outside canvas')
    if (index) assert(bands[index - 1].y + bands[index - 1].height < band.y, 'layer bands overlap')
  })
  const primary = new Map(), cross = new Map()
  let layer
  for (const line of doc.split('\n')) {
    const heading = /^### (L[1-6])\b/.exec(line)
    if (heading) layer = heading[1]
    const row = /^\| ([ABE]\d{2}) \| (.+) \| (.+) \|$/.exec(line)
    if (!row) continue
    assert(layer && !primary.has(row[1]), 'missing or duplicate primary layer: ' + row[1])
    primary.set(row[1], layer)
    cross.set(row[1], new Set([layer, ...(row[3].match(/L[1-6]/g) ?? [])]))
  }
  assert.equal(primary.size, owners.length, 'primary layer coverage')
  const nodes = [], seen = new Set()
  for (const match of svg.matchAll(/<a\b[^>]*class="owner-chip-link"[^>]*>[\s\S]*?<\/a>/g)) {
    const chip = match[0], opening = chip.slice(0, chip.indexOf('>') + 1)
    const id = /^([ABE]\d{2})\b/.exec(attr(opening, 'aria-label') ?? '')?.[1]
    assert(primary.has(id) && !seen.has(id), 'unknown or duplicate owner: ' + id)
    seen.add(id)
    const rectTag = chip.match(/<rect\b[^>]*\/>/)?.[0]
    assert(rectTag, 'missing owner rectangle: ' + id)
    const rect = rectangle(rectTag), transform = attr(opening, 'transform')
    if (transform) {
      const delta = /^translate\((-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)\)$/.exec(transform)
      assert(delta, 'unsupported owner transform: ' + id)
      rect.x += Number(delta[1]); rect.y += Number(delta[2])
    }
    const expected = primary.get(id)
    assert(inside(rect, bands[Number(expected.slice(1)) - 1]), `${id} owner outside primary ${expected}`)
    assert(rect.x >= 245 && rect.x + rect.width <= width, 'owner outside columns: ' + id)
    nodes.push({ id, layer: expected, ...rect })
  }
  assert.equal(seen.size, primary.size, 'SVG owner coverage')
  const projections = []
  for (const match of svg.matchAll(/(<rect\b[^>]*stroke-dasharray="[^"]+"[^>]*\/>)([\s\S]*?)(?=<rect\b|<a\b|<\/svg>)/g)) {
    const rect = rectangle(match[1]), index = bands.findIndex(band => inside(rect, band))
    if (index < 0) {
      // Only the original header/legend regions may sit outside the six layer bands.
      assert(rect.y + rect.height <= bands[0].y || rect.y >= bands.at(-1).y + bands.at(-1).height, 'capability crosses a layer boundary')
      continue
    }
    const sources = [...new Set(match[2].match(/\b[ABE]\d{2}\b/g) ?? [])].sort()
    assert(sources.length, 'capability projection has no source Owner')
    const projectedLayer = 'L' + (index + 1)
    for (const id of sources) assert(cross.get(id)?.has(projectedLayer), `${id} projection ${projectedLayer} absent from primary/cross-layer index`)
    projections.push({ layer: projectedLayer, sources, ...rect })
  }
  for (const id of ['A37', 'A08', 'A39']) assert(projections.some(note => note.layer === 'L1' && note.sources.includes(id)), 'missing L1 input projection: ' + id)
  const boxes = [...nodes, ...projections]
  for (let i = 0; i < boxes.length; i++) for (let k = i + 1; k < boxes.length; k++) {
    assert(!overlaps(boxes[i], boxes[k]), `overlapping owner/capability boxes: ${boxes[i].id ?? boxes[i].sources} / ${boxes[k].id ?? boxes[k].sources}`)
  }
  return { width, height, nodes: nodes.sort((a, b) => a.id.localeCompare(b.id)), projections: projections.sort((a, b) => a.y - b.y || a.x - b.x) }
}

export function checkPanoramaOwnerLinks() {
  for (const id of owners) {
    const primary = articles.owners[id]?.primary
    if (primary) {
      assert(existsSync('articles/' + primary + '.md'), 'missing owner article ' + id)
      if (english.has(primary)) {
        assert(existsSync('en/articles/' + primary + '.md'), 'missing English owner article ' + id)
      }
    }
  }

  const layouts = []
  for (const lang of ['zh', 'en']) {
    const svgPath = root + 'v3-owner-map-' + lang + '.svg'
    const markdownPath = (lang === 'en' ? 'en/' : '') + 'articles/017-prompt-to-answer-six-layer-panorama-v3.md'
    const svg = readFileSync(svgPath, 'utf8')
    const doc = readFileSync(markdownPath, 'utf8')
    layouts.push(validateOwnerLayout(svg, doc))
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
    assert.equal(matches.length, 47, 'SVG chips count ' + lang)
    assert.equal(discovered.size, owners.length, 'SVG owner coverage ' + lang)
    assert(doc.includes('<object class="v3-owner-map"'), 'SVG must be interactive object in ' + markdownPath)
    assert(doc.includes('data="/eff-agent-article/' + svgPath + '"'), 'incorrect SVG object source')
    assert(doc.includes('{#capability-owner-links}'), 'owner index anchor missing')

    const rows = [...doc.matchAll(/^\| ([ABE]\d{2}) \| (.+) \| (.+) \|$/gm)]
    assert.equal(rows.length, 47, 'module index row count ' + lang)
    for (const [, id, cell] of rows) {
      assert(discovered.has(id), 'appendix owner not on SVG: ' + id)
      assert(cell.includes('](' + target(id, lang, false) + ')'), 'appendix link mismatch ' + lang + ':' + id)
    }
  }
  assert.deepEqual(layouts[0], layouts[1], 'Chinese/English geometry or capability sources differ')
  console.log('V3: 47 owners, primary layers, capability sources and bilingual article links validated.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) checkPanoramaOwnerLinks()
