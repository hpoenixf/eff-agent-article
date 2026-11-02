// Only the independent catalogue owns these query keys. No browser storage:
// each history entry, shared URL and language route carries its own state.
export const DEFAULT_CATALOG_SORT = 'created-desc'
export const CATALOG_SORT_ORDERS = ['category', 'created-desc', 'created-asc', 'updated-desc', 'updated-asc']
const urlFor = value => new URL(value, 'https://catalog.invalid')
const knownTags = (values, tagIds) => tagIds.filter(id => values.includes(id))

export function readCatalogLocation(value, tagIds) {
  const params = urlFor(value).searchParams
  const sort = params.get('sort')
  const rawPage = params.get('page') || ''
  const page = /^[1-9]\d*$/.test(rawPage) ? Number(rawPage) : 1
  return {
    sort: CATALOG_SORT_ORDERS.includes(sort) ? sort : DEFAULT_CATALOG_SORT,
    page: Number.isSafeInteger(page) ? page : 1,
    // Ignore unknown tags, collapse duplicates, use the registry's stable order.
    tags: knownTags(params.getAll('tags').flatMap(value => value.split(',')), tagIds)
  }
}

export function writeCatalogLocation(value, state, tagIds) {
  const url = urlFor(value)
  const sort = CATALOG_SORT_ORDERS.includes(state.sort) ? state.sort : DEFAULT_CATALOG_SORT
  const tags = knownTags(state.tags, tagIds)
  for (const key of ['sort', 'page', 'tags']) url.searchParams.delete(key)
  // Default state is a clean URL; a non-default state is explicit and shareable.
  if (sort !== DEFAULT_CATALOG_SORT) url.searchParams.set('sort', sort)
  if (Number.isSafeInteger(state.page) && state.page > 1) url.searchParams.set('page', String(state.page))
  if (tags.length) url.searchParams.set('tags', tags.join(','))
  return url.pathname + url.search + url.hash
}
