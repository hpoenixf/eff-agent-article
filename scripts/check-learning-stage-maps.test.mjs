import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { validateOwnerLayout } from './check-panorama-owner-links.mjs'
import { learningPathStages } from '../.vitepress/theme/learning-path-nav.mjs'

const root = new URL('../', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')
const stages = {
  intro: { slug: 'agent-in-15-minutes', width: 1720, height: 1110, count: 10, source: ['src/gateway.mjs', 'src/runtime.mjs', 'src/tools.mjs'] },
  intermediate: { slug: 'agent-ten-modules', width: 2240, height: 1110, count: 16, source: ['src/skills.mjs', 'src/mcp.mjs', 'src/memory.mjs', 'src/child.mjs'] },
  deep: { slug: 'open-etf-agent-v010-system-design', width: 2240, height: 1110, count: 17, source: ['src/specialist-demo.mjs', 'src/specialist-child.mjs', 'src/calculation.mjs'] }
}
const sourcePrefix = 'https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/'
const map = (stage, lang) => 'visuals/learning-stage-maps/' + stage + '-' + lang + '.svg'

test('three six-layer maps have bilingual source parity and no unrelated Owner domains', () => {
  for (const [stage, spec] of Object.entries(stages)) {
    const texts = ['zh', 'en'].map(lang => read(map(stage, lang)))
    const linkSets = texts.map(text => [...text.matchAll(/<a class="stage-link" href="([^"]+)"/g)].map(match => match[1]))
    for (const [index, content] of texts.entries()) {
      assert.ok(content.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="' + spec.width + '" height="' + spec.height + '" viewBox="0 0 ' + spec.width + ' ' + spec.height + '"'), stage + ': incorrect compact dimensions')
      assert.ok(content.endsWith('</svg>'))
      assert.equal(linkSets[index].length, spec.count, stage)
      assert.ok(linkSets[index].every(href => href.startsWith(sourcePrefix)))
      for (const source of spec.source) assert.ok(content.includes(sourcePrefix + source), stage + ': ' + source)
      // The production panorama's unrelated Owner IDs and financial / Web-only columns are not rendered here.
      assert.doesNotMatch(content, /(?:owner=B0[1-5]|owner=A(?:09|27|40)|v3-owner-map)/)
    }
    assert.deepEqual(linkSets[0], linkSets[1], stage + ': translated diagrams differ in source links')
    assert.doesNotMatch(texts[1], /[\u3400-\u9fff]/, stage + ': English SVG includes Chinese')
    for (const [lang, prefix] of [['zh', ''], ['en', 'en/']]) {
      const article = read(prefix + 'articles/' + spec.slug + '.md')
      const asset = '/eff-agent-article/' + map(stage, lang)
      assert.ok(article.includes('<PanoramaViewer src="' + asset + '"'))
      assert.ok(article.includes(':canvas-width="' + spec.width + '" :canvas-height="' + spec.height + '"'), stage + ': viewer must fit SVG geometry')
      assert.ok(article.includes('<object class="v3-owner-map" type="image/svg+xml" data="' + asset + '"'))
      assert.ok(article.includes('https://hpoenixf.com' + asset))
    }
  }
})

test('the committed SVGs match their single deterministic generator', () => {
  const files = Object.keys(stages).flatMap(stage => ['zh', 'en'].map(lang => map(stage, lang)))
  const previous = files.map(read)
  execFileSync(process.execPath, ['scripts/generate-learning-stage-maps.mjs'], {
    cwd: new URL('.', root), stdio: 'pipe'
  })
  assert.deepEqual(files.map(read), previous, 'regeneration must not modify committed diagrams')
})

test('compact viewer respects per-image dimensions without changing the full panorama defaults', () => {
  const viewer = read('.vitepress/theme/PanoramaViewer.vue')
  assert.ok(viewer.includes('props.canvasWidth ?? 2960'))
  assert.ok(viewer.includes('props.canvasHeight ?? 1754'))
  assert.ok(viewer.includes('stage.value.clientWidth / naturalWidth.value'))
  assert.ok(viewer.includes('stage.value.clientHeight / naturalHeight.value'))
  assert.ok(viewer.includes('compact-learning-map'))
  const panorama = read('articles/017-prompt-to-answer-six-layer-panorama-v3.md')
  assert.ok(panorama.includes('v3-owner-map-zh.svg'))
  assert.ok(panorama.includes(':canvas-width="2960" :canvas-height="1824"'))
  assert.ok(panorama.includes('style="height: 924px"'))
  assert.equal(learningPathStages().at(-1).height, 1824)
})

const ownerMap = lang => read('visuals/017-prompt-to-answer-six-layer-panorama/diagrams/v3-owner-map-' + lang + '.svg')
const ownerIndex = lang => read((lang === 'en' ? 'en/' : '') + 'articles/017-prompt-to-answer-six-layer-panorama-v3.md')

test('V3 keeps 47 single-owner chips and bilingual capability projections in their indexed layers', () => {
  const layouts = ['zh', 'en'].map(lang => validateOwnerLayout(ownerMap(lang), ownerIndex(lang)))
  assert.deepEqual(layouts[0], layouts[1])
  assert.equal(layouts[0].nodes.length, 47)
  assert.equal(layouts[0].projections.length, 23)
  for (const id of ['A38', 'A39', 'A41']) assert.equal(layouts[0].nodes.find(node => node.id === id).layer, 'L2')
  for (const id of ['A37', 'A08', 'A39']) assert.ok(layouts[0].projections.some(note => note.layer === 'L1' && note.sources.includes(id)))
  assert.ok(ownerMap('en').includes('Candidate model config'))
  assert.ok(!ownerMap('en').includes('Qualified model config'))
})

test('V3 layer guard rejects misplaced owners and chips crossing a layer boundary', () => {
  const svg = ownerMap('en'), doc = ownerIndex('en')
  for (const [from, to, id] of [
    ['translate(0 210)', 'translate(0 -132)', 'A39'],
    ['translate(0 176)', 'translate(0 298)', 'A38'],
    ['translate(0 245)', 'translate(0 315)', 'A41'],
    ['translate(0 210)', 'translate(0 271)', 'A39']
  ]) assert.throws(() => validateOwnerLayout(svg.replace(from, to), doc), new RegExp(id + ' owner outside primary L2'))
})

test('V3 source guard rejects removed inputs, unknown sources and stale cross-layer indexes', () => {
  const svg = ownerMap('en'), doc = ownerIndex('en')
  const response = /<rect x="489\.0" y="381\.0"[^>]*\/><text[^>]*>Question \/ approval reply<\/text><text[^>]*>Owner: A37 Human interaction<\/text>/
  assert.ok(response.test(svg))
  assert.throws(() => validateOwnerLayout(svg.replace(response, ''), doc), /missing L1 input projection: A37/)
  assert.throws(() => validateOwnerLayout(svg.replace('Owner: A39 Expert profiles', 'Owner: A99 Expert profiles'), doc), /A99 projection L1 absent/)
  const stale = doc.replace(/^(\| A37 \|.*? \| )L1, /m, '$1')
  assert.notEqual(stale, doc)
  assert.throws(() => validateOwnerLayout(svg, stale), /A37 projection L1 absent/)
  assert.throws(() => validateOwnerLayout(svg.replace('translate(0 210)', 'rotate(10)'), doc), /unsupported owner transform: A39/)
})

test('workshop uses the same layer vocabulary and vertical order, with actions kept as examples', async () => {
  const { sixLayerNames } = await import('./six-layer-names.mjs')
  const escape = text => text.replaceAll('&', '&amp;')
  for (const lang of ['zh', 'en']) for (const mobile of [false, true]) {
    const path = `public/diagrams/open-workshop/six-layers-${lang}${mobile ? '-mobile' : ''}.svg`
    const svg = read(path)
    const layers = [...svg.matchAll(/data-layer-id="([^"]+)" data-layer-name="([^"]+)" data-layer-top="(\d+)"/g)]
    assert.deepEqual(layers.map(match => match[1]), sixLayerNames.map(layer => layer.id))
    assert.deepEqual(layers.map(match => match[2]), sixLayerNames.map(layer => escape(layer[lang])))
    const tops = layers.map(match => Number(match[3]))
    assert.ok(tops.every((top, index) => !index || top > tops[index - 1]))
    for (const layer of sixLayerNames) {
      for (const stage of ['intro', 'intermediate', 'deep']) assert.ok(read(map(stage, lang)).includes('>' + escape(layer[lang]) + '</text>'))
      if (lang === 'zh') assert.ok(ownerMap(lang).includes('>' + layer.zh + '</text>'))
    }
    for (const term of ['v0.20', 'submit', 'work', 'Run', 'manifest', 'Main', 'Child', 'Memory', 'Publication', 'Reader']) assert.ok(svg.includes(term), term)
    assert.doesNotMatch(svg, /<a\b|mermaid|foreignObject/)
    if (lang === 'en') assert.doesNotMatch(svg, /[\u3400-\u9fff]/)
    assert.ok(svg.includes(lang === 'zh' ? '本地练习不等于完整生产或金融平台。' : 'production or finance platform.'))
  }
  const files = ['zh', 'en'].flatMap(lang => ['', '-mobile'].map(suffix => `public/diagrams/open-workshop/six-layers-${lang}${suffix}.svg`))
  const before = files.map(read)
  execFileSync(process.execPath, ['scripts/generate-workshop-layer-map.mjs'], { cwd: root, stdio: 'pipe' })
  assert.deepEqual(files.map(read), before, 'workshop diagram edits must be made in the deterministic generator')
})
