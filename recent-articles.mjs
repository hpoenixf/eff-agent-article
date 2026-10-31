// Catalogue membership and translation qualification retain their existing owners.
export function recentArticles(pages, { items, englishSlugs = [], englishTitles = {}, history = new Map(), language = 'zh', limit = 5 }) {
  const titles = new Map(items), translated = new Set(englishSlugs)
  const english = language === 'en', prefix = english ? '/en/articles/' : '/articles/'
  const seen = new Set(), results = []
  for (const page of pages) {
    const match = new RegExp('^' + prefix + '([^/]+?)(?:\\.html)?$').exec(page.url)
    if (!match) continue
    const slug = match[1], fm = page.frontmatter || {}
    if (!titles.has(slug) || (english && !translated.has(slug))) continue
    if (fm.draft === true || fm.draft === 'true' || fm.published === false || fm.published === 'false') continue
    const event = history.get(prefix.slice(1) + slug + '.md')
    if (!event) continue // Uncommitted or unknown history is not today's publication.
    if (seen.has(slug)) throw new Error('Duplicate current article ' + slug)
    seen.add(slug)
    results.push({ slug, title: english ? englishTitles[slug] || titles.get(slug) : titles.get(slug),
      href: prefix + slug, ...event })
  }
  return results.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp) ||
    (a.kind === b.kind ? 0 : a.kind === 'new' ? -1 : 1) || a.slug.localeCompare(b.slug)).slice(0, limit)
}
