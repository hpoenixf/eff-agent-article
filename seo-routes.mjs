import { mergedArticles, historicalEditions } from './book.mjs'

export const SITE_URL = 'https://hpoenixf.com/eff-agent-article/'

// These routes are preserved for existing inbound links, but only their targets
// should appear in search results. The reading tree in book.mjs remains canonical.
const legacySlugs = new Set([
  ...Object.keys(mergedArticles),
  ...Object.keys(historicalEditions)
])

function routePath(value) {
  const pathname = new URL(value, SITE_URL).pathname
  return pathname
    .replace(/^\/eff-agent-article\//, '/')
    .replace(/^\/+/, '')
    .replace(/\.(?:html|md)$/, '')
    .replace(/\/$/, '')
}

export function isLegacyArticleRoute(value) {
  const article = /^(?:en\/)?articles\/([a-z0-9-]+)$/.exec(routePath(value))
  return Boolean(article && legacySlugs.has(article[1]))
}

export function canonicalUrl(relativePath) {
  let path = relativePath.replace(/\.md$/, '')
  if (path === 'index') path = ''
  if (path === 'en/index') path = 'en/'

  const article = /^(en\/)?articles\/([^/]+)$/.exec(path)
  if (article) {
    const target = mergedArticles[article[2]] ?? historicalEditions[article[2]]
    if (target) path = (article[1] || '') + 'articles/' + target
  }
  return SITE_URL + path
}

export function filterSitemapItems(items) {
  return items.filter(({ url }) => !isLegacyArticleRoute(url))
}
