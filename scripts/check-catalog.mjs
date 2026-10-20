import { existsSync, readFileSync } from 'node:fs'
import { chapters, articleCount } from '../book.mjs'

const slugs = chapters.flatMap(chapter => chapter.items.map(([slug]) => slug))
const duplicates = slugs.filter((slug, idx) => slugs.indexOf(slug) !== idx)
const actual = (await import('node:fs')).readdirSync('articles').filter(name => name.endsWith('.md')).map(name => name.slice(0, -3))
const missing = slugs.filter(slug => !existsSync('articles/' + slug + '.md'))
const unindexed = actual.filter(slug => !slugs.includes(slug))
const broken = []
for (const slug of slugs) {
  if (!existsSync('articles/' + slug + '.md')) continue
  const src = readFileSync('articles/' + slug + '.md', 'utf8')
  // Check explicitly relative Markdown links. URLs and anchors are not local paths.
  for (const found of src.matchAll(/\]\(([^)]+)\)/g)) {
    const href = found[1].split('#')[0]
    if (!href || /^(?:https?:|mailto:|data:|\/)/.test(href)) continue
    if (!/\.(?:md|svg|png|jpe?g|webp|html)$/.test(href)) continue
    const path = new URL(href, 'file://' + process.cwd() + '/articles/' + slug + '.md').pathname
    if (!existsSync(path)) broken.push(slug + ': ' + href)
  }
}
console.log('Indexed articles:', articleCount, '| actual:', actual.length)
if (duplicates.length || missing.length || unindexed.length || broken.length) {
  console.error({ duplicates, missing, unindexed, broken })
  process.exit(1)
}
console.log('Catalogue and local article links validated.')
