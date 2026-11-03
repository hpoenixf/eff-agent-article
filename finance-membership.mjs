// Preserve existing finance associations independently of any landing-page layout.
// New authored finance tags join this same set; book.mjs remains the reading-order authority.
export const existingFinanceArticleSlugs = [
  "agent-weekly-thesis-history-continuous-research",
  "031-fintech-data-time-and-reproducible-numbers",
  "agent-numeric-kernel-exact-units-rounding",
  "portfolio-mcp-readonly-investment-data",
  "agent-deterministic-fund-allocation",
  "financial-agent-trustworthy-evidence-chain",
  "financial-agent-python-result-consumption",
  "rag-retrieval-evaluation-evidence",
  "investment-perspectives-and-thesis-falsification",
  "030-fintech-from-research-to-investment-advice",
  "011-model-understands-code-authorizes",
  "financial-business-agent-trusted-handoff",
  "financial-agent-system-panorama",
  "mcp-market-responsibility-retrospective"
]
const financeTagNames = new Set(['金融', '金融科技', 'finance', 'fintech'])

export function financeArticleMembers({ slugs, pages = [], existing = existingFinanceArticleSlugs }) {
  const canonical = new Set(slugs), members = new Set()
  for (const slug of existing) {
    if (!canonical.has(slug)) throw new Error('Unknown existing finance article: ' + slug)
    members.add(slug)
  }
  for (const page of pages) {
    const match = /^(?:\/eff-agent-article)?\/?(?:en\/)?articles\/([a-z0-9-]+)(?:\.(?:md|html))?$/.exec(page.url)
    if (!match || !canonical.has(match[1])) continue
    const tags = page.frontmatter?.tags ?? []
    if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string')) throw new Error('Invalid article tags: ' + page.url)
    if (tags.some(tag => financeTagNames.has(tag.trim().toLowerCase()))) members.add(match[1])
  }
  return slugs.filter(slug => members.has(slug))
}

export function taggedArticleSlugs(data, tag, slugs) {
  return slugs.filter(slug => (data.articles[slug] || []).some(item => item.id === tag))
}
