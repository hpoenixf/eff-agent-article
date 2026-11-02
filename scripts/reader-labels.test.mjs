import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createMarkdownRenderer } from 'vitepress'
import { assertReaderLabel, internalOwnerIds } from './check-reader-labels.mjs'

test('only known complete Owner IDs trigger reader-label review, not dates, quantities or real identifiers', () => {
  const ids = new Set(['A02', 'B03', 'E04'])
  assert.deepEqual(internalOwnerIds('A02 对话；B03：计算；E04 evidence', ids), ['A02', 'B03', 'E04'])
  assert.throws(() => assertReaderLabel('`A02`', ids, 'title'), /responsibility name/)
  for (const text of ['2026-11-02', 'HTTP 200', 'CNY 300', 'v0.26.2', 'A02Handler', 'field_A02', 'A020', 'A99', 'B03X', '普通职责名']) assertReaderLabel(text, ids, 'fixture')
  assert.deepEqual(internalOwnerIds(undefined, ids), [])
})

test('renamed headings retain each previous site/GitHub fragment without polluting visible title or permalink labels', async () => {
  const md = await createMarkdownRenderer(process.cwd(), { highlight: code => code })
  const cases = JSON.parse(readFileSync('scripts/fixtures/reader-heading-aliases.json', 'utf8'))
  for (const item of cases) {
    const html = md.render(readFileSync(item.path, 'utf8'))
    for (const id of item.ids) assert.equal(html.split('id="' + id + '"').length - 1, 1, item.path + '#' + id)
    for (const [, heading] of html.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/g)) {
      assert.doesNotMatch(heading, /<a id=/, 'Compatibility anchors stay outside heading text and its generated aria-label')
    }
    assert.doesNotMatch(html, /<p><a id=/, 'Compatibility block must not add an empty prose paragraph')
  }
})
