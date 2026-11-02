import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createMarkdownRenderer } from 'vitepress'
import { chapters } from '../book.mjs'
import { englishTitles } from '../book.en.mjs'
import { canonicalDescriptionPaths } from '../article-description.mjs'

// Candidate detection uses the existing Owner registry, not a second ID list.
// Narrative/code/diagram exceptions still require contextual editorial review.
export function internalOwnerIds(text, ownerIds) {
  return [...String(text || '').matchAll(/(?<![A-Za-z0-9_])[ABE]\d{2}(?![A-Za-z0-9_])/g)]
    .map(match => match[0]).filter(id => ownerIds.has(id))
}
export function assertReaderLabel(text, ownerIds, location) {
  const ids = internalOwnerIds(text, ownerIds)
  assert.equal(ids.length, 0, `Use the responsibility name rather than internal Owner IDs (${ids.join(', ')}): ${location}`)
}

export async function checkReaderLabels({ output = false } = {}) {
  const ownerHtml = readFileSync('visuals/owner-architecture/index.html', 'utf8')
  const embedded = /<script[^>]*id="owner-data"[^>]*>([\s\S]*?)<\/script>/.exec(ownerHtml)
  assert.ok(embedded, 'Missing authoritative Owner registry')
  const ownerIds = new Set(JSON.parse(embedded[1]).owners.map(owner => owner.id))
  const md = await createMarkdownRenderer(process.cwd(), { highlight: code => code, config: renderer => {
    renderer.core.ruler.push('capture_reader_labels', state => { state.env.readerLabelTokens = state.tokens })
  } })
  for (const chapter of chapters) for (const [slug, label] of [...chapter.items, ...(chapter.related || [])]) {
    assertReaderLabel(label, ownerIds, 'book.mjs:' + slug)
    if (englishTitles[slug]) assertReaderLabel(englishTitles[slug], ownerIds, 'book.en.mjs:' + slug)
  }
  const paths = canonicalDescriptionPaths()
  for (const path of paths) {
    const env = {}; md.render(readFileSync(path, 'utf8'), env)
    const fm = env.frontmatter || {}, tokens = env.readerLabelTokens
    for (const field of ['title', 'description']) assertReaderLabel(fm[field], ownerIds, path + ':' + field)
    for (const field of ['takeaways', 'appliesTo', 'notFor']) for (const text of fm.readingBrief?.[field] || []) assertReaderLabel(text, ownerIds, path + ':readingBrief.' + field)
    for (let i = 0; i < tokens.length; i++) if (tokens[i].type === 'heading_open' && tokens[i].tag === 'h1') {
      const visible = (tokens[i + 1].children || []).filter(token => ['text', 'code_inline', 'image'].includes(token.type)).map(token => token.content).join('')
      assertReaderLabel(visible, ownerIds, path + ':H1')
    }
    if (output) {
      const html = readFileSync('.vitepress/dist/' + path.replace(/\.md$/, '.html'), 'utf8')
      const heading = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(html)
      assert.ok(heading, 'Missing article H1: ' + path)
      assertReaderLabel(heading[1].replace(/<[^>]*>/g, ''), ownerIds, path + ':SSR H1')
    }
  }
  return paths.length
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Reader-facing labels checked: ${await checkReaderLabels({ output: process.argv.includes('--output') })} canonical language editions. Narrative exceptions require editorial review.`)
}
