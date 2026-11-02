import { fileURLToPath } from 'node:url'
import { collections } from '../../book.mjs'
import { englishArticleSlugs } from '../../book.en.mjs'
import { availableArticleHistory } from '../../article-history.mjs'

export default {
  watch: ['../../articles/*.md', '../../en/articles/*.md', '../../book.mjs', '../../book.en.mjs'],
  load() {
    const slugs = collections.flatMap(group => group.chapters.flatMap(chapter => chapter.items.map(([slug]) => slug)))
    const paths = [...slugs.map(slug => `articles/${slug}.md`), ...englishArticleSlugs.map(slug => `en/articles/${slug}.md`)]
    const { history, available } = availableArticleHistory(fileURLToPath(new URL('../../', import.meta.url)), paths, console.warn, { includeCreated: true })
    return {
      available,
      articles: Object.fromEntries(paths.map(path => {
        const event = history.get(path)
        return [path, { created: event?.created ?? null, updated: event ? { date: event.date, timestamp: event.timestamp, commit: event.commit } : null }]
      }))
    }
  }
}
