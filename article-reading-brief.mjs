import { chapters, historicalEditions } from './book.mjs'

// The catalogue remains the only article identity owner. Compatibility pointers
// are not essays; historical full-text editions retain their own brief.
const readableSlugs = new Set([
  ...chapters.flatMap(chapter => chapter.items.map(([slug]) => slug)),
  ...Object.keys(historicalEditions)
])

export function isBriefArticle(path = '') {
  const match = /^(?:en\/)?articles\/([a-z0-9-]+)\.md$/.exec(path)
  return Boolean(match && readableSlugs.has(match[1]))
}

export function validateReadingBrief(brief, path = '') {
  if (!brief || typeof brief !== 'object' || Array.isArray(brief)) {
    throw Error('Missing readingBrief: ' + path)
  }
  const allowed = new Set(['takeaways', 'appliesTo', 'notFor'])
  if (Object.keys(brief).some(key => !allowed.has(key))) throw Error('Unknown readingBrief field: ' + path)
  for (const [key, min, max] of [['takeaways', 3, 5], ['appliesTo', 1, 2], ['notFor', 1, 2]]) {
    const values = brief[key]
    if (!Array.isArray(values) || values.length < min || values.length > max ||
        values.some(value => typeof value !== 'string' || !value.trim() || /[<>\n\r]/.test(value)) ||
        new Set(values.map(value => value.trim())).size !== values.length) {
      throw Error('Invalid readingBrief.' + key + ': ' + path)
    }
  }
  return brief
}

function visibleHtml(source) {
  return source
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|nav)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi, ' ')
}

// Reuse the site's parsed full body, rather than an excerpt or SEO description.
// Frontmatter and generated navigation are absent from these Markdown tokens.
export function readingText(tokens) {
  return tokens.flatMap(token => {
    if (token.type === 'fence') return /^mermaid(?:\s|$)/i.test(token.info.trim()) ? [] : [token.content]
    if (token.children?.length) return [readingText(token.children)]
    if (['text', 'code_inline', 'code_block', 'image'].includes(token.type)) return [token.content]
    if (['html_block', 'html_inline'].includes(token.type)) return [visibleHtml(token.content)]
    return []
  }).join(' ')
}

// A transparent planning estimate, not a measurement of a reader's speed.
// Mixed-language pages use the same additive model in both languages. Diagrams,
// reflection and executing examples take additional time and are not timed.
export function estimateReadingTime(tokens) {
  const text = readingText(tokens).replace(/(?:https?|ftp):\/\/[^\s<>"'`]+/giu, ' ')
  const hanCharacters = (text.match(/\p{Script=Han}/gu) || []).length
  const otherWords = (text.replace(/\p{Script=Han}/gu, ' ').match(/[\p{L}\p{N}]+(?:['’_-][\p{L}\p{N}]+)*/gu) || []).length
  return { minutes: Math.max(1, Math.ceil(hanCharacters / 300 + otherWords / 200)), hanCharacters, otherWords }
}

export function articleReadingBriefPlugin(md) {
  md.core.ruler.push('article_reading_brief', state => {
    if (!isBriefArticle(state.env.relativePath)) return
    validateReadingBrief(state.env.frontmatter?.readingBrief, state.env.relativePath)
    // Always replace derived metadata; a hand-entered time cannot override it.
    state.env.frontmatter.readingEstimate = estimateReadingTime(state.tokens)
    const titleStart = state.tokens.findIndex(token => token.type === 'heading_open' && token.tag === 'h1')
    let insertion = 0
    if (titleStart >= 0) {
      const close = state.tokens.findIndex((token, index) => index > titleStart && token.type === 'heading_close' && token.tag === 'h1')
      insertion = close + 1
    }
    const card = new state.Token('html_block', '', 0)
    card.content = '<ArticleReadingBrief />\n'
    card.block = true
    state.tokens.splice(insertion, 0, card)
  })
}
