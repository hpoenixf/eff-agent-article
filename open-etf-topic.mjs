// Presentation joins only. Article identity/order: book.mjs; qualification: public repo snapshots.
import { validateRealTenEvidence } from './scripts/real-ten-evidence.mjs'
import admissionReceipt from './data/open-etf-agent/v017-real-ten.safe.json' with { type: 'json' }
import scheduleReceipt from './data/open-etf-agent/v018-real-ten.safe.json' with { type: 'json' }
import { collections } from './book.mjs'
import { englishTitles, englishArticlePath, englishCollections } from './book.en.mjs'
import source from './.github/open-etf-code-source.json' with { type: 'json' }
import coverage from './data/open-etf-agent/article-coverage.json' with { type: 'json' }
import translations from './data/open-etf-agent/article-coverage.en.json' with { type: 'json' }
import receipts from './data/open-etf-agent/article-coverage-receipts.json' with { type: 'json' }
import temporalReceipt from './data/open-etf-agent/v012-temporal.safe.json' with { type: 'json' }
import responseReceipt from './data/open-etf-agent/v013-ordinary-response.safe.json' with { type: 'json' }
import memoryReceipt from './data/open-etf-agent/v014-memory-consumer.safe.json' with { type: 'json' }
import revocableReceipt from './data/open-etf-agent/v016-revocable-rag.safe.json' with { type: 'json' }
import lineage from './data/open-etf-agent/versions.json' with { type: 'json' }
export const repo = 'https://github.com/hpoenixf/open-etf-agent'
export const qualification = { sourceCommit: source.commit, commit: receipts.sourceCommit, date: receipts.executedAt.slice(0,10), semanticStatus: receipts.semanticStatus, count: coverage.articles.length, targets: Object.keys(coverage.targets).length }
export const topicPath = language => language === 'zh' ? '/open-etf-agent' : '/en/open-etf-agent'
const records = new Map(coverage.articles.map(row => [row.slug, row]))
export function topicGroups(language = 'en') {
  const en = language === 'en'
  return (en ? englishCollections : collections).find(c => c.id === 'modules').chapters.map((chapter) => ({
    title: chapter.title,
    articles: chapter.items.map(([slug,title]) => {
      const record = records.get(slug)
      const view=(slice,scope)=>{
        const receipt=slice?.target && receipts.results[slice.target]
        const q=coverage.schemaVersion===3 && slice?.target?coverage.qualifications[coverage.targetEvidence[slice.target]]:null
        const scenarios={temporal:temporalReceipt.independentInstall,'ordinary-response':responseReceipt.independent,'memory-consumer':memoryReceipt.independent,'revocable-rag':revocableReceipt.independent}
        const scenario=q?.kind==='independent-scenario' && scenarios[q.scenario]
        const realTen = q?.kind === 'independent-scenario' && ['shared-admission','schedule-occurrence'].includes(q.scenario)
        // Consume the same canonical validator as snapshot import and code coverage.
        // Never reinterpret real requests as provider-free evidence for display.
        const realObserved = realTen ? validateRealTenEvidence(q.scenario === 'shared-admission' ? admissionReceipt : scheduleReceipt, q.scenario) : null
        const verified=slice?.status==='verified' && (realTen ? !!realObserved.report?.sha256 : scenario?scenario.modelCalls===0 && !!scenario.report?.sha256:receipt?.exitCode===0 && coverage.verifiedAt===receipts.sourceCommit)
        const target=verified && lineage.targets[slice.target]
        return {target:slice?.target,status:verified?'limited':slice?'unmapped':'unassessed',scope,since:target?.since,evidence:target?repo+'/blob/'+(realTen ? q.evidenceCommit : q?.commit || receipts.sourceCommit)+'/'+(realTen ? q.receipt.path : target.evidencePath):null}
      }
      const primary=view(record,record?(en?translations.articles[slug]?.scope || record.scope:record.scope):(en?'Not included in this coverage snapshot. No execution claim.':'不在本次覆盖快照中；不借用执行结论。'))
      const additionalTargets=(record?.additionalTargets || []).map(slice=>view(slice,en?translations.articles[slug]?.additionalScopes?.[slice.target]?.scope || slice.scope:slice.scope))
      return { slug, title: en ? englishTitles[slug] || translations.articles[slug]?.title || title : title,
        href: en ? englishArticlePath(slug) : '/articles/' + slug,
        translated: englishArticlePath(slug).startsWith('/en/'),
        ...primary, additionalTargets,
        status: primary.status==='limited' || additionalTargets.some(slice=>slice.status==='limited')?'limited':primary.status }
    })
  }))
}
// Editorial captions only; fixed identities come exclusively from versions.json.
const captions = {
 '0.1': ['First readable report','第一份可回读报告','Runtime · Gateway · Tool Host'],
 '0.2': ['Methods meet tools','方法接入工具链','Skill · MCP · SSE'],
 '0.3': ['Cooperate within bounds','有边界地协作','Child · Hook · shared budget'],
 '0.4': ['Keep the original','保留原始事实','Result · Context · Retrieval'],
 '0.5': ['Notes are not facts','便笺不是原始事实','Compaction · explicit Memory'],
 '0.6': ['Deliver by identity','按身份交付与读取','Artifact · Revision · Reader'],
 '0.7': ['Contribute and recover','可信扩展与恢复','Plugin · SQLite · lease / fence'],
 '0.8': ['Commit the answer body','独立提交回答正文','Publication · revision CAS'],
 '0.9': ['Continue the same Run','沿同一个 Run 继续','Submit · Worker · readback'],
 '0.10': ['One result, actual consumers','一个结果，真实消费','Result / Reference · report · CSV'],
 '0.11': ['Read the original PDF','读取原始 PDF','Local text layer · physical page · original bytes'],
 '0.12': ['Keep task time fixed','固定任务时间','Temporal · IANA zone · original task date'],
 '0.13': ['Adopt the original reply','采用原普通回复','Ordinary response · receipt · same-Run adoption'],
 '0.14': ['Read existing Memory','只读既有记忆','Memory · current revision · actual request'],
 '0.15': ['Check sources before handoff','核对来源再交接','Specialist Child · exact evidence · Main'],
 '0.16': ['Recheck eligibility on read','读取时重核资格','Revocable source · Publication · Reader'],
 '0.17': ['Share admission capacity','共享准入容量','Shared Admission · original request'],
 '0.18': ['Wake one confirmed occurrence','唤醒一次已确认的时间机会','Schedule · explicit wake · same Run'],
 '0.19': ['Compose existing contracts','组合既有契约','Original owners · explicit inputs · bounded summary'],
 '0.20': ['Run your own research project','运行自己的研究项目','Local sources · same-Run recovery · layered evidence'],
 '0.21': ['Return answers to the same task','让回答回到原任务','Sequential questions · durable receipt · explicit adoption'],
 '0.22': ['Delegate bounded read-only work','有界委派只读研究','Serial Child · scoped sources · original Main'],
 '0.23': ['Retrieve admitted evidence','检索已准入原文','Knowledge · lexical retrieval · original source'],
 '0.24': ['Keep project capacity across revisions','修订之间保留项目容量','Endpoint identity · original tickets · project-local scope']
}
export const versions = Object.entries(lineage.versions).sort(([a],[b]) => a.localeCompare(b, undefined, { numeric: true })).map(([version,identity]) => ({ version, ...identity, title: captions[version]?.[0] || version, zh: captions[version]?.[1] || version, module: captions[version]?.[2] || 'See fixed source', href: repo + '/tree/' + identity.commit }))
export const catalogCount = topicGroups().reduce((n,g)=>n+g.articles.length,0)

// Qualified module progression, not publication dates; all slices retain their original identities.
export const recentVersions = versions.slice(-3).reverse()
export function recentModuleArticles(language = 'en') {
  const latest = article => [article,...article.additionalTargets].filter(slice=>slice.evidence && slice.since).map(slice=>slice.since).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}))[0]
  return topicGroups(language).flatMap(group=>group.articles).map((article,index)=>({article,index,since:latest(article)})).filter(row=>row.since).sort((a,b)=>b.since.localeCompare(a.since,undefined,{numeric:true}) || a.index-b.index).slice(0,3).map(row=>row.article)
}

