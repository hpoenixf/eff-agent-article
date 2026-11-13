import { collections, learningPathSlugs } from './book.mjs'
import { englishTitles, englishArticlePath } from './book.en.mjs'
import { tagDefinitions } from './article-tags.mjs'
const titles = Object.fromEntries(collections.flatMap(group => group.chapters.flatMap(chapter => chapter.items)))
// Ordered recommendations only. Canonical identities and titles stay in book.mjs/book.en.mjs.
export const routeDefinitions = [
  { id: 'start', zh: '新人入门', en: 'Getting started', goal: ['从第一个可运行例子，走到完整的六层系统。', 'From your first working example to the six-layer system.'], slugs: learningPathSlugs },
  { id: 'architecture', zh: '架构进阶', en: 'Architecture', goal: ['已经会用 Agent？理解协作、上下文与系统边界。', 'Understand collaboration, context and system boundaries beyond the first Agent.'], slugs: ['017-prompt-to-answer-six-layer-panorama-v3','agent-context-governance-principles','agent-context-governance-actions','agent-subagent-context-specialization','agent-long-horizon-research-panorama','agent-model-runtime-mcp-skill-boundaries'] },
  { id: 'finance', zh: '金融研究', en: 'Finance', goal: ['从业务问题出发，建立可复算、可核验、有边界的研究。', 'Build reproducible, verifiable research with clear financial boundaries.'], slugs: ['financial-agent-system-panorama','031-fintech-data-time-and-reproducible-numbers','financial-agent-python-result-consumption','financial-agent-research-claim-boundaries','030-fintech-from-research-to-investment-advice'] },
  { id: 'engineering', zh: '研发实践', en: 'Engineering', goal: ['把需求、实现、证据和真实验收接成一条研发链路。', 'Connect requirements, implementation, evidence and real-task acceptance.'], slugs: ['ai-coding-quality-panorama','026-agent-spec-evidence-workflow','agent-article-code-evidence-contract','agent-evaluation-set-for-iteration','032-ai-development-from-bug-loop-to-task-convergence'] }
]
export function readingRoutes(locale = 'zh') {
  const en = locale === 'en'
  return routeDefinitions.map(route => ({ id: route.id, label: route[locale], goal: route.goal[en ? 1 : 0], articles: route.slugs.map(slug => ({ slug, title: en ? englishTitles[slug] || titles[slug] : titles[slug], href: en ? englishArticlePath(slug) : `/articles/${slug}` })) }))
}
export function categoryLinks(locale = 'zh') {
  const en = locale === 'en', prefix = en ? '/en' : ''
  const names = { modules: 'Module mechanisms', thinking: 'Architecture and decisions', engineering: 'Engineering practice' }
  return collections.map(group => ({ id: group.id, title: en ? names[group.id] : group.title, href: `${prefix}/${group.id}`, image: `/images/home/${group.id === 'thinking' ? 'architecture' : group.id}.svg` }))
}
export function topicLinks(locale = 'zh') { return tagDefinitions.map(tag => ({ title: tag[locale], href: `${locale === 'en' ? '/en' : ''}/${tag.path}` })) }
