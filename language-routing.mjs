// Pure path routing: VitePress site base is applied separately via withBase().
export const availableEnglishPages = ['','index','catalog','modules','thinking','engineering','fintech','gallery','architecture','principles','roadmap']
export function localizedSitePath(rawPath, language, translatedArticles) {
  const cleaned = rawPath.replace(/^\//, '').replace(/\/$/, '').replace(/\.html$/, '')
  const path = cleaned === 'en' ? '' : cleaned.startsWith('en/') ? cleaned.slice(3) : cleaned
  if (language === 'en') {
    const article = /^articles\/([a-z0-9-]+)$/.exec(path)
    if (!availableEnglishPages.includes(path) && !(article && translatedArticles.includes(article[1]))) return null
  }
  return '/' + (language === 'en' ? 'en/' : '') + path
}
