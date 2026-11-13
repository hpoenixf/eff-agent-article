import { categoryLinks } from '../home-reading-routes.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'

test('home illustrations stay bilingual, local, decorative and lightweight', () => {
  const homes = ['index.md', 'en/index.md'].map(p => readFileSync(p, 'utf8'))
  const assets = home => [...home.matchAll(/src: (\/images\/home\/[^\n]+)\n\s+alt: ""\n\s+width: (\d+)\n\s+height: (\d+)/g)].map(m => ({ src: m[1], alt: '', width: Number(m[2]), height: Number(m[3]) }))
  assert.deepEqual(assets(homes[0]), assets(homes[1]))
  assert.equal(assets(homes[0]).length, 1)
  let bytes = 0
  for (const image of [...assets(homes[0]), ...categoryLinks().map(item => ({ src: item.image, alt: '', width: 360, height: 152 }))]) {
    assert.match(image.src, /^\/images\/home\/[a-z-]+\.svg$/)
    assert.equal(image.alt, '') // Adjacent headings carry meaning; avoid repeated screen-reader copy.
    assert.ok(image.width > 0 && image.height > 0)
    const path = 'public' + image.src
    const svg = readFileSync(path, 'utf8')
    assert.match(svg, /<svg /)
    assert.ok(!/<(?:script|foreignObject|text)\b|\bon\w+=|\bhref=/i.test(svg))
    bytes += statSync(path).size
  }
  assert.ok(bytes < 20000)
})
