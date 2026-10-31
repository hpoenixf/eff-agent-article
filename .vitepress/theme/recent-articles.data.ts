import { createContentLoader } from 'vitepress'
import { fileURLToPath } from 'node:url'
import { chapters } from '../../book.mjs'
import { englishArticleSlugs, englishTitles } from '../../book.en.mjs'
import { recentArticles } from '../../recent-articles.mjs'
import { availableArticleHistory } from '../../article-history.mjs'

export default createContentLoader(['articles/*.md', 'en/articles/*.md'], {
  transform(pages) {
    const items = chapters.flatMap(chapter => chapter.items)
    const paths = items.flatMap(([slug]) => ['articles/' + slug + '.md', ...(englishArticleSlugs.includes(slug) ? ['en/articles/' + slug + '.md'] : [])])
    const { history, available } = availableArticleHistory(fileURLToPath(new URL('../../', import.meta.url)), paths)
    const options = { items, englishSlugs: englishArticleSlugs, englishTitles, history }
    return { available, zh: recentArticles(pages, options), en: recentArticles(pages, { ...options, language: 'en' }) }
  }
})
