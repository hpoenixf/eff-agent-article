import { collections, learningPathSlugs } from './book.mjs'
import { englishTitles, englishArticlePath } from './book.en.mjs'
import { tagDefinitions } from './article-tags.mjs'
const titles = Object.fromEntries(collections.flatMap(group => group.chapters.flatMap(chapter => chapter.items)))
// Previews and complete topic pages consume the same canonical tag membership.
export const routeDefinitions = [
  { id: 'start', tag: 'intro', zh: '新人入门', en: 'Getting started', goal: ['从第一个例子到六层全景。', 'From the first example to the six-layer panorama.'] },
  { id: 'architecture', tag: 'architecture', zh: '架构进阶', en: 'Architecture', goal: ['架构设计与系统思考。', 'Architecture, design decisions and system thinking.'] },
  { id: 'finance', tag: 'finance', zh: '金融研究', en: 'Finance', goal: ['金融标签下的研究与实践。', 'Research and practice from the finance tag.'] },
  { id: 'engineering', tag: 'engineering', zh: '研发实践', en: 'Engineering', goal: ['从需求、实现到测试与交付。', 'From requirements and implementation to testing and delivery.'] }
]
export function readingRoutes(locale = 'zh', data = { articles: {} }) {
  const en = locale === 'en'
  return routeDefinitions.map(route => {
    const tag = tagDefinitions.find(tag => tag.id === route.tag)
    const slugs = (route.tag === 'intro' ? learningPathSlugs : Object.keys(titles)).filter(slug => (data.articles[slug] || []).some(tag => tag.id === route.tag))
    return { id: route.id, label: route[locale], goal: route.goal[en ? 1 : 0], total: slugs.length,
      href: `${en ? '/en' : ''}/${tag.path}`,
      articles: slugs.slice(0, 5).map(slug => ({ slug, title: en ? englishTitles[slug] || titles[slug] : titles[slug], href: en ? englishArticlePath(slug) : `/articles/${slug}` })) }
  })
}
export function categoryLinks(locale = 'zh') {
  const en = locale === 'en', prefix = en ? '/en' : ''
  const names = { modules: 'Module mechanisms', thinking: 'Architecture and decisions', engineering: 'Engineering practice' }
  return collections.map(group => ({ id: group.id, title: en ? names[group.id] : group.title, href: `${prefix}/${group.id}`, image: `/images/home/${group.id === 'thinking' ? 'architecture' : group.id}.svg` }))
}
export function topicLinks(locale = 'zh') { return tagDefinitions.map(tag => ({ title: tag[locale], href: `${locale === 'en' ? '/en' : ''}/${tag.path}` })) }
