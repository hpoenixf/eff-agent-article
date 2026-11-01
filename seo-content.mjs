const fallback = {
  zh: '讨论实现机制、工程取舍与证据边界，记录 Agent 系统可复核的演进过程。',
  en: 'Engineering mechanisms, trade-offs, evidence limits, and reproducible Agent system evolution.'
}

function clean(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/\\?\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[\x60*_#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function seoDescription({ title, headers = [], frontmatter = {}, english = false }) {
  const authored = clean(frontmatter.description)
  if (authored) return authored
  const headingText = (Array.isArray(headers) ? headers : [])
    .filter((h) => h && (h.level === 2 || h.level === 3))
    .map((h) => clean(h.title))
    .filter(Boolean)
    .slice(0, 3)
  const name = clean(title) || (english ? 'ETF Agent engineering notes' : 'ETF Agent 工程手记')
  const topics = headingText.join(english ? '; ' : '、')
  if (!topics) return name + (english ? '. ' + fallback.en : '：' + fallback.zh)
  return english
    ? name + '. Explore ' + topics + ', with the implementation context and evidence limits.'
    : name + '：围绕' + topics + '展开，说明工程机制、适用场景与证据边界。'
}

export function socialHead({ title, description, canonical, image, article = false, english = false }) {
  return [
    ['meta', { property: 'og:type', content: article ? 'article' : 'website' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { property: 'og:image', content: image }],
    ['meta', { property: 'og:image:alt', content: english ? 'ETF Agent Engineering Notes' : 'ETF Agent 工程手记' }],
    ['meta', { property: 'og:locale', content: english ? 'en_US' : 'zh_CN' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: image }]
  ]
}

// Opt-in editorial provenance only: the caller must verify these facts against
// the article. Never infer authorship from repo ownership, dates from build time,
// or an article illustration from the generic site social card.
function editorialMetadata(metadata) {
  if (metadata == null) return {}
  if (typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new TypeError('articleMetadata must be an object')
  }
  const result = {}
  const httpsUrl = (value, field) => {
    let url
    try { url = new URL(value) } catch { /* Report the field, not its value. */ }
    if (typeof value !== 'string' || !url || url.protocol !== 'https:' || url.username || url.password) {
      throw new TypeError(`articleMetadata.${field} must be an absolute HTTPS URL without credentials`)
    }
    return url.href
  }
  if (metadata.author != null) {
    const author = metadata.author
    if (typeof author !== 'object' || Array.isArray(author) || typeof author.name !== 'string' || !clean(author.name)) {
      throw new TypeError('articleMetadata.author requires a verified name and profile URL')
    }
    result.author = { '@type': 'Person', name: clean(author.name), url: httpsUrl(author.url, 'author.url') }
  }
  // Full calendar dates deliberately avoid ambiguous locale/timezone parsing.
  for (const key of ['datePublished', 'dateModified']) {
    if (metadata[key] == null) continue
    const value = metadata[key]
    const parsed = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T00:00:00Z') : null
    if (!parsed || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
      throw new TypeError(`articleMetadata.${key} must be a verified YYYY-MM-DD calendar date`)
    }
    result[key] = value
  }
  if (result.datePublished && result.dateModified && result.dateModified < result.datePublished) {
    throw new TypeError('articleMetadata.dateModified precedes datePublished')
  }
  if (metadata.image != null) result.image = httpsUrl(metadata.image, 'image')
  return result
}

export function articleStructuredData({ title, description, canonical, english = false, metadata }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': canonical + '#article',
    headline: clean(title),
    description,
    url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    inLanguage: english ? 'en-US' : 'zh-CN',
    isPartOf: { '@type': 'WebSite', name: 'ETF Agent · Engineering Notes', url: 'https://hpoenixf.com/eff-agent-article/' },
    ...editorialMetadata(metadata)
  }
}

export function structuredDataHead(data) {
  return ['script', { type: 'application/ld+json' }, JSON.stringify(data).replace(/</g, '\\u003c')]
}
