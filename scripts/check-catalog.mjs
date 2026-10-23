import { existsSync, readFileSync } from 'node:fs'
import { collections, chapters, articleCount, mergedArticles } from '../book.mjs'

if (collections.length !== 3 || collections.map(entry => entry.id).join(',') !== 'modules,thinking,engineering') {
  console.error('The site must expose three canonical reading perspectives.')
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
if (primaryOwnerIds.size !== 41 || registry.schemaVersion !== 1) throw Error('Owner article map requires 41 recognized owners and schema v1')
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
if (!ownerHtml.includes("fetch('./owner-articles.json'")) throw Error('Owner view does not load canonical relation map')
const primaryCount = Object.values(registry.owners).filter(reading => reading.primary).length
console.log('Owner article mapping:', primaryOwnerIds.size, 'owners,', primaryCount, 'with dedicated essays,', referenced.size, 'distinct linked essays')
const engineering = readFileSync('engineering.md', 'utf8')
const finance = readFileSync('fintech.md', 'utf8')
const catalogue = readFileSync('catalog.md', 'utf8')
const readme = readFileSync('README.md', 'utf8')
if (!engineering.includes('<ChapterCatalog category="engineering" />')) throw Error('Engineering landing page missing')
if (!catalogue.includes('<ChapterCatalog />') || !readme.includes('AI Agent 研发工程实践')) throw Error('Three-way catalogue entry missing')
const financeSlugs = [...finance.matchAll(/\/articles\/([a-z0-9-]+)/g)].map(match => match[1])
// The cross-category finance page is a thematic map: an indexed essay may be
// linked from both a concern matrix and a reading route. This does not create
// duplicate canonical entries; the single reading tree above still enforces that.
if (new Set(financeSlugs).size < 2 || financeSlugs.some(slug => !knownArticles.has(slug))) {
  throw Error('Finance topic must link only to indexed essays')
}
console.log('Three-perspective catalogue, curated finance links and local article links validated.')


// English presentation derives slugs from book.mjs, never maintains a second article tree.
const { englishTitles, englishArticleSlugs } = await import('../book.en.mjs')
const englishKeys = Object.keys(englishTitles)
if (englishKeys.some(slug => !slugs.includes(slug)) ||
    englishArticleSlugs.some(slug => !englishTitles[slug])) throw Error('English translations must have canonical slugs and English titles')
if (new Set(englishArticleSlugs).size !== englishArticleSlugs.length) throw Error('Duplicate translated article slug')
for (const slug of englishArticleSlugs) {
  if (!slugs.includes(slug) || !existsSync('en/articles/' + slug + '.md')) throw Error('Missing English translation: ' + slug)
}
for (const path of ['index','catalog','modules','thinking','engineering','fintech','gallery','architecture','principles','roadmap']) {
  if (!existsSync('en/' + path + '.md')) throw Error('Missing English landing page: ' + path)
}
const existingTranslations = (await import('node:fs')).readdirSync('en/articles').filter(path => path.endsWith('.md')).map(path => path.slice(0, -3))
const englishCompatibilityPages = existingTranslations.filter(slug => !englishArticleSlugs.includes(slug))
for (const slug of englishCompatibilityPages) {
  const target = mergedArticles[slug]
  if (!target || !englishArticleSlugs.includes(target)) throw Error('Unregistered English article translation: ' + slug)
  const text = readFileSync('en/articles/' + slug + '.md', 'utf8')
  if (!text.includes('search: false') || !text.includes('](' + target + '.md)')) {
    throw Error('Invalid English merged article pointer: ' + slug)
  }
}
console.log('English navigation:', englishKeys.length, 'stable IDs; complete translations:', englishArticleSlugs.length, '| compatibility pages:', englishCompatibilityPages.length)


// Curated principles are reciprocal editorial links, not another mandatory article category.
const principleMap = readFileSync('principles.md', 'utf8')
const principleLinks = new Map()
for (const row of principleMap.split('\n')) {
  const anchor = row.match(/id="(principle-[1-8]|method-[1-6])"/)?.[1]
  if (!anchor) continue
  for (const [, slug] of row.matchAll(/\]\(\/articles\/([a-z0-9-]+)\)/g)) {
    if (!principleLinks.has(slug)) principleLinks.set(slug, new Set())
    principleLinks.get(slug).add(anchor)
  }
}
for (const [slug, anchors] of principleLinks) {
  if (!knownArticles.has(slug)) throw Error('Principles map references an unindexed essay: ' + slug)
  const source = readFileSync('articles/' + slug + '.md', 'utf8')
  if (![...anchors].some(anchor => source.includes('](/principles#' + anchor + ')'))) {
    throw Error('Missing contextual principle/method backlink: ' + slug)
  }
  const englishPath = 'en/articles/' + slug + '.md'
  if (existsSync(englishPath)) {
    const englishSource = readFileSync(englishPath, 'utf8')
    if (![...anchors].some(anchor => englishSource.includes('](/en/principles#' + anchor + ')'))) {
      throw Error('Missing English contextual principle/method backlink: ' + slug)
    }
  }
}
console.log('Curated principle/method cross-links validated:', principleLinks.size, 'distinct essays.')
