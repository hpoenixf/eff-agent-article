import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { articleHistory, comparableArticle, availableArticleHistory } from '../article-history.mjs'
import { recentArticles } from '../recent-articles.mjs'
const items = Array.from({ length: 8 }, (_, i) => ['a' + i, '文章 ' + i])
const history = new Map(items.flatMap(([slug], i) => ['', 'en/'].map(prefix => [prefix+'articles/'+slug+'.md',{date:'2026-10-'+(20+i),timestamp:'2026-10-'+(20+i)+'T00:00:00Z',kind:'new',commit:'synthetic'}])))
const options = { items, history, englishSlugs: ['a0', 'a1'], englishTitles: { a0: 'English zero', a1: 'English one' } }
const page = (slug, fm = {}, en = false) => ({ url: (en ? '/en' : '') + '/articles/' + slug + '.html', frontmatter: fm })
test('new article without date fields automatically enters latest five', () => {
 const actual=recentArticles(items.map(([slug])=>page(slug)),options)
 assert.deepEqual(actual.map(x=>x.slug),['a7','a6','a5','a4','a3'])
})
test('draft, historical, uncommitted and unknown timestamps never become today', () => {
 assert.deepEqual(recentArticles([page('old'),page('a1',{draft:true}),page('a2',{published:false})],options),[])
 assert.deepEqual(recentArticles([page('a0',{lastUpdated:Date.now()})],{...options,history:new Map()}),[])
})
test('English uses actual translated pages and proper titles/routes', () => {
 const result=recentArticles([page('a0',{},true),page('a2',{},true),page('a1')],{...options,language:'en'})
 assert.equal(result.length,1);assert.equal(result[0].title,'English zero');assert.equal(result[0].href,'/en/articles/a0')
})
test('same commit new entries sort ahead of updates, stable across input order', () => {
 const h=new Map(['a0','a1'].map(s=>['articles/'+s+'.md',{timestamp:'2026-10-31T00:00:00Z',date:'2026-10-31',kind:s==='a1'?'new':'updated'}]))
 assert.deepEqual(recentArticles([page('a0'),page('a1')],{...options,history:h}).map(x=>x.slug),['a1','a0'])
})
test('prose whitespace and derived metadata do not refresh; visible metadata and code still matter', () => {
 assert.equal(comparableArticle('---\nlastUpdated: 1\nlayout: doc\n---\n# Title\n\nHello world\n'),comparableArticle('---\nlastUpdated: 2\nlayout: home\n---\n# Title\nHello   \n world\r\n'))
 assert.notEqual(comparableArticle('```py\n  value\n```'),comparableArticle('```py\nvalue\n```'))
 assert.notEqual(comparableArticle('[a](old)'),comparableArticle('[a](new)'))
 for (const key of ['title','description','evidence','draft']) {
   assert.notEqual(comparableArticle(`---\n${key}: A\n---\nSame body`),comparableArticle(`---\n${key}: B\n---\nSame body`))
 }
 assert.equal(comparableArticle('---\nlayout: doc\n  nested: presentation\ntitle: Visible\n---\nBody'),comparableArticle('---\nlayout: home\ntitle: Visible\n---\nBody'))
})
test('real Git history ignores formatting and uncommitted edits; records merged new and modified content', () => {
 const cache=join(process.cwd(),'.vitepress','cache');mkdirSync(cache,{recursive:true})
 const root=mkdtempSync(join(cache,'recent-history-fixture-'))
 const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim()
 git('init','-b','main');git('config','user.name','Synthetic fixture');git('config','user.email','fixture@example.invalid')
 mkdirSync(join(root,'articles'));const write=(name,text)=>writeFileSync(join(root,'articles',name+'.md'),text)
 let day=10;const commit=(msg)=>{git('add','articles');execFileSync('git',['-C',root,'commit','-m',msg],{env:{...process.env,GIT_AUTHOR_DATE:`2026-10-${day}T00:00:00Z`,GIT_COMMITTER_DATE:`2026-10-${day}T00:00:00Z`},stdio:'pipe'});day++}
 write('a0','# A\nold prose');commit('new')
 write('a0','# A\nnew prose');commit('content')
 write('a0','# A\n\nnew    prose\n');commit('format')
 write('a0','---\nlastUpdated: 123\nlayout: doc\n---\n# A\nnew prose');commit('derived metadata')
 write('a0','# A\nuncommitted');write('a1','# Not committed')
 let h=articleHistory(root,['articles/a0.md','articles/a1.md']);assert.equal(h.get('articles/a0.md').date,'2026-10-11');assert.equal(h.get('articles/a0.md').kind,'updated');assert.equal(h.has('articles/a1.md'),false)
 commit('new article and content');h=articleHistory(root,['articles/a1.md']);assert.equal(h.get('articles/a1.md').kind,'new')
 git('checkout','-b','topic');write('a2','# New on branch');commit('branch');git('checkout','main')
 execFileSync('git',['-C',root,'merge','--no-ff','topic','-m','merge content'],{env:{...process.env,GIT_AUTHOR_DATE:'2026-10-20T00:00:00Z',GIT_COMMITTER_DATE:'2026-10-20T00:00:00Z'},stdio:'pipe'})
 h=articleHistory(root,['articles/a2.md']);assert.equal(h.get('articles/a2.md').date,'2026-10-20');assert.equal(h.get('articles/a2.md').kind,'new')
 const shallow=join(root,'shallow-copy');execFileSync('git',['clone','--depth=1','file://'+root,shallow],{stdio:'pipe'});assert.throws(()=>articleHistory(shallow,['articles/a2.md']),/full Git history/);let warned=false;const fallback=availableArticleHistory(shallow,['articles/a2.md'],()=>{warned=true});assert.equal(fallback.available,false);assert.equal(fallback.history.size,0);assert.equal(warned,true)
 // Reader-visible metadata changes alone advance the event; a later layout-only commit does not.
 write('a0','---\ntitle: Visible title\ndescription: First description\n---\n# A\nuncommitted');commit('visible title')
 h=articleHistory(root,['articles/a0.md']);assert.equal(h.get('articles/a0.md').date,'2026-10-16')
 write('a0','---\ntitle: Visible title\ndescription: Revised description\n---\n# A\nuncommitted');commit('visible description')
 h=articleHistory(root,['articles/a0.md']);assert.equal(h.get('articles/a0.md').date,'2026-10-17')
 write('a0','---\nlayout: home\nlastUpdated: 999\ntitle: Visible title\ndescription: Revised description\n---\n# A\nuncommitted');commit('only layout and derived time')
 h=articleHistory(root,['articles/a0.md']);assert.equal(h.get('articles/a0.md').date,'2026-10-17')
 // Fixture is intentionally retained locally for reproducible evidence, never published.
})
