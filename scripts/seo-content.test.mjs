import test from 'node:test'
import assert from 'node:assert/strict'
import { seoDescription, socialHead } from '../seo-content.mjs'

test('editorial description takes precedence in its language', () => {
  assert.equal(seoDescription({ title: 'T', frontmatter: { description: 'An authored summary.' } }), 'An authored summary.')
})

test('missing summaries are topic-specific, not a site-wide duplicate', () => {
  const x = seoDescription({ title: 'Agent publication', headers: [{ level: 2, title: 'Effect receipts' }], english: true })
  const y = seoDescription({ title: 'Agent memory', headers: [{ level: 2, title: 'Deletion' }], english: true })
  assert.notEqual(x, y)
  assert.match(x, /Effect receipts/)
  assert.match(y, /Deletion/)
  assert.match(seoDescription({ title: '恢复', headers: [{ level: 2, title: '冷恢复' }] }), /冷恢复/)
})

test('all social links use the public canonical host', () => {
  const meta = socialHead({ title: 'Example', description: 'Text', canonical: 'https://hpoenixf.com/eff-agent-article/articles/example', image: 'https://hpoenixf.com/static/images/twitter-card.png', article: true })
  assert.equal(meta.find(([tag, props]) => props.property === 'og:url')[1].content, 'https://hpoenixf.com/eff-agent-article/articles/example')
  assert.equal(meta.find(([tag, props]) => props.property === 'og:type')[1].content, 'article')
  assert.ok(meta.some(([tag, props]) => props.name === 'twitter:card'))
})

import { articleStructuredData, structuredDataHead } from '../seo-content.mjs'

test('article schema describes the canonical page without invented provenance', () => {
  const canonical = 'https://hpoenixf.com/eff-agent-article/en/articles/example'
  const data = articleStructuredData({ title: 'Example', description: 'Evidence boundaries.', canonical, english: true })
  assert.equal(data['@type'], 'Article')
  assert.equal(data.url, canonical)
  assert.equal(data.mainEntityOfPage['@id'], canonical)
  assert.equal(data.inLanguage, 'en-US')
  assert.equal(data.headline, 'Example')
  for (const key of ['author', 'datePublished', 'dateModified', 'image', 'aggregateRating']) assert.ok(!(key in data))
})

test('JSON-LD cannot break out of its script element', () => {
  const data = { description: '</script><script>alert(1)</script>' }
  const head = structuredDataHead(data)
  assert.equal(head[1].type, 'application/ld+json')
  assert.ok(!head[2].includes('<'))
  assert.deepEqual(JSON.parse(head[2]), data)
})
