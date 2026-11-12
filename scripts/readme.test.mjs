import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { collections } from '../book.mjs'
import { renderReadme, renderVersions, readmeRecent } from './sync-readme.mjs'
import { updateRecentModules } from './sync-readme-modules.mjs'
import anchors from '../data/readme/legacy-anchors.json' with { type: 'json' }
const ids = collections.flatMap(c=>c.chapters.flatMap(ch=>ch.items.map(i=>i[0])))
const history = new Map(ids.slice(0,4).map((id,i)=>['articles/'+id+'.md',{timestamp:`2026-11-0${i+1}T00:00:00Z`,date:`2026-11-0${i+1}`,kind:'updated'}]))
const zh=renderReadme('zh',history),en=renderReadme('en',history)
test('bilingual entrypoints and generator blocks',()=>{
 assert.match(zh,/\(README.en.md\)/);assert.match(en,/\(README.md\)/)
 for(const text of [zh,en]) { assert.doesNotMatch(text,/\{\{[A-Z]+\}\}/); assert.match(text,/catalog/); assert.match(text,/open-etf-agent/);assert.match(text,/production|生产/) }
 assert.equal(updateRecentModules(zh),zh)
})
test('three recent source identities with honest empty and shorter histories',()=>{
 assert.equal(readmeRecent(history).length,3);assert.equal(readmeRecent(new Map()).length,0)
 assert.equal(readmeRecent(new Map([...history].slice(0,1))).length,1)
 assert.equal(readmeRecent(history)[0].date,'2026-11-04')
})
test('fixed versions are capped without certifying them',()=>{
 const rows=[1,2,3,4].map(v=>({version:String(v),zh:'入口',title:'Entry',href:'https://example.org/'+v}))
 assert.equal(renderVersions('en',rows).split('\n').length,3);assert.equal(renderVersions('zh',[]),'')
})
test('relative file targets exist; historical fragments retained',()=>{
 for(const text of [zh,en]) for(const m of text.matchAll(/\]\(([^)]+)\)/g)) {
  const href=m[1];if(/^(https?:|#)/.test(href)||href==='README.en.md')continue
  assert.ok(existsSync(new URL('../'+href.split('#')[0],import.meta.url)),href)
 }
 for(const id of anchors) assert.ok(zh.includes(`id="${id}"`)||[...zh.matchAll(/^#{1,6} (.+)$/gm)].some(m=>m[1].toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu,'').replaceAll(' ','-')===id),id)
})
