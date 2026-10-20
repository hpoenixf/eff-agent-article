import { existsSync, readFileSync } from 'node:fs'
import { collections, chapters, articleCount, mergedArticles } from '../book.mjs'

if (collections.length !== 2 || collections[0].id !== 'modules' || collections[1].id !== 'thinking') {
  console.error('The site must expose precisely two canonical reading perspectives.')
  process.exit(1)
}
const slugs = chapters.flatMap(chapter => chapter.items.map(([slug]) => slug))
const duplicates = slugs.filter((slug, idx) => slugs.indexOf(slug) !== idx)
const actual = (await import('node:fs')).readdirSync('articles').filter(name => name.endsWith('.md')).map(name => name.slice(0, -3))
const missing = slugs.filter(slug => !existsSync('articles/' + slug + '.md'))
const unindexed = actual.filter(slug => !slugs.includes(slug) && !Object.hasOwn(mergedArticles, slug))
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
for (const [oldSlug, target] of Object.entries(mergedArticles)) {
  const page = 'articles/' + oldSlug + '.md'
  if (!existsSync(page) || !slugs.includes(target)) missing.push(oldSlug + ' -> ' + target)
  else {
    const text = readFileSync(page, 'utf8')
    if (!text.includes('search: false') || !text.includes('](' + target + '.md)')) broken.push(oldSlug + ': invalid merged article pointer')
  }
}
console.log('Indexed essays:', articleCount, '| compatibility pages:', Object.keys(mergedArticles).length, '| files:', actual.length)
if (duplicates.length || missing.length || unindexed.length || broken.length) {
  console.error({ duplicates, missing, unindexed, broken })
  process.exit(1)
}
console.log('Two-perspective catalogue and local article links validated.')
