// Reading order and associations come only from book.mjs (including its English projection).
export function readingSidebar(collections, { pathFor = slug => '/articles/' + slug, english = false } = {}) {
  const entry = ([slug, title]) => ({
    text: title + (english && !pathFor(slug).startsWith('/en/') ? ' · 中文' : ''),
    link: pathFor(slug)
  })
  return collections.map(collection => ({
    text: collection.title,
    collapsed: true,
    items: collection.chapters.map(chapter => ({
      text: chapter.title,
      collapsed: true,
      items: [
        ...chapter.items.map(entry),
        ...(chapter.related?.length ? [{
          text: english ? 'Related reading · canonical entry elsewhere' : '关联阅读 · 主目录收录在别处',
          collapsed: true,
          items: chapter.related.map(entry)
        }] : [])
      ]
    }))
  }))
}
