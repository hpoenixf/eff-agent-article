import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const root = new URL('../', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')
const stages = {
  intro: { slug: 'agent-in-15-minutes', count: 10, source: ['src/gateway.mjs', 'src/runtime.mjs', 'src/tools.mjs'] },
  intermediate: { slug: 'agent-ten-modules', count: 16, source: ['src/skills.mjs', 'src/mcp.mjs', 'src/memory.mjs', 'src/child.mjs'] },
  deep: { slug: 'open-etf-agent-v010-system-design', count: 17, source: ['src/specialist-demo.mjs', 'src/specialist-child.mjs', 'src/calculation.mjs'] }
}
const sourcePrefix = 'https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/'
const map = (stage, lang) => 'visuals/learning-stage-maps/' + stage + '-' + lang + '.svg'

test('three six-layer maps have bilingual source parity and no unrelated Owner domains', () => {
  for (const [stage, spec] of Object.entries(stages)) {
    const texts = ['zh', 'en'].map(lang => read(map(stage, lang)))
    const linkSets = texts.map(text => [...text.matchAll(/<a class="stage-link" href="([^"]+)"/g)].map(match => match[1]))
    for (const [index, content] of texts.entries()) {
      assert.match(content, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="2960" height="1754"/)
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
