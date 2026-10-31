// A display-only projection. The canonical sidebar stays unchanged.
export function groupTopCategories(sidebar, categoryTitles, label) {
  const titles = new Set(categoryTitles)
  const categories = sidebar.filter(entry => titles.has(entry.text) && entry.items?.length)
  if (!categories.length) return sidebar
  const selected = new Set(categories)
  return sidebar.flatMap(entry => selected.has(entry)
    ? (entry === categories[0] ? [{ text: label, items: categories }] : [])
    : [entry])
}
