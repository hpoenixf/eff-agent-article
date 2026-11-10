import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { chapters, learningPathSlugs, mergedArticles } from '../book.mjs'
import { englishArticleSlugs, englishTitles, englishArticlePath } from '../book.en.mjs'

import { learningPathNavigation } from '../.vitepress/theme/learning-path-nav.mjs'

const root = new URL('../', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')

test('learning path inserts three concept essays into the canonical reading order', () => {
  const all = chapters.flatMap(chapter => chapter.items.map(([slug]) => slug))
  assert.deepEqual(learningPathSlugs, [
    'agent-in-15-minutes', 'prompt-context-rag-memory', 'agent-ten-modules',
    'tools-function-calling-mcp-skill', 'conversation-context-memory-checkpoints',
    'open-etf-agent-v010-system-design',
    'open-etf-agent-research-project-workshop',
    '017-prompt-to-answer-six-layer-panorama-v3'
  ])
  assert.deepEqual(all.filter(slug => learningPathSlugs.includes(slug)), learningPathSlugs)
  const workshop = 'open-etf-agent-research-project-workshop'
  assert.equal(all.filter(slug => slug === workshop).length, 1)
  assert.equal(all.indexOf(workshop), all.indexOf('open-etf-agent-v010-system-design') + 1)
  assert.equal(all.indexOf(workshop) + 1, all.indexOf('017-prompt-to-answer-six-layer-panorama-v3'))
  assert.ok(englishArticleSlugs.includes(workshop))
  for (const prefix of ['', 'en/']) {
    const body = read(prefix + 'articles/' + workshop + '.md')
    assert.ok(body.includes('88afb84958ed8de9108d756cdc0d63e6d2fbee24'))
    assert.ok(body.includes('case-mechanism-observations.json'))
    assert.ok(body.includes('synthetic-data-and-reports.json'))
    assert.ok(body.includes('open-etf-agent-v010-system-design'))
    assert.ok(body.includes('017-prompt-to-answer-six-layer-panorama-v3'))
  }
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
    // Navigation is freely usable; the recommended next step must include concept bridges.
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
        for (const field of ['label', 'title', 'description']) assert.ok(step[field]?.trim(), step.slug + ':' + field)
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
  assert.ok(component.includes('learningPathNavigation'))
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


test('homepage keeps one intro CTA and a compact bilingual continuation disclosure', () => {
  const component = read('.vitepress/theme/HomeReadingMenu.vue')
  const theme = read('.vitepress/theme/index.ts')
  assert.match(theme, /'home-hero-actions-after': \(\) => h\(HomeReadingMenu\)/)
  assert.match(component, /learningPathNavigation/)
  assert.match(component, /steps\.slice\(1\)/)
  assert.match(component, /<details ref="disclosure"/)
  assert.match(component, /<summary>/)
  assert.match(component, /@toggle="fit"/)
  assert.match(component, /getBoundingClientRect\(\)/)
  assert.match(component, /removeEventListener\('resize', fit\)/)
  assert.match(component, /removeEventListener\('scroll', fit\)/)
  assert.match(component, /withBase\(step.href\)/)
  assert.match(component, /概念串讲与实作进阶/)
  assert.match(component, /Concepts and hands-on guides/)
  assert.match(component, /event.key === 'Escape'/)
  assert.match(component, /removeEventListener\('pointerdown', outside\)/)
  assert.match(component, /removeEventListener\('focusin', outside\)/)
  assert.match(component, /removeEventListener\('keydown', escape\)/)
  for (const path of ['index.md', 'en/index.md']) {
    const home = read(path)
    const actions = home.split('  actions:\n')[1].split('  secondaryActions:')[0]
    assert.equal((actions.match(/theme:/g) ?? []).length, 1)
    assert.ok(actions.includes('agent-in-15-minutes'))
    assert.ok(home.includes('link: https://github.com/hpoenixf/open-etf-agent'))
    assert.ok(home.includes(path.startsWith('en/') ? 'link: /en/catalog' : 'link: /catalog'))
  }
})

test('homepage disclosure floats below its trigger without moving the hero layout', async () => {
  const { parse, compileScript, compileStyle } = await import('@vue/compiler-sfc')
  const { build } = await import('esbuild')
  const { createSSRApp } = await import('vue')
  const { renderToString } = await import('@vue/server-renderer')
  const { createMarkdownRenderer } = await import('vitepress')
  const { mkdirSync, writeFileSync } = await import('node:fs')
  const { resolve } = await import('node:path')
  const { pathToFileURL } = await import('node:url')
  const theme = resolve('.vitepress/theme')
  const { descriptor } = parse(read('.vitepress/theme/HomeReadingMenu.vue'))
  const compiled = compileScript(descriptor, { id: 'home-menu-test', inlineTemplate: true }).content
  const bundle = await build({ stdin: { contents: compiled, loader: 'ts', resolveDir: theme }, bundle: true, write: false, platform: 'node', format: 'esm', external: ['vue'], plugins: [{ name: 'home-menu-test-data', setup(builder) {
    builder.onResolve({ filter: /^vitepress$/ }, () => ({ path: 'vitepress', namespace: 'home-menu-test' }))
    builder.onLoad({ filter: /.*/, namespace: 'home-menu-test' }, () => ({ contents: 'import { ref } from \"vue\"; export const useData = () => ({ lang: ref(globalThis.__homeMenuData.lang.value), frontmatter: ref(globalThis.__homeMenuData.frontmatter.value) }); export const useRoute = () => ({ path: "/" }); export const withBase = p => /^https?:/.test(p) ? p : "/eff-agent-article" + p;' }))
  } }] })
  mkdirSync(resolve('.vitepress/cache'), { recursive: true })
  const fixture = resolve('.vitepress/cache/home-menu-render-fixture.mjs'); writeFileSync(fixture, bundle.outputFiles[0].text)
  const Component = (await import(pathToFileURL(fixture))).default
  const md = await createMarkdownRenderer(process.cwd(), { highlight: code => code })
  for (const prefix of ['', 'en/']) {
    const env = {}; md.render(read(prefix + 'index.md'), env)
    globalThis.__homeMenuData = { lang: { value: prefix ? 'en-US' : 'zh-CN' }, frontmatter: { value: env.frontmatter } }
    const html = await renderToString(createSSRApp(Component))
    assert.equal((html.match(/<details\b/g) || []).length, 1)
    assert.equal((html.match(/<summary\b/g) || []).length, 1)
    assert.match(html, /<svg class="home-reading-menu__chevron"[^>]*aria-hidden="true"[^>]*focusable="false"/)
    assert.ok(!html.includes('⌄'))
    assert.match(html, /class="home-reading-actions__secondary"/)
    for (const slug of learningPathSlugs.slice(1)) assert.ok(html.includes('href="/eff-agent-article/' + prefix + 'articles/' + slug + '"'))
    const menuPositions = learningPathSlugs.slice(1).map(slug => html.indexOf('href="/eff-agent-article/' + prefix + 'articles/' + slug + '"'))
    assert.deepEqual(menuPositions, [...menuPositions].sort((a,b) => a-b))
    assert.ok(html.includes(prefix ? 'Workshop' : '练手'))
    assert.ok(!html.includes('/articles/' + learningPathSlugs[0]), 'The original hero remains the single primary CTA owner')
    assert.ok(html.includes('href="/eff-agent-article/' + prefix + 'catalog"'))
    assert.ok(html.includes('href="https://github.com/hpoenixf/open-etf-agent" target="_blank" rel="noreferrer"'))
  }
  const css = read('.vitepress/theme/home-layout.css')
  assert.match(css, /\.VPHome \.VPHero \{ margin-top: 0; padding: 48px 32px 32px;/)
  assert.match(css, /@media \(min-width: 768px\)[\s\S]*grid-template-columns: max-content minmax\(0, 1fr\)/)
  assert.match(css, /\.actions \{ grid-column: 1; grid-row: 3; align-self: start;/)
  assert.match(css, /\.home-reading-menu \{ grid-column: 2; grid-row: 3; align-self: start;/)
  assert.match(css, /\.home-reading-actions__secondary \{ grid-column: 1 \/ -1; margin-top: 12px;/)
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*padding: 28px 20px 24px/)
  assert.match(css, /\.home-reading-menu \{[^}]*position: relative/)
  assert.match(css, /\.home-reading-menu__links \{[^}]*position: absolute/)
  assert.match(css, /max-height: min\(360px, 55dvh, var\(--home-menu-space, 55dvh\)\)/)
  assert.match(css, /\[data-placement="above"\][\s\S]*bottom: 100%/)
  assert.match(css, /overflow-y: auto/)
  assert.deepEqual(compileStyle({ source: descriptor.styles[0].content, id: 'home-menu-test', scoped: true }).errors, [])
  assert.match(descriptor.styles[0].content, /prefers-reduced-motion: reduce/)
})


test('workshop follows deep dive in both menu and article navigation without a fabricated diagram', async () => {
  const { learningPathStages } = await import('../.vitepress/theme/learning-path-nav.mjs')
  for (const prefix of ['', 'en/']) {
    const deep = learningPathNavigation(prefix + 'articles/open-etf-agent-v010-system-design.md')
    assert.equal(deep.next.slug, 'open-etf-agent-research-project-workshop')
    const practice = learningPathNavigation(prefix + 'articles/open-etf-agent-research-project-workshop.md')
    assert.equal(practice.next.slug, '017-prompt-to-answer-six-layer-panorama-v3')
    assert.equal(practice.steps.length, 8)
    assert.equal(practice.steps[6].label, prefix ? 'Workshop' : '练手')
    assert.equal(practice.steps[7].label, prefix ? 'Panorama' : '全景')
  }
  for (const en of [false, true]) {
    const diagrams = learningPathStages(en)
    assert.deepEqual(diagrams.map(x => x.key), ['intro', 'intermediate', 'deep', 'workshop', 'panorama'])
    assert.equal(diagrams.at(-1).slug, '017-prompt-to-answer-six-layer-panorama-v3')
    assert.equal(diagrams.at(-1).label, en ? 'Panorama' : '全景')
    const workshop = diagrams.find(x => x.key === 'workshop')
    assert.equal(workshop.src, '/diagrams/open-workshop/six-layers-' + (en ? 'en' : 'zh') + '.svg')
    assert.equal(workshop.label, en ? 'Workshop' : '练手')
    assert.equal(workshop.sourceLinks, false)
  }
})


test('workshop keeps six-layer scope, exact command boundaries and bilingual responsive source diagrams', () => {
  for (const [prefix, language] of [['', 'zh'], ['en/', 'en']]) {
    const body = read(prefix + 'articles/open-etf-agent-research-project-workshop.md')
    for (const layer of ['L1','L2','L3','L4','L5','L6']) assert.ok(body.includes('**' + layer + ' ·'))
    assert.ok(body.includes('REPORT_REQUIRED'))
    assert.ok(body.includes('CLI_LIVE_WORK_REQUIRED'))
    assert.ok(body.includes('case-mechanism-observations.json'))
    assert.ok(body.includes('withBase'))
    assert.ok(body.includes('(max-width: 640px)'))
    assert.doesNotMatch(body, /```mermaid/)
    for (const suffix of ['', '-mobile']) {
      const asset = 'public/diagrams/open-workshop/six-layers-' + language + suffix + '.svg'
      assert.ok(body.includes(asset.replace('public', '')))
      const svg = read(asset)
      assert.match(svg, /<title id="title">/)
      assert.ok(svg.includes(language === 'en' ? 'Submission saves; work executes.' : '提交只保存；work 才执行。'))
      assert.doesNotMatch(svg, /foreignObject|https?:\/\/[^w]/)
    }
  }
})
