import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse, compileStyle } from 'vue/compiler-sfc'
import { collections, mergedArticles, historicalEditions, panoramaSeriesSlugs } from '../book.mjs'
import { englishCollections, englishArticleSlugs } from '../book.en.mjs'
import { groupTopCategories } from '../.vitepress/theme/reading-directory.mjs'

const collection = id => collections.find(c => c.id === id)
const slugs = c => c.chapters.flatMap(ch => ch.items.map(([slug]) => slug))
const text = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('compiled directory CSS hides only the duplicate control, never its navigation bar', () => {
  const { descriptor } = parse(text('.vitepress/theme/DirectoryMenu.vue'))
  const css = descriptor.styles.map(style => {
    const result = compileStyle({ source: style.content, id: 'data-v-directory-test', scoped: style.scoped })
    assert.deepEqual(result.errors, [])
    return result.code
  }).join('\n')
  assert.match(css, /\.VPNavBar\.has-sidebar\s+\.directory-menu\s*\{\s*display:\s*none/)
  assert.doesNotMatch(css, /\.VPNavBar(?:\.has-sidebar)?\s*\{[^}]*display:\s*none/)
  assert.match(css, /@media\s*\(min-width:\s*960px\)/)
  assert.match(css, /@media\s*\(max-width:\s*767px\)/)
})

test('six module reading keys preserve the canonical identities and bilingual order', () => {
  const modules = collection('modules')
  assert.deepEqual(modules.chapters.map(ch => ch.id), ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'])
  const all = collections.flatMap(slugs)
  assert.equal(new Set(all).size, all.length)
  for (const c of collections) {
    const en = englishCollections.find(e => e.id === c.id)
    assert.deepEqual(slugs(en), slugs(c))
    assert.deepEqual(en.chapters.map(ch => ch.id), c.chapters.map(ch => ch.id))
    for (const ch of en.chapters) assert.ok(ch.title && ch.desc)
  }
  assert.ok(slugs(collection('thinking')).includes('017-prompt-to-answer-six-layer-panorama-v3'))
  assert.ok(slugs(collection('thinking')).includes('025-agent-langfuse-from-trace-to-trustworthy-observability'))
  assert.ok(modules.chapters.find(ch => ch.id === 'l3').related.some(([s]) => s === '025-agent-langfuse-from-trace-to-trustworthy-observability'))
  for (const [old, current] of Object.entries({...mergedArticles, ...historicalEditions})) {
    assert.ok(!all.includes(old))
    assert.ok(all.includes(current))
  }
})

test('finance curation and topic headings stay bilingual without a second article index', () => {
  const selected = path => [...text(path).matchAll(/\/articles\/([a-z0-9-]+)/g)].map(m => m[1]).sort()
  assert.deepEqual(selected('fintech.md'), selected('en/fintech.md'))
  const all = new Set(collections.flatMap(slugs))
  for (const slug of selected('fintech.md')) assert.ok(all.has(slug), slug)
  const topic = text('open-etf-topic.mjs')
  assert.ok(topic.includes('(en ? englishCollections : collections)'))
  assert.ok(!topic.includes("['Research, reading & computation'"))
})


test('panorama tag curates full-scope essays without a fourth primary class', () => {
  const selected = [
    '017-prompt-to-answer-six-layer-panorama-v3',
    'financial-agent-system-panorama',
    'one-report-nine-architecture-judgments',
    'agent-context-governance-principles',
    'agent-context-governance-actions',
    '025-agent-langfuse-from-trace-to-trustworthy-observability',
    'honest-agent-evaluation',
    'ai-citations-do-not-prove-reliability',
    'agent-subagent-context-specialization',
    'agent-long-horizon-research-panorama'
  ]
  assert.deepEqual([...panoramaSeriesSlugs], selected)
  const all = collections.flatMap(slugs)
  assert.equal(collections.length, 3)
  assert.equal(new Set(all).size, all.length)
  assert.equal(new Set(panoramaSeriesSlugs).size, panoramaSeriesSlugs.length)
  for (const slug of selected) {
    assert.equal(all.filter(value => value === slug).length, 1, 'No duplicate canonical classification: ' + slug)
    assert.ok(englishArticleSlugs.includes(slug), 'Bilingual panorama essay missing: ' + slug)
    assert.ok(text('articles/' + slug + '.md').length > 1000, slug)
    assert.ok(text('en/articles/' + slug + '.md').length > 1000, slug)
  }
  for (const file of ['panorama.md', 'en/panorama.md']) {
    const page = text(file)
    assert.ok(page.includes('<PanoramaSeries />'), 'Tag cards must use the reviewed single tag registry: ' + file)
    assert.ok(page.length > 350, 'Tag landing should be a useful standalone guide: ' + file)
  }
  const config = text('.vitepress/config.mts')
  assert.ok(config.includes("{ text: '全景', link: '/panorama' }"))
  assert.ok(config.includes("{ text: 'Panorama', link: '/en/panorama' }"))
  const home = text('.vitepress/theme/HomeOverview.vue')
  assert.ok(home.includes("tagData.definitions"))
  assert.ok(text("article-tags.mjs").includes("path: 'panorama'"))
  const theme = text('.vitepress/theme/index.ts')
  assert.ok(theme.includes("app.component('PanoramaSeries', PanoramaSeries)"))
  assert.ok(theme.includes('h(ArticleTopicTags)'))
  assert.ok(text('.vitepress/theme/ArticleTopicTags.vue').includes('article-tags.data'))
  assert.ok(text('.vitepress/theme/PanoramaSeries.vue').includes('panoramaSeriesSlugs'))
})

test('context panorama pair retains bilingual illustrations and peer navigation', () => {
  for (const [slug, count] of [['agent-context-governance-principles', 7], ['agent-context-governance-actions', 9]]) {
    assert.ok(slugs(collection('thinking')).includes(slug))
    for (const lang of ['', 'en/']) {
      const source = text(lang + 'articles/' + slug + '.md')
      const figures = [...source.matchAll(/!\[[^\]]+\]\(([^)]+\.svg)\)/g)]
      assert.equal(figures.length, count, lang + slug)
      const expected = lang ? '../../visuals/en/' + slug + '/' : '../visuals/' + slug + '/'
      for (const [, path] of figures) assert.ok(path.startsWith(expected), path)
      assert.ok(source.includes('/' + lang + 'panorama'))
      for (const peer of ['agent-context-governance-principles', 'agent-context-governance-actions']) {
        assert.ok(source.includes('/' + lang + 'articles/' + peer))
      }
    }
  }
})

test('one bilingual directory shares canonical order, collapsed groups and retired preview routes', async () => {
  const { runInNewContext } = await import('node:vm')
  const { englishArticlePath } = await import('../book.en.mjs')
  const { canonicalUrl, filterSitemapItems } = await import('../seo-routes.mjs')
  const source = text('.vitepress/config.mts').replace(/^import .*$/gm, '')
    .replace('export default defineConfig(', 'globalThis.config = defineConfig(')
    .replaceAll('import.meta.url', JSON.stringify(import.meta.url))
  const context = { collections, englishCollections, englishArticlePath, defineConfig: value => value,
    SITE_URL: '', filterSitemapItems, socialHead: () => [] }
  runInNewContext(source, context)
  const flatten = items => items.flatMap(item => item.items ? flatten(item.items) : [item.link])
  for (const [locale, theme] of [['', context.config.themeConfig], ['en/', context.config.locales.en.themeConfig]]) {
    assert.equal(theme.nav.length, 1, 'Only the independent About tab is added; article directory stays singular')
    assert.equal(theme.nav[0].text, 'About')
    assert.equal(theme.nav[0].link, '/about')
    assert.equal(theme.sidebar[0].link, '/' + locale + 'catalog')
    assert.equal(theme.sidebar.at(-1).link, 'https://github.com/hpoenixf/open-etf-agent')
    const beforeProjection = JSON.stringify(theme.sidebar)
    const categories = locale ? englishCollections : collections
    const label = locale ? 'Article categories' : '文章分类'
    const top = groupTopCategories(theme.sidebar, categories.map(c => c.title), label)
    assert.equal(JSON.stringify(theme.sidebar), beforeProjection, 'Sidebar projection must not mutate the three independent categories')
    assert.equal(top[0].link, '/' + locale + 'catalog')
    assert.equal(top[1].text, label)
    assert.deepEqual(Array.from(top[1].items, item => item.text), categories.map(c => c.title))
    assert.equal(top.filter(item => item.text === label).length, 1)
    assert.equal(top.length, theme.sidebar.length - categories.length + 1)
    assert.equal(top.at(-1).link, theme.sidebar.at(-1).link)
    assert.deepEqual(flatten(top), flatten(theme.sidebar), 'All links and their order remain canonical')
    assert.equal(top[2], theme.sidebar[4], 'Tag topics remain a separate top-level group')
    assert.equal(top[3], theme.sidebar[5], 'Independent pages remain a separate top-level group')
    const groups = theme.sidebar.filter(item => item.items)
    const checkCollapsed = items => items.forEach(item => { if (item.items) { assert.equal(item.collapsed, true); checkCollapsed(item.items) } })
    checkCollapsed(groups)
    const articleLinks = flatten(theme.sidebar).filter(path => /\/articles\//.test(path))
    assert.equal(articleLinks.length, collections.flatMap(slugs).length)
    assert.equal(new Set(articleLinks).size, articleLinks.length)
    for (const path of ['fintech', 'panorama', 'open-etf-agent', 'gallery']) assert.ok(flatten(theme.sidebar).includes('/' + locale + path))
    assert.ok(!flatten(theme.sidebar).some(path => /\/(roadmap|principles)$/.test(path)))
    const retired = text(locale + 'roadmap.md')
    assert.ok(retired.includes('0;url=https://hpoenixf.com/eff-agent-article/' + locale + 'catalog'))
    assert.ok(retired.includes('search: false'))
    assert.equal(canonicalUrl(locale + 'roadmap.md'), 'https://hpoenixf.com/eff-agent-article/' + locale + 'catalog')
  }
  assert.equal(filterSitemapItems([{ url: 'roadmap' }, { url: 'en/roadmap' }, { url: 'catalog' }]).length, 1)
  assert.ok(text('.vitepress/theme/ChapterCatalog.vue').includes('withBase(categoryFor(collection.id))'))
  assert.ok(text('.vitepress/theme/index.ts').includes("'nav-screen-content-before': () => h(ReadingDirectory)"))
  assert.ok(text('.vitepress/theme/ReadingDirectory.vue').includes('theme.value.sidebar'))
  for (const file of ['catalog.md', 'en/catalog.md']) assert.ok(!/\]\([^)]*(?:\/principles|principles\.md)/.test(text(file)))
  assert.ok(!text('.vitepress/theme/index.ts').includes('h(PrinciplesLink'))
  assert.ok(!/href: ['"]\/(?:en\/)?roadmap['"]/.test(text('.vitepress/theme/HomeOverview.vue')))
})

test('homepage visual layer is scoped, responsive and preserves accessible controls', () => {
  const css = text('.vitepress/theme/home-layout.css')
  const compiled = compileStyle({ source: css, filename: 'home-layout.css', id: 'home-layout', scoped: false })
  assert.deepEqual(compiled.errors, [])
  assert.ok(text('.vitepress/theme/index.ts').indexOf("import './home-layout.css'") > text('.vitepress/theme/index.ts').indexOf("import './custom.css'"))
  for (const rule of compiled.code.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (rule[1].trim().startsWith('@')) continue
    assert.ok(rule[1].trim().split(',').every(selector => selector.trim().startsWith('.VPHome')), rule[1])
  }
  assert.match(css, /max-width: 1040px/)
  assert.match(css, /max-width: 760px/)
  assert.match(css, /@media \(max-width: 767px\)/)
  assert.match(css, /font-size: 32px/)
  assert.match(css, /min-height: 48px/)
  assert.match(css, /min-height: 44px/)
  assert.match(css, /focus-visible/)
  assert.match(css, /outline: 2px solid/)
  assert.ok(!/display:\s*none|visibility:\s*hidden/.test(css), 'Styling must not hide navigation, content or controls')
  assert.ok(!/position:\s*(fixed|absolute)/.test(css), 'No floating decorative overlays')
})

test('homepage menu colors and focus outrank the component scoped styles', () => {
  const { descriptor } = parse(text('.vitepress/theme/HomeReadingMenu.vue'))
  const old = compileStyle({ source: descriptor.styles[0].content, id: 'data-v-menu', scoped: true }).code
  const css = text('.vitepress/theme/home-layout.css')
  // Attribute selectors added by Vue must count: the old focus has three class-level selectors.
  assert.match(old, /\.home-reading-actions a\[data-v-menu\]:focus-visible/)
  for (const selector of [
    '.VPHome .VPHero .home-reading-actions a:focus-visible',
    '.VPHome .VPHero .home-reading-menu summary:focus-visible',
    '.VPHome .VPHero .home-reading-menu small',
    '.VPHome .VPHero .home-reading-menu__links a',
    '.VPHome .vp-doc .recent-heading h2'
  ]) assert.ok(css.includes(selector), selector)
  assert.ok(!css.includes('#d9efbd') && !css.includes('#c8dbd0'), 'No light-on-light menu colors')
})

test('desktop About stays visible while compact navigation has only one menu trigger', () => {
  const css = text('.vitepress/theme/navigation-layout.css')
  const compiled = compileStyle({ source: css, filename: 'navigation-layout.css', id: 'navigation-layout', scoped: false })
  assert.deepEqual(compiled.errors, [])
  assert.ok(text('.vitepress/theme/index.ts').includes("import './navigation-layout.css'"))
  const desktop = css.slice(css.indexOf('@media (min-width: 960px)'), css.indexOf('@media (max-width: 959px)'))
  const compact = css.slice(css.indexOf('@media (max-width: 959px)'))
  assert.match(desktop, /\.VPNavBar \.VPNavBarMenu \{ display: flex !important;/)
  assert.match(desktop, /\.VPNavBar \.VPNavBarHamburger \{ display: none !important;/)
  assert.match(compact, /\.VPNavBar \.VPNavBarHamburger \{ display: flex !important;/)
  assert.match(compact, /\.VPNavBar \.directory-menu \{ display: none;/)
  assert.ok(!/\.VPNavBar(?:\.has-sidebar)?\s*\{[^}]*display:\s*none/.test(css))
  assert.match(css, /min-width: 44px; min-height: 44px;/)
})
