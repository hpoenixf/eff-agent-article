import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse, compileScript, compileStyle } from '@vue/compiler-sfc'
import { build } from 'esbuild'
import { createSSRApp, createRenderer, nextTick, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { articleEvidence, articleTopicTags, openSourceExample } from '../.vitepress/theme/article-context.mjs'

const theme = resolve('.vitepress/theme')
const data = { page: ref({ relativePath: 'articles/019-agent-answer-publication.md' }), lang: ref('zh-CN'), frontmatter: ref({ evidence: { implementation: 'Implementation qualification.', scoped: 'Scoped qualification.', live: 'Live qualification.' } }) }
const tags = { definitions: [{ id: 'open-source', zh: '开源', en: 'Open source', path: 'open-etf-agent' }], articles: { '019-agent-answer-publication': [{ id: 'open-source', verification: 'scoped' }] } }
globalThis.__articleDisclosures = { data, tags }
async function component(name) {
  const result = await build({ entryPoints: [resolve(theme, name + '.vue')], bundle: true, write: false, platform: 'node', format: 'esm', external: ['vue'], plugins: [{ name: 'actual-disclosure-components', setup(builder) {
    builder.onResolve({ filter: /^(vitepress|\.\/article-tags\.data)$/ }, args => ({ path: args.path, namespace: 'fixture' }))
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: args.path === 'vitepress'
      ? 'export const useData = () => globalThis.__articleDisclosures.data; export const withBase = p => "/reader" + p;'
      : 'export const data = globalThis.__articleDisclosures.tags;' }))
    builder.onLoad({ filter: /\.vue$/ }, args => {
      const { descriptor } = parse(readFileSync(args.path, 'utf8'))
      for (const style of descriptor.styles) assert.deepEqual(compileStyle({ source: style.content, id: 'disclosure-test', scoped: style.scoped }).errors, [])
      return { contents: compileScript(descriptor, { id: 'disclosure-test', inlineTemplate: true }).content, loader: 'ts', resolveDir: theme }
    })
  } }] })
  const cache = resolve('.vitepress/cache'); mkdirSync(cache, { recursive: true })
  const path = resolve(cache, name + '-disclosure-test.mjs'); writeFileSync(path, result.outputFiles[0].text)
  return (await import(pathToFileURL(path))).default
}
const ArticleContext = await component('ArticleContext')

// Lightweight real Vue host: lifecycle/key behavior, not a browser visual test.
function mount(Component) {
  const node = (tag, text = '') => ({ tag, text, children: [], props: {}, parent: null, open: false })
  const renderer = createRenderer({
    createElement: tag => node(tag), createText: text => node('#text', text), createComment: text => node('#comment', text),
    setText: (n, text) => { n.text = text }, setElementText: (n, text) => { n.text = text; n.children = [] },
    parentNode: n => n.parent, nextSibling: n => n.parent?.children[n.parent.children.indexOf(n) + 1] ?? null,
    patchProp: (n, key, prev, next) => { n.props[key] = next },
    insert: (n, parent, anchor = null) => { if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1); n.parent = parent; const i = parent.children.indexOf(anchor); parent.children.splice(i < 0 ? parent.children.length : i, 0, n) },
    remove: n => { if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1); n.parent = null },
    insertStaticContent: (content, parent, anchor) => { const n = node('#static', content); n.parent = parent; const i = parent.children.indexOf(anchor); parent.children.splice(i < 0 ? parent.children.length : i, 0, n); return [n, n] }
  })
  const root = node('root'), app = renderer.createApp(Component); app.mount(root)
  const all = n => [n, ...n.children.flatMap(all)]
  return { app, find: predicate => all(root).find(predicate) }
}

test('presentation helpers retain original evidence, tag qualifications and exact companion mapping', () => {
  assert.equal(articleEvidence({}), undefined)
  assert.equal(articleEvidence({ evidence: {} }), undefined)
  const evidence = { scoped: 'Not a production claim.' }
  assert.strictEqual(articleEvidence({ evidence }), evidence)
  assert.deepEqual(articleTopicTags('en/articles/019-agent-answer-publication.md', tags), [{ ...tags.definitions[0], ...tags.articles['019-agent-answer-publication'][0] }])
  assert.equal(openSourceExample('articles/019-agent-answer-publication.md'), 'src/publication.mjs')
  assert.equal(openSourceExample('en/articles/019-agent-answer-publication.md'), 'src/publication.mjs')
  for (const path of ['index.md', 'catalog.md', 'en/catalog.md', 'articles/other.md', 'articles/019-agent-answer-publication.md/extra']) assert.equal(openSourceExample(path), undefined)
})

test('one default-closed native disclosure retains all three actual bilingual modules in SSR', async () => {
  for (const [lang, prefix, label] of [['zh-CN', '', '证据、标签与源码'], ['en-US', 'en/', 'Evidence, tags &amp; source code']]) {
    data.lang.value = lang; data.page.value = { relativePath: prefix + 'articles/019-agent-answer-publication.md' }
    const html = await renderToString(createSSRApp(ArticleContext))
    assert.equal((html.match(/<details\b/g) || []).length, 1)
    assert.match(html, new RegExp('<summary>' + label + '</summary>'))
    assert.doesNotMatch(html, /<details[^>]*\sopen(?:=|\s|>)/)
    for (const qualification of Object.values(data.frontmatter.value.evidence)) assert.ok(html.includes(qualification))
    for (const css of ['article-evidence', 'article-topic-tags', 'open-source-bridge']) assert.ok(html.includes('class="' + css + '"'))
    assert.ok(html.includes('href="/reader/' + prefix + 'open-etf-agent"'))
    assert.ok(html.includes('https://github.com/hpoenixf/open-etf-agent/blob/main/src/publication.mjs'))
    assert.ok(html.includes(prefix ? 'Scoped verification' : '有限范围已验证'))
    assert.ok(html.includes(prefix ? 'not the complete internal ETF Agent product or a live investing system.' : '不是内部完整 ETF Agent 产品源码，也不代表实时投研或生产就绪。'))
  }
})

test('empty pages do not get empty disclosures; evidence-only, tags-only and source-only pages stay available', async () => {
  data.frontmatter.value = {}; data.page.value = { relativePath: 'catalog.md' }
  assert.doesNotMatch(await renderToString(createSSRApp(ArticleContext)), /<details/)
  data.frontmatter.value = { evidence: { scoped: 'Specific scope.' } }
  assert.match(await renderToString(createSSRApp(ArticleContext)), /Specific scope/)
  data.frontmatter.value = {}; data.page.value = { relativePath: 'articles/tag-only.md' }; tags.articles['tag-only'] = [{ id: 'open-source', verification: 'unverified' }]
  assert.match(await renderToString(createSSRApp(ArticleContext)), /Associated · unverified/)
  data.page.value = { relativePath: 'articles/020-agent-extension-host-smartphone.md' }
  const sourceOnly = await renderToString(createSSRApp(ArticleContext))
  assert.match(sourceOnly, /src\/extensions.mjs/); assert.doesNotMatch(sourceOnly, /class="article-topic-tags"/)
})

test('route and language edition changes replace opened native details rather than leaking expanded state', async () => {
  data.page.value = { relativePath: 'articles/019-agent-answer-publication.md' }
  const host = mount(ArticleContext)
  try {
    const old = host.find(n => n.tag === 'details'); old.open = true
    data.page.value = { relativePath: 'en/articles/019-agent-answer-publication.md' }; await nextTick()
    const translated = host.find(n => n.tag === 'details'); assert.notStrictEqual(translated, old); assert.equal(translated.open, false)
    translated.open = true; data.page.value = { relativePath: 'articles/020-agent-extension-host-smartphone.md' }; await nextTick()
    assert.notStrictEqual(host.find(n => n.tag === 'details'), translated); assert.equal(host.find(n => n.tag === 'details').open, false)
  } finally { host.app.unmount() }
})

const ArticleReadingBrief = await component('ArticleReadingBrief')
const brief = { takeaways: ['First scoped conclusion.', 'Second distinct conclusion.', 'Third conclusion.'], appliesTo: ['A supported use.'], notFor: ['An unsupported use.'] }
test('brief conclusions and estimated time stay visible while full adoption boundaries are default-closed', async () => {
  data.frontmatter.value = { readingBrief: brief, readingEstimate: { minutes: 7 } }
  for (const [lang, prefix, label, summary] of [['zh-CN', '', '预计阅读 7 分钟', '适用与不适用'], ['en-US', 'en/', 'Estimated 7 min read', 'Who this is for — and who it is not for']]) {
    data.lang.value = lang; data.page.value = { relativePath: prefix + 'articles/019-agent-answer-publication.md' }
    const html = await renderToString(createSSRApp(ArticleReadingBrief))
    assert.equal((html.match(/<details\b/g) || []).length, 1)
    assert.match(html, new RegExp('<summary>' + summary + '</summary>'))
    assert.doesNotMatch(html, /<details[^>]*\sopen(?:=|\s|>)/)
    assert.ok(html.indexOf(label) < html.indexOf('<details'))
    for (const item of brief.takeaways) assert.ok(html.indexOf(item) < html.indexOf('<details'))
    for (const item of [...brief.appliesTo, ...brief.notFor]) assert.ok(html.indexOf(item) > html.indexOf('<details'))
    assert.doesNotMatch(html, /reading-brief-method|阅读时长如何估算|How reading time is estimated/)
  }
})
test('brief boundaries reset on article and language navigation without removing content', async () => {
  data.frontmatter.value = { readingBrief: brief, readingEstimate: { minutes: 7 } }
  data.page.value = { relativePath: 'articles/019-agent-answer-publication.md' }
  const host = mount(ArticleReadingBrief)
  try {
    const old = host.find(n => n.tag === 'details'); old.open = true
    data.page.value = { relativePath: 'en/articles/019-agent-answer-publication.md' }; await nextTick()
    const translated = host.find(n => n.tag === 'details'); assert.notStrictEqual(translated, old); assert.equal(translated.open, false)
    translated.open = true; data.page.value = { relativePath: 'articles/another.md' }; await nextTick()
    assert.notStrictEqual(host.find(n => n.tag === 'details'), translated); assert.equal(host.find(n => n.tag === 'details').open, false)
  } finally { host.app.unmount() }
  data.frontmatter.value = {}
  assert.doesNotMatch(await renderToString(createSSRApp(ArticleReadingBrief)), /<aside|<details/)
})
