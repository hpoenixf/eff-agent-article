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
