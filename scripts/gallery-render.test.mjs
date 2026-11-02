import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse, compileScript, compileStyle } from '@vue/compiler-sfc'
import { createSSRApp, createRenderer, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMarkdownRenderer } from 'vitepress'
import { build } from 'esbuild'
import { learningPathSlugs } from '../book.mjs'
import { learningPathStages, galleryStageFromHash, galleryStageForKey } from '../.vitepress/theme/learning-path-nav.mjs'

const read = path => readFileSync(resolve(path), 'utf8')
const theme = resolve('.vitepress/theme')
const { descriptor } = parse(read('.vitepress/theme/ArchitectureGallery.vue'))
const compiled = compileScript(descriptor, { id: 'gallery-test', inlineTemplate: true }).content
const bundle = await build({ stdin: { contents: compiled, loader: 'ts', resolveDir: theme }, bundle: true, write: false, platform: 'node', format: 'esm', external: ['vue'], plugins: [{ name: 'gallery-fixtures', setup(builder) {
  builder.onResolve({ filter: /^(vitepress|\.\/PanoramaViewer\.vue)$/ }, args => ({ path: args.path, namespace: 'gallery-test' }))
  builder.onLoad({ filter: /.*/, namespace: 'gallery-test' }, args => ({ contents: args.path === 'vitepress'
    ? 'export const useData = () => ({ lang: { value: globalThis.__galleryLanguage } }); export const withBase = p => "/eff-agent-article" + p;'
    : 'import { h } from "vue"; export default { setup(props, { slots }) { return () => h("figure", { class: "viewer-fixture" }, slots.default?.()) } };' }))
} }] })
mkdirSync(resolve('.vitepress/cache'), { recursive: true })
const modulePath = resolve('.vitepress/cache/gallery-render-fixture.mjs'); writeFileSync(modulePath, bundle.outputFiles[0].text)
const Component = (await import(pathToFileURL(modulePath))).default

test('four gallery views reuse the canonical reading path and existing bilingual diagram geometry', () => {
  for (const english of [false, true]) {
    const stages = learningPathStages(english)
    assert.deepEqual(stages.map(stage => stage.slug), learningPathSlugs)
    for (const stage of stages) {
      assert.equal(stage.href, `${english ? '/en' : ''}/articles/${stage.slug}`)
      const svg = read(stage.src.slice(1))
      assert.match(svg, new RegExp(`viewBox="0 0 ${stage.width} ${stage.height}"`))
      const article = read(`${english ? 'en/' : ''}articles/${stage.slug}.md`)
      assert.ok(article.includes(stage.src), stage.key + ' must reuse its actual article diagram')
      assert.equal(stage.sourceLinks, stage.key !== 'panorama')
    }
  }
  for (const key of ['intro', 'intermediate', 'deep', 'panorama']) assert.equal(galleryStageFromHash('#stage=' + key), key)
  for (const hash of ['', '#stage=missing', '#stage=intro&other', '#owner-inventory']) assert.equal(galleryStageFromHash(hash), 'panorama')
  assert.equal(galleryStageForKey('panorama', 'ArrowRight'), 'intro')
  assert.equal(galleryStageForKey('intro', 'ArrowLeft'), 'panorama')
  assert.equal(galleryStageForKey('deep', 'Home'), 'intro')
  assert.equal(galleryStageForKey('intro', 'End'), 'panorama')
  assert.equal(galleryStageForKey('intro', 'Escape'), null)
})

test('SSR exposes four real reading links, default panorama and original Owner index without an iframe or status wall', async () => {
  const md = await createMarkdownRenderer(process.cwd(), { highlight: code => code })
  const registry = JSON.parse(/<script[^>]*id="owner-data"[^>]*>([\s\S]*?)<\/script>/.exec(read('visuals/owner-architecture/index.html'))[1])
  const expected = registry.owners.filter(owner => !['E01', 'E02', 'E03'].includes(owner.id)).map(owner => owner.id).sort()
  assert.equal(expected.length, 47)
  for (const english of [false, true]) {
    globalThis.__galleryLanguage = english ? 'en-US' : 'zh-CN'
    const html = await renderToString(createSSRApp(Component))
    assert.ok(!html.includes('role="tab"'), 'Before enhancement these remain ordinary links')
    for (const stage of learningPathStages(english)) assert.ok(html.includes('href="/eff-agent-article' + stage.href + '"'))
    assert.equal((html.match(/<object\b/g) || []).length, 1)
    assert.ok(html.includes('v3-owner-map-' + (english ? 'en' : 'zh') + '.svg'))
    assert.match(html, /<details id="owner-inventory"/)
    const source = read((english ? 'en/' : '') + 'gallery.md')
    assert.match(source, /layout: page/)
    assert.equal((source.match(/^# /gm) || []).length, 1)
    assert.ok(!/<iframe|近期模块变化|点击 Owner 查看职责|October 2[4-7], 2026|November 1, 2026/.test(source))
    assert.deepEqual([...source.matchAll(/index\.html#owner=([ABE]\d\d)/g)].map(match => match[1]).sort(), expected)
    const rendered = md.render(source)
    assert.match(rendered, /<ArchitectureGallery>/)
    assert.match(rendered, /<table\b/)
  }
  assert.deepEqual(compileStyle({ source: descriptor.styles[0].content, id: 'gallery-test', scoped: true }).errors, [])
  assert.match(descriptor.styles[0].content, /min-height: 44px/)
  assert.match(descriptor.styles[0].content, /\.gallery-stage-map[^}]*width: 100%; height: auto/)
})

test('real Vue gallery events support keyboard selection, modifier links, hash restoration and cleanup', async () => {
  globalThis.__galleryLanguage = 'en-US'
  let focused = null
  const all = n => [n, ...n.children.flatMap(all)]
  const node = (tag, text = '') => ({ tag, text, props: {}, children: [], parent: null,
    focus(options) { focused = { target: this, options } },
    querySelector(selector) { return all(this).find(n => '#' + n.props.id === selector) }
  })
  const renderer = createRenderer({
    createElement: tag => node(tag), createText: text => node('#text', text), createComment: text => node('#comment', text),
    setText: (n, text) => { n.text = text }, setElementText: (n, text) => { n.text = text; n.children = [] },
    parentNode: n => n.parent, nextSibling: n => n.parent?.children[n.parent.children.indexOf(n) + 1] ?? null,
    patchProp: (n, key, prev, next) => { n.props[key] = next },
    insert: (n, parent, anchor = null) => { if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1); n.parent = parent; const i = parent.children.indexOf(anchor); parent.children.splice(i < 0 ? parent.children.length : i, 0, n) },
    remove: n => { if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1); n.parent = null },
    insertStaticContent: (content, parent, anchor) => { const n = node('#static', content); n.parent = parent; const i = parent.children.indexOf(anchor); parent.children.splice(i < 0 ? parent.children.length : i, 0, n); return [n, n] }
  })
  const listeners = new Map(), state = { retained: 'vitepress-history' }
  globalThis.window = { location: { hash: '#stage=deep' }, history: { state, replaceState(value, title, hash) { assert.strictEqual(value, state); window.location.hash = hash } },
    addEventListener(type, handler) { listeners.set(type, handler) }, removeEventListener(type, handler) { assert.strictEqual(listeners.get(type), handler); listeners.delete(type) } }
  const root = node('root'), app = renderer.createApp(Component); app.mount(root); await nextTick()
  const find = predicate => all(root).find(predicate)
  const tab = key => find(n => n.props.id === 'gallery-tab-' + key)
  const selected = () => find(n => n.props['aria-selected'] === true)
  const key = async value => { let prevented = false; await selected().props.onKeydown({ key: value, preventDefault() { prevented = true } }); await nextTick(); return prevented }
  try {
    assert.equal(selected().props.id, 'gallery-tab-deep')
    assert.equal(find(n => n.props.role === 'tablist').props['aria-label'], 'Reading stages')
    assert.equal(all(root).filter(n => n.props.role === 'tab' && n.props.tabindex === 0).length, 1)
    assert.equal(await key('ArrowRight'), true); assert.equal(selected()?.props.id, 'gallery-tab-panorama')
    assert.equal(await key('ArrowRight'), true); assert.equal(selected()?.props.id, 'gallery-tab-intro')
    assert.equal(await key('ArrowLeft'), true); assert.equal(selected()?.props.id, 'gallery-tab-panorama')
    await key('Home'); assert.equal(selected()?.props.id, 'gallery-tab-intro'); await key('End'); assert.equal(selected()?.props.id, 'gallery-tab-panorama')
    assert.equal(focused.target.props.id, 'gallery-tab-panorama'); assert.deepEqual(focused.options, { preventScroll: true })
    assert.equal(await key('Escape'), false)
    let prevented = false
    tab('intro').props.onClick({ button: 0, ctrlKey: true, preventDefault() { prevented = true } }); await nextTick()
    assert.equal(prevented, false); assert.equal(selected()?.props.id, 'gallery-tab-panorama')
    tab('intro').props.onClick({ button: 0, preventDefault() { prevented = true } }); await nextTick()
    assert.equal(prevented, true); assert.equal(window.location.hash, '#stage=intro')
    await tab('deep').props.onKeydown({ key: ' ', preventDefault() {} }); await nextTick(); assert.equal(selected()?.props.id, 'gallery-tab-deep')
    window.location.hash = '#owner-inventory'; listeners.get('hashchange')(); await nextTick()
    assert.equal(find(n => n.props.id === 'owner-inventory').open, true)
    window.location.hash = '#stage=unknown'; listeners.get('hashchange')(); await nextTick(); assert.equal(selected()?.props.id, 'gallery-tab-panorama')
  } finally { app.unmount(); delete globalThis.window }
  assert.equal(listeners.size, 0)
})


test('the installed VitePress capture router leaves enhanced stage links to the gallery', () => {
  const router = read('node_modules/vitepress/dist/client/app/router.js')
  const handler = /window\.addEventListener\('click', (\(e\) => \{[\s\S]*?)\}, \{ capture: true \}\);/.exec(router)
  assert.ok(handler, 'Recheck the integration if VitePress changes its capture listener')
  let navigations = 0
  class Element {}
  const target = new Element()
  let raw = true
  const link = { closest: selector => selector === '.vp-raw' && raw ? {} : null,
    hasAttribute: () => false, getAttribute: () => '/eff-agent-article/articles/agent-in-15-minutes', baseURI: 'https://example.test/eff-agent-article/gallery' }
  target.closest = selector => selector === 'a' ? link : null
  const listen = new Function('Element', 'location', 'treatAsHtml', 'go', 'return (' + handler[1] + '})')(
    Element, { href: link.baseURI }, () => true, () => { navigations++ })
  const event = { target, button: 0, preventDefault() {} }
  listen(event); assert.equal(navigations, 0)
  raw = false; listen(event); assert.equal(navigations, 1, 'The fixture must reproduce the original routing conflict')
  assert.match(descriptor.template.content, /<nav[^>]*class="gallery-stages vp-raw"/)
})
