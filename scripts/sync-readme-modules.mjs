import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { recentModuleArticles } from '../open-etf-topic.mjs'
const start = '<!-- open-etf-recent-modules:start -->'
const end = '<!-- open-etf-recent-modules:end -->'
export function renderRecentModuleLinks(zh = recentModuleArticles('zh'), en = recentModuleArticles('en')) {
 const english = new Map(en.map(row=>[row.slug,row]))
 return zh.map(row=>{
  const translated=english.get(row.slug)
  if(!translated) throw new Error(`Missing English module: ${row.slug}`)
  return `- [${row.title}](${row.href.replace(/^\//,'')}.md) · [${translated.title}](${translated.href.replace(/^\//,'')}.md)`
 }).join('\n')
}
export function updateRecentModules(text) {
 if(text.split(start).length!==2 || text.split(end).length!==2) throw new Error('Expected one README recent-module block')
 const a=text.indexOf(start)+start.length, b=text.indexOf(end)
 if(b<a) throw new Error('Invalid README module block')
 return text.slice(0,a)+'\n'+renderRecentModuleLinks()+'\n'+text.slice(b)
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
 const mode=process.argv[2]
 if(!['--write','--check'].includes(mode) || process.argv.length!==3) throw new Error('Usage: node scripts/sync-readme-modules.mjs --write|--check')
 const path=new URL('../README.md',import.meta.url), text=readFileSync(path,'utf8'), updated=updateRecentModules(text)
 if(mode==='--write') writeFileSync(path,updated)
 else if(text!==updated) throw new Error('README recent modules differ from canonical topic; run --write')
 console.log('README bilingual recent modules match canonical topic')
}
