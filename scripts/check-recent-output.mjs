import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
for (const [path, prefix] of [['index.html', '/eff-agent-article/'], ['en/index.html', '/eff-agent-article/en/']]) {
  const html = readFileSync('.vitepress/dist/' + path, 'utf8')
  const sections = html.match(/<section\b[^>]*class="recent-articles"[\s\S]*?<\/section>/g) || []
  assert.equal(sections.length, 1, `Missing/duplicate recent section: ${path}`)
  const section = sections[0]
  assert.ok(section.includes(`href="${prefix}catalog"`), `Missing full catalogue fallback: ${path}`)
  if (section.includes('data-history="unavailable"')) {
    assert.equal((section.match(/<time\b/g) || []).length, 0, 'Unavailable history must not fabricate dates')
    console.warn(`Recent history unavailable in ${path}; catalogue fallback verified`)
    continue
  }
  assert.ok(section.includes('data-history="available"'), 'Missing history availability status')
  assert.equal((section.match(/<time\b/g) || []).length, 5, `Expected five recent entries with full history: ${path}`)
  const links = [...section.matchAll(/href="([^"]+)"/g)].map(match => match[1]).filter(link => link !== prefix + 'catalog')
  assert.equal(new Set(links).size, 5, `Duplicate or missing recent article: ${path}`)
  assert.ok(links.every(link => link.startsWith(prefix + 'articles/')), `Wrong-language recent route: ${path}`)
  for (const [, value] of section.matchAll(/<time\b[^>]*datetime="([^"]+)"/g)) assert.ok(Number.isFinite(Date.parse(value)), 'Invalid timestamp')
}
console.log('Recent homepage output verified in both languages')
