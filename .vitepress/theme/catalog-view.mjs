// Reader-only projection: preserve canonical collections and never mutate book data.
export function catalogView(collections, { category, selectedTags = [], articles = {} } = {}) {
  const matches = (slug) => selectedTags.every(id => (articles[slug] || []).some(tag => tag.id === id))
  const visible = collections.filter(collection => !category || collection.id === category).map(collection => ({
    ...collection,
    chapters: collection.chapters.map(chapter => ({
      ...chapter,
      items: chapter.items.filter(([slug]) => matches(slug)),
      related: chapter.related?.filter(([slug]) => matches(slug))
    })).filter(chapter => chapter.items.length)
  })).filter(collection => collection.chapters.length)
  const articleCount = new Set(visible.flatMap(collection => collection.chapters.flatMap(chapter => chapter.items.map(([slug]) => slug)))).size
  return { collections: visible, articleCount }
}

// Sort one global, filtered primary list; do not reorder the authoritative book,
// individual category pages, related links, or the default grouped view.
export function chronologicalCatalog(collections, { order, chronology = {}, sourcePath = slug => `articles/${slug}.md` } = {}) {
  if (!['created-asc', 'created-desc', 'updated-asc', 'updated-desc'].includes(order)) throw new Error('Unknown catalogue date order')
  const [field, direction] = order.split('-')
  const validEvent = event => typeof event?.timestamp === 'string' && Number.isFinite(Date.parse(event.timestamp)) ? event : null
  const entries = collections.flatMap(collection => collection.chapters.flatMap(chapter => chapter.items.map(([slug, title]) => ({
    slug, title, categoryId: collection.id, categoryTitle: collection.title,
    created: validEvent(chronology[sourcePath(slug)]?.created),
    updated: validEvent(chronology[sourcePath(slug)]?.updated)
  })))).map((entry, ordinal) => ({ ...entry, ordinal }))
  const time = entry => {
    const value = Date.parse(entry[field]?.timestamp)
    return Number.isFinite(value) ? value : null
  }
  return entries.sort((a, b) => {
    const left = time(a), right = time(b)
    if (left === null || right === null) return left === right ? a.ordinal - b.ordinal : left === null ? 1 : -1
    return (direction === 'asc' ? left - right : right - left) || a.ordinal - b.ordinal
  })
}
