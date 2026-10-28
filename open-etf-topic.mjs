// Presentation joins only. Article identity/order: book.mjs; qualification: public repo snapshots.
import { collections } from './book.mjs'
import { englishTitles, englishArticlePath } from './book.en.mjs'
import source from './.github/open-etf-code-source.json' with { type: 'json' }
import coverage from './data/open-etf-agent/article-coverage.json' with { type: 'json' }
import translations from './data/open-etf-agent/article-coverage.en.json' with { type: 'json' }
import receipts from './data/open-etf-agent/article-coverage-receipts.json' with { type: 'json' }
import lineage from './data/open-etf-agent/versions.json' with { type: 'json' }
export const repo = 'https://github.com/hpoenixf/open-etf-agent'
export const qualification = { sourceCommit: source.commit, commit: receipts.sourceCommit, date: receipts.executedAt.slice(0,10), semanticStatus: receipts.semanticStatus, count: coverage.articles.length, targets: Object.keys(receipts.results).length }
export const topicPath = language => language === 'zh' ? '/open-etf-agent' : '/en/open-etf-agent'
const records = new Map(coverage.articles.map(row => [row.slug, row]))
export function topicGroups(language = 'en') {
  const en = language === 'en'
  return collections.find(c => c.id === 'modules').chapters.map((chapter,index) => ({
    title: en ? ['Research, reading & computation', 'Context, memory & knowledge', 'Runtime, extensions & observation', 'Control, publication & delivery'][index] || chapter.title : chapter.title,
    articles: chapter.items.map(([slug,title]) => {
      const record = records.get(slug)
      const receipt = record?.target && receipts.results[record.target]
      const verified = record?.status === 'verified' && receipt?.exitCode === 0 && coverage.verifiedAt === receipts.sourceCommit
      const target = verified && lineage.targets[record.target]
      return { slug, title: en ? englishTitles[slug] || translations.articles[slug]?.title || title : title,
        href: en ? englishArticlePath(slug) : '/articles/' + slug,
        translated: englishArticlePath(slug).startsWith('/en/'),
        status: verified ? 'limited' : record ? 'unmapped' : 'unassessed',
        scope: record ? (en ? translations.articles[slug]?.scope || record.scope : record.scope) : (en ? 'Not included in this coverage snapshot. No execution claim.' : '不在本次覆盖快照中；不借用执行结论。'),
        since: target?.since,
        evidence: target ? repo + '/blob/' + receipts.sourceCommit + '/' + target.evidencePath : null }
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
 '0.13': ['Adopt the original reply','采用原普通回复','Ordinary response · receipt · same-Run adoption']
}
export const versions = Object.entries(lineage.versions).sort(([a],[b]) => a.localeCompare(b, undefined, { numeric: true })).map(([version,identity]) => ({ version, ...identity, title: captions[version]?.[0] || version, zh: captions[version]?.[1] || version, module: captions[version]?.[2] || 'See fixed source', href: repo + '/tree/' + identity.commit }))
export const catalogCount = topicGroups().reduce((n,g)=>n+g.articles.length,0)

// Editorial module progression, not publication dates. All article fields join the catalog.
const recentModuleSlugs = [
  'agent-durable-human-interaction-response-adoption',
  'agent-temporal-semantics-market-calendar',
  '024-agent-pdf-from-text-to-evidence'
]
export const recentVersions = versions.slice(-3).reverse()
export function recentModuleArticles(language = 'en') {
  const articles = new Map(topicGroups(language).flatMap(group => group.articles).map(article => [article.slug, article]))
  return recentModuleSlugs.map(slug => articles.get(slug)).filter(Boolean)
}
