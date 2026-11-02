import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse, compileScript, compileStyle } from '@vue/compiler-sfc'
import { build } from 'esbuild'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMarkdownRenderer } from 'vitepress'
import { collections } from '../book.mjs'
import { englishArticleSlugs } from '../book.en.mjs'

const theme = resolve('.vitepress/theme')
const { descriptor } = parse(readFileSync(resolve(theme, 'ChapterCatalog.vue'), 'utf8'))
let compiled = compileScript(descriptor, { id: 'catalog-test', inlineTemplate: true }).content
// Supply selected values as a test driver, without changing the template,
// computed state, filtering, sorting, routing, or any event binding.
assert.ok(compiled.includes("const sortOrder = ref('category')"))
assert.ok(compiled.includes('const selectedTags = ref<string[]>([])'))
compiled = compiled.replace("const sortOrder = ref('category')", 'const sortOrder = ref(globalThis.__catalogTestState.order)')
compiled = compiled.replace('const selectedTags = ref<string[]>([])', 'const selectedTags = ref<string[]>(globalThis.__catalogTestState.tags)')
const [a, b] = collections.map(c => c.chapters.flatMap(ch => ch.items)[0][0])
const canonical = collections.flatMap(c => c.chapters.flatMap(ch => ch.items.map(([slug]) => slug)))
const untranslated = canonical.find(slug => !englishArticleSlugs.includes(slug))
const date = timestamp => ({ timestamp, date: timestamp.slice(0, 10) })
const dates = {
  [`articles/${a}.md`]: { created: date('2026-01-01T00:00:00Z'), updated: date('2026-02-02T00:00:00Z') },
  [`en/articles/${a}.md`]: { created: date('2026-01-03T00:00:00Z'), updated: date('2026-02-01T00:00:00Z') },
  [`articles/${b}.md`]: { created: date('2026-01-02T00:00:00Z'), updated: date('2026-02-01T00:00:00Z') },
  [`en/articles/${b}.md`]: { created: date('2026-01-01T00:00:00Z'), updated: date('2026-02-02T00:00:00Z') },
  [`articles/${untranslated}.md`]: { created: date('2025-01-01T00:00:00Z'), updated: date('2025-02-01T00:00:00Z') }
}
globalThis.__catalogChronology = { available: true, articles: dates }
globalThis.__catalogTags = { definitions: [{ id: 'finance', zh: '金融', en: 'Finance' }, { id: 'open', zh: '开源', en: 'Open source' }], articles: {
  [a]: [{ id: 'finance' }, { id: 'open' }, { id: 'fallback' }],
  [b]: [{ id: 'finance' }, { id: 'open' }],
  [untranslated]: [{ id: 'finance' }, { id: 'fallback' }]
} }
const bundled = await build({ stdin: { contents: compiled, loader: 'ts', resolveDir: theme }, bundle: true, write: false, platform: 'node', format: 'esm', external: ['vue'], plugins: [{ name: 'local-catalog-test-providers', setup(builder) {
  builder.onResolve({ filter: /^(vitepress|\.\/article-tags\.data|\.\/article-chronology\.data)$/ }, args => ({ path: args.path, namespace: 'catalog-test' }))
  builder.onLoad({ filter: /.*/, namespace: 'catalog-test' }, args => ({ contents: args.path === 'vitepress'
    ? 'export const useData = () => globalThis.__catalogTestState.data; export const withBase = p => "/eff-agent-article" + p;'
    : 'export const data = globalThis.' + (args.path.includes('chronology') ? '__catalogChronology' : '__catalogTags') + ';' }))
} }] })
const cache = resolve('.vitepress/cache'); mkdirSync(cache, { recursive: true })
const modulePath = resolve(cache, 'catalog-render-fixture.mjs'); writeFileSync(modulePath, bundled.outputFiles[0].text)
const Component = (await import(pathToFileURL(modulePath))).default
async function render({ order = 'category', tags = [], english = false, page = 'catalog.md', props = {} } = {}) {
  globalThis.__catalogTestState = { order, tags, data: { lang: { value: english ? 'en-US' : 'zh-CN' }, page: { value: { relativePath: page } } } }
  return renderToString(createSSRApp(Component, props))
}
const orderedSlugs = html => [...html.matchAll(/data-article="([^"]+)"/g)].map(match => match[1])

test('actual catalogue SFC exposes a labelled native select only on independent Chinese and English catalogues', async () => {
  for (const english of [false, true]) {
    const html = await render({ english, page: english ? 'en/catalog.md' : 'catalog.md' })
    assert.equal((html.match(/<select\b/g) || []).length, 1)
    assert.match(html, /<label\b[^>]*for="catalog-sort-order"/)
    assert.match(html, /aria-describedby="catalog-date-note"/)
    for (const order of ['category', 'created-asc', 'created-desc', 'updated-asc', 'updated-desc']) assert.ok(html.includes(`value="${order}"`))
    assert.match(html, english ? /Created: newest first/ : /创建时间：从新到旧/)
    assert.ok(!html.includes('catalog-chronological-list'), 'Original grouped view remains the default')
    assert.equal((html.match(/class="collection-block"/g) || []).length, collections.length)
  }
  for (const page of ['index.md', 'en/index.md', 'modules.md', 'en/thinking.md']) assert.ok(!(await render({ page, order: 'created-desc' })).includes('<select'))
  assert.ok(!(await render({ props: { category: 'modules' }, order: 'updated-desc' })).includes('<select'))
  assert.ok(!(await render({ props: { compact: true }, order: 'updated-desc' })).includes('<select'))
  assert.deepEqual(compileStyle({ source: descriptor.styles[0].content, id: 'catalog-test', scoped: true }).errors, [])
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
  assert.deepEqual(orderedSlugs(fallback), [untranslated, a])
  assert.ok(fallback.includes('(Chinese original)')); assert.ok(fallback.includes('2025-01-01'))
  const empty = await render({ order: 'updated-desc', tags: ['not-a-tag'] })
  assert.deepEqual(orderedSlugs(empty), []); assert.match(empty, /role="status"/)
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
