import { createContentLoader } from 'vitepress'
import { buildArticleDescriptions } from '../../article-description.mjs'

export default createContentLoader(['articles/*.md', 'en/articles/*.md'], {
  transform: pages => buildArticleDescriptions(pages)
})
