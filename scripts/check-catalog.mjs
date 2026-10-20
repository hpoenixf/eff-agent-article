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
// One reviewed Owner -> article relation registry; book.mjs remains the only article catalogue.
const ownerHtml = readFileSync('visuals/owner-architecture/index.html', 'utf8')
const embedded = ownerHtml.match(/<script type="application\/json" id="owner-data">([\s\S]*?)<\/script>/)
if (!embedded) throw Error('Owner diagram data not found')
const ownerData = JSON.parse(embedded[1])
const registry = JSON.parse(readFileSync('visuals/owner-architecture/owner-articles.json', 'utf8'))
const primaryOwnerIds = new Set(ownerData.owners.filter(o => /^(?:A\d\d|B\d\d|E04)$/u.test(o.id)).map(o => o.id))
if (primaryOwnerIds.size !== 38 || registry.schemaVersion !== 1) throw Error('Owner article map requires 38 recognized owners and schema v1')
const knownArticles = new Map(chapters.flatMap(chapter => chapter.items))
const referenced = new Set()
for (const [ownerId, reading] of Object.entries(registry.owners)) {
  if (!primaryOwnerIds.has(ownerId)) throw Error('Unknown Owner article mapping: ' + ownerId)
  const entries = [reading.primary, ...(reading.related || [])].filter(Boolean)
  if (new Set(entries).size !== entries.length) throw Error('Repeated article for Owner ' + ownerId)
  for (const slug of entries) {
    if (!knownArticles.has(slug)) throw Error('Non-indexed article ' + slug + ' for ' + ownerId)
    referenced.add(slug)
  }
}
for (const [slug, title] of Object.entries(registry.articles)) {
  if (!referenced.has(slug) || knownArticles.get(slug) !== title) throw Error('Owner article label or unused mapping: ' + slug)
}
if (referenced.size !== Object.keys(registry.articles).length) throw Error('Owner article labels incomplete')
if (!ownerHtml.includes("fetch('./owner-articles.json')")) throw Error('Owner view does not load canonical relation map')
const primaryCount = Object.values(registry.owners).filter(reading => reading.primary).length
console.log('Owner article mapping:', primaryOwnerIds.size, 'owners,', primaryCount, 'with dedicated essays,', referenced.size, 'distinct linked essays')
console.log('Two-perspective catalogue and local article links validated.')
