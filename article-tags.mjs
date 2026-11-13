import { collections, learningPathSlugs } from './book.mjs'

// Categories remain book.mjs reading paths; tags are independent, derived associations.
export const tagDefinitions = [
  { id: 'intro', zh: '入门', en: 'Getting started', path: 'getting-started' },
  { id: 'architecture', zh: '架构进阶', en: 'Architecture', path: 'thinking' },
  { id: 'engineering', zh: '研发实践', en: 'Engineering practice', path: 'engineering' },
  { id: 'finance', zh: '金融', en: 'Finance', path: 'fintech' },
  { id: 'panorama', zh: '全景', en: 'Panorama', path: 'panorama' },
  { id: 'open-source', zh: '开源', en: 'Open source', path: 'open-etf-agent' }
]

export function canonicalArticleLinks(markdown, canonical) {
  const slugs = new Set()
  // Match local Markdown destinations only; external URLs and navigation are not articles.
  for (const match of markdown.matchAll(/\]\(\s*<?((?:\/|\.\/)?(?:en\/)?articles\/([a-z0-9-]+)(?:\.md)?(?:#[^\s)>]*)?)>?(?:\s+['"][^)]*)?\s*\)/g)) {
    if (canonical.has(match[2])) slugs.add(match[2])
  }
  return [...slugs]
}

export function buildArticleTags({ slugs, financeSlugs, panoramaSlugs, openGroups }) {
  const canonical = new Set(slugs)
  const articles = Object.fromEntries(slugs.map(slug => [slug, []]))
  const add = (slug, tag) => { if (canonical.has(slug) && !articles[slug].some(item => item.id === tag.id)) articles[slug].push(tag) }
  for (const slug of learningPathSlugs) add(slug, { id: 'intro' })
  // Editorial category membership is the authority, not title keyword inference.
  for (const [category, tag] of [['thinking', 'architecture'], ['engineering', 'engineering']]) {
    for (const slug of collections.find(group => group.id === category).chapters.flatMap(chapter => chapter.items.map(([slug]) => slug))) add(slug, { id: tag })
  }
  for (const slug of financeSlugs) add(slug, { id: 'finance' })
  for (const slug of panoramaSlugs) add(slug, { id: 'panorama' })
  for (const row of openGroups.flatMap(group => group.articles)) {
    const targets = [row, ...(row.additionalTargets || [])].filter(slice => slice.target)
    if (targets.length) add(row.slug, { id: 'open-source', verification: targets.some(slice => slice.status === 'limited') ? 'scoped' : 'unverified' })
  }
  return { definitions: tagDefinitions, articles }
}
