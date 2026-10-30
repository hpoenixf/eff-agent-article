import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { chapters, learningPathSlugs, mergedArticles } from '../book.mjs'
import { englishArticleSlugs, englishTitles, englishArticlePath } from '../book.en.mjs'

import { learningPathNavigation } from '../.vitepress/theme/learning-path-nav.mjs'

const root = new URL('../', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')

test('learning path is a four-stop selection from the unique canonical catalogue', () => {
  const all = chapters.flatMap(chapter => chapter.items.map(([slug]) => slug))
  assert.deepEqual(learningPathSlugs, [
    'agent-in-15-minutes', 'agent-ten-modules', 'open-etf-agent-v010-system-design',
    '017-prompt-to-answer-six-layer-panorama-v3'
  ])
  const start = all.indexOf(learningPathSlugs[0])
  assert.deepEqual(all.slice(start, start + 4), learningPathSlugs)
  for (const slug of learningPathSlugs) {
    assert.equal(all.filter(value => value === slug).length, 1)
    assert.ok(englishArticleSlugs.includes(slug))
    assert.ok(englishTitles[slug])
    assert.ok(read('articles/' + slug + '.md').includes('# '))
    assert.ok(read('en/articles/' + slug + '.md').includes('# '))
  }
})

test('each introductory stop links to its immediate next stop in both languages', () => {
  for (const prefix of ['', 'en/']) {
    for (let index = 0; index < learningPathSlugs.length - 1; index++) {
      const source = read(prefix + 'articles/' + learningPathSlugs[index] + '.md')
      assert.ok(source.includes(learningPathSlugs[index + 1]), prefix + learningPathSlugs[index])
    }
    // Four-stop navigation is freely usable; the recommended next step still must not skip bridges.
    for (const [index, slug] of learningPathSlugs.entries()) {
      const source = read(prefix + 'articles/' + slug + '.md')
      assert.equal((source.match(/<LearningPathNav \/>/g) ?? []).length, 1)
      const nav = learningPathNavigation(prefix + 'articles/' + slug + '.md')
      assert.equal(nav.steps.filter(step => step.current).length, 1)
      assert.equal(nav.steps[index].current, true)
      assert.deepEqual(nav.steps.map(step => step.slug), learningPathSlugs)
      assert.equal(nav.next?.slug ?? null, learningPathSlugs[index + 1] ?? null)
      assert.equal(nav.english, prefix === 'en/')
      for (const step of nav.steps) {
        assert.equal(step.href, '/' + prefix + 'articles/' + step.slug)
      }
    }
    // The alias may serve old bookmarks, but canonical reading pages must not send new readers there.
    for (const slug of learningPathSlugs) {
      assert.ok(!read(prefix + 'articles/' + slug + '.md').includes('agent-loop-to-application'),
        prefix + slug + ' must link to the combined deep-dive canonical article')
    }
    const modules = read(prefix + 'articles/agent-ten-modules.md')
    assert.equal([...modules.matchAll(/^### \d+\./gm)].length, 10)
  }
})

test('the duplicate deep-dive address is a bilingual compatibility page only', () => {
  const alias = 'agent-loop-to-application'
  const target = 'open-etf-agent-v010-system-design'
  const all = chapters.flatMap(chapter => chapter.items.map(([slug]) => slug))
  assert.equal(mergedArticles[alias], target)
  assert.ok(!all.includes(alias))
  assert.ok(!englishArticleSlugs.includes(alias))
  assert.equal(englishArticlePath(alias), '/en/articles/' + target)
  for (const prefix of ['', 'en/']) {
    const stub = read(prefix + 'articles/' + alias + '.md')
    assert.match(stub, /search: false/)
    assert.ok(stub.includes('](' + target + '.md)'))
    const combined = read(prefix + 'articles/' + target + '.md')
    assert.ok(combined.includes('ff5b9273ef0d239e804f61792702cd2e94174be7'))
    assert.ok(combined.includes('74bd5aa455ccaeb2994eb22aa744affde660bfa2'))
    assert.ok(combined.includes('result-consumption'))
    assert.ok(combined.includes('durable-publication'))
    assert.ok(combined.includes('source_check'))
  }
})

test('shared homepage and catalog cards consume the canonical learning-path selection', () => {
  const component = read('.vitepress/theme/FlagshipEntry.vue')
  assert.ok(component.includes("from '../../book.mjs'"))
  assert.ok(component.includes('learningPathSlugs.map'))
  assert.ok(component.includes("'/en'"))
  assert.ok(component.includes('withBase('))
})


test('reading-path navigation marks the current page and keeps real keyboard links', () => {
  const component = read('.vitepress/theme/LearningPathNav.vue')
  assert.match(component, /aria-current="page"/)
  assert.match(component, /<a v-else/)
  assert.match(component, /withBase\(step.href\)/)
  assert.match(component, /focus-visible/)
  assert.equal(learningPathNavigation('articles/not-a-learning-stop.md'), null)
})
