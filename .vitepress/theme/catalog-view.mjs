// Reader-only projection: preserve canonical collections and never mutate book data.
export function catalogView(collections, { category, selectedTags = [], articles = {} } = {}) {
  const matches = (slug) => selectedTags.every(id => (articles[slug] || []).some(tag => tag.id === id))
  const visible = collections.filter(collection => !category || collection.id === category).map(collection => ({
    ...collection,
    chapters: collection.chapters.map(chapter => ({
      ...chapter,
      items: chapter.items.filter(([slug]) => matches(slug)),
      related: chapter.related?.filter(([slug]) => matches(slug))
    })).filter(chapter => chapter.items.length || chapter.related?.length)
  })).filter(collection => collection.chapters.length)
  const articleCount = new Set(visible.flatMap(collection => collection.chapters.flatMap(chapter => chapter.items.map(([slug]) => slug)))).size
  return { collections: visible, articleCount }
}

export function primaryCatalogEntries(collections, { chronology = {}, sourcePath = slug => `articles/${slug}.md` } = {}) {
  const validEvent = event => typeof event?.timestamp === 'string' && Number.isFinite(Date.parse(event.timestamp)) ? event : null
  return collections.flatMap(collection => collection.chapters.flatMap(chapter => chapter.items.map(([slug, title]) => ({
    slug, title, categoryId: collection.id, categoryTitle: collection.title,
    created: validEvent(chronology[sourcePath(slug)]?.created),
    updated: validEvent(chronology[sourcePath(slug)]?.updated)
  })))).map((entry, ordinal) => ({ ...entry, ordinal }))
}

// Sort the complete filtered primary list before pagination. Related links do
// not enter this list, and neither the book nor category pages are reordered.
export function chronologicalCatalog(collections, { order, ...options } = {}) {
  if (!['created-asc', 'created-desc', 'updated-asc', 'updated-desc'].includes(order)) throw new Error('Unknown catalogue date order')
  const [field, direction] = order.split('-')
  const entries = primaryCatalogEntries(collections, options)
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

export function paginateCatalogEntries(entries, { page = 1, pageSize = 20 } = {}) {
  if (!Number.isSafeInteger(pageSize) || pageSize < 1) throw new TypeError('Catalogue page size must be a positive integer')
  const total = entries.length
  const pageCount = Math.ceil(total / pageSize)
  const requested = Number.isSafeInteger(page) ? page : 1
  const current = Math.min(Math.max(1, requested), Math.max(1, pageCount))
  const offset = (current - 1) * pageSize
  return { items: entries.slice(offset, offset + pageSize), page: current, pageCount, total,
    start: total ? offset + 1 : 0, end: Math.min(offset + pageSize, total) }
}
