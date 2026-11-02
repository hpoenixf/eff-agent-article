import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createMarkdownRenderer } from 'vitepress'
import { chapters, historicalEditions } from '../book.mjs'
import { englishArticleSlugs } from '../book.en.mjs'
import { articleReadingBriefPlugin } from '../article-reading-brief.mjs'

const md = await createMarkdownRenderer(process.cwd(), { highlight: code => code, config: renderer => renderer.use(articleReadingBriefPlugin) })
const slugs = [...chapters.flatMap(chapter => chapter.items.map(([slug]) => slug)), ...Object.keys(historicalEditions)]
const output = process.argv.includes('--output')
let checked = 0
const conclusions = new Map()
for (const slug of slugs) {
  for (const prefix of ['', 'en/']) {
    const path = `${prefix}articles/${slug}.md`
    if (!existsSync(path)) {
      assert.ok(prefix && !englishArticleSlugs.includes(slug), 'Missing registered article: ' + path)
      continue
    }
    const env = { relativePath: path }
    const source = readFileSync(path, 'utf8')
    md.render(source, env)
    const brief = env.frontmatter.readingBrief
    const signature = JSON.stringify(brief.takeaways)
    assert.ok(!conclusions.has(signature), 'Repeated full conclusion set: ' + path + ' / ' + conclusions.get(signature))
    conclusions.set(signature, path)
    // A body excerpt or a template can pass structural tests: semantic review
    // against the complete article is still mandatory before publication.
    if (output) {
      const html = readFileSync('.vitepress/dist/' + path.replace(/\.md$/, '.html'), 'utf8')
      assert.equal((html.match(/class="article-reading-brief"/g) || []).length, 1, 'One SSR brief: ' + path)
      const card = html.slice(html.indexOf('class="article-reading-brief"'), html.indexOf('</aside>', html.indexOf('class="article-reading-brief"')))
      assert.match(card, /aria-labelledby="article-reading-brief-title"/)
      assert.ok(html.indexOf('</h1>') < html.indexOf('class="article-reading-brief"'), 'Title must precede brief: ' + path)
      const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
      for (const text of [...brief.takeaways, ...brief.appliesTo, ...brief.notFor]) assert.ok(card.includes(escape(text)), 'Missing SSR brief text: ' + path)
      const label = prefix ? `Estimated ${env.frontmatter.readingEstimate.minutes} min read` : `预计阅读 ${env.frontmatter.readingEstimate.minutes} 分钟`
      assert.ok(card.includes(label), 'Wrong localized estimate: ' + path)
    }
    checked++
  }
}
console.log(`Reading briefs checked: ${checked} existing article editions${output ? ', including complete SSR cards' : ''}.`)
