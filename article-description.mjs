import { chapters } from './book.mjs'
import { englishArticleSlugs } from './book.en.mjs'

// Authored frontmatter is the sole editorial source. No title, body excerpt,
// readingBrief or SEO fallback is allowed to manufacture a list description.
export function authoredArticleDescription(frontmatter = {}, path = '') {
  const value = frontmatter.description
  if (typeof value !== 'string' || !value.trim()) throw new Error('Missing authored article description: ' + path)
  const text = value.replace(/\s+/g, ' ').trim()
  if (/<\/?[a-z][^>]*>|\[[^\]]+\]\([^)]*\)/i.test(text)) throw new Error('Article description must be plain text: ' + path)
  return text
}

export function canonicalDescriptionPaths() {
  const slugs = chapters.flatMap(chapter => chapter.items.map(([slug]) => slug))
  const translated = new Set(englishArticleSlugs)
  return slugs.flatMap(slug => ['articles/' + slug + '.md', ...(translated.has(slug) ? ['en/articles/' + slug + '.md'] : [])])
}

export function descriptionSourcePath(value) {
  const path = String(value).replace(/^\/eff-agent-article\//, '').replace(/^\//, '').replace(/\.(?:md|html)$/, '')
  if (!/^(?:en\/)?articles\/[a-z0-9-]+$/.test(path)) throw new Error('Invalid article description path: ' + value)
  return path + '.md'
}

export function buildArticleDescriptions(pages, paths = canonicalDescriptionPaths()) {
  const required = new Set(paths), articles = {}
  if (required.size !== paths.length) throw new Error('Duplicate canonical description path')
  for (const page of pages) {
    const path = descriptionSourcePath(page.url)
    if (!required.has(path)) continue // Ignore compatibility and historical editions.
    if (Object.hasOwn(articles, path)) throw new Error('Duplicate article description source: ' + path)
    const fm = page.frontmatter || {}
    if ([true, 'true'].includes(fm.draft) || [false, 'false'].includes(fm.published)) throw new Error('Canonical article is not published: ' + path)
    articles[path] = authoredArticleDescription(fm, path)
  }
  for (const path of required) if (!Object.hasOwn(articles, path)) throw new Error('Missing canonical description source: ' + path)
  return { articles }
}

// Resolve the actual destination chosen by the existing language router. A
// Chinese-original fallback uses its real Chinese description, not a fake EN one.
export function descriptionForArticle(articles, href) {
  const path = descriptionSourcePath(href), value = articles[path]
  if (typeof value !== 'string' || !value) throw new Error('Missing indexed article description: ' + path)
  return value
}
