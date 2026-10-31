import test from 'node:test'
import assert from 'node:assert/strict'
import { canonicalArticleLinks, buildArticleTags } from '../article-tags.mjs'
import { collections, panoramaSeriesSlugs } from '../book.mjs'
import { topicGroups } from '../open-etf-topic.mjs'
import { readFileSync } from 'node:fs'

test('finance links are canonical local destinations, bilingual-normalized and deduplicated', () => {
 const md = '[a](/articles/a) [en](/en/articles/a) [md](articles/b.md#x) [external](https://host/articles/a) [nav](/fintech) [unknown](/articles/absent)'
 assert.deepEqual(canonicalArticleLinks(md, new Set(['a','b'])), ['a','b'])
})
test('tags coexist; open association requires a target and scoped proof is distinct', () => {
 const result = buildArticleTags({ slugs:['a','b','c'], financeMarkdown:'[a](/articles/a)', panoramaSlugs:['a'], openGroups:[{articles:[{slug:'a',target:'module',status:'unmapped'}, {slug:'b',target:null,status:'limited'}, {slug:'c',additionalTargets:[{target:'module',status:'limited'}]}]}] })
 assert.deepEqual(result.articles.a.map(t=>t.id), ['finance','panorama','open-source'])
 assert.equal(result.articles.a[2].verification,'unverified'); assert.deepEqual(result.articles.b,[])
 assert.equal(result.articles.c[0].verification,'scoped')
})
test('current authority sources yield canonical multi-tags without a second article list', () => {
 const slugs=collections.flatMap(c=>c.chapters.flatMap(c=>c.items.map(([s])=>s)))
 const result=buildArticleTags({slugs,financeMarkdown:readFileSync(new URL('../fintech.md',import.meta.url),'utf8'),panoramaSlugs:panoramaSeriesSlugs,openGroups:topicGroups('zh')})
 for(const id of ['finance','panorama','open-source']) assert.ok(Object.values(result.articles).some(tags=>tags.some(t=>t.id===id)))
 assert.equal(Object.values(result.articles).filter(tags=>tags.some(t=>t.id==='panorama')).length,panoramaSeriesSlugs.length)
 console.log('Current tag counts', Object.fromEntries(result.definitions.map(({id})=>[id,Object.values(result.articles).filter(tags=>tags.some(t=>t.id===id)).length])))
})
