import test from 'node:test'
import assert from 'node:assert/strict'
import { canonicalArticleLinks, buildArticleTags } from '../article-tags.mjs'
import { collections, panoramaSeriesSlugs } from '../book.mjs'
import { topicGroups } from '../open-etf-topic.mjs'
import { readFileSync } from 'node:fs'
import { financeArticleMembers, existingFinanceArticleSlugs, taggedArticleSlugs } from '../finance-membership.mjs'
import { createMarkdownRenderer } from 'vitepress'
const markdown = await createMarkdownRenderer(process.cwd(), { highlight: code => code })
const frontmatter = source => { const env = {}; markdown.render(source, env); return env.frontmatter || {} }

test('finance links are canonical local destinations, bilingual-normalized and deduplicated', () => {
 const md = '[a](/articles/a) [en](/en/articles/a) [md](articles/b.md#x) [external](https://host/articles/a) [nav](/fintech) [unknown](/articles/absent)'
 assert.deepEqual(canonicalArticleLinks(md, new Set(['a','b'])), ['a','b'])
})
test('tags coexist; open association requires a target and scoped proof is distinct', () => {
 const result = buildArticleTags({ slugs:['a','b','c'], financeSlugs:['a'], panoramaSlugs:['a'], openGroups:[{articles:[{slug:'a',target:'module',status:'unmapped'}, {slug:'b',target:null,status:'limited'}, {slug:'c',additionalTargets:[{target:'module',status:'limited'}]}]}] })
 assert.deepEqual(result.articles.a.map(t=>t.id), ['finance','panorama','open-source'])
 assert.equal(result.articles.a[2].verification,'unverified'); assert.deepEqual(result.articles.b,[])
 assert.equal(result.articles.c[0].verification,'scoped')
})
test('current authority sources yield canonical multi-tags without a second article list', () => {
 const slugs=collections.flatMap(c=>c.chapters.flatMap(c=>c.items.map(([s])=>s)))
 const result=buildArticleTags({slugs,financeSlugs:financeArticleMembers({slugs,pages:slugs.map(slug=>({url:'/articles/'+slug,frontmatter:frontmatter(readFileSync(new URL('../articles/'+slug+'.md',import.meta.url),'utf8'))}))}),panoramaSlugs:panoramaSeriesSlugs,openGroups:topicGroups('zh')})
 for(const id of ['finance','panorama','open-source']) assert.ok(Object.values(result.articles).some(tags=>tags.some(t=>t.id===id)))
 assert.equal(Object.values(result.articles).filter(tags=>tags.some(t=>t.id==='panorama')).length,panoramaSeriesSlugs.length)
 console.log('Current tag counts', Object.fromEntries(result.definitions.map(({id})=>[id,Object.values(result.articles).filter(tags=>tags.some(t=>t.id===id)).length])))
})


test('finance preserves existing members and admits authored bilingual tags without title inference', () => {
 const slugs=['old','new','english','title-only'];
 const pages=[{url:'/articles/new',frontmatter:{tags:['金融科技']}},{url:'/en/articles/english.html',frontmatter:{tags:['Fintech']}},{url:'/articles/title-only',frontmatter:{title:'金融研究'}}];
 const members=financeArticleMembers({slugs,pages,existing:['old']});
 assert.deepEqual(members,['old','new','english']);
 const data=buildArticleTags({slugs,financeSlugs:members,panoramaSlugs:[],openGroups:[]});
 assert.deepEqual(taggedArticleSlugs(data,'finance',slugs),members);
 assert.throws(()=>financeArticleMembers({slugs,pages:[],existing:['missing']}),/Unknown existing/);
})
test('the topic and badges consume the same tag data, not links parsed from the landing page', () => {
 const component=readFileSync(new URL('../.vitepress/theme/FinanceTopic.vue',import.meta.url),'utf8');
 const loader=readFileSync(new URL('../.vitepress/theme/article-tags.data.ts',import.meta.url),'utf8');
 assert.match(component,/taggedArticleSlugs\(tags, 'finance'/);
 assert.match(component,/article-tags.data/);assert.match(component,/descriptionForArticle/);
 assert.doesNotMatch(loader,/fintech\.md|financeMarkdown/);
 for(const path of ['fintech.md','en/fintech.md']) assert.match(readFileSync(new URL('../'+path,import.meta.url),'utf8'),/<FinanceTopic \/>/);
 assert.equal(existingFinanceArticleSlugs.length,14);
})

test('current authored finance tags add the two explicitly tagged panoramas and preserve the old fourteen', () => {
 const slugs=collections.flatMap(c=>c.chapters.flatMap(c=>c.items.map(([s])=>s)));
 const pages=slugs.map(slug=>({url:'/articles/'+slug,frontmatter:frontmatter(readFileSync(new URL('../articles/'+slug+'.md',import.meta.url),'utf8'))}));
 const members=financeArticleMembers({slugs,pages});
 assert.deepEqual(new Set(members),new Set([...existingFinanceArticleSlugs,'vertical-financial-agent-principles-panorama','etf-agent-framework-comparison-panorama']));
})

test('actual finance component renders every tagged article in both languages and marks fallback', async () => {
 const { parse, compileScript, compileStyle } = await import('@vue/compiler-sfc');
 const { build } = await import('esbuild');
 const { createSSRApp, ref } = await import('vue');
 const { renderToString } = await import('@vue/server-renderer');
 const { mkdirSync, writeFileSync } = await import('node:fs');
 const { resolve } = await import('node:path');
 const { pathToFileURL } = await import('node:url');
 const { englishArticlePath, englishArticleSlugs, englishTitles } = await import('../book.en.mjs');
 const { buildArticleDescriptions, descriptionForArticle } = await import('../article-description.mjs');
 const slugs=collections.flatMap(c=>c.chapters.flatMap(c=>c.items.map(([s])=>s)));
 const pages=slugs.flatMap(slug=>['',...(englishArticleSlugs.includes(slug)?['en/']:[])].map(prefix=>({url:'/'+prefix+'articles/'+slug,frontmatter:frontmatter(readFileSync(new URL('../'+prefix+'articles/'+slug+'.md',import.meta.url),'utf8'))})));
 const members=financeArticleMembers({slugs,pages});
 globalThis.__financeTags=buildArticleTags({slugs,financeSlugs:members,panoramaSlugs:[],openGroups:[]});
 globalThis.__financeDescriptions=buildArticleDescriptions(pages);
 const theme=resolve('.vitepress/theme');
 const {descriptor}=parse(readFileSync(resolve(theme,'FinanceTopic.vue'),'utf8'));
 for(const style of descriptor.styles) assert.deepEqual(compileStyle({source:style.content,id:'finance-test',scoped:style.scoped}).errors,[]);
 const compiled=compileScript(descriptor,{id:'finance-test',inlineTemplate:true}).content;
 const bundled=await build({stdin:{contents:compiled,loader:'ts',resolveDir:theme},bundle:true,write:false,platform:'node',format:'esm',external:['vue'],plugins:[{name:'finance-test-data',setup(builder){
  builder.onResolve({filter:/^(vitepress|\.\/article-tags\.data|\.\/article-descriptions\.data)$/},args=>({path:args.path,namespace:'finance-test'}));
  builder.onLoad({filter:/.*/,namespace:'finance-test'},args=>({contents:args.path==='vitepress'?'export const useData=()=>globalThis.__financeState; export const withBase=p=>globalThis.__financeBase.replace(/\\/$/, "")+p;':args.path==='./article-tags.data'?'export const data=globalThis.__financeTags;':'export const data=globalThis.__financeDescriptions;'}));
 }}]});
 mkdirSync(resolve('test-output'),{recursive:true});const path=resolve('test-output/finance-render-fixture.mjs');writeFileSync(path,bundled.outputFiles[0].text);
 const Component=(await import(pathToFileURL(path))).default;
 for(const base of ['/','/eff-agent-article/']) for(const english of [false,true]){
  globalThis.__financeBase=base;globalThis.__financeState={lang:ref(english?'en-US':'zh-CN')};
  const html=await renderToString(createSSRApp(Component));
  assert.equal((html.match(/<li>/g)||[]).length,members.length);
  const escape = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const titles = new Map(collections.flatMap(c=>c.chapters.flatMap(c=>c.items)));
  const entries = [...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match=>match[1]);
  assert.ok(html.includes(english ? `${members.length} articles,` : `共 ${members.length} 篇`));
  for(const [i,slug] of members.entries()) {
   const href=english?englishArticlePath(slug):'/articles/'+slug;
   const entry=entries[i];
   assert.equal((entry.match(/<h3>/g)||[]).length,1,slug);
   assert.equal((entry.match(/<a /g)||[]).length,1,slug);
   assert.ok(entry.includes('href="'+base.replace(/\/$/,'')+href+'"'),slug);
   assert.ok(entry.includes(escape(english ? englishTitles[slug] : titles.get(slug))),slug);
   assert.ok(entry.includes('<p>'+escape(descriptionForArticle(globalThis.__financeDescriptions.articles,href))+'</p>'),slug);
  }
  if(english) assert.match(html,/Chinese original/);
 }
 delete globalThis.__financeTags;delete globalThis.__financeDescriptions;delete globalThis.__financeState;delete globalThis.__financeBase;
})
