import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createMarkdownRenderer } from 'vitepress'
import { canonicalDescriptionPaths, buildArticleDescriptions, descriptionForArticle } from '../article-description.mjs'

const escapeHtml = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const md = await createMarkdownRenderer(process.cwd(), { highlight: code => code })
const paths = canonicalDescriptionPaths(), pages = [], seen = new Map()
for (const path of paths) {
  assert.ok(existsSync(path), 'Missing canonical article: ' + path)
  const env = {}; md.render(readFileSync(path, 'utf8'), env)
  pages.push({ url: '/' + path.slice(0, -3), frontmatter: env.frontmatter })
}
const { articles } = buildArticleDescriptions(pages, paths)
for (const page of pages) {
  const description = descriptionForArticle(articles, page.url)
  assert.ok(!seen.has(description), 'Duplicate authored description: ' + page.url + ' / ' + seen.get(description))
  seen.set(description, page.url)
  assert.notEqual(description, page.frontmatter.title, 'A title is not an article introduction: ' + page.url)
  assert.ok(!page.frontmatter.readingBrief?.takeaways?.includes(description), 'Do not copy one conclusion into the introduction: ' + page.url)
}
if (process.argv.includes('--output')) {
  for (const prefix of ['', 'en/']) for (const page of ['index', 'catalog']) {
    const html = readFileSync('.vitepress/dist/' + prefix + page + '.html', 'utf8')
    const rows = [...html.matchAll(/<p\b([^>]*class="article-list-description"[^>]*)>([\s\S]*?)<\/p>/g)]
    const expected = page === 'catalog' ? 20 : html.includes('data-history="available"') ? 7 : 0
    assert.equal(rows.length, expected, prefix + page + ': visible list description count')
    for (const [, attrs, text] of rows) {
      const href = /data-description-for="([^"]+)"/.exec(attrs)?.[1] || ''
      const title = /title="([^"]+)"/.exec(attrs)?.[1] || ''
      const id = /id="([^"]+)"/.exec(attrs)?.[1]
      const description = descriptionForArticle(articles, href)
      assert.equal(text, escapeHtml(description), 'Full authored description must survive SSR: ' + href)
      assert.equal(title, escapeHtml(description), 'Unclipped native tooltip missing: ' + href)
      assert.ok(id && html.includes('aria-describedby="' + id + '"'), 'Title link must reference its complete description: ' + href)
    }
  }
}
console.log(`Authored article descriptions checked: ${paths.length} canonical language editions${process.argv.includes('--output') ? ', with exact recent/catalog SSR text' : ''}.`)
