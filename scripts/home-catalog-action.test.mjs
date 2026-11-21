import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse, compileScript } from '@vue/compiler-sfc'
import { build } from 'esbuild'
import { createSSRApp, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { collections } from '../book.mjs'
import { englishCollections } from '../book.en.mjs'
import { catalogView } from '../.vitepress/theme/catalog-view.mjs'
const theme=resolve('.vitepress/theme')
const descriptor=parse(readFileSync(resolve(theme,'HomeCatalogAction.vue'),'utf8')).descriptor
const compiled=compileScript(descriptor,{id:'home-catalog-test',inlineTemplate:true}).content
const bundle=await build({stdin:{contents:compiled,loader:'ts',resolveDir:theme},bundle:true,write:false,platform:'node',format:'esm',external:['vue'],plugins:[{name:'locale',setup(b){b.onResolve({filter:/^vitepress$/},()=>({path:'vitepress',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const useData=()=>({lang:globalThis.__homeCatalogLang});export const withBase=p=>"/eff-agent-article"+p;'}))}}]})
mkdirSync('.vitepress/cache',{recursive:true});const file=resolve('.vitepress/cache/home-catalog-test.mjs');writeFileSync(file,bundle.outputFiles[0].text)
const component=(await import(pathToFileURL(file))).default
for(const [locale,book,label,path]of[['zh-CN',collections,'查看全部文章','/catalog'],['en-US',englishCollections,'View all articles','/en/catalog']])test(`${locale}: full locale catalogue count and existing destination`,async()=>{globalThis.__homeCatalogLang=ref(locale);const html=await renderToString(createSSRApp(component));assert.ok(html.includes(label));assert.ok(html.includes(`href="/eff-agent-article${path}"`));assert.ok(html.includes(`${catalogView(book).articleCount}${locale==='zh-CN'?' 篇':' articles'}`));assert.ok(!html.includes('undefined'))})
test('catalogue counting excludes related-only entries and deduplicates primary IDs',()=>{const book=[{id:'a',chapters:[{items:[['one','One'],['one','Again']],related:[['draft','Not published in the catalogue']]}]}];assert.equal(catalogView(book).articleCount,1);book[0].chapters[0].items.push(['two','Two']);assert.equal(catalogView(book).articleCount,2)})
test('hero placement and mobile/keyboard affordances',()=>{assert.match(readFileSync(resolve(theme,'index.ts'),'utf8'),/'home-hero-info-after': \(\) => h\(HomeCatalogAction\)/);assert.match(descriptor.styles[0].content,/focus-visible/);assert.match(descriptor.styles[0].content,/max-width: 639px/);assert.match(descriptor.styles[0].content,/min-height: 48px/)})
