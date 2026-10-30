import { learningPathSlugs } from '../../book.mjs'

const labels = {
  zh: ['入门', '进阶', '深入', '全景'],
  en: ['Introduction', 'Intermediate', 'Deep dive', 'Panorama']
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
