import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse, compileScript, compileStyle } from '@vue/compiler-sfc'
import { build } from 'esbuild'
import { createSSRApp, createRenderer, nextTick, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMarkdownRenderer } from 'vitepress'
import { collections } from '../book.mjs'
import { chronologicalCatalog } from '../.vitepress/theme/catalog-view.mjs'
import { DEFAULT_CATALOG_SORT } from '../.vitepress/theme/catalog-location.mjs'
import { englishArticleSlugs, englishCollections, englishArticlePath } from '../book.en.mjs'

const theme = resolve('.vitepress/theme')
const { descriptor } = parse(readFileSync(resolve(theme, 'ChapterCatalog.vue'), 'utf8'))
let compiled = compileScript(descriptor, { id: 'catalog-test', inlineTemplate: true }).content
// Supply selected values as a test driver, without changing the template,
// computed state, filtering, sorting, routing, or any event binding.
assert.ok(compiled.includes("const sortOrder = ref(DEFAULT_CATALOG_SORT)"))
assert.ok(compiled.includes('const selectedTags = ref<string[]>([])'))
compiled = compiled.replace("const sortOrder = ref(DEFAULT_CATALOG_SORT)", 'const sortOrder = ref(globalThis.__catalogTestState.order)')
compiled = compiled.replace('const selectedTags = ref<string[]>([])', 'const selectedTags = ref<string[]>(globalThis.__catalogTestState.tags)')
assert.ok(compiled.includes('const currentPage = ref(1)'))
compiled = compiled.replace('const currentPage = ref(1)', 'const currentPage = ref(globalThis.__catalogTestState.currentPage)')
const [a, b] = collections.map(c => c.chapters.flatMap(ch => ch.items)[0][0])
const canonical = collections.flatMap(c => c.chapters.flatMap(ch => ch.items.map(([slug]) => slug)))
const untranslated = canonical.find(slug => !englishArticleSlugs.includes(slug))
const date = timestamp => ({ timestamp, date: timestamp.slice(0, 10) })
const dates = {
  [`articles/${a}.md`]: { created: date('2026-01-01T00:00:00Z'), updated: date('2026-02-02T00:00:00Z') },
  [`en/articles/${a}.md`]: { created: date('2026-01-03T00:00:00Z'), updated: date('2026-02-01T00:00:00Z') },
  [`articles/${b}.md`]: { created: date('2026-01-02T00:00:00Z'), updated: date('2026-02-01T00:00:00Z') },
  [`en/articles/${b}.md`]: { created: date('2026-01-01T00:00:00Z'), updated: date('2026-02-02T00:00:00Z') },
  ...(untranslated ? { [`articles/${untranslated}.md`]: { created: date('2025-01-01T00:00:00Z'), updated: date('2025-02-01T00:00:00Z') } } : {})
}
globalThis.__catalogDescriptions = { articles: Object.fromEntries(canonical.flatMap(slug => [
  ['articles/' + slug + '.md', '测试简介：机制、取舍与适用边界。' + slug],
  ['en/articles/' + slug + '.md', 'Fixture description of the mechanism, trade-offs and scope. ' + slug]
])) }
globalThis.__catalogChronology = { available: true, articles: dates }
globalThis.__catalogTags = { definitions: [{ id: 'finance', zh: '金融', en: 'Finance' }, { id: 'open', zh: '开源', en: 'Open source' }], articles: {
  [a]: [{ id: 'finance' }, { id: 'open' }, { id: 'fallback' }],
  [b]: [{ id: 'finance' }, { id: 'open' }],
  ...(untranslated ? { [untranslated]: [{ id: 'finance' }, { id: 'fallback' }] } : {})
} }
const bundled = await build({ stdin: { contents: compiled, loader: 'ts', resolveDir: theme }, bundle: true, write: false, platform: 'node', format: 'esm', external: ['vue'], plugins: [{ name: 'local-catalog-test-providers', setup(builder) {
  builder.onResolve({ filter: /^(vitepress|\.\/article-tags\.data|\.\/article-chronology\.data|\.\/article-descriptions\.data)$/ }, args => ({ path: args.path, namespace: 'catalog-test' }))
  builder.onLoad({ filter: /.*/, namespace: 'catalog-test' }, args => ({ contents: args.path === 'vitepress'
    ? 'export const useData = () => globalThis.__catalogTestState.data; export const withBase = p => "/eff-agent-article" + p;'
    : 'export const data = globalThis.' + (args.path.includes('chronology') ? '__catalogChronology' : args.path.includes('descriptions') ? '__catalogDescriptions' : '__catalogTags') + ';' }))
} }] })
const cache = resolve('.vitepress/cache'); mkdirSync(cache, { recursive: true })
const modulePath = resolve(cache, 'catalog-render-fixture.mjs'); writeFileSync(modulePath, bundled.outputFiles[0].text)
const Component = (await import(pathToFileURL(modulePath))).default
const languageDescriptor = parse(readFileSync(resolve(theme, 'LanguagePreference.vue'), 'utf8')).descriptor
const languageBundle = await build({ stdin: { contents: compileScript(languageDescriptor, { id: 'catalog-language-test', inlineTemplate: true }).content, loader: 'ts', resolveDir: theme },
  bundle: true, write: false, platform: 'node', format: 'esm', external: ['vue'], plugins: [{ name: 'language-test-router', setup(builder) {
    builder.onResolve({ filter: /^vitepress$/ }, () => ({ path: 'vitepress', namespace: 'language-test' }))
    builder.onLoad({ filter: /.*/, namespace: 'language-test' }, () => ({ contents: 'export const useRoute = () => ({ path: "/catalog" }); export const withBase = p => "/eff-agent-article" + p;' }))
  } }] })
const languageModulePath = resolve(cache, 'catalog-language-fixture.mjs'); writeFileSync(languageModulePath, languageBundle.outputFiles[0].text)
const LanguageComponent = (await import(pathToFileURL(languageModulePath))).default
async function render({ order = DEFAULT_CATALOG_SORT, tags = [], english = false, page = 'catalog.md', props = {}, currentPage = 1 } = {}) {
  globalThis.__catalogTestState = { order, tags, currentPage, data: { lang: ref(english ? 'en-US' : 'zh-CN'), page: ref({ relativePath: page }) } }
  return renderToString(createSSRApp(Component, props))
}
const expectedDefault = english => chronologicalCatalog(english ? englishCollections : collections, { order: DEFAULT_CATALOG_SORT, chronology: dates, sourcePath: slug => (english ? englishArticlePath(slug).slice(1) : 'articles/' + slug) + '.md' }).map(entry => entry.slug)
const orderedSlugs = html => [...html.matchAll(/data-article="([^"]+)"/g)].map(match => match[1])

test('actual catalogue SFC exposes a labelled native select only on independent Chinese and English catalogues', async () => {
  for (const english of [false, true]) {
    const html = await render({ english, page: english ? 'en/catalog.md' : 'catalog.md' })
    assert.equal((html.match(/<select\b/g) || []).length, 1)
    assert.match(html, /<label\b[^>]*for="catalog-sort-order"/)
    assert.match(html, /aria-describedby="catalog-date-note"/)
    for (const order of ['category', 'created-asc', 'created-desc', 'updated-asc', 'updated-desc']) assert.ok(html.includes(`value="${order}"`))
    assert.match(html, english ? /Created: newest first/ : /创建时间：从新到旧/)
    assert.match(html, /class="catalog-article-list"/); assert.ok(!html.includes('class="collection-block"'), 'Independent catalogue uses dense cards in original catalogue order')
    assert.equal(orderedSlugs(html).length, 20)
    assert.equal((html.match(/class="article-list-description"/g) || []).length, 20)
    for (const slug of orderedSlugs(html)) {
      const path = (english && englishArticleSlugs.includes(slug) ? 'en/' : '') + 'articles/' + slug + '.md'
      assert.ok(html.includes(globalThis.__catalogDescriptions.articles[path]))
      assert.ok(html.includes('aria-describedby="catalog-description-' + slug + '"'))
    }
    assert.equal((html.match(/<h1\b/g) || []).length, 1)
    assert.match(html, /<header class="catalog-page-heading"/)
    assert.match(html, new RegExp(canonical.length + (english ? ' articles' : ' 篇文章')))
    assert.equal((html.match(/class="catalog-entry-meta"/g) || []).length, 20)
    assert.equal((html.match(/class="catalog-dates"/g) || []).length, 20)
    assert.deepEqual(orderedSlugs(html), expectedDefault(english).slice(0, 20))
    assert.match(html, /<option[^>]*value="created-desc"[^>]*selected/)
    assert.match(html, /class="catalog-toolbar"/)
    assert.match(html, /class="catalog-select-shell"/)
    assert.match(html, /<details class="catalog-help"/)
    const allLinks = /<details class="catalog-all-links"[^>]*>([\s\S]*?)<\/details>/.exec(html)?.[1]
    assert.ok(allLinks)
    for (const slug of canonical) assert.ok(allLinks.includes('/articles/' + slug), 'Every article remains an actual SSR hyperlink: ' + slug)
    assert.equal((allLinks.match(/<a /g) || []).length, canonical.length)
  }
  for (const page of ['index.md', 'en/index.md', 'modules.md', 'en/thinking.md']) assert.ok(!(await render({ page, order: 'created-desc' })).includes('<select'))
  assert.ok(!(await render({ props: { category: 'modules' }, order: 'updated-desc' })).includes('<select'))
  assert.ok(!(await render({ props: { compact: true }, order: 'updated-desc' })).includes('<select'))
  assert.deepEqual(compileStyle({ source: descriptor.styles[0].content, id: 'catalog-test', scoped: true }).errors, [])
})

test('SSR page two, out-of-range, empty and language fallback retain correct pagination and discoverable links', async () => {
  const page2 = await render({ currentPage: 2, order: 'category' })
  assert.deepEqual(orderedSlugs(page2), canonical.slice(20, 40))
  assert.match(page2, /aria-current="page"[^>]*aria-label="第 2 页"/)
  const last = await render({ currentPage: 999, order: 'created-asc' })
  assert.equal(orderedSlugs(last).length, canonical.length % 20 || 20)
  assert.match(last, /<button[^>]*disabled[^>]*>下一页<\/button>/)
  const one = await render({ tags: ['fallback'], currentPage: 8, english: true, page: 'en/catalog.md' })
  assert.equal(orderedSlugs(one).length, untranslated ? 2 : 1)
  assert.ok(!one.includes('<nav class="catalog-pagination"'))
  assert.match(one, /Page 1 of 1/)
  assert.equal(one.includes('(Chinese original)'), Boolean(untranslated), 'Full English coverage needs no Chinese-original fallback')
  const empty = await render({ tags: ['absent'], currentPage: 8 })
  assert.deepEqual(orderedSlugs(empty), [])
  assert.ok(!empty.includes('class="catalog-all-links"'))
  assert.ok(!empty.includes('<nav class="catalog-pagination"'))
  assert.match(empty, /显示 0–0 篇，共 0 篇/)
})

function catalogHost() {
  let focused = null
  const node = (tag, text = '') => ({ tag, tagName: tag.toUpperCase(), text, props: {}, children: [], parent: null,
    listeners: {}, addEventListener(event, handler) { this.listeners[event] = handler }, removeEventListener(event) { delete this.listeners[event] },
    focus(options) { focused = { target: this, options } },
    get options() { return this.children.filter(child => child.tag === 'option') }
  })
  const renderer = createRenderer({
    createElement: tag => node(tag), createText: text => node('#text', text), createComment: text => node('#comment', text),
    setText: (n, text) => { n.text = text }, setElementText: (n, text) => { n.text = text; n.children = [] },
    parentNode: n => n.parent, nextSibling: n => n.parent?.children[n.parent.children.indexOf(n) + 1] ?? null,
    patchProp: (n, key, prev, next) => { n.props[key] = next; if (['value', 'multiple', 'selected'].includes(key)) n[key] = next },
    insert: (n, parent, anchor = null) => { if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1); n.parent = parent; const i = parent.children.indexOf(anchor); parent.children.splice(i < 0 ? parent.children.length : i, 0, n) },
    remove: n => { if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1); n.parent = null },
    insertStaticContent: (content, parent, anchor) => { const n = node('#static', content); n.parent = parent; const i = parent.children.indexOf(anchor); parent.children.splice(i < 0 ? parent.children.length : i, 0, n); return [n, n] }
  })
  const root = node('root')
  const all = n => [n, ...n.children.flatMap(all)]
  const text = n => n.text + n.children.map(text).join('')
  const find = predicate => all(root).find(predicate)
  return { root, renderer, all, text, find, focused: () => focused }
}

// Vue's real reactive renderer and bound event handlers, with a lightweight host
// tree rather than a browser or a replacement implementation of the component.
test('actual filter, clear, sort and paging handlers update results and reset the page without focus side effects', async () => {
  await render()
  const host = catalogHost()
  const { root, renderer, all, text, find } = host
  const app = renderer.createApp(Component); app.mount(root)
  const current = () => find(n => n.props['aria-current'] === 'page')
  const click = async n => { assert.ok(n); n.props.onClick(); await nextTick() }
  try {
    await click(find(n => n.tag === 'button' && text(n) === '下一页'))
    assert.equal(text(current()), '2')
    await click(find(n => n.tag === 'button' && text(n) === '金融'))
    assert.ok(!current(), 'Three matching articles fit one page')
    const clear = find(n => n.tag === 'button' && n.props['aria-label'] === '清除筛选')
    await click(clear)
    assert.strictEqual(find(n => n.tag === 'button' && n.props['aria-label'] === '清除筛选'), clear, 'Clearing must not remove its focus target')
    assert.equal(clear.props['aria-disabled'], true)
    assert.equal(text(current()), '1')
    await click(find(n => n.tag === 'button' && text(n) === '下一页'))
    const select = find(n => n.tag === 'select')
    select.props.onChange({ target: { value: 'updated-desc' } }); await nextTick()
    assert.equal(text(current()), '1')
    assert.equal(all(root).filter(n => n.props['data-article']).length, 20)
    assert.ok(find(n => n.props.id === 'catalog-results' && n.props.tabindex === -1))
    assert.equal(host.focused(), null, 'Changing pages, filters and order must not grab focus')
    await click(find(n => n.tag === 'a' && n.props.href === '#catalog-results'))
    assert.equal(host.focused().target.props.id, 'catalog-results')
    assert.deepEqual(host.focused().options, { preventScroll: true })
  } finally { app.unmount() }
})

test('actual SFC renders all four global orders, matching tags, edition dates, and Chinese-original fallback', async () => {
  const expected = { 'created-asc': [a, b], 'created-desc': [b, a], 'updated-asc': [b, a], 'updated-desc': [a, b] }
  for (const [order, slugs] of Object.entries(expected)) {
    const html = await render({ order, tags: ['finance', 'open'] })
    assert.deepEqual(orderedSlugs(html), slugs)
    assert.ok(!html.includes('class="collection-block"'))
    assert.match(html, /<time datetime="2026-/)
  }
  const english = await render({ english: true, page: 'en/catalog.md', order: 'created-desc', tags: ['finance', 'open'] })
  assert.deepEqual(orderedSlugs(english), [a, b])
  assert.ok(english.includes(`/en/articles/${a}`)); assert.ok(english.includes('2026-01-03'))
  const fallback = await render({ english: true, page: 'en/catalog.md', order: 'created-asc', tags: ['fallback'] })
  assert.deepEqual(orderedSlugs(fallback), untranslated ? [untranslated, a] : [a])
  assert.equal(fallback.includes('(Chinese original)'), Boolean(untranslated))
  if (untranslated) {
    assert.ok(fallback.includes('2025-01-01'))
    assert.ok(fallback.includes(globalThis.__catalogDescriptions.articles['articles/' + untranslated + '.md']))
    assert.ok(!fallback.includes(globalThis.__catalogDescriptions.articles['en/articles/' + untranslated + '.md']))
  } else {
    assert.ok(!fallback.includes('2025-01-01'), 'No synthetic Chinese-only dates for a fully translated catalogue')
  }
  const empty = await render({ order: 'updated-desc', tags: ['not-a-tag'] })
  assert.deepEqual(orderedSlugs(empty), []); assert.match(empty, /role="status"/)
})

// An in-memory History API fixture drives the actual mounted SFC. This is not
// a browser claim; the live release also needs a real Back/Forward check.
function historyWindow(initial) {
  let location = new URL(initial, 'https://example.invalid'), index = 0
  const entries = [{ href: location.href, state: { router: 'preserved', scrollPosition: 80 } }]
  const listeners = new Set()
  let pushes = 0, replaces = 0
  const history = {
    get state() { return entries[index].state },
    pushState(state, title, href) { pushes++; location = new URL(href, location); entries.splice(++index); entries.push({ href: location.href, state }) },
    replaceState(state, title, href) { replaces++; if (href !== undefined) location = new URL(href, location); entries[index] = { href: location.href, state } }
  }
  const pop = () => { for (const callback of listeners) callback({ state: history.state }) }
  return { get location() { return location }, history, scrollY: 80,
    addEventListener: (name, fn) => { assert.equal(name, 'popstate'); listeners.add(fn) },
    removeEventListener: (name, fn) => { assert.equal(name, 'popstate'); listeners.delete(fn) },
    back() { if (index) { location = new URL(entries[--index].href); pop() } },
    forward() { if (index + 1 < entries.length) { location = new URL(entries[++index].href); pop() } },
    visit(href) { location = new URL(href, location); entries[index] = { href: location.href, state: history.state }; pop() },
    counts: () => ({ pushes, replaces, listeners: listeners.size })
  }
}

test('mounted catalogue restores URL, history and language routes without writes on popstate or duplicate edits', async () => {
  const originalWindow = globalThis.window
  await render()
  const browser = historyWindow('/eff-agent-article/catalog?keep=a%20b#catalog-results')
  globalThis.window = browser
  const host = catalogHost(), { root, renderer, find, text, all } = host
  let app = renderer.createApp(Component); app.mount(root); await nextTick()
  const select = () => find(n => n.tag === 'select')
  const current = () => text(find(n => n.props['aria-current'] === 'page'))
  const click = async label => { const button = find(n => n.tag === 'button' && (text(n) === label || n.props['aria-label'] === label)); assert.ok(button); button.props.onClick(); await nextTick() }
  const location = () => browser.location.pathname + browser.location.search + browser.location.hash
  try {
    assert.equal(select().props.value, 'created-desc')
    assert.equal(current(), '1')
    assert.equal(browser.counts().pushes, 0)
    await click('下一页')
    assert.equal(current(), '2'); assert.equal(browser.location.searchParams.get('page'), '2')
    assert.equal(browser.history.state.router, 'preserved'); assert.equal(browser.history.state.scrollPosition, 80)
    const pushes = browser.counts().pushes
    browser.back(); await nextTick(); assert.equal(current(), '1')
    browser.forward(); await nextTick(); assert.equal(current(), '2')
    assert.equal(browser.counts().pushes, pushes, 'Traversal never pushes another history entry')
    const page2 = location()
    await click('金融')
    assert.equal(browser.location.searchParams.get('tags'), 'finance')
    assert.equal(browser.location.searchParams.has('page'), false, 'A filter resets page 1')
    await click('清除筛选'); assert.equal(current(), '1')
    const afterClear = browser.counts().pushes
    await click('清除筛选'); assert.equal(browser.counts().pushes, afterClear)
    await click('下一页')
    select().props.onChange({ target: { value: 'updated-desc' } }); await nextTick()
    assert.equal(current(), '1'); assert.equal(browser.location.searchParams.get('sort'), 'updated-desc')
    browser.back(); await nextTick(); assert.equal(current(), '2'); assert.equal(select().props.value, 'created-desc')
    browser.forward(); await nextTick(); assert.equal(current(), '1'); assert.equal(select().props.value, 'updated-desc')
    assert.equal(browser.location.searchParams.get('keep'), 'a b'); assert.equal(browser.location.hash, '#catalog-results')
    browser.visit('/eff-agent-article/catalog?sort=category&page=999&tags=finance,unknown#keep')
    await nextTick()
    assert.equal(select().props.value, 'category')
    assert.equal(all(root).filter(n => n.props['data-article']).length, untranslated ? 3 : 2)
    assert.equal(location(), '/eff-agent-article/catalog?sort=category&tags=finance#keep')
    const beforeLeaving = browser.counts()
    browser.visit('/eff-agent-article/articles/example?sort=category&page=3')
    await nextTick()
    assert.equal(browser.counts().replaces, beforeLeaving.replaces, 'Old catalogue does not normalize an article URL')
    app.unmount(); assert.equal(browser.counts().listeners, 0)
    // Re-create the catalogue after returning from an article or a refresh.
    browser.visit(page2)
    await render()
    app = renderer.createApp(Component); app.mount(root); await nextTick()
    assert.equal(current(), '2'); assert.equal(select().props.value, 'created-desc')
    // Reused component changes to the English route: URL, not old ref state, wins.
    browser.visit('/eff-agent-article/en/catalog?sort=created-asc&tags=open&page=99')
    globalThis.__catalogTestState.data.lang.value = 'en-US'
    globalThis.__catalogTestState.data.page.value = { relativePath: 'en/catalog.md' }
    await nextTick()
    assert.equal(select().props.value, 'created-asc')
    assert.deepEqual(all(root).filter(n => n.props['data-article']).map(n => n.props['data-article']), [b, a])
    assert.equal(location(), '/eff-agent-article/en/catalog?sort=created-asc&tags=open')
    assert.equal(host.focused(), null)
  } finally { app.unmount(); assert.equal(browser.counts().listeners, 0); if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow }
})

test('actual language switch and preference redirect preserve catalogue query/hash without a lang redirect loop', async () => {
  const originalWindow = globalThis.window
  const cases = [
    { url: '/eff-agent-article/catalog?sort=updated-asc&page=2&tags=finance&campaign=x#catalog-results', saved: 'en', expected: '/eff-agent-article/en/catalog?sort=updated-asc&page=2&tags=finance&campaign=x#catalog-results', operation: 'replace' },
    { url: '/eff-agent-article/catalog?lang=zh&sort=category&page=2&tags=panorama#keep', saved: 'en', expected: '/eff-agent-article/catalog?sort=category&page=2&tags=panorama#keep', operation: 'history' },
    { url: '/eff-agent-article/en/catalog?lang=zh&sort=category&page=2&tags=panorama#keep', saved: 'en', expected: '/eff-agent-article/catalog?sort=category&page=2&tags=panorama#keep', operation: 'replace' },
    { url: '/eff-agent-article/catalog?sort=category&page=2&tags=finance#keep', saved: 'zh', choose: 'EN', expected: '/eff-agent-article/en/catalog?sort=category&page=2&tags=finance#keep', operation: 'assign' }
  ]
  try {
    for (const item of cases) {
      const url = new URL(item.url, 'https://example.invalid'), calls = []
      let saved = item.saved
      globalThis.window = {
        location: { href: url.href, pathname: url.pathname, search: url.search, hash: url.hash,
          replace: href => calls.push(['replace', href]), assign: href => calls.push(['assign', href]) },
        history: { state: { fixture: true }, replaceState: (state, title, href) => calls.push(['history', href]) },
        localStorage: { getItem: () => saved, setItem: (key, value) => { saved = value } }
      }
      const { root, renderer, find, text } = catalogHost()
      const app = renderer.createApp(LanguageComponent); app.mount(root); await nextTick()
      try {
        if (item.choose) { find(n => n.tag === 'button' && text(n) === item.choose).props.onClick(); await nextTick() }
        assert.deepEqual(calls, [[item.operation, item.expected]])
      } finally { app.unmount() }
    }
  } finally { if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow }
})

test('missing history keeps all articles and stable order rather than fabricating dates', async () => {
  globalThis.__catalogChronology.available = false; globalThis.__catalogChronology.articles = {}
  try {
    const html = await render({ order: 'created-desc', tags: ['finance', 'open'] })
    assert.deepEqual(orderedSlugs(html), [a, b]); assert.ok(!html.includes('<time'))
    assert.match(html, /未知/); assert.match(html, /role="status"/)
  } finally { globalThis.__catalogChronology.available = true; globalThis.__catalogChronology.articles = dates }
})

test('the sixth homepage feature reuses the existing bilingual open-source topic and the original responsive grid', async () => {
  const md = await createMarkdownRenderer(process.cwd(), { highlight: code => code })
  for (const [prefix, title, action] of [['', '开源专题', '探索开源'], ['en/', 'Open source', 'Explore open source']]) {
    const env = {}; md.render(readFileSync(prefix + 'index.md', 'utf8'), env)
    assert.equal(env.frontmatter.features.length, 6)
    assert.deepEqual(env.frontmatter.features.map(item => item.link), ['modules', 'thinking', 'engineering', 'panorama', 'fintech', 'open-etf-agent'].map(route => '/' + prefix + route))
    assert.equal(env.frontmatter.features[5].title, title); assert.equal(env.frontmatter.features[5].linkText, action)
    assert.match(readFileSync(prefix + 'open-etf-agent.md', 'utf8'), /<OpenEtfTopic language=/)
  }
  const css = readFileSync('.vitepress/theme/home-layout.css', 'utf8')
  assert.match(css, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/)
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.VPHome \.VPFeatures \.items \{ grid-template-columns: minmax\(0, 1fr\)/)
})

test('dense independent page shell preserves original anchors, responsive grid and touch/focus affordances', async () => {
  const css = descriptor.styles[0].content
  assert.match(css, /@media \(min-width: 960px\)[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(css, /catalog-article-list[^}]*grid-template-columns: minmax\(0, 1fr\)/)
  assert.match(css, /@media \(pointer: coarse\), \(max-width: 640px\)/)
  assert.match(css, /catalog-dates dt, \.catalog-dates dd \{ display: inline; margin: 0; \}/)
  for (const [prefix, anchor] of [['', '全部文章'], ['en/', 'article-catalog']]) {
    const source = readFileSync(prefix + 'catalog.md', 'utf8')
    assert.match(source, /layout: page/); assert.ok(!/^# /m.test(source), 'The shared component owns the only H1')
    assert.match(source, /<ContinueReading \/>/)
    const html = await render({ english: Boolean(prefix), page: prefix + 'catalog.md' })
    assert.match(html, new RegExp('<h1 id="' + anchor + '"'))
  }
  const category = await render({ page: 'modules.md', props: { category: 'modules' } })
  assert.ok(category.includes('class="chapter-card"')); assert.ok(!category.includes('catalog-article-list'))
  assert.ok(!category.includes('article-list-description')); assert.ok(!category.includes('<h1')); assert.ok(!category.includes('catalog-entry-meta'))
})
