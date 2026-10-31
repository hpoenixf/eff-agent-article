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
