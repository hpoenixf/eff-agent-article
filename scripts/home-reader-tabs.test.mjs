import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { readingRoutes, categoryLinks, topicLinks } from '../home-reading-routes.mjs'
import { collections, panoramaSeriesSlugs, learningPathSlugs } from '../book.mjs'
import { checkCatalogOrderHtml } from './check-catalog-order-output.mjs'
import { buildArticleTags } from '../article-tags.mjs'
import { existingFinanceArticleSlugs } from '../finance-membership.mjs'
const tagData=buildArticleTags({slugs:collections.flatMap(g=>g.chapters.flatMap(c=>c.items.map(([s])=>s))),financeSlugs:existingFinanceArticleSlugs,panoramaSlugs:panoramaSeriesSlugs,openGroups:[]})
globalThis.__homeTagData=tagData
test('four bilingual routes keep canonical article identities and all introductory steps', () => {
  for (const locale of ['zh','en']) {
    const routes = readingRoutes(locale,tagData)
    assert.equal(routes.length,4)
    assert.deepEqual(routes[0].articles.map(a=>a.slug), learningPathSlugs.slice(0,5))
    for (const route of routes) {
      assert.ok(route.label && route.goal)
      assert.equal(route.articles.length,5)
      assert.ok(existsSync('.'+route.href+'.md'))
      assert.ok(route.total>=5)
      assert.equal(new Set(route.articles.map(a=>a.slug)).size, route.articles.length)
      for (const article of route.articles) {
        assert.ok(article.title)
        assert.ok(existsSync('.'+article.href+'.md'), article.href)
        if(locale==='en') assert.ok(article.href.startsWith('/en/'), article.href)
      }
    }
    for (const link of [...categoryLinks(locale),...topicLinks(locale)]) assert.ok(existsSync('.'+link.href+'.md'),link.href)
    assert.ok(readFileSync(locale==='en'?'en/index.md':'index.md','utf8').includes('<HomeReaderTabs />'))
  }
})
test('tabs render five accessible controls, ordered links, locale base paths and responsive styles', async () => {
  const { parse, compileScript, compileStyle } = await import('@vue/compiler-sfc')
  const { build } = await import('esbuild')
  const { createSSRApp } = await import('vue')
  const { renderToString } = await import('@vue/server-renderer')
  const source=readFileSync('.vitepress/theme/HomeReaderTabs.vue','utf8')
  const {descriptor}=parse(source)
  const compiled=compileScript(descriptor,{id:'reader-tabs',inlineTemplate:true}).content
  const bundle=await build({stdin:{contents:compiled,loader:'ts',resolveDir:resolve('.vitepress/theme')},bundle:true,write:false,platform:'node',format:'esm',external:['vue'],plugins:[{name:'tabs-data',setup(b){b.onResolve({filter:/^\.\/article-tags\.data$/},()=>({path:'tags',namespace:'tagmock'}));b.onLoad({filter:/.*/,namespace:'tagmock'},()=>({contents:'export const data=globalThis.__homeTagData'}));b.onResolve({filter:/^vitepress$/},()=>({path:'vp',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'import { ref } from "vue"; export const useData=()=>({lang:ref(globalThis.__tabLang)});export const withBase=p=>"/eff-agent-article"+p;'}))}}]})
  mkdirSync('.vitepress/cache',{recursive:true});const fixture=resolve('.vitepress/cache/tabs-fixture.mjs');writeFileSync(fixture,bundle.outputFiles[0].text)
  const Component=(await import(pathToFileURL(fixture))).default
  for(const locale of ['zh','en']){
    globalThis.__tabLang=locale
    const html=await renderToString(createSSRApp(Component))
    checkCatalogOrderHtml(html, { language: locale, kind: 'home' })
    assert.equal((html.match(/class="reader-view-all"/g)||[]).length,4)
    assert.equal((html.match(/role="tab"/g)||[]).length,5)
    assert.equal((html.match(/role="tabpanel"/g)||[]).length,5)
    assert.equal((html.match(/aria-selected="true"/g)||[]).length,1)
    assert.ok(html.includes('id="reader-tab-catalog"'))
    for(const route of readingRoutes(locale,tagData)) for(const article of route.articles) assert.ok(html.includes('href="/eff-agent-article'+article.href+'"'))
  }
  for(const key of ['ArrowLeft','ArrowRight','Home','End']) assert.ok(source.includes(key))
  assert.ok(source.includes('overflow-x:auto'))
  assert.ok(source.includes('@media(max-width:640px)'))
  assert.deepEqual(compileStyle({source:descriptor.styles[0].content,id:'reader-tabs',scoped:true}).errors,[])
})
test('standalone topic map links keep a single site base in both languages', async () => {
  const { createMarkdownRenderer } = await import('vitepress')
  const md = await createMarkdownRenderer(process.cwd(), { highlight: code => code })
  for (const [page, asset] of [['open-etf-agent.md','module-map.zh-CN.svg'],['en/open-etf-agent.md','module-map.svg']]) {
    const source = readFileSync(page,'utf8')
    const link = source.split('\n').find(line => line.includes('interactive SVG directly') || line.includes('在独立页面打开图'))
    const expected = 'https://hpoenixf.com/eff-agent-article/visuals/open-etf-agent/'+asset
    assert.ok(link.includes(']('+expected+')'))
    const html = md.render(link)
    assert.ok(html.includes('href="'+expected+'"'))
    assert.ok(!html.includes('/eff-agent-article/eff-agent-article/'))
  }
})

test('topic previews derive only from tag members and keep complete topic destinations', () => {
 const routes=readingRoutes('zh',tagData);
 for(const [i,tag] of ['intro','architecture','finance','engineering'].entries()) {
  const order=tag==='intro'?learningPathSlugs:Object.keys(tagData.articles);
  const members=order.filter(s=>tagData.articles[s].some(t=>t.id===tag));
  assert.deepEqual(routes[i].articles.map(a=>a.slug),members.slice(0,5));
  assert.equal(routes[i].total,members.length);
 }
 assert.equal(routes[2].href,'/fintech');
 const source=readFileSync('.vitepress/theme/HomeReaderTabs.vue','utf8');
 assert.match(source,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(source,/<nav class="reader-tags"/);
 for(const path of ['index.md','en/index.md']) assert.doesNotMatch(readFileSync(path,'utf8'),/  actions:/);
 assert.match(readFileSync('.vitepress/theme/home-layout.css','utf8'),/recent-articles ol\{display:grid;grid-template-columns:repeat\(2/);
});


test('capsule tabs retain accessible labels, decorative icons and reduced-motion fallback', () => {
  const source = readFileSync('.vitepress/theme/HomeReaderTabs.vue', 'utf8')
  assert.match(source, /reader-tab-slider/)
  assert.match(source, /aria-hidden="true"/)
  assert.match(source, /prefers-reduced-motion:reduce/)
  assert.match(source, /animation:none!important/)
  assert.match(source, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/)
})
