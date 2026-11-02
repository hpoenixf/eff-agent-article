import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
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


test('fund allocation uses bilingual native relationships without losing the synthetic amount example', () => {
  const svgIds = (svg) => [...svg.matchAll(/\bid="([^"]+)"/g)].map(match => match[1])
  const figures = {
    'allocation-relations': ['identified-inputs', 'cash-constrains-budget', 'policy-constrains-bucket', 'fund-evidence-constrains-fund-amount', 'budget-constrains-bucket', 'bucket-constrains-fund'],
    'eligibility-outcomes': ['amount-evidence-unavailable', 'preserve-history-gap', 'eligible-fund', 'ineligible-fund', 'reconciliation', 'history-gap-to-readonly', 'readonly-output']
  }
  for (const [figure, required] of Object.entries(figures)) {
    const zh = readFileSync(resolve('visuals/fund-allocation', figure + '.svg'), 'utf8')
    const en = readFileSync(resolve('visuals/en/fund-allocation', figure + '.svg'), 'utf8')
    assert.deepEqual(svgIds(en), svgIds(zh), figure + ': translated diagram retains relationship identity')
    assert.equal(new Set(svgIds(zh)).size, svgIds(zh).length)
    for (const svg of [zh, en]) {
      assert.match(svg, /role="img" aria-labelledby="title desc"/)
      assert.match(svg, /<title id="title">[^<]+<\/title>/)
      assert.match(svg, /<desc id="desc">[^<]+<\/desc>/)
      for (const id of required) assert.ok(svgIds(svg).includes(id), figure + ': missing ' + id)
      assert.doesNotMatch(svg, /<(?:script|foreignObject|image)\b|\b(?:href|onload)=/i)
    }
    assert.equal(englishImageError('en/articles/agent-deterministic-fund-allocation.md', '../../visuals/en/fund-allocation/' + figure + '.svg'), null)
  }
  for (const language of ['', 'en/']) {
    const article = readFileSync(resolve(language + 'articles/agent-deterministic-fund-allocation.md'), 'utf8')
    assert.doesNotMatch(article, /(?:~~~|```)[ \t]*mermaid\b/)
    for (const figure of Object.keys(figures)) {
      const relative = (language ? '../../visuals/en/' : '../visuals/') + 'fund-allocation/' + figure + '.svg'
      assert.equal(article.split('](' + relative + ')').length - 1, 2, 'Figure and original SVG link remain discoverable')
    }
    const example = JSON.parse(/~~~json\n([\s\S]*?)\n~~~/.exec(article)[1])
    assert.equal(example.scenario, 'synthetic-read-only')
    assert.equal(example.dailyBudget, 300)
    assert.equal(example.allocations.reduce((sum, fund) => sum + fund.amount, 0), 230)
    assert.equal(example.allocated + example.unallocated, example.dailyBudget)
    assert.equal(example.unallocated, 70)
    assert.equal(example.ledgerWritten, false)
  }
})
