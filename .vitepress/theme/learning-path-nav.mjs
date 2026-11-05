import { learningPathSlugs } from '../../book.mjs'

const labels = {
  zh: ['入门', '进阶', '深入', '练手', '全景'],
  en: ['Introduction', 'Intermediate', 'Deep dive', 'Workshop', 'Panorama']
}

export function learningPathNavigation(relativePath) {
  const english = relativePath.startsWith('en/')
  const slug = relativePath.replace(/^en\//, '').replace(/^articles\//, '').replace(/\.md$/, '')
  const current = learningPathSlugs.indexOf(slug)
  if (current < 0) return null
  const steps = learningPathSlugs.map((value, index) => ({
    slug: value,
    label: labels[english ? 'en' : 'zh'][index],
    href: `${english ? '/en' : ''}/articles/${value}`,
    current: index === current,
    number: index + 1
  }))
  return { english, steps, next: steps[current + 1] ?? null }
}

// Presentation metadata only: article identity and order remain in book.mjs.
const stageViews = [
  { key: 'intro', slug: 'agent-in-15-minutes', width: 1720, height: 1110,
    zh: '从最小 Agent 循环开始，看清输入、工具和回答如何相连。',
    en: 'Start with the smallest Agent loop: input, tools and an answer.' },
  { key: 'intermediate', slug: 'agent-ten-modules', width: 2240, height: 1110,
    zh: '沿十个模块理解一个可运行的公开教学实现。',
    en: 'Follow ten modules through a runnable public teaching implementation.' },
  { key: 'deep', slug: 'open-etf-agent-v010-system-design', width: 2240, height: 1110,
    zh: '深入固定公开版本的系统设计，连接证据、产物与交付。',
    en: 'Explore a pinned public implementation, connecting evidence, artifacts and delivery.' },
  { key: 'workshop', slug: 'open-etf-agent-research-project-workshop', width: 1280, height: 840,
    zh: '带入自己的资料，沿 v0.20 本地练习检查任务、报告和可回查来源。',
    en: 'Bring your own materials and inspect the task, saved report and sources in the v0.20 local workshop.' },
  { key: 'panorama', slug: '017-prompt-to-answer-six-layer-panorama-v3', width: 2960, height: 1824,
    zh: '回到更广的六层系统设计，查看职责与交接；不等于公开实现的功能清单。',
    en: 'See responsibilities and handoffs across the broader six-layer design—not a public implementation feature checklist.' }
]

export function learningPathStages(english = false) {
  const language = english ? 'en' : 'zh'
  return stageViews.map(view => {
    const slug = view.slug
    const index = learningPathSlugs.indexOf(slug)
    return {
      key: view.key, slug, label: labels[language][index], description: view[language],
      href: `${english ? '/en' : ''}/articles/${slug}`,
      src: view.key === 'panorama'
        ? `/visuals/017-prompt-to-answer-six-layer-panorama/diagrams/v3-owner-map-${language}.svg`
        : view.key === 'workshop'
          ? `/diagrams/open-workshop/six-layers-${language}.svg`
          : `/visuals/learning-stage-maps/${view.key}-${language}.svg`,
      mobileSrc: view.key === 'workshop' ? `/diagrams/open-workshop/six-layers-${language}-mobile.svg` : null,
      width: view.width, height: view.height, sourceLinks: ['intro', 'intermediate', 'deep'].includes(view.key)
    }
  })
}

export function galleryStageFromHash(hash) {
  const key = /^#stage=([a-z]+)$/.exec(hash)?.[1]
  return stageViews.some(view => view.key === key) ? key : 'panorama'
}

export function galleryStageForKey(current, key) {
  const index = stageViews.findIndex(view => view.key === current)
  const last = stageViews.length - 1
  const next = key === 'ArrowRight' ? (index + 1) % stageViews.length
    : key === 'ArrowLeft' ? (index + last) % stageViews.length
      : key === 'Home' ? 0 : key === 'End' ? last : -1
  return next < 0 ? null : stageViews[next].key
}
