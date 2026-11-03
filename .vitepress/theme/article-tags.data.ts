import { createContentLoader } from 'vitepress'
import { collections, panoramaSeriesSlugs } from '../../book.mjs'
import { topicGroups } from '../../open-etf-topic.mjs'
import { buildArticleTags } from '../../article-tags.mjs'
import { financeArticleMembers } from '../../finance-membership.mjs'

const loader = createContentLoader(['articles/*.md', 'en/articles/*.md'], {
  transform(pages) {
    const slugs = collections.flatMap(group => group.chapters.flatMap(chapter => chapter.items.map(([slug]) => slug)))
    return buildArticleTags({ slugs, financeSlugs: financeArticleMembers({ slugs, pages }), panoramaSlugs: panoramaSeriesSlugs, openGroups: topicGroups('zh') })
  }
})
export default {
  ...loader,
  watch: [...loader.watch, '../../finance-membership.mjs', '../../book.mjs', '../../open-etf-topic.mjs', '../../data/open-etf-agent/*.json']
}
