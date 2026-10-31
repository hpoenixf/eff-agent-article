import { readFileSync } from 'node:fs'
import { collections, panoramaSeriesSlugs } from '../../book.mjs'
import { topicGroups } from '../../open-etf-topic.mjs'
import { buildArticleTags } from '../../article-tags.mjs'

export default {
  watch: ['../../fintech.md', '../../book.mjs', '../../open-etf-topic.mjs', '../../data/open-etf-agent/*.json'],
  load() {
    return buildArticleTags({
      slugs: collections.flatMap(group => group.chapters.flatMap(chapter => chapter.items.map(([slug]) => slug))),
      financeMarkdown: readFileSync(new URL('../../fintech.md', import.meta.url), 'utf8'),
      panoramaSlugs: panoramaSeriesSlugs,
      openGroups: topicGroups('zh')
    })
  }
}
