import test from 'node:test'
import assert from 'node:assert/strict'
import { canonicalArticleLinks, buildArticleTags } from '../article-tags.mjs'
import { collections, panoramaSeriesSlugs, learningPathSlugs } from '../book.mjs'
import { topicGroups } from '../open-etf-topic.mjs'
import { readFileSync } from 'node:fs'
import { financeGroupMembers, financeTopicGroups } from '../finance-topic-groups.mjs'
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
 for(const path of ['fintech.md','en/fintech.md']) assert.match(readFileSync(new URL('../'+path,import.meta.url),'utf8'),/<FinanceTopic summary \/>/);
 assert.equal(existingFinanceArticleSlugs.length,14);
})

test('current authored finance tags include the two panoramas and B05 while preserving the old fourteen', () => {
 const slugs=collections.flatMap(c=>c.chapters.flatMap(c=>c.items.map(([s])=>s)));
 const pages=slugs.map(slug=>({url:'/articles/'+slug,frontmatter:frontmatter(readFileSync(new URL('../articles/'+slug+'.md',import.meta.url),'utf8'))}));
 const members=financeArticleMembers({slugs,pages});
 assert.deepEqual(new Set(members),new Set([...existingFinanceArticleSlugs,'vertical-financial-agent-principles-panorama','etf-agent-framework-comparison-panorama','agent-atomic-portfolio-report-production']));
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
  const source = readFileSync(new URL('../'+(english?'en/':'')+'fintech.md',import.meta.url),'utf8');
  let page = markdown.render(source, {});
  const components = [...page.matchAll(/<FinanceTopic\s+([^>]*?)\s*\/>/g)];
  assert.equal(components.length, 11, 'summary, nine classified groups and pending group');
  for(const match of components) {
   const category=match[1].match(/category="([^"]+)"/)?.[1];
   const summary=/\bsummary\b/.test(match[1]);
   page=page.replace(match[0],await renderToString(createSSRApp(Component,{category,summary})));
  }
  const html=page;
  assert.doesNotMatch(html,/原有导读|existing guide|Read by research question/);
  assert.equal((html.match(/<li><h3>/g)||[]).length,members.length);
  const escape = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const titles = new Map(collections.flatMap(c=>c.chapters.flatMap(c=>c.items)));
  const entries = [...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match=>match[1]);
  assert.ok(html.includes(english ? `${members.length} articles,` : `共 ${members.length} 篇`));
  for(const [i,slug] of members.entries()) {
   const href=english?englishArticlePath(slug):'/articles/'+slug;
   const entry=entries.find(value=>value.includes('href="'+base.replace(/\/$/,'')+href+'"'));
   assert.ok(entry,slug);
   assert.equal(html.split('href="'+base.replace(/\/$/,'')+href+'"').length-1,1,'Whole page contains each article link exactly once: '+slug);
   assert.equal((entry.match(/<h3>/g)||[]).length,1,slug);
   assert.equal((entry.match(/<a /g)||[]).length,1,slug);
   assert.ok(entry.includes('href="'+base.replace(/\/$/,'')+href+'"'),slug);
   assert.ok(entry.includes(escape(english ? englishTitles[slug] : titles.get(slug))),slug);
   assert.ok(entry.includes('<p>'+escape(descriptionForArticle(globalThis.__financeDescriptions.articles,href))+'</p>'),slug);
  }
  if(english) {
   const hasUntranslatedFinance = members.some(slug => !englishArticleSlugs.includes(slug));
   assert.equal(html.includes('Chinese original'), hasUntranslatedFinance,
     'A fully translated finance catalogue must not show a stale Chinese-original fallback');
  }
 }
 const newSlug = slugs.find(slug=>!members.includes(slug));
 globalThis.__financeTags.articles[newSlug]=[{id:'finance'}];
 const PendingComponent=(await import(pathToFileURL(path).href+'?pending')).default;
 globalThis.__financeState={lang:ref('zh-CN')};globalThis.__financeBase='/eff-agent-article/';
 const pendingHtml=await renderToString(createSSRApp(PendingComponent,{category:'pending'}));
 assert.match(pendingHtml,/待分类的金融新文章/);
 assert.ok(pendingHtml.includes('/eff-agent-article/articles/'+newSlug));
 assert.equal((pendingHtml.match(/<li>/g)||[]).length,1);
 delete globalThis.__financeTags;delete globalThis.__financeDescriptions;delete globalThis.__financeState;delete globalThis.__financeBase;
})


test('research groups preserve all finance members once and visibly retain newly tagged articles', () => {
 const members=[...existingFinanceArticleSlugs,'vertical-financial-agent-principles-panorama','etf-agent-framework-comparison-panorama'];
 const grouped=Object.keys(financeTopicGroups).flatMap(key=>financeGroupMembers(members,key));
 assert.equal(grouped.length,16);assert.equal(new Set(grouped).size,16);assert.deepEqual(new Set(grouped),new Set(members));
 assert.deepEqual(financeGroupMembers([...members,'newly-tagged-finance'],'pending'),['newly-tagged-finance']);
 for(const prefix of ['', 'en/']) {
  const source=readFileSync(new URL('../'+prefix+'fintech.md',import.meta.url),'utf8');
  for(const letter of ['A','B','C','D']) assert.match(source,new RegExp('## '+letter+' ·'));
  assert.doesNotMatch(source,/\]\(\/(?:en\/)?articles\//);
  assert.match(source,/<FinanceTopic category="pending" \/>/);
 }
})

// Editorial curation retains complete topic panoramas while focused arguments stay on their primary paths.
test('complete engineering panoramas retain their shared tag', () => {
 const retainedSlugs = ["025-agent-langfuse-from-trace-to-trustworthy-observability", "honest-agent-evaluation", "agent-subagent-context-specialization"];
 const slugs = collections.flatMap(c => c.chapters.flatMap(ch => ch.items.map(([slug]) => slug)));
 const result = buildArticleTags({slugs, financeSlugs:[], panoramaSlugs:panoramaSeriesSlugs, openGroups:[]});
 for (const slug of retainedSlugs) assert.ok(result.articles[slug].some(tag => tag.id === 'panorama'), slug);
});
test('focused topics remain readable without inheriting the curated panorama tag', () => {
 const focusedSlugs = ["agent-trust-from-claims-to-commitments", "agent-fragility-and-antifragility", "ai-citations-do-not-prove-reliability"];
 const slugs = collections.flatMap(c => c.chapters.flatMap(ch => ch.items.map(([slug]) => slug)));
 const result = buildArticleTags({slugs, financeSlugs:[], panoramaSlugs:panoramaSeriesSlugs, openGroups:[]});
 for (const slug of focusedSlugs) {
  assert.equal(slugs.filter(value => value === slug).length, 1, slug);
  assert.ok(!result.articles[slug].some(tag => tag.id === 'panorama'), slug);
  for (const language of ['', 'en/']) {
   assert.ok(readFileSync(new URL('../' + language + 'articles/' + slug + '.md', import.meta.url), 'utf8').length > 1000, language + slug);
  }
 }
});

test('introductory badges derive exactly from the canonical learning route in both languages', () => {
 const slugs=collections.flatMap(c=>c.chapters.flatMap(c=>c.items.map(([s])=>s)));
 const data=buildArticleTags({slugs,financeSlugs:[],panoramaSlugs:[],openGroups:[]});
 assert.deepEqual(slugs.filter(s=>data.articles[s].some(t=>t.id==='intro')),learningPathSlugs);
 const tag=data.definitions.find(t=>t.id==='intro');assert.equal(tag.zh,'入门');assert.equal(tag.en,'Getting started');assert.equal(tag.path,'getting-started');
 assert.equal(new Set(learningPathSlugs).size,11);
});

test('selecting the introductory filter starts in the canonical reading order', () => {
 const source=readFileSync(new URL('../.vitepress/theme/ChapterCatalog.vue',import.meta.url),'utf8');
 assert.ok(source.includes("if (id === 'intro' && selectedTags.value.includes('intro')) sortOrder.value = 'category'"));
});

test('engineering and architecture tags use reviewed category membership, not title guesses', () => {
 const slugs=collections.flatMap(c=>c.chapters.flatMap(ch=>ch.items.map(([s])=>s)));
 const data=buildArticleTags({slugs,financeSlugs:[],panoramaSlugs:[],openGroups:[]});
 for(const [category,tag] of [['engineering','engineering'],['thinking','architecture']]) {
  const expected=collections.find(c=>c.id===category).chapters.flatMap(ch=>ch.items.map(([s])=>s));
  assert.deepEqual(taggedArticleSlugs(data,tag,slugs),expected);
 }
});
