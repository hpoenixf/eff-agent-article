import { mergedArticles } from './book.mjs'

// Pure path routing: VitePress site base is applied separately via withBase().
// The translatedArticles argument includes full historical English editions, not only active catalogue entries.
export const availableEnglishPages = ['','index','catalog','modules','thinking','engineering','fintech','financial-research-backlog','gallery','architecture','principles','roadmap']
export function localizedSitePath(rawPath, language, translatedArticles) {
  const cleaned = rawPath.replace(/^\//, '').replace(/\/$/, '').replace(/\.html$/, '')
  let path = cleaned === 'en' ? '' : cleaned.startsWith('en/') ? cleaned.slice(3) : cleaned
  const mergedArticle = /^articles\/([a-z0-9-]+)$/.exec(path)
  if (mergedArticle && mergedArticles[mergedArticle[1]]) {
    path = 'articles/' + mergedArticles[mergedArticle[1]]
  }
  if (language === 'en') {
    const article = /^articles\/([a-z0-9-]+)$/.exec(path)
    if (!availableEnglishPages.includes(path) && !(article && translatedArticles.includes(article[1]))) return null
  }
  return '/' + (language === 'en' ? 'en/' : '') + path
}
