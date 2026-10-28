import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { localAsset, englishImageError } from './check-bilingual-visuals.mjs'

const output = resolve('test-output')
mkdirSync(output, { recursive: true })
const root = mkdtempSync(join(output, 'visual-asset-contract-'))
const write = (path, text) => {
  mkdirSync(resolve(root, path, '..'), { recursive: true })
  writeFileSync(resolve(root, path), text)
}
write('public/diagrams/english.svg', '<svg><text>Evidence</text></svg>')
write('public/diagrams/chinese.svg', '<svg><text>证据</text></svg>')
write('diagrams/english.svg', '<svg><text>旧根目录</text></svg>')
write('visuals/legacy.svg', '<svg><text>Legacy</text></svg>')

test('site-root images use the public asset, including query and encoded path', () => {
  assert.equal(localAsset('en/articles/example.md', '/diagrams/english.svg?v=1#caption', root), resolve(root, 'public/diagrams/english.svg'))
  assert.equal(localAsset('en/articles/example.md', '/diagrams/%65nglish.svg', root), resolve(root, 'public/diagrams/english.svg'))
  assert.equal(englishImageError('en/articles/example.md', '/diagrams/english.svg', root), null)
})
test('legacy repository-root and article-relative assets still resolve', () => {
  assert.equal(englishImageError('en/articles/example.md', '/visuals/legacy.svg', root), null)
  assert.equal(englishImageError('en/articles/example.md', '../../visuals/legacy.svg', root), null)
})
test('genuinely absent assets and Chinese-labelled English images still fail', () => {
  assert.match(englishImageError('en/articles/example.md', '/diagrams/missing.svg', root), /English image missing/)
  assert.match(englishImageError('en/articles/example.md', '/diagrams/chinese.svg', root), /Chinese-labelled image/)
  assert.equal(englishImageError('en/articles/example.md', 'https://example.org/image.svg', root), null)
})
