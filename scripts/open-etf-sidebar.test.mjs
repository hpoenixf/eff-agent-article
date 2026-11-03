import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { openEtfSidebar } from '../open-etf-sidebar.mjs'
import { topicGroups, topicPath } from '../open-etf-topic.mjs'
for (const language of ['zh', 'en']) test(`${language} topic sidebar follows the canonical map without duplicate articles`, () => {
  const sidebar = openEtfSidebar(language)
  const groups = topicGroups(language)
  const links = sidebar.flatMap(item => item.items || [item])
  const articles = links.filter(item => item.link.includes('/articles/'))
  assert.deepEqual(articles.map(item => item.link), groups.flatMap(group => group.articles.map(article => article.href)))
  assert.equal(new Set(articles.map(item => item.link)).size, articles.length)
  assert.deepEqual(sidebar.slice(2, 2 + groups.length).map(item => item.text), groups.map(group => group.title))
  assert.ok(sidebar.slice(2, 2 + groups.length).every(item => item.collapsed && item.items.every(child => !child.items)))
  const component = readFileSync(new URL('../.vitepress/theme/OpenEtfTopic.vue', import.meta.url), 'utf8')
  for (const item of links.filter(item => item.link.includes('#'))) {
    assert.ok(item.link.startsWith(topicPath(language) + '#'))
    assert.ok(component.includes(`id="${item.link.split('#')[1]}"`))
  }
  assert.ok(!links.some(item => /\/(fintech|panorama|financial-research-backlog)$/.test(item.link)))
})
test('only the two topic routes override existing locale navigation', () => {
  const config = readFileSync(new URL('../.vitepress/config.mts', import.meta.url), 'utf8')
  assert.match(config, /'\/open-etf-agent': openEtfSidebar\('zh'\)/)
  assert.match(config, /'\/en\/open-etf-agent': openEtfSidebar\('en'\)/)
  assert.match(config, /'\/': \[/)
  assert.match(config, /'\/en\/': \[/)
  assert.match(config, /\.\.\.readingSidebar/)
  assert.match(config, /\.\.\.englishSidebar/)
})
